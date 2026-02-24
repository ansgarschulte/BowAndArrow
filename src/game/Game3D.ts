import { levels } from '../levels/levelConfig';
import { ScoreManager } from '../systems/ScoreManager';
import { InputManager3D } from '../systems/InputManager3D';
import { Environment3D } from './Environment3D';
import { Archer3D } from './Archer3D';
import { Arrow3D } from './Arrow3D';
import { Target3D } from './Target3D';
import { AimSystem3D } from './AimSystem3D';
import { HUD3D } from '../ui/HUD3D';
import { LevelCompleteScreen } from '../ui/LevelCompleteScreen';
import { GameOverScreen } from '../ui/GameOverScreen';
import { GameSettings, getSelectedBow, BowTypes } from '../config/gameConfig';
import type { Engine3D } from './Engine3D';
import * as THREE from 'three';

export class Game3D {
  private engine: Engine3D;
  private level: number;
  private environment!: Environment3D;
  private archer!: Archer3D;
  private arrows: Arrow3D[] = [];
  private targets: Target3D[] = [];
  private aimSystem!: AimSystem3D;
  private inputManager!: InputManager3D;
  private scoreManager!: ScoreManager;
  private hud!: HUD3D;
  private levelComplete!: LevelCompleteScreen;
  private gameOver!: GameOverScreen;
  private canShoot: boolean = false;
  private shootCooldown: number = 0;
  private finished: boolean = false;
  private lastAssistedDir: THREE.Vector3 | null = null;

  constructor(engine: Engine3D, level: number) {
    this.engine = engine;
    this.level = level;

    const levelConfig = levels[level - 1];
    if (!levelConfig) {
      engine.showMenu();
      return;
    }

    // Environment
    this.environment = new Environment3D(engine.scene);

    // Archer
    this.archer = new Archer3D(engine.scene);

    // Targets
    levelConfig.targets.forEach(tc => {
      this.targets.push(new Target3D(engine.scene, tc, engine.camera));
    });

    // Aim system
    this.aimSystem = new AimSystem3D(engine.scene);

    // Input
    this.inputManager = new InputManager3D(engine.renderer.domElement);
    this.inputManager.onShoot((h, v, p) => this.shoot(h, v, p));

    // Score
    this.scoreManager = new ScoreManager(levelConfig.targets.length, levelConfig.arrowCount);

    // HUD
    this.hud = new HUD3D();
    this.hud.init(level, levelConfig.wind);

    // Overlays
    this.levelComplete = new LevelCompleteScreen();
    this.gameOver = new GameOverScreen();

    // Level intro
    this.hud.showLevelIntro(levelConfig.name, levelConfig.subtitle);
    setTimeout(() => {
      this.canShoot = true;
    }, 2200);
  }

  private shoot(angleH: number, angleV: number, power: number): void {
    if (!this.canShoot || this.shootCooldown > 0 || this.finished) return;
    if (this.scoreManager.getArrowsLeft() <= 0) return;

    this.scoreManager.useArrow();
    this.archer.hideArrow();

    const startPos = this.archer.getShootPosition();
    // Use aim-assisted direction if available
    let direction = this.lastAssistedDir || this.archer.getShootDirection(angleH, angleV);

    const levelConfig = levels[this.level - 1];
    const bowConfig = BowTypes[getSelectedBow()];
    const arrow = new Arrow3D(
      this.engine.scene,
      startPos,
      direction,
      power,
      levelConfig.wind
    );
    this.arrows.push(arrow);

    // Multi-shot bows (triple, air): fire additional arrows at slight angles
    const extraShots = bowConfig.multiShot || (getSelectedBow() === 'triple' ? 3 : 0);
    if (extraShots >= 3) {
      const spread = 0.04;
      for (const sign of [-1, 1]) {
        const offset = new THREE.Vector3().copy(direction);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), spread * sign);
        const extra = new Arrow3D(
          this.engine.scene,
          startPos.clone(),
          offset,
          power,
          levelConfig.wind
        );
        this.arrows.push(extra);
      }
    }

    this.shootCooldown = 0.5;
  }

  private applyAimAssist(shootPos: THREE.Vector3, shootDir: THREE.Vector3): THREE.Vector3 {
    let closestDist = Infinity;
    let closestTargetDir: THREE.Vector3 | null = null;

    for (const target of this.targets) {
      if (target.isHit()) continue;
      const targetPos = target.getPosition();
      const toTarget = targetPos.clone().sub(shootPos).normalize();

      // Angle between aim direction and direction to target
      const angle = shootDir.angleTo(toTarget);
      const assistRadius = GameSettings.aimAssistRadius * (Math.PI / 180);

      if (angle < assistRadius && angle < closestDist) {
        closestDist = angle;
        closestTargetDir = toTarget;
      }
    }

    if (closestTargetDir) {
      // Blend toward target direction
      const t = GameSettings.aimAssistStrength * (1 - closestDist / (GameSettings.aimAssistRadius * Math.PI / 180));
      const assisted = shootDir.clone().lerp(closestTargetDir, t).normalize();
      this.lastAssistedDir = assisted;
      return assisted;
    }

    this.lastAssistedDir = null;
    return shootDir;
  }

  update(delta: number): void {
    if (this.shootCooldown > 0) {
      this.shootCooldown -= delta;
    }

    // Input
    this.inputManager.update();
    const input = this.inputManager.getState();

    // Archer animation
    this.archer.update(delta, input.aimAngleH, input.aimAngleV, input.power, input.isAiming);

    // Aim system with aim-assist
    const shootPos = this.archer.getShootPosition();
    let shootDir = this.archer.getShootDirection(input.aimAngleH, input.aimAngleV);

    // Aim-assist: snap direction toward nearest target
    if (input.isAiming && input.power > 0) {
      shootDir = this.applyAimAssist(shootPos, shootDir);
    }

    this.aimSystem.update(shootPos, shootDir, input.power, input.isAiming);

    // Targets
    this.targets.forEach(t => t.update(delta));

    // Arrows + collisions
    this.arrows = this.arrows.filter(arrow => {
      const active = arrow.update(delta);
      if (!active) return false;

      const arrowPos = arrow.getPosition();

      // Check hits
      for (const target of this.targets) {
        const result = target.checkHit(arrowPos);
        if (result.hit) {
          const bowType = getSelectedBow();
          target.onHit(bowType);
          const points = this.scoreManager.registerHit(result.distance, 1);
          this.hud.showHitPoints(points);
          // Additional large-area effects for smoke/water bows
          const bowCfg = BowTypes[bowType];
          if (bowCfg.hitEffect) {
            this.spawnHitEffect(bowCfg.hitEffect, arrowPos.clone());
          }
          arrow.deactivate();
          return false;
        }
      }

      return true;
    });

    // HUD
    this.hud.update(
      this.scoreManager.getScore(),
      this.scoreManager.getArrowsLeft(),
      this.scoreManager.getHits(),
      this.scoreManager.getTotalTargets(),
      input.isAiming ? input.power : 0
    );

    // Win/Lose
    if (!this.finished) {
      if (this.scoreManager.isLevelComplete()) {
        this.finished = true;
        this.canShoot = false;
        setTimeout(() => {
          this.levelComplete.show({
            level: this.level,
            score: this.scoreManager.getScore(),
            hits: this.scoreManager.getHits(),
            totalTargets: this.scoreManager.getTotalTargets(),
            onNext: () => this.engine.startLevel(this.level + 1),
            onMenu: () => this.engine.showMenu(),
          });
        }, 1000);
      } else if (this.scoreManager.isGameOver() && this.arrows.every(a => !a.isActive())) {
        this.finished = true;
        this.canShoot = false;
        setTimeout(() => {
          this.gameOver.show({
            level: this.level,
            score: this.scoreManager.getScore(),
            hits: this.scoreManager.getHits(),
            totalTargets: this.scoreManager.getTotalTargets(),
            onRetry: () => this.engine.startLevel(this.level),
            onMenu: () => this.engine.showMenu(),
          });
        }, 1500);
      }
    }
  }

  destroy(): void {
    this.inputManager.destroy();
    this.environment.destroy();
    this.archer.destroy();
    this.arrows.forEach(a => a.destroy());
    this.targets.forEach(t => t.destroy());
    this.aimSystem.destroy();
    this.hud.destroy();
    this.levelComplete.hide();
    this.gameOver.hide();
  }

  private spawnHitEffect(type: 'smoke' | 'water', pos: THREE.Vector3): void {
    const scene = this.engine.scene;
    const count = type === 'smoke' ? 30 : 25;

    for (let i = 0; i < count; i++) {
      const size = type === 'smoke'
        ? 0.15 + Math.random() * 0.25
        : 0.06 + Math.random() * 0.12;

      let color: number;
      if (type === 'smoke') {
        const gray = 0.4 + Math.random() * 0.5;
        const c = Math.floor(gray * 255);
        color = (c << 16) | (c << 8) | c;
      } else {
        const blues = [0x42a5f5, 0x64b5f6, 0x90caf9, 0x2196f3, 0xbbdefb, 0xffffff];
        color = blues[Math.floor(Math.random() * blues.length)];
      }

      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
      const geo = new THREE.SphereGeometry(size, 6, 6);
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(pos);

      // Velocity: smoke rises slowly outward, water splashes fast in all directions
      const vx = (Math.random() - 0.5) * (type === 'smoke' ? 2 : 6);
      const vy = Math.random() * (type === 'smoke' ? 3 : 8) + (type === 'smoke' ? 1 : 2);
      const vz = (Math.random() - 0.5) * (type === 'smoke' ? 2 : 6);

      scene.add(p);

      const startTime = Date.now();
      const duration = type === 'smoke' ? 1500 : 800;
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const t = elapsed / duration;
        if (t >= 1) {
          scene.remove(p);
          geo.dispose();
          mat.dispose();
          return;
        }
        const dt = 0.016;
        p.position.x += vx * dt;
        p.position.y += vy * dt - (type === 'water' ? 9.8 * dt * t : 0);
        p.position.z += vz * dt;

        if (type === 'smoke') {
          p.scale.setScalar(1 + t * 3);
          mat.opacity = 0.85 * (1 - t);
        } else {
          p.scale.setScalar(1 - t * 0.5);
          mat.opacity = 0.9 * (1 - t);
        }
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }
}

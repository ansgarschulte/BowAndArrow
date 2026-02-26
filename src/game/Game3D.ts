import { levels } from '../levels/levelConfig';
import { ScoreManager } from '../systems/ScoreManager';
import { InputManager3D } from '../systems/InputManager3D';
import { Environment3D, getWorldTheme } from './Environment3D';
import { Archer3D } from './Archer3D';
import { Arrow3D } from './Arrow3D';
import { Target3D } from './Target3D';
import { AimSystem3D } from './AimSystem3D';
import { HUD3D } from '../ui/HUD3D';
import { LevelCompleteScreen } from '../ui/LevelCompleteScreen';
import { GameOverScreen } from '../ui/GameOverScreen';
import { GameSettings, getSelectedBow, BowTypes } from '../config/gameConfig';
import { Sound } from '../systems/SoundManager';
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
  private timeScale: number = 1;
  private bulletTimeActive: boolean = false;
  private onKeyDown: ((e: KeyboardEvent) => void) | null = null;

  constructor(engine: Engine3D, level: number) {
    this.engine = engine;
    this.level = level;

    const levelConfig = levels[level - 1];
    if (!levelConfig) {
      engine.showMenu();
      return;
    }

    // Environment
    this.environment = new Environment3D(engine.scene, getWorldTheme(level));

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

    // Score — only count required targets (not bonus/bomb)
    const requiredTargets = levelConfig.targets.filter(t => t.type !== 'bonus' && t.type !== 'bomb').length;
    this.scoreManager = new ScoreManager(requiredTargets, levelConfig.arrowCount);

    // HUD
    this.hud = new HUD3D();
    this.hud.init(level, levelConfig.wind, () => {
      if (!this.finished) {
        this.finished = true;
        this.engine.showMenu();
      }
    });

    // Overlays
    this.levelComplete = new LevelCompleteScreen();
    this.gameOver = new GameOverScreen();

    // ESC to exit level
    this.onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !this.finished) {
        this.finished = true;
        this.engine.showMenu();
      }
    };
    window.addEventListener('keydown', this.onKeyDown);

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
    // Haptic + sound feedback on shoot
    try { navigator.vibrate?.(15); } catch { /* noop */ }
    Sound.shoot();
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
    // Apply bullet-time slow motion
    const effectiveDelta = delta * this.timeScale;

    if (this.shootCooldown > 0) {
      this.shootCooldown -= effectiveDelta;
    }

    // Input (not affected by timescale)
    this.inputManager.update();
    const input = this.inputManager.getState();

    // Archer animation
    this.archer.update(effectiveDelta, input.aimAngleH, input.aimAngleV, input.power, input.isAiming);

    // Aim system with aim-assist
    const shootPos = this.archer.getShootPosition();
    let shootDir = this.archer.getShootDirection(input.aimAngleH, input.aimAngleV);

    // Aim-assist: snap direction toward nearest target
    if (input.isAiming && input.power > 0) {
      shootDir = this.applyAimAssist(shootPos, shootDir);
    }

    this.aimSystem.update(shootPos, shootDir, input.power, input.isAiming);

    // Targets
    this.targets.forEach(t => t.update(effectiveDelta));

    // Arrows + collisions
    this.arrows = this.arrows.filter(arrow => {
      const active = arrow.update(effectiveDelta);
      if (!active) {
        this.scoreManager.registerMiss();
        Sound.miss();
        return false;
      }

      const arrowPos = arrow.getPosition();

      // Check hits
      for (const target of this.targets) {
        const result = target.checkHit(arrowPos);
        if (result.hit) {
          const bowType = getSelectedBow();
          target.onHit(bowType);

          if (target.isBomb()) {
            // Bomb: lose points, screen shake, penalty sound
            this.scoreManager.registerBombHit();
            this.hud.showHitPoints(-200, 0);
            try { navigator.vibrate?.([50, 30, 50, 30, 80]); } catch { /* noop */ }
            Sound.gameOver();
            this.shakeScreen();
          } else {
            const multiplier = target.isBonus() ? 3 : 1;
            const countAsHit = target.isRequired();
            const points = this.scoreManager.registerHit(result.distance, 1, multiplier, countAsHit);
            this.hud.showHitPoints(points, this.scoreManager.getCombo());
            try { navigator.vibrate?.([30, 20, 50]); } catch { /* noop */ }
            Sound.hit();
            const currentCombo = this.scoreManager.getCombo();
            if (currentCombo > 1) Sound.combo(currentCombo);

            // Bullet-time on last required target hit
            if (countAsHit && this.scoreManager.isLevelComplete() && !this.bulletTimeActive) {
              this.activateBulletTime();
            }
          }
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
        Sound.levelComplete();
        setTimeout(() => {
          this.inputManager.disableInput();
          this.levelComplete.show({
            level: this.level,
            score: this.scoreManager.getScore(),
            hits: this.scoreManager.getHits(),
            totalTargets: this.scoreManager.getTotalTargets(),
            combo: this.scoreManager.getMaxCombo(),
            onNext: () => this.engine.startLevel(this.level + 1),
            onMenu: () => this.engine.showMenu(),
          });
        }, 1000);
      } else if (this.scoreManager.isGameOver() && this.arrows.every(a => !a.isActive())) {
        this.finished = true;
        this.canShoot = false;
        Sound.gameOver();
        setTimeout(() => {
          this.inputManager.disableInput();
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
    if (this.onKeyDown) window.removeEventListener('keydown', this.onKeyDown);
    this.inputManager.destroy();
    this.environment.destroy();
    this.archer.destroy();
    this.arrows.forEach(a => a.destroy());
    this.targets.forEach(t => t.destroy());
    this.aimSystem.destroy();
    this.hud.destroy();
    this.levelComplete.destroy();
    this.gameOver.destroy();
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

  private shakeScreen(): void {
    const canvas = this.engine.renderer.domElement;
    let frame = 0;
    const shake = () => {
      if (frame >= 10) {
        canvas.style.transform = '';
        return;
      }
      const x = (Math.random() - 0.5) * 12;
      const y = (Math.random() - 0.5) * 12;
      canvas.style.transform = `translate(${x}px, ${y}px)`;
      frame++;
      requestAnimationFrame(shake);
    };
    shake();
  }

  private activateBulletTime(): void {
    this.bulletTimeActive = true;
    this.timeScale = 0.2; // 5x slow motion

    // Show "EPIC!" text
    const el = document.createElement('div');
    el.textContent = '🎬 EPIC SHOT! 🎬';
    el.style.cssText = `
      position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%);
      font-size: 36px; font-weight: bold; color: #fff;
      text-shadow: 0 0 20px #ff4444, 0 0 40px #ff0000;
      pointer-events: none; z-index: 15;
      animation: hitFloat 1.5s ease-out forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);

    // Gradually restore time
    let frame = 0;
    const restore = () => {
      frame++;
      if (frame > 30) {
        this.timeScale = 1;
        this.bulletTimeActive = false;
        return;
      }
      this.timeScale = 0.2 + (frame / 30) * 0.8;
      requestAnimationFrame(restore);
    };
    setTimeout(() => requestAnimationFrame(restore), 800);
  }
}

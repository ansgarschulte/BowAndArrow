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
import type { Engine3D } from './Engine3D';

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
      this.targets.push(new Target3D(engine.scene, tc));
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
    const direction = this.archer.getShootDirection(angleH, angleV);

    const levelConfig = levels[this.level - 1];
    const arrow = new Arrow3D(
      this.engine.scene,
      startPos,
      direction,
      power,
      levelConfig.wind
    );
    this.arrows.push(arrow);

    this.shootCooldown = 0.5;
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

    // Aim system
    const shootPos = this.archer.getShootPosition();
    const shootDir = this.archer.getShootDirection(input.aimAngleH, input.aimAngleV);
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
          target.onHit();
          const points = this.scoreManager.registerHit(result.distance, 1);
          this.hud.showHitPoints(points);
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
}

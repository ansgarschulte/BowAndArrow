import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, Colors } from '../config/gameConfig';
import { levels } from '../levels/levelConfig';
import { InputManager } from '../systems/InputManager';
import { ScoreManager } from '../systems/ScoreManager';
import { Bow } from '../objects/Bow';
import { Arrow } from '../objects/Arrow';
import { Target } from '../objects/Target';
import { Ring } from '../objects/Ring';
import { AimLine } from '../objects/AimLine';
import { HUD } from '../ui/HUD';

export class GameScene extends Phaser.Scene {
  private level: number = 1;
  private inputManager!: InputManager;
  private scoreManager!: ScoreManager;
  private bow!: Bow;
  private arrows: Arrow[] = [];
  private targets: Target[] = [];
  private rings: Ring[] = [];
  private aimLine!: AimLine;
  private hud!: HUD;
  private canShoot: boolean = false;
  private shootCooldown: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { level: number }): void {
    this.level = data.level || 1;
  }

  create(): void {
    const levelConfig = levels[this.level - 1];
    if (!levelConfig) {
      this.scene.start('MenuScene');
      return;
    }

    // Clean up
    this.arrows = [];
    this.targets = [];
    this.rings = [];

    // Background
    this.createBackground(levelConfig.groundY);

    // Initialize systems
    this.scoreManager = new ScoreManager(levelConfig.targets.length, levelConfig.arrowCount);
    this.inputManager = new InputManager(this);
    this.inputManager.onShoot((angle, power) => this.shoot(angle, power));

    // Create game objects
    this.bow = new Bow(this);
    this.aimLine = new AimLine(this);

    // Targets
    levelConfig.targets.forEach(tc => {
      this.targets.push(new Target(this, tc));
    });

    // Rings
    levelConfig.rings.forEach(rc => {
      this.rings.push(new Ring(this, rc));
    });

    // HUD
    this.hud = new HUD(this, this.level, levelConfig.wind);
    this.hud.showLevelIntro(levelConfig.name, levelConfig.subtitle);

    // Enable shooting after intro
    this.canShoot = false;
    this.time.delayedCall(2200, () => {
      this.canShoot = true;
    });
  }

  private createBackground(groundY: number): void {
    const bg = this.add.graphics();

    // Sky gradient
    bg.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x5da3d9, 0x5da3d9, 1);
    bg.fillRect(0, 0, GAME_WIDTH, groundY);

    // Mountains/hills in background
    bg.fillStyle(0x6b8e5a, 0.6);
    bg.beginPath();
    bg.moveTo(0, groundY - 60);
    bg.lineTo(80, groundY - 120);
    bg.lineTo(160, groundY - 80);
    bg.lineTo(250, groundY - 140);
    bg.lineTo(340, groundY - 90);
    bg.lineTo(GAME_WIDTH, groundY - 70);
    bg.lineTo(GAME_WIDTH, groundY);
    bg.lineTo(0, groundY);
    bg.closePath();
    bg.fillPath();

    // Ground
    bg.fillStyle(Colors.grass, 1);
    bg.fillRect(0, groundY, GAME_WIDTH, GAME_HEIGHT - groundY);

    // Ground details
    bg.fillStyle(Colors.grassDark, 0.3);
    for (let i = 0; i < GAME_WIDTH; i += 25) {
      const h = 5 + Math.random() * 15;
      bg.fillRect(i, groundY - h / 2, 2, h);
    }

    // Shooting platform
    bg.fillStyle(Colors.wood, 1);
    bg.fillRoundedRect(GAME_WIDTH / 2 - 50, GAME_HEIGHT - 60, 100, 20, 5);
    bg.fillStyle(0x795548, 1);
    bg.fillRect(GAME_WIDTH / 2 - 40, GAME_HEIGHT - 42, 10, 40);
    bg.fillRect(GAME_WIDTH / 2 + 30, GAME_HEIGHT - 42, 10, 40);

    // Clouds
    this.createClouds();

    bg.setDepth(0);
  }

  private createClouds(): void {
    for (let i = 0; i < 4; i++) {
      const cloudX = Math.random() * GAME_WIDTH;
      const cloudY = 40 + Math.random() * 80;
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.6);
      cloud.fillEllipse(cloudX, cloudY, 60 + Math.random() * 40, 20 + Math.random() * 15);
      cloud.fillEllipse(cloudX + 20, cloudY - 5, 40, 18);
      cloud.fillEllipse(cloudX - 15, cloudY + 3, 35, 15);
      cloud.setDepth(1);

      // Gentle cloud movement
      this.tweens.add({
        targets: cloud,
        x: cloud.x + 50,
        duration: 15000 + Math.random() * 10000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private shoot(angle: number, power: number): void {
    if (!this.canShoot || this.shootCooldown > 0) return;
    if (this.scoreManager.getArrowsLeft() <= 0) return;

    this.scoreManager.useArrow();

    const pos = this.bow.getShootPosition();
    const levelConfig = levels[this.level - 1];
    const arrow = new Arrow(this, pos.x, pos.y, angle, power, levelConfig.wind);
    this.arrows.push(arrow);

    this.shootCooldown = 500; // ms cooldown

    // Screen shake
    this.cameras.main.shake(100, 0.003);
  }

  update(_time: number, delta: number): void {
    // Update cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown -= delta;
    }

    // Input
    this.inputManager.update();
    const inputState = this.inputManager.getState();

    // Bow
    this.bow.update(inputState.aimAngle, inputState.power, inputState.isAiming);

    // Aim line
    const bowPos = this.bow.getShootPosition();
    this.aimLine.update(bowPos.x, bowPos.y, inputState.aimAngle, inputState.power, inputState.isAiming);

    // Update targets
    this.targets.forEach(t => t.update(delta));

    // Update rings
    this.rings.forEach(r => r.update(delta));

    // Update arrows and check collisions
    this.arrows = this.arrows.filter(arrow => {
      const active = arrow.update(delta);
      if (!active) return false;

      const arrowPos = arrow.getPosition();

      // Check ring collisions (block arrow if it hits ring border)
      for (const ring of this.rings) {
        if (ring.checkBlocked(arrowPos.x, arrowPos.y)) {
          arrow.deactivate();
          return false;
        }
        if (ring.checkPassThrough(arrowPos.x, arrowPos.y)) {
          ring.flashSuccess();
        }
      }

      // Check target hits
      for (const target of this.targets) {
        const result = target.checkHit(arrowPos.x, arrowPos.y);
        if (result.hit) {
          target.onHit();
          const points = this.scoreManager.registerHit(result.distance, 1);
          this.showHitPoints(arrowPos.x, arrowPos.y, points);
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
      inputState.isAiming ? inputState.power : 0
    );

    // Check win/lose
    if (this.scoreManager.isLevelComplete()) {
      this.canShoot = false;
      this.time.delayedCall(1000, () => {
        this.cleanup();
        this.scene.start('LevelCompleteScene', {
          level: this.level,
          score: this.scoreManager.getScore(),
          hits: this.scoreManager.getHits(),
          totalTargets: this.scoreManager.getTotalTargets(),
        });
      });
    } else if (this.scoreManager.isGameOver() && this.arrows.every(a => !a.isActive())) {
      this.canShoot = false;
      this.time.delayedCall(1500, () => {
        this.cleanup();
        this.scene.start('GameOverScene', {
          level: this.level,
          score: this.scoreManager.getScore(),
          hits: this.scoreManager.getHits(),
          totalTargets: this.scoreManager.getTotalTargets(),
        });
      });
    }
  }

  private showHitPoints(x: number, y: number, points: number): void {
    const text = this.add.text(x, y, `+${points}`, {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(25);

    this.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  private cleanup(): void {
    this.inputManager.destroy();
    this.bow.destroy();
    this.aimLine.destroy();
    this.arrows.forEach(a => a.destroy());
    this.targets.forEach(t => t.destroy());
    this.rings.forEach(r => r.destroy());
    this.hud.destroy();
  }
}

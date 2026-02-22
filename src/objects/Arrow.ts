import Phaser from 'phaser';
import { GameSettings, Colors } from '../config/gameConfig';

export class Arrow {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;
  private vx: number;
  private vy: number;
  private wind: number;
  private active: boolean = true;
  private trail: { x: number; y: number }[] = [];
  private scale: number = 1;

  constructor(
    scene: Phaser.Scene,
    startX: number,
    startY: number,
    angle: number,
    power: number,
    wind: number
  ) {
    this.scene = scene;
    this.x = startX;
    this.y = startY;
    this.wind = wind * GameSettings.windMax;

    const speed = power * GameSettings.arrowSpeed;
    this.vx = Math.sin(angle) * speed;
    this.vy = -speed; // upward

    this.graphics = scene.add.graphics();
    this.graphics.setDepth(8);
  }

  update(delta: number): boolean {
    if (!this.active) return false;

    const dt = delta / 1000;

    // Physics
    this.vx += this.wind * dt;
    this.vy += GameSettings.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 2.5D: scale down as arrow "moves away"
    const progress = Math.max(0, 1 - (this.y / 844) * 0.5);
    this.scale = Phaser.Math.Clamp(progress, 0.3, 1);

    // Trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 15) this.trail.shift();

    // Draw
    this.draw();

    // Out of bounds
    if (this.y < -50 || this.y > 900 || this.x < -50 || this.x > 440) {
      this.active = false;
      this.fadeOut();
      return false;
    }

    return true;
  }

  private draw(): void {
    this.graphics.clear();

    // Trail
    for (let i = 0; i < this.trail.length - 1; i++) {
      const alpha = (i / this.trail.length) * 0.3;
      this.graphics.lineStyle(2 * this.scale, Colors.aimLine, alpha);
      this.graphics.lineBetween(
        this.trail[i].x, this.trail[i].y,
        this.trail[i + 1].x, this.trail[i + 1].y
      );
    }

    // Arrow body
    const angle = Math.atan2(this.vy, this.vx);
    const len = 25 * this.scale;

    const tipX = this.x + Math.cos(angle) * len;
    const tipY = this.y + Math.sin(angle) * len;
    const tailX = this.x - Math.cos(angle) * len;
    const tailY = this.y - Math.sin(angle) * len;

    // Shaft
    this.graphics.lineStyle(3 * this.scale, Colors.arrow, 1);
    this.graphics.lineBetween(tailX, tailY, tipX, tipY);

    // Tip
    const tipLen = 8 * this.scale;
    const perpX = -Math.sin(angle) * tipLen * 0.5;
    const perpY = Math.cos(angle) * tipLen * 0.5;
    this.graphics.fillStyle(0x9e9e9e, 1);
    this.graphics.fillTriangle(
      tipX + Math.cos(angle) * tipLen, tipY + Math.sin(angle) * tipLen,
      tipX + perpX, tipY + perpY,
      tipX - perpX, tipY - perpY
    );

    // Fletching
    this.graphics.fillStyle(Colors.targetRed, 1);
    const fletchLen = 6 * this.scale;
    this.graphics.fillTriangle(
      tailX, tailY,
      tailX + perpX * 0.8, tailY + perpY * 0.8,
      tailX + Math.cos(angle) * fletchLen, tailY + Math.sin(angle) * fletchLen
    );
    this.graphics.fillTriangle(
      tailX, tailY,
      tailX - perpX * 0.8, tailY - perpY * 0.8,
      tailX + Math.cos(angle) * fletchLen, tailY + Math.sin(angle) * fletchLen
    );
  }

  private fadeOut(): void {
    this.scene.tweens.add({
      targets: this.graphics,
      alpha: 0,
      duration: 300,
      onComplete: () => this.graphics.destroy(),
    });
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getScale(): number {
    return this.scale;
  }

  isActive(): boolean {
    return this.active;
  }

  deactivate(): void {
    this.active = false;
  }

  destroy(): void {
    this.graphics.destroy();
  }
}

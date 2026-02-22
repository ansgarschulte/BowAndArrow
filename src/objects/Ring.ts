import Phaser from 'phaser';
import { RingConfig } from '../levels/levelConfig';

export class Ring {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Image;
  private config: RingConfig;
  private baseX: number;
  private baseY: number;
  private elapsed: number = 0;
  private innerRadius: number;

  constructor(scene: Phaser.Scene, config: RingConfig) {
    this.scene = scene;
    this.config = config;
    this.baseX = config.x;
    this.baseY = config.y;

    this.sprite = scene.add.image(config.x, config.y, 'ring');
    this.sprite.setScale(config.scale);
    this.sprite.setDepth(4);
    this.sprite.setAlpha(0.9);

    this.innerRadius = 28 * config.scale; // inner passable area
  }

  update(delta: number): void {
    this.elapsed += delta / 1000;

    if (this.config.movement) {
      const { pattern, speed, range } = this.config.movement;
      const t = this.elapsed * speed * 0.05;

      switch (pattern) {
        case 'horizontal':
          this.sprite.x = this.baseX + Math.sin(t) * range;
          break;
        case 'vertical':
          this.sprite.y = this.baseY + Math.sin(t) * range;
          break;
        case 'sine':
          this.sprite.x = this.baseX + Math.sin(t) * range;
          this.sprite.y = this.baseY + Math.cos(t * 0.7) * range * 0.5;
          break;
      }
    }
  }

  // Returns true if the arrow passes through the ring center
  checkPassThrough(arrowX: number, arrowY: number): boolean {
    const dx = arrowX - this.sprite.x;
    const dy = arrowY - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= this.innerRadius;
  }

  // Returns true if the arrow hits the ring border (blocked)
  checkBlocked(arrowX: number, arrowY: number): boolean {
    const dx = arrowX - this.sprite.x;
    const dy = arrowY - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const outerRadius = 36 * this.config.scale;
    return dist > this.innerRadius && dist <= outerRadius;
  }

  flashSuccess(): void {
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: 1,
    });
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

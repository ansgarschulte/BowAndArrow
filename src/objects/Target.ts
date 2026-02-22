import Phaser from 'phaser';
import { GameSettings } from '../config/gameConfig';
import { TargetConfig } from '../levels/levelConfig';

export class Target {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
  private config: TargetConfig;
  private baseX: number;
  private baseY: number;
  private elapsed: number = 0;
  private hit: boolean = false;
  private hitRadius: number;

  constructor(scene: Phaser.Scene, config: TargetConfig) {
    this.scene = scene;
    this.config = config;
    this.baseX = config.x;
    this.baseY = config.y;

    if (config.type === 'emoji' && config.emojiIndex !== undefined) {
      this.sprite = scene.add.image(config.x, config.y, `emoji_${config.emojiIndex}`);
    } else if (config.type === 'duck') {
      this.sprite = scene.add.image(config.x, config.y, 'duck');
    } else {
      this.sprite = scene.add.image(config.x, config.y, 'target');
    }

    this.sprite.setScale(config.scale);
    this.sprite.setDepth(3);
    this.hitRadius = 30 * config.scale * GameSettings.hitRadiusMultiplier;
  }

  update(delta: number): void {
    if (this.hit) return;

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
        case 'circle':
          this.sprite.x = this.baseX + Math.cos(t) * range;
          this.sprite.y = this.baseY + Math.sin(t) * range;
          break;
      }
    }
  }

  checkHit(arrowX: number, arrowY: number): { hit: boolean; distance: number } {
    if (this.hit) return { hit: false, distance: Infinity };

    const dx = arrowX - this.sprite.x;
    const dy = arrowY - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.hitRadius) {
      return { hit: true, distance: dist };
    }
    return { hit: false, distance: dist };
  }

  onHit(): void {
    this.hit = true;

    // Hit animation
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: this.config.scale * 1.3,
      scaleY: this.config.scale * 1.3,
      alpha: 0,
      duration: 400,
      ease: 'Back.easeIn',
    });

    // Particle burst
    this.createHitParticles();
  }

  private createHitParticles(): void {
    const colors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xff6b6b];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 80 + Math.random() * 60;
      const particle = this.scene.add.graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 3 + Math.random() * 4;
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, size);
      particle.setPosition(this.sprite.x, this.sprite.y);
      particle.setDepth(15);

      this.scene.tweens.add({
        targets: particle,
        x: this.sprite.x + Math.cos(angle) * speed,
        y: this.sprite.y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.3,
        duration: 500 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }

  isHit(): boolean {
    return this.hit;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

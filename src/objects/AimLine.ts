import Phaser from 'phaser';
import { Colors, GameSettings } from '../config/gameConfig';

export class AimLine {
  private graphics: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(5);
  }

  update(
    startX: number,
    startY: number,
    angle: number,
    power: number,
    isAiming: boolean
  ): void {
    this.graphics.clear();
    if (!isAiming || power < GameSettings.minPower) return;

    const distance = power * 400 * GameSettings.aimLineLength;
    const dashLength = 8;
    const gapLength = 8;
    const totalSegments = Math.floor(distance / (dashLength + gapLength));

    this.graphics.lineStyle(3, Colors.aimLine, 0.8);

    const dirX = Math.sin(angle);
    const dirY = -1; // upward

    for (let i = 0; i < totalSegments; i++) {
      const segStart = i * (dashLength + gapLength);
      const segEnd = segStart + dashLength;

      const x1 = startX + dirX * segStart;
      const y1 = startY + dirY * segStart;
      const x2 = startX + dirX * segEnd;
      const y2 = startY + dirY * segEnd;

      // Fade out towards end
      const alpha = 0.8 - (i / totalSegments) * 0.6;
      this.graphics.lineStyle(3, Colors.aimLine, alpha);
      this.graphics.lineBetween(x1, y1, x2, y2);
    }
  }

  destroy(): void {
    this.graphics.destroy();
  }
}

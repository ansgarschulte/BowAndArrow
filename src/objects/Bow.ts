import Phaser from 'phaser';
import { Colors, GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';

export class Bow {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bowGraphics: Phaser.GameObjects.Graphics;
  private stringGraphics: Phaser.GameObjects.Graphics;
  private drawAmount: number = 0;
  public x: number;
  public y: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.x = GAME_WIDTH / 2;
    this.y = GAME_HEIGHT - 120;

    this.bowGraphics = scene.add.graphics();
    this.stringGraphics = scene.add.graphics();
    this.container = scene.add.container(this.x, this.y, [
      this.bowGraphics,
      this.stringGraphics,
    ]);
    this.container.setDepth(10);
    this.drawBow(0, 0);
  }

  update(aimAngle: number, power: number, isAiming: boolean): void {
    this.drawAmount = power;
    this.container.setRotation(aimAngle * 0.3);
    this.drawBow(aimAngle, power);
  }

  private drawBow(angle: number, power: number): void {
    this.bowGraphics.clear();
    this.stringGraphics.clear();

    const bowWidth = 8;
    const bowHeight = 100;
    const bendAmount = 10 + power * 15;

    // Bow limb
    this.bowGraphics.lineStyle(bowWidth, Colors.wood, 1);
    this.bowGraphics.beginPath();
    this.bowGraphics.arc(bendAmount, 0, bowHeight / 2, -Math.PI / 2, Math.PI / 2, false);
    this.bowGraphics.strokePath();

    // Grip
    this.bowGraphics.fillStyle(0x5d4037, 1);
    this.bowGraphics.fillRoundedRect(bendAmount - 6, -8, 12, 16, 4);

    // String
    const stringPull = power * 30;
    this.stringGraphics.lineStyle(2, Colors.bowString, 1);
    this.stringGraphics.beginPath();
    this.stringGraphics.moveTo(bendAmount, -bowHeight / 2);
    this.stringGraphics.lineTo(-stringPull, 0);
    this.stringGraphics.lineTo(bendAmount, bowHeight / 2);
    this.stringGraphics.strokePath();

    // Arrow on string
    if (power > 0) {
      const arrowLen = 50;
      this.bowGraphics.lineStyle(3, Colors.arrow, 1);
      this.bowGraphics.lineBetween(
        -stringPull, 0,
        -stringPull + arrowLen, 0
      );
      // Arrow tip
      this.bowGraphics.fillStyle(0x9e9e9e, 1);
      this.bowGraphics.fillTriangle(
        -stringPull + arrowLen, 0,
        -stringPull + arrowLen - 6, -4,
        -stringPull + arrowLen - 6, 4
      );
    }
  }

  getShootPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  destroy(): void {
    this.container.destroy();
  }
}

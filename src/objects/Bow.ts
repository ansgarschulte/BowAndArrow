import Phaser from 'phaser';
import { Colors, GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';

export class Bow {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private backLayer: Phaser.GameObjects.Graphics;
  private bodyLayer: Phaser.GameObjects.Graphics;
  private frontLayer: Phaser.GameObjects.Graphics;
  public x: number;
  public y: number;

  // Robin Hood palette
  private static readonly SKIN = 0xf5cba7;
  private static readonly TUNIC = 0x2e7d32;
  private static readonly TUNIC_DARK = 0x1b5e20;
  private static readonly HAT = 0x1b5e20;
  private static readonly FEATHER = 0xc62828;
  private static readonly BELT = 0x5d4037;
  private static readonly BOOTS = 0x3e2723;
  private static readonly PANTS = 0x6d4c41;
  private static readonly QUIVER = 0x795548;
  private static readonly HAIR = 0x4e342e;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.x = GAME_WIDTH / 2;
    this.y = GAME_HEIGHT - 85;

    this.backLayer = scene.add.graphics();
    this.bodyLayer = scene.add.graphics();
    this.frontLayer = scene.add.graphics();

    this.container = scene.add.container(this.x, this.y, [
      this.backLayer,
      this.bodyLayer,
      this.frontLayer,
    ]);
    this.container.setDepth(10);
    this.draw(0, 0, false);
  }

  update(aimAngle: number, power: number, isAiming: boolean): void {
    this.container.setRotation(aimAngle * 0.15);
    this.draw(aimAngle, power, isAiming);
  }

  private draw(angle: number, power: number, isAiming: boolean): void {
    this.backLayer.clear();
    this.bodyLayer.clear();
    this.frontLayer.clear();

    // Subtle breathing
    const breathe = Math.sin(this.scene.time.now / 800) * 1.2;

    this.drawLegs(this.backLayer);
    this.drawDrawArm(this.backLayer, power, isAiming);
    this.drawTorso(this.bodyLayer, breathe);
    this.drawQuiver(this.bodyLayer, breathe);
    this.drawHead(this.bodyLayer, angle, breathe);
    this.drawBowArm(this.frontLayer, power);
    this.drawBowAndString(this.frontLayer, power);
  }

  private drawLegs(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(Bow.PANTS, 1);
    g.fillRoundedRect(-9, 16, 8, 25, 3);
    g.fillRoundedRect(1, 16, 8, 25, 3);

    g.fillStyle(Bow.BOOTS, 1);
    g.fillRoundedRect(-10, 36, 10, 9, { tl: 0, tr: 0, bl: 3, br: 3 });
    g.fillRoundedRect(0, 36, 10, 9, { tl: 0, tr: 0, bl: 3, br: 3 });

    g.lineStyle(1, 0x2d1e14, 0.4);
    g.lineBetween(-10, 36, 0, 36);
    g.lineBetween(0, 36, 10, 36);
  }

  private drawTorso(g: Phaser.GameObjects.Graphics, breathe: number): void {
    const by = breathe * 0.3;

    g.fillStyle(Bow.TUNIC, 1);
    g.beginPath();
    g.moveTo(-14, -14 + by);
    g.lineTo(14, -14 + by);
    g.lineTo(12, 18);
    g.lineTo(-12, 18);
    g.closePath();
    g.fillPath();

    g.lineStyle(1, Bow.TUNIC_DARK, 0.35);
    g.lineBetween(0, -12 + by, 0, 16);
    g.lineBetween(-14, -13 + by, -10, -6 + by);
    g.lineBetween(14, -13 + by, 10, -6 + by);

    g.fillStyle(Bow.BELT, 1);
    g.fillRect(-13, 6, 26, 4);
    g.fillStyle(Colors.gold, 1);
    g.fillRect(-3, 6, 6, 4);
    g.lineStyle(1, 0xb8860b, 0.5);
    g.strokeRect(-3, 6, 6, 4);
  }

  private drawQuiver(g: Phaser.GameObjects.Graphics, breathe: number): void {
    const by = breathe * 0.2;
    g.fillStyle(Bow.QUIVER, 1);
    g.fillRoundedRect(5, -17 + by, 7, 26, 2);
    g.lineStyle(1, 0x4e342e, 0.5);
    g.lineBetween(5, -17 + by, 12, -17 + by);

    g.lineStyle(2, Bow.BELT, 0.6);
    g.lineBetween(-7, -8 + by, 9, -17 + by);

    for (let i = 0; i < 3; i++) {
      const ax = 7 + i * 2;
      const ay = -17 + by - i * 2;
      g.fillStyle(0x9e9e9e, 0.7);
      g.fillTriangle(ax, ay, ax - 2, ay - 4, ax + 2, ay - 4);
      g.lineStyle(1, Colors.arrow, 0.4);
      g.lineBetween(ax, ay, ax + 0.5, -4 + by);
    }
  }

  private drawHead(g: Phaser.GameObjects.Graphics, angle: number, breathe: number): void {
    const hx = angle * 2.5;
    const by = breathe * 0.4;

    g.fillStyle(Bow.SKIN, 1);
    g.fillRect(-3 + hx, -20 + by, 6, 6);

    g.fillStyle(Bow.SKIN, 1);
    g.fillCircle(hx, -26 + by, 10);

    g.fillStyle(Bow.HAIR, 1);
    g.beginPath();
    g.arc(hx, -26 + by, 10, -Math.PI * 0.8, Math.PI * 0.8, false);
    g.fillPath();

    g.fillStyle(Bow.SKIN, 0.9);
    g.fillCircle(hx - 10, -25 + by, 2.5);
    g.fillCircle(hx + 10, -25 + by, 2.5);

    // Robin Hood hat
    g.fillStyle(Bow.HAT, 1);
    g.beginPath();
    g.moveTo(hx - 13, -30 + by);
    g.lineTo(hx + 3, -48 + by);
    g.lineTo(hx + 13, -30 + by);
    g.closePath();
    g.fillPath();

    g.fillEllipse(hx, -31 + by, 28, 5);

    // Feather
    g.fillStyle(Bow.FEATHER, 0.9);
    g.beginPath();
    g.moveTo(hx + 3, -46 + by);
    g.lineTo(hx + 15, -53 + by);
    g.lineTo(hx + 20, -44 + by);
    g.closePath();
    g.fillPath();
    g.lineStyle(1, 0x8b0000, 0.6);
    g.lineBetween(hx + 3, -46 + by, hx + 20, -44 + by);
  }

  private drawDrawArm(g: Phaser.GameObjects.Graphics, power: number, isAiming: boolean): void {
    const sx = -12;
    const sy = -10;
    const stringPull = power * 26;
    const stringX = -stringPull;
    const stringY = -6;

    if (isAiming || power > 0) {
      const elbowX = sx - 4 - power * 2;
      const elbowY = sy + 10;

      g.lineStyle(5, Bow.SKIN, 1);
      g.lineBetween(sx, sy, elbowX, elbowY);
      g.lineBetween(elbowX, elbowY, stringX, stringY);

      g.lineStyle(6, Bow.TUNIC, 1);
      g.lineBetween(sx, sy, sx + (elbowX - sx) * 0.4, sy + (elbowY - sy) * 0.4);

      g.fillStyle(Bow.SKIN, 1);
      g.fillCircle(stringX, stringY, 3);
    } else {
      g.lineStyle(5, Bow.SKIN, 1);
      g.lineBetween(sx, sy, sx - 3, sy + 22);

      g.lineStyle(6, Bow.TUNIC, 1);
      g.lineBetween(sx, sy, sx - 1, sy + 9);

      g.fillStyle(Bow.SKIN, 1);
      g.fillCircle(sx - 3, sy + 22, 3);
    }
  }

  private drawBowArm(g: Phaser.GameObjects.Graphics, power: number): void {
    const sx = 12;
    const sy = -10;
    const bendAmount = 16 + power * 12;
    const gripX = bendAmount;
    const gripY = -6;

    const elbowX = sx + 8;
    const elbowY = sy + 6;

    g.lineStyle(5, Bow.SKIN, 1);
    g.lineBetween(sx, sy, elbowX, elbowY);
    g.lineBetween(elbowX, elbowY, gripX, gripY);

    g.lineStyle(6, Bow.TUNIC, 1);
    g.lineBetween(sx, sy, sx + (elbowX - sx) * 0.4, sy + (elbowY - sy) * 0.4);

    g.fillStyle(Bow.SKIN, 1);
    g.fillCircle(gripX, gripY, 3.5);
  }

  private drawBowAndString(g: Phaser.GameObjects.Graphics, power: number): void {
    const bowHeight = 72;
    const bendAmount = 16 + power * 12;
    const bowCY = -6;

    // Bow limb
    g.lineStyle(5, Colors.wood, 1);
    g.beginPath();
    g.arc(bendAmount, bowCY, bowHeight / 2, -Math.PI / 2, Math.PI / 2, false);
    g.strokePath();

    // Limb tips
    g.fillStyle(0x4e342e, 1);
    g.fillCircle(bendAmount, bowCY - bowHeight / 2, 2);
    g.fillCircle(bendAmount, bowCY + bowHeight / 2, 2);

    // Grip wrap
    g.fillStyle(Bow.BELT, 1);
    g.fillRoundedRect(bendAmount - 3, bowCY - 5, 6, 10, 2);

    // String
    const stringPull = power * 26;
    g.lineStyle(1.5, Colors.bowString, 1);
    g.beginPath();
    g.moveTo(bendAmount, bowCY - bowHeight / 2);
    g.lineTo(-stringPull, bowCY);
    g.lineTo(bendAmount, bowCY + bowHeight / 2);
    g.strokePath();

    // Arrow on string
    if (power > 0) {
      const ax = -stringPull;
      const ay = bowCY;
      const arrowLen = 44;

      g.lineStyle(2.5, Colors.arrow, 1);
      g.lineBetween(ax, ay, ax + arrowLen, ay);

      g.fillStyle(0x9e9e9e, 1);
      g.fillTriangle(
        ax + arrowLen, ay,
        ax + arrowLen - 5, ay - 3,
        ax + arrowLen - 5, ay + 3
      );

      g.fillStyle(Bow.FEATHER, 0.8);
      g.fillTriangle(ax + 1, ay, ax + 6, ay - 3, ax + 6, ay);
      g.fillTriangle(ax + 1, ay, ax + 6, ay + 3, ax + 6, ay);
    }
  }

  getShootPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y - 35 };
  }

  destroy(): void {
    this.container.destroy();
  }
}

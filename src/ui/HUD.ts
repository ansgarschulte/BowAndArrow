import Phaser from 'phaser';
import { GAME_WIDTH, Colors } from '../config/gameConfig';

export class HUD {
  private scene: Phaser.Scene;
  private scoreText: Phaser.GameObjects.Text;
  private arrowsText: Phaser.GameObjects.Text;
  private levelText: Phaser.GameObjects.Text;
  private hitsText: Phaser.GameObjects.Text;
  private powerBar: Phaser.GameObjects.Graphics;
  private windIndicator: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, level: number, wind: number) {
    this.scene = scene;

    // Level name
    this.levelText = scene.add.text(GAME_WIDTH / 2, 20, `Level ${level}`, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(20);

    // Score
    this.scoreText = scene.add.text(15, 20, '🏆 0', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setDepth(20);

    // Arrows
    this.arrowsText = scene.add.text(GAME_WIDTH - 15, 20, '🏹 8', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(20);

    // Hits
    this.hitsText = scene.add.text(GAME_WIDTH - 15, 46, '🎯 0/5', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(20);

    // Wind
    this.windIndicator = scene.add.text(15, 46, '', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#a0d8ef',
      stroke: '#000000',
      strokeThickness: 2,
    }).setDepth(20);

    if (wind !== 0) {
      const dir = wind > 0 ? '→' : '←';
      const strength = Math.abs(wind) > 0.5 ? '💨💨' : '💨';
      this.windIndicator.setText(`${strength} ${dir}`);
    }

    // Power bar
    this.powerBar = scene.add.graphics();
    this.powerBar.setDepth(20);
  }

  update(score: number, arrowsLeft: number, hits: number, totalTargets: number, power: number): void {
    this.scoreText.setText(`🏆 ${score}`);
    this.arrowsText.setText(`🏹 ${arrowsLeft}`);
    this.hitsText.setText(`🎯 ${hits}/${totalTargets}`);

    // Power bar
    this.powerBar.clear();
    if (power > 0) {
      const barWidth = 120;
      const barHeight = 12;
      const x = (GAME_WIDTH - barWidth) / 2;
      const y = 70;

      // Background
      this.powerBar.fillStyle(Colors.powerBarBg, 0.7);
      this.powerBar.fillRoundedRect(x, y, barWidth, barHeight, 6);

      // Fill
      const fillColor = power > 0.8 ? 0xff3333 : power > 0.5 ? Colors.powerBarFill : 0x4caf50;
      this.powerBar.fillStyle(fillColor, 1);
      this.powerBar.fillRoundedRect(x + 2, y + 2, (barWidth - 4) * power, barHeight - 4, 4);
    }
  }

  showLevelIntro(name: string, subtitle: string): void {
    const cx = GAME_WIDTH / 2;
    const nameText = this.scene.add.text(cx, 350, name, {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(30).setAlpha(0);

    const subText = this.scene.add.text(cx, 400, subtitle, {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(30).setAlpha(0);

    this.scene.tweens.add({
      targets: [nameText, subText],
      alpha: 1,
      duration: 400,
      hold: 1500,
      yoyo: true,
      onComplete: () => {
        nameText.destroy();
        subText.destroy();
      },
    });
  }

  destroy(): void {
    this.scoreText.destroy();
    this.arrowsText.destroy();
    this.levelText.destroy();
    this.hitsText.destroy();
    this.powerBar.destroy();
    this.windIndicator.destroy();
  }
}

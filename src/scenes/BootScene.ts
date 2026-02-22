import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, Colors } from '../config/gameConfig';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.createLoadingBar();
    this.generateAssets();
  }

  private createLoadingBar(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const title = this.add.text(cx, cy - 80, '🏹', { fontSize: '64px' });
    title.setOrigin(0.5);

    const subtitle = this.add.text(cx, cy - 20, 'Ziel Scheiben Schiessen\nLeicht Gemacht', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold',
    });
    subtitle.setOrigin(0.5);

    const barWidth = 260;
    const barHeight = 20;
    const barX = cx - barWidth / 2;
    const barY = cy + 60;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333, 0.8);
    barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 10);

    const barFill = this.add.graphics();
    this.load.on('progress', (value: number) => {
      barFill.clear();
      barFill.fillStyle(Colors.gold, 1);
      barFill.fillRoundedRect(barX + 2, barY + 2, (barWidth - 4) * value, barHeight - 4, 8);
    });
  }

  private generateAssets(): void {
    // Generate all textures programmatically
    this.generateTargetTexture();
    this.generateBowTexture();
    this.generateArrowTexture();
    this.generateGroundTexture();
    this.generateRingTexture();
    this.generateDuckTexture();
    this.generateEmojiTextures();
    this.generateParticleTexture();
  }

  private generateTargetTexture(): void {
    const size = 120;
    const g = this.make.graphics({ x: 0, y: 0 });
    const rings = [
      { radius: 60, color: Colors.targetRed },
      { radius: 48, color: Colors.targetWhite },
      { radius: 36, color: Colors.targetBlue },
      { radius: 24, color: Colors.targetRed },
      { radius: 12, color: Colors.targetYellow },
    ];
    rings.forEach(r => {
      g.fillStyle(r.color, 1);
      g.fillCircle(size / 2, size / 2, r.radius);
      g.lineStyle(1, 0x000000, 0.3);
      g.strokeCircle(size / 2, size / 2, r.radius);
    });
    g.generateTexture('target', size, size);
    g.destroy();
  }

  private generateBowTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.lineStyle(6, Colors.wood, 1);
    g.beginPath();
    g.arc(40, 60, 50, -Math.PI * 0.4, Math.PI * 0.4, false);
    g.strokePath();
    // String
    g.lineStyle(2, Colors.bowString, 1);
    g.lineBetween(22, 22, 22, 98);
    g.generateTexture('bow', 80, 120);
    g.destroy();
  }

  private generateArrowTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Shaft
    g.lineStyle(3, Colors.arrow, 1);
    g.lineBetween(0, 10, 60, 10);
    // Tip
    g.fillStyle(0x9e9e9e, 1);
    g.fillTriangle(60, 10, 54, 4, 54, 16);
    // Fletching
    g.fillStyle(Colors.targetRed, 1);
    g.fillTriangle(0, 10, 8, 4, 8, 10);
    g.fillTriangle(0, 10, 8, 16, 8, 10);
    g.generateTexture('arrow', 64, 20);
    g.destroy();
  }

  private generateGroundTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(Colors.grass, 1);
    g.fillRect(0, 0, GAME_WIDTH, 200);
    // Darker grass stripes
    g.fillStyle(Colors.grassDark, 0.3);
    for (let i = 0; i < GAME_WIDTH; i += 30) {
      g.fillRect(i, 0, 15, 200);
    }
    g.generateTexture('ground', GAME_WIDTH, 200);
    g.destroy();
  }

  private generateRingTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.lineStyle(6, Colors.gold, 1);
    g.strokeCircle(40, 40, 34);
    g.lineStyle(2, 0xffa000, 1);
    g.strokeCircle(40, 40, 30);
    g.generateTexture('ring', 80, 80);
    g.destroy();
  }

  private generateDuckTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Body
    g.fillStyle(0xffeb3b, 1);
    g.fillEllipse(40, 50, 50, 40);
    // Head
    g.fillCircle(60, 30, 16);
    // Beak
    g.fillStyle(0xff9800, 1);
    g.fillTriangle(70, 28, 82, 32, 70, 36);
    // Eye
    g.fillStyle(0x000000, 1);
    g.fillCircle(64, 26, 3);
    g.generateTexture('duck', 84, 70);
    g.destroy();
  }

  private generateEmojiTextures(): void {
    const emojis = ['🎯', '😜', '🤡', '🎪', '🦆'];
    emojis.forEach((emoji, i) => {
      const rt = this.add.renderTexture(0, 0, 64, 64);
      const text = this.add.text(0, 0, emoji, { fontSize: '48px' });
      text.setOrigin(0, 0);
      rt.draw(text, 8, 4);
      rt.saveTexture(`emoji_${i}`);
      text.destroy();
      rt.destroy();
    });
  }

  private generateParticleTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}

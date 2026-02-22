import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, Colors } from '../config/gameConfig';

export class MenuScene extends Phaser.Scene {
  private maxUnlockedLevel: number = 1;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.maxUnlockedLevel = this.loadProgress();
    this.createBackground();
    this.createTitle();
    this.createLevelButtons();
  }

  private createBackground(): void {
    const bg = this.add.graphics();
    // Sky gradient
    bg.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x5da3d9, 0x5da3d9, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.7);
    // Ground
    bg.fillStyle(Colors.grass, 1);
    bg.fillRect(0, GAME_HEIGHT * 0.7, GAME_WIDTH, GAME_HEIGHT * 0.3);
    bg.fillStyle(Colors.grassDark, 0.4);
    bg.fillRect(0, GAME_HEIGHT * 0.7, GAME_WIDTH, 4);
  }

  private createTitle(): void {
    const cx = GAME_WIDTH / 2;

    this.add.text(cx, 80, '🏹', { fontSize: '72px' }).setOrigin(0.5);

    this.add.text(cx, 150, 'Ziel Scheiben\nSchiessen', {
      fontSize: '36px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold',
      stroke: '#2d5016',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, 220, 'Leicht Gemacht', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffd700',
      align: 'center',
      fontStyle: 'bold',
      stroke: '#8d6e00',
      strokeThickness: 3,
    }).setOrigin(0.5);
  }

  private createLevelButtons(): void {
    const startY = 300;
    const cols = 5;
    const spacing = 65;
    const offsetX = (GAME_WIDTH - (cols - 1) * spacing) / 2;

    for (let i = 0; i < 10; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = offsetX + col * spacing;
      const y = startY + row * 80;
      const level = i + 1;
      const unlocked = level <= this.maxUnlockedLevel;

      this.createLevelButton(x, y, level, unlocked);
    }
  }

  private createLevelButton(x: number, y: number, level: number, unlocked: boolean): void {
    const bg = this.add.graphics();
    const size = 50;

    if (unlocked) {
      bg.fillStyle(Colors.uiAccent, 1);
      bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 12);

      // Glow effect
      bg.lineStyle(2, Colors.gold, 0.6);
      bg.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 12);
    } else {
      bg.fillStyle(0x555555, 0.6);
      bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 12);
    }

    const text = this.add.text(x, y, `${level}`, {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: unlocked ? '#ffffff' : '#888888',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (unlocked) {
      const zone = this.add.zone(x, y, size, size).setInteractive();
      zone.on('pointerdown', () => {
        this.tweens.add({
          targets: [text],
          scale: 0.9,
          duration: 80,
          yoyo: true,
          onComplete: () => {
            this.scene.start('GameScene', { level });
          },
        });
      });
    } else {
      // Lock icon
      this.add.text(x, y + 30, '🔒', { fontSize: '14px' }).setOrigin(0.5);
    }
  }

  private loadProgress(): number {
    try {
      const saved = localStorage.getItem('bogen_progress');
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  }
}

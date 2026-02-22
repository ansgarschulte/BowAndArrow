import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, Colors } from '../config/gameConfig';

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelCompleteScene' });
  }

  create(data: { level: number; score: number; hits: number; totalTargets: number }): void {
    const { level, score, hits, totalTargets } = data;
    const cx = GAME_WIDTH / 2;

    // Background overlay
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Panel
    bg.fillStyle(Colors.uiDark, 0.95);
    bg.fillRoundedRect(40, 200, GAME_WIDTH - 80, 420, 20);
    bg.lineStyle(3, Colors.gold, 1);
    bg.strokeRoundedRect(40, 200, GAME_WIDTH - 80, 420, 20);

    // Title
    this.add.text(cx, 240, '🎉 Level geschafft!', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stars
    const stars = hits >= totalTargets ? 3 : hits >= totalTargets * 0.6 ? 2 : 1;
    const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    this.add.text(cx, 290, starStr, { fontSize: '40px' }).setOrigin(0.5);

    // Stats
    this.add.text(cx, 350, `Treffer: ${hits}/${totalTargets}`, {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(cx, 385, `Punkte: ${score}`, {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffeb3b',
    }).setOrigin(0.5);

    // Save progress
    this.saveProgress(level + 1);

    // Next level button
    if (level < 10) {
      this.createButton(cx, 460, 'Nächstes Level ▶', () => {
        this.scene.start('GameScene', { level: level + 1 });
      });
    }

    // Menu button
    this.createButton(cx, 530, '🏠 Menü', () => {
      this.scene.start('MenuScene');
    });
  }

  private createButton(x: number, y: number, label: string, callback: () => void): void {
    const bg = this.add.graphics();
    const w = 220;
    const h = 50;
    bg.fillStyle(Colors.uiAccent, 1);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 14);

    const text = this.add.text(x, y, label, {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, w, h).setInteractive();
    zone.on('pointerdown', () => {
      this.tweens.add({
        targets: [text],
        scale: 0.95,
        duration: 60,
        yoyo: true,
        onComplete: callback,
      });
    });
  }

  private saveProgress(maxLevel: number): void {
    try {
      const current = parseInt(localStorage.getItem('bogen_progress') || '1', 10);
      if (maxLevel > current) {
        localStorage.setItem('bogen_progress', maxLevel.toString());
      }
    } catch {
      // localStorage not available
    }
  }
}

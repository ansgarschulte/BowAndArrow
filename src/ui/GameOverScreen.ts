import { addCoins } from '../config/gameConfig';

export class GameOverScreen {
  private container: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'game-over';
    this.container.className = 'overlay hidden';
    document.body.appendChild(this.container);
  }

  show(data: {
    level: number;
    score: number;
    hits: number;
    totalTargets: number;
    onRetry: () => void;
    onMenu: () => void;
  }): void {
    // Earn half points even on failure
    const earned = Math.floor(data.score * 0.5);
    const newTotal = earned > 0 ? addCoins(earned) : 0;

    this.container.className = 'overlay';
    this.container.innerHTML = `
      <div class="overlay-panel" style="border-color: #e94560;">
        <h2 style="color: #e94560;">💔 Pfeile alle!</h2>
        <div class="stats">Treffer: ${data.hits}/${data.totalTargets}</div>
        ${earned > 0 ? `<div class="stats gold">+${earned} 🪙 (halbe Punkte)</div>` : ''}
        <button class="overlay-btn" id="btn-retry">🔄 Nochmal</button>
        <button class="overlay-btn secondary" id="btn-menu-go">🏠 Menü</button>
      </div>
    `;

    const addButtonHandler = (id: string, handler: () => void) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      let handled = false;
      const action = (e: Event) => {
        e.stopPropagation();
        if (handled) return;
        handled = true;
        handler();
      };
      btn.addEventListener('click', action);
    };

    addButtonHandler('btn-retry', () => { this.hide(); data.onRetry(); });
    addButtonHandler('btn-menu-go', () => { this.hide(); data.onMenu(); });
  }

  hide(): void {
    this.container.className = 'overlay hidden';
  }
}

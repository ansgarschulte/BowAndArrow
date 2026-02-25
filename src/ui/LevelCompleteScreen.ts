import { levels } from '../levels/levelConfig';
import { addCoins } from '../config/gameConfig';

export class LevelCompleteScreen {
  private container: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'level-complete';
    this.container.className = 'overlay hidden';

    const style = document.createElement('style');
    style.id = 'overlay-styles';
    if (!document.getElementById('overlay-styles')) {
      style.textContent = `
      .overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.7); display: flex;
        justify-content: center; align-items: center;
        z-index: 200; font-family: Arial, sans-serif;
      }
      .overlay.hidden { display: none; }
      .overlay-panel {
        background: #1a1a2e; border-radius: 20px;
        padding: 32px 28px; text-align: center;
        border: 3px solid #ffd700;
        max-width: 320px; width: 90%;
      }
      .overlay-panel h2 {
        color: #ffd700; font-size: 28px; margin: 0 0 12px 0;
      }
      .overlay-panel .stars { font-size: 40px; margin: 8px 0 16px 0; }
      .overlay-panel .stats { color: #fff; font-size: 20px; margin: 8px 0; }
      .overlay-panel .stats.gold { color: #ffeb3b; }
      .overlay-btn {
        display: block; width: 220px; margin: 12px auto 0;
        padding: 14px 0; border: none; border-radius: 14px;
        font-size: 18px; font-weight: bold; color: #fff;
        background: linear-gradient(135deg, #e94560, #c62a45);
        cursor: pointer; -webkit-tap-highlight-color: transparent;
        transition: transform 0.1s; touch-action: manipulation;
      }
      .overlay-btn:active { transform: scale(0.95); }
      .overlay-btn.secondary {
        background: linear-gradient(135deg, #555, #444);
      }
    `;
      document.head.appendChild(style);
    }
    document.body.appendChild(this.container);
  }

  show(data: {
    level: number;
    score: number;
    hits: number;
    totalTargets: number;
    onNext: () => void;
    onMenu: () => void;
  }): void {
    const stars = data.hits >= data.totalTargets ? 3 : data.hits >= data.totalTargets * 0.6 ? 2 : 1;
    const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

    this.saveProgress(data.level + 1);
    const newTotal = addCoins(data.score);

    this.container.className = 'overlay';
    this.container.innerHTML = `
      <div class="overlay-panel">
        <h2>🎉 Level geschafft!</h2>
        <div class="stars">${starStr}</div>
        <div class="stats">Treffer: ${data.hits}/${data.totalTargets}</div>
        <div class="stats gold">+${data.score} 🪙</div>
        <div class="stats" style="font-size:15px; color:#aaa;">Gesamt: ${newTotal} 🪙</div>
        ${data.level < levels.length ? '<button class="overlay-btn" id="btn-next">Nächstes Level ▶</button>' : ''}
        <button class="overlay-btn secondary" id="btn-menu">🏠 Menü</button>
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

    addButtonHandler('btn-next', () => { this.hide(); data.onNext(); });
    addButtonHandler('btn-menu', () => { this.hide(); data.onMenu(); });
  }

  hide(): void {
    this.container.className = 'overlay hidden';
  }

  destroy(): void {
    this.container.remove();
  }

  private saveProgress(maxLevel: number): void {
    try {
      const current = parseInt(localStorage.getItem('bogen_progress') || '1', 10);
      if (maxLevel > current) {
        localStorage.setItem('bogen_progress', maxLevel.toString());
      }
    } catch { /* noop */ }
  }
}

import { getSelectedBow, BowTypes } from '../config/gameConfig';
import { BowSelectScreen } from './BowSelectScreen';

export class MenuScreen {
  private container: HTMLDivElement;
  private onLevelSelect: (level: number) => void;
  private bowSelectScreen: BowSelectScreen;

  constructor(onLevelSelect: (level: number) => void) {
    this.onLevelSelect = onLevelSelect;
    this.container = document.createElement('div');
    this.container.id = 'menu-screen';
    this.bowSelectScreen = new BowSelectScreen(() => this.show());

    const style = document.createElement('style');
    style.textContent = `
      #menu-screen {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; z-index: 100;
        font-family: Arial, sans-serif;
        padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
      }
      #menu-screen.hidden { display: none; }
      .menu-emoji { font-size: 72px; margin-bottom: 16px; }
      .menu-title {
        font-size: 34px; font-weight: bold; color: #fff;
        text-align: center; margin: 0 20px;
        text-shadow: 0 2px 10px rgba(0,0,0,0.5);
      }
      .menu-subtitle {
        font-size: 22px; font-weight: bold; color: #ffd700;
        margin: 8px 0 32px 0;
        text-shadow: 0 1px 5px rgba(0,0,0,0.4);
      }
      .level-grid {
        display: grid; grid-template-columns: repeat(5, 56px);
        gap: 14px; margin-top: 8px;
      }
      .level-btn {
        width: 56px; height: 56px; border-radius: 14px;
        border: none; font-size: 22px; font-weight: bold;
        cursor: pointer; transition: transform 0.1s;
        -webkit-tap-highlight-color: transparent;
      }
      .level-btn:active { transform: scale(0.92); }
      .level-btn.unlocked {
        background: linear-gradient(135deg, #e94560, #c62a45);
        color: #fff;
        box-shadow: 0 3px 10px rgba(233,69,96,0.4);
      }
      .level-btn.locked {
        background: rgba(80,80,80,0.6);
        color: #888;
        cursor: default;
      }
      .level-btn .lock-icon {
        font-size: 12px; display: block; margin-top: 2px;
      }
      .cheat-btn {
        position: absolute; top: 16px; right: 16px;
        background: none; border: none; font-size: 24px;
        cursor: pointer; opacity: 0.4; padding: 8px;
        -webkit-tap-highlight-color: transparent;
      }
      .cheat-btn:active { opacity: 1; }
      .bow-select-btn {
        display: flex; align-items: center; justify-content: center;
        gap: 8px; margin-top: 24px; padding: 12px 24px;
        border: 2px solid #ffd700; border-radius: 14px;
        background: rgba(255,215,0,0.1); color: #ffd700;
        font-size: 17px; font-weight: bold; cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: transform 0.1s;
      }
      .bow-select-btn:active { transform: scale(0.95); }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.container);
  }

  show(): void {
    const maxLevel = this.loadProgress();
    this.container.className = '';
    this.container.innerHTML = `
      <div class="menu-emoji">🏹</div>
      <div class="menu-title">Ziel Scheiben<br>Schiessen</div>
      <div class="menu-subtitle">Leicht Gemacht</div>
      <div class="level-grid">
        ${Array.from({ length: 10 }, (_, i) => {
          const level = i + 1;
          const unlocked = level <= maxLevel;
          return `<button class="level-btn ${unlocked ? 'unlocked' : 'locked'}" 
                          data-level="${level}" ${unlocked ? '' : 'disabled'}>
            ${level}${unlocked ? '' : '<span class="lock-icon">🔒</span>'}
          </button>`;
        }).join('')}
      </div>
      <button class="bow-select-btn" id="btn-bow-select">
        ${BowTypes[getSelectedBow()].emoji} ${BowTypes[getSelectedBow()].name}
      </button>
      <button class="cheat-btn" id="cheat-unlock" title="Alle Level freischalten">🔓</button>
    `;

    this.container.querySelectorAll('.level-btn.unlocked').forEach(btn => {
      const handler = (e: Event) => {
        e.preventDefault();
        const level = parseInt((btn as HTMLElement).dataset.level || '1', 10);
        this.onLevelSelect(level);
      };
      btn.addEventListener('touchstart', handler, { passive: false });
      btn.addEventListener('click', handler);
    });

    const cheatBtn = document.getElementById('cheat-unlock');
    if (cheatBtn) {
      const unlock = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        localStorage.setItem('bogen_progress', '10');
        this.show();
      };
      cheatBtn.addEventListener('touchstart', unlock, { passive: false });
      cheatBtn.addEventListener('click', unlock);
    }

    const bowBtn = document.getElementById('btn-bow-select');
    if (bowBtn) {
      const openBow = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        this.hide();
        this.bowSelectScreen.show();
      };
      bowBtn.addEventListener('touchstart', openBow, { passive: false });
      bowBtn.addEventListener('click', openBow);
    }
  }

  hide(): void {
    this.container.className = 'hidden';
  }

  private loadProgress(): number {
    try {
      return parseInt(localStorage.getItem('bogen_progress') || '1', 10);
    } catch {
      return 1;
    }
  }
}

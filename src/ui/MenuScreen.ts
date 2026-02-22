export class MenuScreen {
  private container: HTMLDivElement;
  private onLevelSelect: (level: number) => void;

  constructor(onLevelSelect: (level: number) => void) {
    this.onLevelSelect = onLevelSelect;
    this.container = document.createElement('div');
    this.container.id = 'menu-screen';

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
    `;

    this.container.querySelectorAll('.level-btn.unlocked').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const level = parseInt((btn as HTMLElement).dataset.level || '1', 10);
        this.onLevelSelect(level);
      });
    });
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

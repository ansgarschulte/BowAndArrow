import { getSelectedBow, BowTypes, getCoins, getLevelStars, checkDailyLoginBonus, getDailyChallengeLevel, hasDailyChallengeBeenPlayed } from '../config/gameConfig';
import { BowSelectScreen } from './BowSelectScreen';
import { levels } from '../levels/levelConfig';
import { Sound } from '../systems/SoundManager';

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
        display: grid; grid-template-columns: repeat(5, 48px);
        gap: 10px; margin-top: 8px;
        max-height: 55vh; overflow-y: auto;
        -webkit-overflow-scrolling: touch; padding: 4px;
      }
      .level-btn {
        width: 48px; height: 48px; border-radius: 12px;
        border: none; font-size: 20px; font-weight: bold;
        cursor: pointer; transition: transform 0.1s;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
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
      .level-stars {
        font-size: 10px; color: #ffd700; line-height: 1; margin-top: 2px;
      }
      .cheat-btn {
        position: absolute; top: 16px; right: 16px;
        background: none; border: none; font-size: 24px;
        cursor: pointer; opacity: 0.4; padding: 8px;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      .cheat-btn:active { opacity: 1; }
      .bow-select-btn {
        display: flex; align-items: center; justify-content: center;
        gap: 8px; margin-top: 24px; padding: 12px 24px;
        border: 2px solid #ffd700; border-radius: 14px;
        background: rgba(255,215,0,0.1); color: #ffd700;
        font-size: 17px; font-weight: bold; cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        transition: transform 0.1s;
      }
      .bow-select-btn:active { transform: scale(0.95); }
      .daily-btn {
        width: 80%; max-width: 300px; padding: 10px; margin-bottom: 10px;
        border: 2px solid #ff4444; border-radius: 14px;
        background: linear-gradient(135deg, rgba(255,68,68,0.2), rgba(255,136,0,0.2));
        color: #ff8800; font-size: 16px; font-weight: bold;
        cursor: pointer; touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        animation: pulse 1.5s ease-in-out infinite alternate;
      }
      .daily-btn.played {
        border-color: #555; background: rgba(50,50,50,0.3);
        color: #888; animation: none;
      }
      @keyframes pulse {
        from { transform: scale(1); }
        to { transform: scale(1.03); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.container);
  }

  show(): void {
    const maxLevel = this.loadProgress();
    const dailyLevel = getDailyChallengeLevel();
    const dailyPlayed = hasDailyChallengeBeenPlayed();

    this.container.className = '';
    this.container.innerHTML = `
      <div class="menu-emoji">🏹</div>
      <div class="menu-title">Ziel Scheiben<br>Schiessen</div>
      <div class="menu-subtitle">Leicht Gemacht</div>
      <div style="color:#ffd700; font-size:18px; font-weight:bold; margin-bottom:8px;">🪙 ${getCoins()}</div>
      <button class="daily-btn ${dailyPlayed ? 'played' : ''}" id="btn-daily" ${dailyPlayed ? 'disabled' : ''}>
        ${dailyPlayed ? '✅ Daily erledigt' : `⚡ Daily Challenge (Lvl ${dailyLevel})`}
      </button>
      <div class="level-grid">
        ${Array.from({ length: levels.length }, (_, i) => {
          const level = i + 1;
          const unlocked = level <= maxLevel;
          const stars = getLevelStars(level);
          const starStr = unlocked && stars > 0 ? '<div class="level-stars">' + '★'.repeat(stars) + '☆'.repeat(3 - stars) + '</div>' : '';
          return `<button class="level-btn ${unlocked ? 'unlocked' : 'locked'}" 
                          data-level="${level}" ${unlocked ? '' : 'disabled'}>
            ${level}${unlocked ? '' : '<span class="lock-icon">🔒</span>'}${starStr}
          </button>`;
        }).join('')}
      </div>
      <button class="bow-select-btn" id="btn-bow-select">
        🛒 Bogen-Shop (${BowTypes[getSelectedBow()].emoji} ${BowTypes[getSelectedBow()].name})
      </button>
      <button class="cheat-btn" id="cheat-unlock" title="Alle Level freischalten">🔓</button>
    `;

    // Daily login bonus popup
    const loginBonus = checkDailyLoginBonus();
    if (loginBonus) {
      Sound.buy();
      const popup = document.createElement('div');
      popup.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.7); z-index: 200;
        display: flex; align-items: center; justify-content: center;
      `;
      popup.innerHTML = `
        <div style="background: #1a1a2e; border: 3px solid #ffd700; border-radius: 20px; padding: 30px; text-align: center; max-width: 280px;">
          <div style="font-size: 48px;">🎁</div>
          <div style="color: #fff; font-size: 22px; font-weight: bold; margin: 10px 0;">Täglicher Bonus!</div>
          <div style="color: #ffd700; font-size: 28px; font-weight: bold;">+${loginBonus.coins} 🪙</div>
          <div style="color: #aaa; font-size: 14px; margin: 8px 0;">Streak: ${loginBonus.streak} Tag${loginBonus.streak > 1 ? 'e' : ''} 🔥</div>
          <button style="margin-top: 15px; padding: 10px 30px; border: none; border-radius: 10px; background: #ffd700; color: #000; font-size: 18px; font-weight: bold; cursor: pointer; touch-action: manipulation;">OK</button>
        </div>
      `;
      document.body.appendChild(popup);
      popup.querySelector('button')!.addEventListener('click', () => {
        popup.remove();
        // Refresh coin display
        const coinEl = this.container.querySelector('[style*="ffd700"]') as HTMLElement;
        if (coinEl) coinEl.textContent = `🪙 ${getCoins()}`;
      });
    }

    this.container.querySelectorAll('.level-btn.unlocked').forEach(btn => {
      btn.addEventListener('click', () => {
        Sound.click();
        const level = parseInt((btn as HTMLElement).dataset.level || '1', 10);
        this.onLevelSelect(level);
      });
    });

    // Daily challenge button
    const dailyBtn = document.getElementById('btn-daily');
    if (dailyBtn && !dailyPlayed) {
      dailyBtn.addEventListener('click', () => {
        Sound.click();
        this.onLevelSelect(dailyLevel);
      });
    }

    const cheatBtn = document.getElementById('cheat-unlock');
    if (cheatBtn) {
      cheatBtn.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        Sound.click();
        localStorage.setItem('bogen_progress', String(levels.length));
        this.show();
      });
    }

    const bowBtn = document.getElementById('btn-bow-select');
    if (bowBtn) {
      bowBtn.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        Sound.click();
        this.hide();
        this.bowSelectScreen.show();
      });
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

import { levels } from '../levels/levelConfig';
import { addCoins, saveLevelStars, saveLevelHighscore, getLevelHighscore, getLevelHighscoreName, updateHighscoreName, getDailyChallengeLevel, hasDailyChallengeBeenPlayed, markDailyChallengeComplete } from '../config/gameConfig';
import { Sound } from '../systems/SoundManager';

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
      @keyframes pulse {
        from { transform: scale(1); }
        to { transform: scale(1.08); }
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
    combo: number;
    onNext: () => void;
    onMenu: () => void;
  }): void {
    const stars = data.hits >= data.totalTargets ? 3 : data.hits >= data.totalTargets * 0.6 ? 2 : 1;
    const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

    this.saveProgress(data.level + 1);
    const newTotal = addCoins(data.score);
    saveLevelStars(data.level, stars);
    const isNewRecord = saveLevelHighscore(data.level, data.score);
    const oldHigh = getLevelHighscore(data.level);
    const oldHighName = getLevelHighscoreName(data.level);

    // Check daily challenge
    const dailyLevel = getDailyChallengeLevel();
    const isDailyChallenge = data.level === dailyLevel && !hasDailyChallengeBeenPlayed();
    let dailyBonus = 0;
    if (isDailyChallenge) {
      dailyBonus = markDailyChallengeComplete(data.score);
    }

    if (isNewRecord) Sound.newRecord();

    this.container.className = 'overlay';
    this.container.innerHTML = `
      <div class="overlay-panel">
        <h2>🎉 Level geschafft!</h2>
        <div class="stars">${starStr}</div>
        <div class="stats">Treffer: ${data.hits}/${data.totalTargets}</div>
        <div class="stats gold">+${data.score} 🪙${data.combo > 1 ? ` (Max Combo x${data.combo})` : ''}</div>
        ${isDailyChallenge ? `<div class="stats" style="color:#ff8800; font-size:18px;">⚡ Daily Bonus: +${dailyBonus} 🪙</div>` : ''}
        ${isNewRecord ? `
          <div class="stats" style="color:#ff4444; font-size:22px; animation: pulse 0.5s infinite alternate;">🎊 Neuer Rekord! 🎊</div>
          <div style="margin:10px 0 4px; display:flex; gap:6px; justify-content:center; align-items:center;">
            <input id="hs-name-input" type="text" maxlength="12" placeholder="Dein Name"
              style="padding:8px 10px; border-radius:10px; border:2px solid #ffd700; background:#111;
                     color:#fff; font-size:16px; width:140px; text-align:center;
                     -webkit-tap-highlight-color:transparent; outline:none;" />
            <button id="hs-name-save" style="padding:8px 14px; border-radius:10px; border:none;
              background:#ffd700; color:#000; font-weight:bold; font-size:16px; cursor:pointer;
              touch-action:manipulation;">✓</button>
          </div>` 
        : `<div class="stats" style="font-size:14px; color:#888;">Rekord: ${oldHigh}${oldHighName ? ` (${oldHighName})` : ''}</div>`}
        <div class="stats" style="font-size:15px; color:#aaa;">Gesamt: ${newTotal + dailyBonus} 🪙</div>
        ${data.level < levels.length ? '<button class="overlay-btn" id="btn-next">Nächstes Level ▶</button>' : ''}
        <button class="overlay-btn secondary" id="btn-menu">🏠 Menü</button>
      </div>
    `;

    // Name entry for new record
    if (isNewRecord) {
      const nameInput = document.getElementById('hs-name-input') as HTMLInputElement | null;
      const nameSaveBtn = document.getElementById('hs-name-save') as HTMLButtonElement | null;
      const saveName = () => {
        const name = nameInput?.value.trim() || '';
        if (name) updateHighscoreName(data.level, name);
      };
      nameSaveBtn?.addEventListener('click', saveName);
      nameInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveName(); });
    }

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

    addButtonHandler('btn-next', () => { Sound.click(); this.hide(); data.onNext(); });
    addButtonHandler('btn-menu', () => { Sound.click(); this.hide(); data.onMenu(); });
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

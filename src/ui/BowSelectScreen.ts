import { BowType, BowTypes, getSelectedBow, setSelectedBow, getCoins, getOwnedBows, buyBow } from '../config/gameConfig';
import { Sound } from '../systems/SoundManager';

export class BowSelectScreen {
  private container: HTMLDivElement;
  private onClose: () => void;

  constructor(onClose: () => void) {
    this.onClose = onClose;
    this.container = document.createElement('div');
    this.container.id = 'bow-select';
    this.container.className = 'overlay hidden';

    const style = document.createElement('style');
    style.textContent = `
      #bow-select {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85); display: flex;
        justify-content: center; align-items: center;
        z-index: 200; font-family: Arial, sans-serif;
      }
      #bow-select.hidden { display: none; }
      #bow-select .overlay-panel {
        background: #1a1a2e; border-radius: 20px;
        padding: 32px 28px; text-align: center;
        border: 3px solid #ffd700;
        max-width: 340px; width: 90%;
      }
      .bow-coins {
        color: #ffd700; font-size: 20px; font-weight: bold;
        margin: 0 0 14px 0;
      }
      .bow-grid {
        display: grid; grid-template-columns: 1fr; gap: 10px;
        max-height: 55vh; overflow-y: auto; width: 100%;
        padding: 4px; -webkit-overflow-scrolling: touch;
      }
      .bow-card {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 14px; border-radius: 14px;
        background: rgba(255,255,255,0.08);
        border: 2px solid transparent;
        cursor: pointer; transition: transform 0.1s;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      .bow-card:active { transform: scale(0.97); }
      .bow-card.selected {
        border-color: #ffd700;
        background: rgba(255,215,0,0.15);
      }
      .bow-card.locked {
        opacity: 0.6;
      }
      .bow-card .bow-emoji { font-size: 32px; flex-shrink: 0; }
      .bow-card .bow-info { text-align: left; flex: 1; }
      .bow-card .bow-name {
        color: #fff; font-size: 16px; font-weight: bold;
      }
      .bow-card .bow-price {
        font-size: 13px; margin-top: 2px;
      }
      .bow-card .bow-price.owned { color: #4caf50; }
      .bow-card .bow-price.affordable { color: #ffd700; }
      .bow-card .bow-price.expensive { color: #e94560; }
      .bow-card .bow-selected-badge {
        color: #ffd700; font-size: 13px; margin-top: 2px;
      }
      #bow-select .overlay-btn {
        display: block; width: 220px; margin: 12px auto 0;
        padding: 14px 0; border: none; border-radius: 14px;
        font-size: 18px; font-weight: bold; color: #fff;
        cursor: pointer; -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      #bow-select .overlay-btn.secondary {
        background: linear-gradient(135deg, #555, #444);
      }
      #bow-select .overlay-btn:active { transform: scale(0.95); }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.container);
  }

  show(): void {
    const current = getSelectedBow();
    const bowKeys = Object.keys(BowTypes) as BowType[];
    const coins = getCoins();
    const owned = getOwnedBows();

    this.container.className = 'overlay';
    this.container.innerHTML = `
      <div class="overlay-panel">
        <h2 style="color: #ffd700; font-size: 22px; margin: 0 0 8px 0;">🏹 Bogen-Shop</h2>
        <div class="bow-coins">🪙 ${coins}</div>
        <div class="bow-grid">
          ${bowKeys.map(key => {
            const bow = BowTypes[key];
            const isOwned = owned.has(key);
            const selected = key === current;
            const canAfford = coins >= bow.price;

            let priceHtml: string;
            if (isOwned && selected) {
              priceHtml = '<div class="bow-selected-badge">✓ Ausgewählt</div>';
            } else if (isOwned) {
              priceHtml = '<div class="bow-price owned">✓ Gekauft</div>';
            } else if (canAfford) {
              priceHtml = `<div class="bow-price affordable">🪙 ${bow.price} — Kaufen!</div>`;
            } else {
              priceHtml = `<div class="bow-price expensive">🔒 ${bow.price} 🪙</div>`;
            }

            return `<div class="bow-card ${selected ? 'selected' : ''} ${!isOwned ? 'locked' : ''}" data-bow="${key}">
              <div class="bow-emoji">${bow.emoji}</div>
              <div class="bow-info">
                <div class="bow-name">${bow.name}</div>
                ${priceHtml}
              </div>
            </div>`;
          }).join('')}
        </div>
        <button class="overlay-btn secondary" id="bow-back" style="margin-top: 14px;">← Zurück</button>
      </div>
    `;

    this.container.querySelectorAll('.bow-card').forEach(card => {
      card.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        const bow = (card as HTMLElement).dataset.bow as BowType;
        const isOwned = owned.has(bow);

        if (isOwned) {
          Sound.click();
          setSelectedBow(bow);
          this.show();
        } else {
          if (buyBow(bow)) {
            Sound.buy();
            setSelectedBow(bow);
            this.show();
          }
          // If can't afford, just refresh to show same state
          this.show();
        }
      });
    });

    const backBtn = document.getElementById('bow-back');
    if (backBtn) {
      backBtn.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        this.hide();
        this.onClose();
      });
    }
  }

  hide(): void {
    this.container.className = 'overlay hidden';
  }
}

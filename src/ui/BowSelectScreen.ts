import { BowType, BowTypes, getSelectedBow, setSelectedBow } from '../config/gameConfig';

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
        max-width: 320px; width: 90%;
      }
      .bow-grid {
        display: grid; grid-template-columns: 1fr; gap: 12px;
        max-height: 60vh; overflow-y: auto; width: 100%;
        padding: 4px;
      }
      .bow-card {
        display: flex; align-items: center; gap: 14px;
        padding: 14px 16px; border-radius: 14px;
        background: rgba(255,255,255,0.08);
        border: 2px solid transparent;
        cursor: pointer; transition: transform 0.1s;
        -webkit-tap-highlight-color: transparent;
      }
      .bow-card:active { transform: scale(0.97); }
      .bow-card.selected {
        border-color: #ffd700;
        background: rgba(255,215,0,0.15);
      }
      .bow-card .bow-emoji { font-size: 36px; flex-shrink: 0; }
      .bow-card .bow-info { text-align: left; }
      .bow-card .bow-name {
        color: #fff; font-size: 18px; font-weight: bold;
      }
      .bow-card .bow-selected-badge {
        color: #ffd700; font-size: 13px; margin-top: 2px;
      }
      #bow-select .overlay-btn {
        display: block; width: 220px; margin: 12px auto 0;
        padding: 14px 0; border: none; border-radius: 14px;
        font-size: 18px; font-weight: bold; color: #fff;
        cursor: pointer; -webkit-tap-highlight-color: transparent;
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

    this.container.className = 'overlay';
    this.container.innerHTML = `
      <div class="overlay-panel" style="max-width: 340px;">
        <h2 style="color: #ffd700; font-size: 24px; margin: 0 0 16px 0;">🏹 Bogen wählen</h2>
        <div class="bow-grid">
          ${bowKeys.map(key => {
            const bow = BowTypes[key];
            const selected = key === current;
            return `<div class="bow-card ${selected ? 'selected' : ''}" data-bow="${key}">
              <div class="bow-emoji">${bow.emoji}</div>
              <div class="bow-info">
                <div class="bow-name">${bow.name}</div>
                ${selected ? '<div class="bow-selected-badge">✓ Ausgewählt</div>' : ''}
              </div>
            </div>`;
          }).join('')}
        </div>
        <button class="overlay-btn secondary" id="bow-back" style="margin-top: 16px;">← Zurück</button>
      </div>
    `;

    this.container.querySelectorAll('.bow-card').forEach(card => {
      const handler = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        const bow = (card as HTMLElement).dataset.bow as BowType;
        setSelectedBow(bow);
        this.show(); // refresh to show selection
      };
      card.addEventListener('touchstart', handler, { passive: false });
      card.addEventListener('click', handler);
    });

    const backBtn = document.getElementById('bow-back');
    if (backBtn) {
      const back = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        this.hide();
        this.onClose();
      };
      backBtn.addEventListener('touchstart', back, { passive: false });
      backBtn.addEventListener('click', back);
    }
  }

  hide(): void {
    this.container.className = 'overlay hidden';
  }
}

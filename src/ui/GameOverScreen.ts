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
    this.container.className = 'overlay';
    this.container.innerHTML = `
      <div class="overlay-panel" style="border-color: #e94560;">
        <h2 style="color: #e94560;">💔 Pfeile alle!</h2>
        <div class="stats">Treffer: ${data.hits}/${data.totalTargets}</div>
        <div class="stats gold">Punkte: ${data.score}</div>
        <button class="overlay-btn" id="btn-retry">🔄 Nochmal</button>
        <button class="overlay-btn secondary" id="btn-menu-go">🏠 Menü</button>
      </div>
    `;

    document.getElementById('btn-retry')?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.hide();
      data.onRetry();
    });
    document.getElementById('btn-menu-go')?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.hide();
      data.onMenu();
    });
  }

  hide(): void {
    this.container.className = 'overlay hidden';
  }
}

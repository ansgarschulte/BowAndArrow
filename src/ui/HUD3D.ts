export class HUD3D {
  private container: HTMLDivElement;
  private scoreEl: HTMLSpanElement;
  private arrowsEl: HTMLSpanElement;
  private hitsEl: HTMLSpanElement;
  private levelEl: HTMLSpanElement;
  private windEl: HTMLSpanElement;
  private powerBar: HTMLDivElement;
  private powerFill: HTMLDivElement;
  private introEl: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'hud';
    this.container.innerHTML = `
      <div class="hud-top">
        <span class="hud-score" id="hud-score">🏆 0</span>
        <span class="hud-level" id="hud-level">Level 1</span>
        <span class="hud-arrows" id="hud-arrows">🏹 8</span>
      </div>
      <div class="hud-second">
        <span class="hud-wind" id="hud-wind"></span>
        <span class="hud-hits" id="hud-hits">🎯 0/5</span>
      </div>
      <div class="hud-power" id="hud-power">
        <div class="hud-power-fill" id="hud-power-fill"></div>
      </div>
      <div class="hud-intro" id="hud-intro"></div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #hud {
        position: fixed; top: 0; left: 0; right: 0;
        pointer-events: none; z-index: 10;
        padding: calc(12px + env(safe-area-inset-top)) 16px 0 16px;
        font-family: Arial, sans-serif;
      }
      .hud-top {
        display: flex; justify-content: space-between; align-items: center;
      }
      .hud-second {
        display: flex; justify-content: space-between; margin-top: 4px;
      }
      .hud-score, .hud-arrows, .hud-level, .hud-hits, .hud-wind {
        color: #fff; font-weight: bold; font-size: 16px;
        text-shadow: 0 1px 4px rgba(0,0,0,0.7);
      }
      .hud-level { font-size: 18px; }
      .hud-hits, .hud-wind { font-size: 14px; }
      .hud-power {
        position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
        width: 140px; height: 14px; background: rgba(0,0,0,0.5);
        border-radius: 7px; overflow: hidden; display: none;
      }
      .hud-power-fill {
        height: 100%; width: 0; border-radius: 7px;
        transition: background 0.2s;
      }
      .hud-intro {
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        text-align: center; color: #fff; opacity: 0;
        transition: opacity 0.4s;
        pointer-events: none;
      }
      .hud-intro h2 {
        font-size: 32px; margin: 0;
        text-shadow: 0 2px 8px rgba(0,0,0,0.8);
      }
      .hud-intro p {
        font-size: 20px; margin: 8px 0 0 0; color: #ffd700;
        text-shadow: 0 1px 4px rgba(0,0,0,0.6);
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.container);

    this.scoreEl = document.getElementById('hud-score') as HTMLSpanElement;
    this.arrowsEl = document.getElementById('hud-arrows') as HTMLSpanElement;
    this.hitsEl = document.getElementById('hud-hits') as HTMLSpanElement;
    this.levelEl = document.getElementById('hud-level') as HTMLSpanElement;
    this.windEl = document.getElementById('hud-wind') as HTMLSpanElement;
    this.powerBar = document.getElementById('hud-power') as HTMLDivElement;
    this.powerFill = document.getElementById('hud-power-fill') as HTMLDivElement;
    this.introEl = document.getElementById('hud-intro') as HTMLDivElement;
  }

  init(level: number, wind: number): void {
    this.levelEl.textContent = `Level ${level}`;
    if (wind !== 0) {
      const dir = wind > 0 ? '→' : '←';
      const strength = Math.abs(wind) > 0.5 ? '💨💨' : '💨';
      this.windEl.textContent = `${strength} ${dir}`;
    } else {
      this.windEl.textContent = '';
    }
    this.container.style.display = '';
  }

  update(score: number, arrowsLeft: number, hits: number, totalTargets: number, power: number): void {
    this.scoreEl.textContent = `🏆 ${score}`;
    this.arrowsEl.textContent = `🏹 ${arrowsLeft}`;
    this.hitsEl.textContent = `🎯 ${hits}/${totalTargets}`;

    if (power > 0) {
      this.powerBar.style.display = 'block';
      this.powerFill.style.width = `${power * 100}%`;
      this.powerFill.style.background = power > 0.8 ? '#ff3333' : power > 0.5 ? '#ff6b35' : '#4caf50';
    } else {
      this.powerBar.style.display = 'none';
    }
  }

  showLevelIntro(name: string, subtitle: string): void {
    this.introEl.innerHTML = `<h2>${name}</h2><p>${subtitle}</p>`;
    this.introEl.style.opacity = '1';
    setTimeout(() => {
      this.introEl.style.opacity = '0';
    }, 2000);
  }

  showHitPoints(points: number): void {
    const el = document.createElement('div');
    el.textContent = `+${points}`;
    el.style.cssText = `
      position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%);
      font-size: 28px; font-weight: bold; color: #ffd700;
      text-shadow: 0 2px 6px rgba(0,0,0,0.8);
      pointer-events: none; z-index: 15;
      animation: hitFloat 0.8s ease-out forwards;
    `;

    if (!document.getElementById('hit-float-style')) {
      const style = document.createElement('style');
      style.id = 'hit-float-style';
      style.textContent = `
        @keyframes hitFloat {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -120%) scale(0.8); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  hide(): void {
    this.container.style.display = 'none';
  }

  destroy(): void {
    this.container.remove();
  }
}

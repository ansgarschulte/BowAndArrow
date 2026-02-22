import { GameSettings } from '../config/gameConfig';

export interface InputState {
  isAiming: boolean;
  aimAngleH: number;
  aimAngleV: number;
  power: number;
  released: boolean;
}

export class InputManager3D {
  private canvas: HTMLCanvasElement;
  private state: InputState;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private isCharging: boolean = false;
  private chargeStartTime: number = 0;
  private onShootCallback: ((angleH: number, angleV: number, power: number) => void) | null = null;
  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.state = {
      isAiming: false,
      aimAngleH: 0,
      aimAngleV: 0,
      power: 0,
      released: false,
    };

    this.boundPointerDown = (e) => this.onPointerDown(e);
    this.boundPointerMove = (e) => this.onPointerMove(e);
    this.boundPointerUp = (e) => this.onPointerUp(e);

    canvas.addEventListener('pointerdown', this.boundPointerDown);
    canvas.addEventListener('pointermove', this.boundPointerMove);
    canvas.addEventListener('pointerup', this.boundPointerUp);
    canvas.addEventListener('pointercancel', this.boundPointerUp);
  }

  onShoot(callback: (angleH: number, angleV: number, power: number) => void): void {
    this.onShootCallback = callback;
  }

  getState(): InputState {
    return { ...this.state };
  }

  private onPointerDown(e: PointerEvent): void {
    e.preventDefault();
    this.touchStartX = e.clientX;
    this.touchStartY = e.clientY;
    this.isCharging = true;
    this.chargeStartTime = performance.now();
    this.state.isAiming = true;
    this.state.released = false;
    this.state.power = 0;
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.state.isAiming) return;
    e.preventDefault();

    const dx = e.clientX - this.touchStartX;
    const dy = e.clientY - this.touchStartY;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;

    // Horizontal aim
    this.state.aimAngleH = -(dx / (w * 0.4)) * GameSettings.maxAimAngleH;
    this.state.aimAngleH = Math.max(-GameSettings.maxAimAngleH, Math.min(GameSettings.maxAimAngleH, this.state.aimAngleH));

    // Vertical aim (swipe up = aim higher)
    this.state.aimAngleV = -(dy / (h * 0.4)) * GameSettings.maxAimAngleV;
    this.state.aimAngleV = Math.max(-GameSettings.maxAimAngleV * 0.5, Math.min(GameSettings.maxAimAngleV, this.state.aimAngleV));
  }

  private onPointerUp(e: PointerEvent): void {
    if (!this.state.isAiming) return;
    e.preventDefault();

    this.state.released = true;
    this.state.isAiming = false;
    this.isCharging = false;

    if (this.state.power >= GameSettings.minPower && this.onShootCallback) {
      this.onShootCallback(this.state.aimAngleH, this.state.aimAngleV, this.state.power);
    }

    this.state.power = 0;
  }

  update(): void {
    if (this.isCharging) {
      const elapsed = (performance.now() - this.chargeStartTime) / 1000;
      this.state.power = Math.min(
        elapsed / GameSettings.powerChargeSpeed,
        GameSettings.maxPower
      );
    }
  }

  destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
    this.canvas.removeEventListener('pointermove', this.boundPointerMove);
    this.canvas.removeEventListener('pointerup', this.boundPointerUp);
    this.canvas.removeEventListener('pointercancel', this.boundPointerUp);
  }
}

import Phaser from 'phaser';
import { GAME_WIDTH, GameSettings } from '../config/gameConfig';

export interface InputState {
  isAiming: boolean;
  aimAngle: number; // radians, 0 = straight up
  power: number; // 0 to 1
  released: boolean;
}

export class InputManager {
  private scene: Phaser.Scene;
  private state: InputState;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartTime: number = 0;
  private isCharging: boolean = false;
  private chargeStartTime: number = 0;
  private onShootCallback: ((angle: number, power: number) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.state = {
      isAiming: false,
      aimAngle: 0,
      power: 0,
      released: false,
    };
    this.setupInput();
  }

  onShoot(callback: (angle: number, power: number) => void): void {
    this.onShootCallback = callback;
  }

  getState(): InputState {
    return { ...this.state };
  }

  private setupInput(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
      this.touchStartTime = this.scene.time.now;
      this.isCharging = true;
      this.chargeStartTime = this.scene.time.now;
      this.state.isAiming = true;
      this.state.released = false;
      this.state.power = 0;
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.state.isAiming) return;
      const dx = pointer.x - this.touchStartX;
      // Map horizontal swipe to aim angle (-PI/3 to PI/3)
      const maxSwipe = GAME_WIDTH * 0.4;
      this.state.aimAngle = Phaser.Math.Clamp(dx / maxSwipe, -1, 1) * (Math.PI / 3);
    });

    this.scene.input.on('pointerup', () => {
      if (!this.state.isAiming) return;
      this.state.released = true;
      this.state.isAiming = false;
      this.isCharging = false;

      if (this.state.power >= GameSettings.minPower && this.onShootCallback) {
        this.onShootCallback(this.state.aimAngle, this.state.power);
      }

      this.state.power = 0;
    });
  }

  update(): void {
    if (this.isCharging) {
      const elapsed = (this.scene.time.now - this.chargeStartTime) / 1000;
      this.state.power = Phaser.Math.Clamp(
        elapsed / GameSettings.powerChargeSpeed,
        0,
        GameSettings.maxPower
      );
    }
  }

  destroy(): void {
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerup');
  }
}

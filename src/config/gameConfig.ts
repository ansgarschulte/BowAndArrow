import Phaser from 'phaser';

export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

export const Colors = {
  background: 0x87ceeb,
  grass: 0x4caf50,
  grassDark: 0x388e3c,
  wood: 0x8d6e63,
  bowString: 0xf5f5dc,
  arrow: 0x5d4037,
  aimLine: 0xffeb3b,
  targetRed: 0xe53935,
  targetWhite: 0xffffff,
  targetYellow: 0xfdd835,
  targetBlue: 0x1e88e5,
  targetBlack: 0x212121,
  gold: 0xffd700,
  uiDark: 0x1a1a2e,
  uiAccent: 0xe94560,
  textLight: 0xffffff,
  textDark: 0x1a1a2e,
  powerBarBg: 0x333333,
  powerBarFill: 0xff6b35,
};

export const GameSettings = {
  maxArrows: 8,
  aimLineLength: 0.3, // 30% of distance to target
  minPower: 0.2,
  maxPower: 1.0,
  powerChargeSpeed: 0.8, // seconds to full charge
  arrowSpeed: 600,
  gravity: 200,
  windMax: 50,
};

export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

export const Colors3D = {
  sky: 0x87ceeb,
  skyHorizon: 0xc8e6f5,
  grass: 0x4caf50,
  grassDark: 0x388e3c,
  dirt: 0x8d6e63,
  wood: 0x8d6e63,
  bowString: 0xf5f5dc,
  arrow: 0x5d4037,
  aimLine: 0xffeb3b,
  targetRed: 0xe53935,
  targetWhite: 0xffffff,
  targetYellow: 0xfdd835,
  targetBlue: 0x1e88e5,
  gold: 0xffd700,
  uiDark: 0x1a1a2e,
  uiAccent: 0xe94560,

  // Robin Hood
  skin: 0xf5cba7,
  tunic: 0x2e7d32,
  tunicDark: 0x1b5e20,
  hat: 0x1b5e20,
  feather: 0xc62828,
  belt: 0x5d4037,
  boots: 0x3e2723,
  pants: 0x6d4c41,
  quiver: 0x795548,
  hair: 0x4e342e,

  // Environment
  treeTrunk: 0x5d4037,
  treeLeaves: 0x2e7d32,
  mountain: 0x6b8e5a,
  cloud: 0xffffff,
};

export const CameraSettings = {
  fov: 55,
  near: 0.1,
  far: 200,
  posX: 0,
  posY: 3.5,
  posZ: -4,
  lookAtX: 0,
  lookAtY: 1.8,
  lookAtZ: 20,
};

export const GameSettings = {
  arrowSpeed: 35,
  gravity: 9.8,
  windMax: 3,
  hitRadiusMultiplier: 1.6,
  minPower: 0.15,
  maxPower: 1.0,
  powerChargeSpeed: 1.2,
  aimLineLength: 0.35,
  maxAimAngleH: Math.PI / 4,
  maxAimAngleV: Math.PI / 8,
  archerHeight: 1.7,
};

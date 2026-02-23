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
  arrowSpeed: 50,
  gravity: 3.0,
  windMax: 3,
  hitRadiusMultiplier: 2.2,
  minPower: 0.08,
  maxPower: 1.0,
  powerChargeSpeed: 1.2,
  aimLineLength: 0.35,
  maxAimAngleH: Math.PI / 4,
  maxAimAngleV: Math.PI / 6,
  archerHeight: 1.7,
  aimAssistRadius: 8,
  aimAssistStrength: 0.35,
};

// --- Bow types ---

export type BowType = 'classic' | 'fire' | 'ice' | 'lightning' | 'gold' | 'triple';

export interface BowConfig {
  name: string;
  emoji: string;
  bowColor: number;
  arrowColor: number;
  tipColor: number;
  trailColor: number;
  particleColors: number[];
  glowColor?: number;
}

export const BowTypes: Record<BowType, BowConfig> = {
  classic: {
    name: 'Klassisch',
    emoji: '🏹',
    bowColor: 0x8d6e63,
    arrowColor: 0x5d4037,
    tipColor: 0x9e9e9e,
    trailColor: 0xffeb3b,
    particleColors: [],
  },
  fire: {
    name: 'Feuerbogen',
    emoji: '🔥',
    bowColor: 0xd84315,
    arrowColor: 0x4e342e,
    tipColor: 0xff6f00,
    trailColor: 0xff5722,
    particleColors: [0xff6d00, 0xff9100, 0xffab00, 0xff3d00],
    glowColor: 0xff6600,
  },
  ice: {
    name: 'Eisbogen',
    emoji: '❄️',
    bowColor: 0x4fc3f7,
    arrowColor: 0xb3e5fc,
    tipColor: 0x80deea,
    trailColor: 0x4dd0e1,
    particleColors: [0x80deea, 0xb2ebf2, 0xe0f7fa, 0x4dd0e1],
    glowColor: 0x00bcd4,
  },
  lightning: {
    name: 'Blitzbogen',
    emoji: '⚡',
    bowColor: 0xfbc02d,
    arrowColor: 0xf9a825,
    tipColor: 0xfff176,
    trailColor: 0xffee58,
    particleColors: [0xffee58, 0xfff9c4, 0xfdd835, 0xffff00],
    glowColor: 0xffd600,
  },
  gold: {
    name: 'Goldbogen',
    emoji: '👑',
    bowColor: 0xffd700,
    arrowColor: 0xdaa520,
    tipColor: 0xffd700,
    trailColor: 0xffe082,
    particleColors: [0xffd700, 0xffe082, 0xffecb3, 0xffc107],
    glowColor: 0xffab00,
  },
  triple: {
    name: 'Dreifachbogen',
    emoji: '🏹🏹🏹',
    bowColor: 0x7b1fa2,
    arrowColor: 0x9c27b0,
    tipColor: 0xce93d8,
    trailColor: 0xba68c8,
    particleColors: [0xce93d8, 0xba68c8, 0xab47bc, 0x8e24aa],
    glowColor: 0x9c27b0,
  },
};

export function getSelectedBow(): BowType {
  try {
    const saved = localStorage.getItem('bogen_bow_type');
    if (saved && saved in BowTypes) return saved as BowType;
  } catch { /* noop */ }
  return 'classic';
}

export function setSelectedBow(bow: BowType): void {
  try { localStorage.setItem('bogen_bow_type', bow); } catch { /* noop */ }
}

export interface TargetConfig {
  x: number;
  y: number;
  scale: number;
  type: 'static' | 'moving' | 'duck' | 'emoji';
  emojiIndex?: number;
  movement?: {
    pattern: 'horizontal' | 'vertical' | 'sine' | 'circle';
    speed: number;
    range: number;
  };
}

export interface RingConfig {
  x: number;
  y: number;
  scale: number;
  movement?: {
    pattern: 'horizontal' | 'vertical' | 'sine';
    speed: number;
    range: number;
  };
}

export interface LevelConfig {
  name: string;
  subtitle: string;
  targets: TargetConfig[];
  rings: RingConfig[];
  wind: number;
  arrowCount: number;
  groundY: number;
}

export const levels: LevelConfig[] = [
  // Level 1: Erste Schritte - nah, groß, viele Pfeile
  {
    name: 'Erste Schritte',
    subtitle: 'Triff die Zielscheiben!',
    targets: [
      { x: 100, y: 350, scale: 1.2, type: 'static' },
      { x: 200, y: 320, scale: 1.2, type: 'static' },
      { x: 300, y: 340, scale: 1.2, type: 'static' },
      { x: 150, y: 280, scale: 1.1, type: 'static' },
      { x: 250, y: 290, scale: 1.1, type: 'static' },
    ],
    rings: [],
    wind: 0,
    arrowCount: 12,
    groundY: 550,
  },
  // Level 2: Etwas weiter
  {
    name: 'Etwas weiter',
    subtitle: 'Die Ziele sind weiter weg...',
    targets: [
      { x: 80, y: 300, scale: 0.95, type: 'static' },
      { x: 180, y: 260, scale: 0.85, type: 'static' },
      { x: 280, y: 280, scale: 0.9, type: 'static' },
      { x: 130, y: 230, scale: 0.8, type: 'static' },
      { x: 320, y: 250, scale: 0.85, type: 'static' },
    ],
    rings: [],
    wind: 0,
    arrowCount: 10,
    groundY: 550,
  },
  // Level 3: Windstille vorbei
  {
    name: 'Windstille vorbei',
    subtitle: 'Achtung, Wind! 💨',
    targets: [
      { x: 100, y: 310, scale: 1.0, type: 'static' },
      { x: 220, y: 280, scale: 0.95, type: 'static' },
      { x: 310, y: 320, scale: 1.0, type: 'static' },
      { x: 160, y: 250, scale: 0.9, type: 'static' },
      { x: 270, y: 270, scale: 0.9, type: 'static' },
    ],
    rings: [],
    wind: 0.3,
    arrowCount: 10,
    groundY: 550,
  },
  // Level 4: Bewegliche Ziele
  {
    name: 'Bewegliche Ziele',
    subtitle: 'Sie bewegen sich!',
    targets: [
      { x: 100, y: 320, scale: 0.95, type: 'static' },
      { x: 250, y: 290, scale: 0.95, type: 'static' },
      { x: 350, y: 310, scale: 0.9, type: 'static' },
      {
        x: 180, y: 270, scale: 0.9, type: 'moving',
        movement: { pattern: 'horizontal', speed: 25, range: 50 },
      },
      {
        x: 300, y: 250, scale: 0.85, type: 'moving',
        movement: { pattern: 'horizontal', speed: 30, range: 45 },
      },
    ],
    rings: [],
    wind: 0,
    arrowCount: 12,
    groundY: 550,
  },
  // Level 5: Ring frei!
  {
    name: 'Ring frei!',
    subtitle: 'Schieß durch die Ringe! 💍',
    targets: [
      { x: 80, y: 280, scale: 0.9, type: 'static' },
      { x: 190, y: 260, scale: 0.85, type: 'static' },
      { x: 300, y: 270, scale: 0.9, type: 'static' },
      { x: 140, y: 240, scale: 0.8, type: 'static' },
      { x: 250, y: 250, scale: 0.85, type: 'static' },
    ],
    rings: [
      { x: 80, y: 400, scale: 1.4 },
      { x: 190, y: 380, scale: 1.3 },
      { x: 300, y: 390, scale: 1.4 },
      { x: 140, y: 370, scale: 1.2 },
      { x: 250, y: 380, scale: 1.3 },
    ],
    wind: 0,
    arrowCount: 12,
    groundY: 550,
  },
  // Level 6: Tanzende Scheiben
  {
    name: 'Tanzende Scheiben',
    subtitle: 'Alles bewegt sich! 💃',
    targets: [
      {
        x: 100, y: 310, scale: 0.85, type: 'moving',
        movement: { pattern: 'horizontal', speed: 30, range: 45 },
      },
      {
        x: 200, y: 270, scale: 0.85, type: 'moving',
        movement: { pattern: 'sine', speed: 22, range: 35 },
      },
      {
        x: 300, y: 300, scale: 0.85, type: 'moving',
        movement: { pattern: 'vertical', speed: 20, range: 30 },
      },
      {
        x: 150, y: 240, scale: 0.8, type: 'moving',
        movement: { pattern: 'circle', speed: 18, range: 25 },
      },
      {
        x: 270, y: 260, scale: 0.8, type: 'moving',
        movement: { pattern: 'sine', speed: 32, range: 40 },
      },
    ],
    rings: [],
    wind: 0.15,
    arrowCount: 14,
    groundY: 550,
  },
  // Level 7: Enten-Jagd
  {
    name: 'Enten-Jagd',
    subtitle: 'Erwisch die Enten! 🦆',
    targets: [
      {
        x: 80, y: 300, scale: 0.95, type: 'duck',
        movement: { pattern: 'horizontal', speed: 35, range: 60 },
      },
      {
        x: 200, y: 270, scale: 0.9, type: 'duck',
        movement: { pattern: 'sine', speed: 25, range: 45 },
      },
      {
        x: 320, y: 310, scale: 0.95, type: 'duck',
        movement: { pattern: 'horizontal', speed: 38, range: 55 },
      },
      {
        x: 140, y: 250, scale: 0.85, type: 'duck',
        movement: { pattern: 'sine', speed: 30, range: 35 },
      },
      {
        x: 260, y: 280, scale: 0.9, type: 'duck',
        movement: { pattern: 'horizontal', speed: 32, range: 50 },
      },
    ],
    rings: [],
    wind: 0,
    arrowCount: 12,
    groundY: 550,
  },
  // Level 8: Ring-Tanz
  {
    name: 'Ring-Tanz',
    subtitle: 'Die Ringe bewegen sich! 🎯',
    targets: [
      { x: 100, y: 280, scale: 0.85, type: 'static' },
      {
        x: 200, y: 260, scale: 0.8, type: 'moving',
        movement: { pattern: 'horizontal', speed: 20, range: 25 },
      },
      { x: 300, y: 275, scale: 0.85, type: 'static' },
      {
        x: 150, y: 240, scale: 0.75, type: 'moving',
        movement: { pattern: 'vertical', speed: 18, range: 20 },
      },
      { x: 260, y: 265, scale: 0.8, type: 'static' },
    ],
    rings: [
      { x: 100, y: 400, scale: 1.2, movement: { pattern: 'horizontal', speed: 22, range: 35 } },
      { x: 200, y: 380, scale: 1.2, movement: { pattern: 'sine', speed: 18, range: 30 } },
      { x: 300, y: 390, scale: 1.2, movement: { pattern: 'horizontal', speed: 25, range: 40 } },
      { x: 150, y: 370, scale: 1.1, movement: { pattern: 'vertical', speed: 18, range: 25 } },
      { x: 260, y: 385, scale: 1.2, movement: { pattern: 'sine', speed: 22, range: 30 } },
    ],
    wind: 0.2,
    arrowCount: 14,
    groundY: 550,
  },
  // Level 9: Emoji-Chaos
  {
    name: 'Emoji-Chaos',
    subtitle: 'Triff die Emojis! 😜',
    targets: [
      {
        x: 100, y: 290, scale: 0.8, type: 'emoji', emojiIndex: 0,
        movement: { pattern: 'circle', speed: 28, range: 30 },
      },
      {
        x: 200, y: 260, scale: 0.75, type: 'emoji', emojiIndex: 1,
        movement: { pattern: 'sine', speed: 35, range: 40 },
      },
      {
        x: 300, y: 280, scale: 0.8, type: 'emoji', emojiIndex: 2,
        movement: { pattern: 'horizontal', speed: 38, range: 45 },
      },
      {
        x: 150, y: 230, scale: 0.7, type: 'emoji', emojiIndex: 3,
        movement: { pattern: 'circle', speed: 30, range: 35 },
      },
      {
        x: 270, y: 250, scale: 0.75, type: 'emoji', emojiIndex: 4,
        movement: { pattern: 'sine', speed: 42, range: 38 },
      },
    ],
    rings: [],
    wind: 0.35,
    arrowCount: 14,
    groundY: 550,
  },
  // Level 10: Der Meisterschuss
  {
    name: 'Der Meisterschuss',
    subtitle: 'Zeig was du kannst! 🏆',
    targets: [
      {
        x: 80, y: 260, scale: 0.7, type: 'moving',
        movement: { pattern: 'circle', speed: 35, range: 35 },
      },
      {
        x: 200, y: 230, scale: 0.65, type: 'duck',
        movement: { pattern: 'sine', speed: 42, range: 45 },
      },
      {
        x: 320, y: 250, scale: 0.7, type: 'emoji', emojiIndex: 0,
        movement: { pattern: 'horizontal', speed: 45, range: 50 },
      },
      {
        x: 140, y: 210, scale: 0.6, type: 'moving',
        movement: { pattern: 'sine', speed: 38, range: 40 },
      },
      {
        x: 260, y: 220, scale: 0.65, type: 'emoji', emojiIndex: 2,
        movement: { pattern: 'circle', speed: 40, range: 42 },
      },
    ],
    rings: [
      { x: 80, y: 390, scale: 1.0, movement: { pattern: 'horizontal', speed: 30, range: 35 } },
      { x: 200, y: 360, scale: 1.0, movement: { pattern: 'sine', speed: 28, range: 30 } },
      { x: 320, y: 380, scale: 1.0, movement: { pattern: 'horizontal', speed: 35, range: 40 } },
    ],
    wind: 0.5,
    arrowCount: 14,
    groundY: 550,
  },
];

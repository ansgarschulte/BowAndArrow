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
  // Level 1: Erste Schritte
  {
    name: 'Erste Schritte',
    subtitle: 'Triff die Zielscheiben!',
    targets: [
      { x: 100, y: 280, scale: 1.0, type: 'static' },
      { x: 200, y: 250, scale: 1.0, type: 'static' },
      { x: 300, y: 270, scale: 1.0, type: 'static' },
      { x: 150, y: 200, scale: 0.9, type: 'static' },
      { x: 250, y: 210, scale: 0.9, type: 'static' },
    ],
    rings: [],
    wind: 0,
    arrowCount: 8,
    groundY: 550,
  },
  // Level 2: Etwas weiter
  {
    name: 'Etwas weiter',
    subtitle: 'Die Ziele sind weiter weg...',
    targets: [
      { x: 80, y: 220, scale: 0.7, type: 'static' },
      { x: 180, y: 180, scale: 0.6, type: 'static' },
      { x: 280, y: 200, scale: 0.65, type: 'static' },
      { x: 130, y: 150, scale: 0.55, type: 'static' },
      { x: 320, y: 170, scale: 0.6, type: 'static' },
    ],
    rings: [],
    wind: 0,
    arrowCount: 8,
    groundY: 550,
  },
  // Level 3: Windstille vorbei
  {
    name: 'Windstille vorbei',
    subtitle: 'Achtung, Wind! 💨',
    targets: [
      { x: 100, y: 230, scale: 0.8, type: 'static' },
      { x: 220, y: 200, scale: 0.75, type: 'static' },
      { x: 310, y: 250, scale: 0.8, type: 'static' },
      { x: 160, y: 170, scale: 0.7, type: 'static' },
      { x: 270, y: 190, scale: 0.7, type: 'static' },
    ],
    rings: [],
    wind: 0.4,
    arrowCount: 8,
    groundY: 550,
  },
  // Level 4: Bewegliche Ziele
  {
    name: 'Bewegliche Ziele',
    subtitle: 'Sie bewegen sich!',
    targets: [
      { x: 100, y: 250, scale: 0.8, type: 'static' },
      { x: 250, y: 220, scale: 0.8, type: 'static' },
      { x: 350, y: 240, scale: 0.75, type: 'static' },
      {
        x: 180, y: 200, scale: 0.75, type: 'moving',
        movement: { pattern: 'horizontal', speed: 40, range: 60 },
      },
      {
        x: 300, y: 180, scale: 0.7, type: 'moving',
        movement: { pattern: 'horizontal', speed: 50, range: 50 },
      },
    ],
    rings: [],
    wind: 0,
    arrowCount: 10,
    groundY: 550,
  },
  // Level 5: Ring frei!
  {
    name: 'Ring frei!',
    subtitle: 'Schieß durch die Ringe! 💍',
    targets: [
      { x: 80, y: 220, scale: 0.75, type: 'static' },
      { x: 190, y: 190, scale: 0.7, type: 'static' },
      { x: 300, y: 210, scale: 0.75, type: 'static' },
      { x: 140, y: 170, scale: 0.65, type: 'static' },
      { x: 250, y: 180, scale: 0.7, type: 'static' },
    ],
    rings: [
      { x: 80, y: 350, scale: 1.2 },
      { x: 190, y: 330, scale: 1.1 },
      { x: 300, y: 340, scale: 1.2 },
      { x: 140, y: 320, scale: 1.0 },
      { x: 250, y: 330, scale: 1.1 },
    ],
    wind: 0,
    arrowCount: 10,
    groundY: 550,
  },
  // Level 6: Tanzende Scheiben
  {
    name: 'Tanzende Scheiben',
    subtitle: 'Alles bewegt sich! 💃',
    targets: [
      {
        x: 100, y: 240, scale: 0.7, type: 'moving',
        movement: { pattern: 'horizontal', speed: 45, range: 50 },
      },
      {
        x: 200, y: 200, scale: 0.7, type: 'moving',
        movement: { pattern: 'sine', speed: 35, range: 40 },
      },
      {
        x: 300, y: 230, scale: 0.7, type: 'moving',
        movement: { pattern: 'vertical', speed: 30, range: 35 },
      },
      {
        x: 150, y: 170, scale: 0.65, type: 'moving',
        movement: { pattern: 'circle', speed: 25, range: 30 },
      },
      {
        x: 270, y: 190, scale: 0.65, type: 'moving',
        movement: { pattern: 'sine', speed: 50, range: 45 },
      },
    ],
    rings: [],
    wind: 0.2,
    arrowCount: 12,
    groundY: 550,
  },
  // Level 7: Enten-Jagd
  {
    name: 'Enten-Jagd',
    subtitle: 'Erwisch die Enten! 🦆',
    targets: [
      {
        x: 80, y: 230, scale: 0.8, type: 'duck',
        movement: { pattern: 'horizontal', speed: 55, range: 70 },
      },
      {
        x: 200, y: 200, scale: 0.75, type: 'duck',
        movement: { pattern: 'sine', speed: 40, range: 50 },
      },
      {
        x: 320, y: 240, scale: 0.8, type: 'duck',
        movement: { pattern: 'horizontal', speed: 60, range: 60 },
      },
      {
        x: 140, y: 180, scale: 0.7, type: 'duck',
        movement: { pattern: 'sine', speed: 45, range: 40 },
      },
      {
        x: 260, y: 210, scale: 0.75, type: 'duck',
        movement: { pattern: 'horizontal', speed: 50, range: 55 },
      },
    ],
    rings: [],
    wind: 0,
    arrowCount: 10,
    groundY: 550,
  },
  // Level 8: Ring-Tanz
  {
    name: 'Ring-Tanz',
    subtitle: 'Die Ringe bewegen sich! 🎯',
    targets: [
      { x: 100, y: 220, scale: 0.7, type: 'static' },
      {
        x: 200, y: 190, scale: 0.65, type: 'moving',
        movement: { pattern: 'horizontal', speed: 30, range: 30 },
      },
      { x: 300, y: 210, scale: 0.7, type: 'static' },
      {
        x: 150, y: 170, scale: 0.6, type: 'moving',
        movement: { pattern: 'vertical', speed: 25, range: 25 },
      },
      { x: 260, y: 200, scale: 0.65, type: 'static' },
    ],
    rings: [
      { x: 100, y: 350, scale: 1.0, movement: { pattern: 'horizontal', speed: 35, range: 40 } },
      { x: 200, y: 330, scale: 1.0, movement: { pattern: 'sine', speed: 30, range: 35 } },
      { x: 300, y: 340, scale: 1.0, movement: { pattern: 'horizontal', speed: 40, range: 45 } },
      { x: 150, y: 320, scale: 0.9, movement: { pattern: 'vertical', speed: 25, range: 30 } },
      { x: 260, y: 335, scale: 1.0, movement: { pattern: 'sine', speed: 35, range: 35 } },
    ],
    wind: 0.3,
    arrowCount: 12,
    groundY: 550,
  },
  // Level 9: Emoji-Chaos
  {
    name: 'Emoji-Chaos',
    subtitle: 'Triff die Emojis! 😜',
    targets: [
      {
        x: 100, y: 230, scale: 0.6, type: 'emoji', emojiIndex: 0,
        movement: { pattern: 'circle', speed: 40, range: 35 },
      },
      {
        x: 200, y: 200, scale: 0.55, type: 'emoji', emojiIndex: 1,
        movement: { pattern: 'sine', speed: 55, range: 50 },
      },
      {
        x: 300, y: 220, scale: 0.6, type: 'emoji', emojiIndex: 2,
        movement: { pattern: 'horizontal', speed: 60, range: 55 },
      },
      {
        x: 150, y: 170, scale: 0.5, type: 'emoji', emojiIndex: 3,
        movement: { pattern: 'circle', speed: 45, range: 40 },
      },
      {
        x: 270, y: 190, scale: 0.55, type: 'emoji', emojiIndex: 4,
        movement: { pattern: 'sine', speed: 65, range: 45 },
      },
    ],
    rings: [],
    wind: 0.5,
    arrowCount: 12,
    groundY: 550,
  },
  // Level 10: Der Meisterschuss
  {
    name: 'Der Meisterschuss',
    subtitle: 'Zeig was du kannst! 🏆',
    targets: [
      {
        x: 80, y: 200, scale: 0.5, type: 'moving',
        movement: { pattern: 'circle', speed: 50, range: 40 },
      },
      {
        x: 200, y: 170, scale: 0.45, type: 'duck',
        movement: { pattern: 'sine', speed: 65, range: 55 },
      },
      {
        x: 320, y: 190, scale: 0.5, type: 'emoji', emojiIndex: 0,
        movement: { pattern: 'horizontal', speed: 70, range: 60 },
      },
      {
        x: 140, y: 150, scale: 0.4, type: 'moving',
        movement: { pattern: 'sine', speed: 55, range: 45 },
      },
      {
        x: 260, y: 160, scale: 0.45, type: 'emoji', emojiIndex: 2,
        movement: { pattern: 'circle', speed: 60, range: 50 },
      },
    ],
    rings: [
      { x: 80, y: 340, scale: 0.8, movement: { pattern: 'horizontal', speed: 45, range: 40 } },
      { x: 200, y: 310, scale: 0.8, movement: { pattern: 'sine', speed: 40, range: 35 } },
      { x: 320, y: 330, scale: 0.8, movement: { pattern: 'horizontal', speed: 50, range: 45 } },
    ],
    wind: 0.7,
    arrowCount: 12,
    groundY: 550,
  },
];

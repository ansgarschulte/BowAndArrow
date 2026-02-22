export interface TargetConfig {
  x: number;
  y: number;
  z: number;
  scale: number;
  type: 'static' | 'moving' | 'duck' | 'emoji';
  emojiIndex?: number;
  movement?: {
    pattern: 'horizontal' | 'vertical' | 'sine' | 'circle';
    speed: number;
    range: number;
  };
}

export interface LevelConfig {
  name: string;
  subtitle: string;
  targets: TargetConfig[];
  wind: number;
  arrowCount: number;
}

export const levels: LevelConfig[] = [
  // Level 1: Erste Schritte – nah, groß
  {
    name: 'Erste Schritte',
    subtitle: 'Triff die Zielscheiben!',
    targets: [
      { x: -3, y: 1.5, z: 20, scale: 1.2, type: 'static' },
      { x: 0, y: 1.5, z: 22, scale: 1.2, type: 'static' },
      { x: 3, y: 1.5, z: 20, scale: 1.2, type: 'static' },
      { x: -1.5, y: 2, z: 24, scale: 1.1, type: 'static' },
      { x: 1.5, y: 2, z: 24, scale: 1.1, type: 'static' },
    ],
    wind: 0,
    arrowCount: 12,
  },
  // Level 2: Etwas weiter
  {
    name: 'Etwas weiter',
    subtitle: 'Die Ziele sind weiter weg...',
    targets: [
      { x: -4, y: 1.5, z: 30, scale: 0.95, type: 'static' },
      { x: -1, y: 2, z: 35, scale: 0.85, type: 'static' },
      { x: 2, y: 1.5, z: 32, scale: 0.9, type: 'static' },
      { x: -2, y: 2.5, z: 38, scale: 0.8, type: 'static' },
      { x: 4, y: 2, z: 34, scale: 0.85, type: 'static' },
    ],
    wind: 0,
    arrowCount: 10,
  },
  // Level 3: Windstille vorbei
  {
    name: 'Windstille vorbei',
    subtitle: 'Achtung, Wind! 💨',
    targets: [
      { x: -3, y: 1.5, z: 25, scale: 1.0, type: 'static' },
      { x: 1, y: 2, z: 28, scale: 0.95, type: 'static' },
      { x: 4, y: 1.5, z: 26, scale: 1.0, type: 'static' },
      { x: -1, y: 2.5, z: 30, scale: 0.9, type: 'static' },
      { x: 2.5, y: 2, z: 30, scale: 0.9, type: 'static' },
    ],
    wind: 0.3,
    arrowCount: 10,
  },
  // Level 4: Bewegliche Ziele
  {
    name: 'Bewegliche Ziele',
    subtitle: 'Sie bewegen sich!',
    targets: [
      { x: -3, y: 1.5, z: 25, scale: 0.95, type: 'static' },
      { x: 2, y: 1.5, z: 28, scale: 0.95, type: 'static' },
      { x: 5, y: 1.5, z: 26, scale: 0.9, type: 'static' },
      {
        x: -1, y: 2, z: 30, scale: 0.9, type: 'moving',
        movement: { pattern: 'horizontal', speed: 25, range: 50 },
      },
      {
        x: 3, y: 2, z: 32, scale: 0.85, type: 'moving',
        movement: { pattern: 'horizontal', speed: 30, range: 45 },
      },
    ],
    wind: 0,
    arrowCount: 12,
  },
  // Level 5: Hindernislauf (replaces Rings)
  {
    name: 'Hindernislauf',
    subtitle: 'Weich den Hindernissen aus! 🪵',
    targets: [
      { x: -3, y: 1.5, z: 25, scale: 0.9, type: 'static' },
      { x: 0, y: 2, z: 30, scale: 0.85, type: 'static' },
      { x: 3, y: 1.5, z: 27, scale: 0.9, type: 'static' },
      { x: -1.5, y: 2.5, z: 33, scale: 0.8, type: 'static' },
      { x: 2, y: 2, z: 35, scale: 0.85, type: 'static' },
    ],
    wind: 0,
    arrowCount: 12,
  },
  // Level 6: Tanzende Scheiben
  {
    name: 'Tanzende Scheiben',
    subtitle: 'Alles bewegt sich! 💃',
    targets: [
      {
        x: -3, y: 1.5, z: 28, scale: 0.85, type: 'moving',
        movement: { pattern: 'horizontal', speed: 30, range: 45 },
      },
      {
        x: 0, y: 2, z: 32, scale: 0.85, type: 'moving',
        movement: { pattern: 'sine', speed: 22, range: 35 },
      },
      {
        x: 3, y: 1.5, z: 30, scale: 0.85, type: 'moving',
        movement: { pattern: 'vertical', speed: 20, range: 30 },
      },
      {
        x: -1.5, y: 2.5, z: 35, scale: 0.8, type: 'moving',
        movement: { pattern: 'circle', speed: 18, range: 25 },
      },
      {
        x: 2, y: 2, z: 33, scale: 0.8, type: 'moving',
        movement: { pattern: 'sine', speed: 32, range: 40 },
      },
    ],
    wind: 0.15,
    arrowCount: 14,
  },
  // Level 7: Enten-Jagd
  {
    name: 'Enten-Jagd',
    subtitle: 'Erwisch die Enten! 🦆',
    targets: [
      {
        x: -4, y: 1.5, z: 25, scale: 0.95, type: 'duck',
        movement: { pattern: 'horizontal', speed: 35, range: 60 },
      },
      {
        x: 0, y: 2, z: 30, scale: 0.9, type: 'duck',
        movement: { pattern: 'sine', speed: 25, range: 45 },
      },
      {
        x: 4, y: 1.5, z: 27, scale: 0.95, type: 'duck',
        movement: { pattern: 'horizontal', speed: 38, range: 55 },
      },
      {
        x: -2, y: 2.5, z: 33, scale: 0.85, type: 'duck',
        movement: { pattern: 'sine', speed: 30, range: 35 },
      },
      {
        x: 2, y: 2, z: 35, scale: 0.9, type: 'duck',
        movement: { pattern: 'horizontal', speed: 32, range: 50 },
      },
    ],
    wind: 0,
    arrowCount: 12,
  },
  // Level 8: Wind-Sturm (replaces Ring-Tanz)
  {
    name: 'Wind-Sturm',
    subtitle: 'Starker Wind! 🌪️',
    targets: [
      { x: -3, y: 1.5, z: 28, scale: 0.85, type: 'static' },
      {
        x: 0, y: 2, z: 32, scale: 0.8, type: 'moving',
        movement: { pattern: 'horizontal', speed: 20, range: 25 },
      },
      { x: 3, y: 1.5, z: 30, scale: 0.85, type: 'static' },
      {
        x: -1.5, y: 2.5, z: 35, scale: 0.75, type: 'moving',
        movement: { pattern: 'vertical', speed: 18, range: 20 },
      },
      { x: 2, y: 2, z: 33, scale: 0.8, type: 'static' },
    ],
    wind: 0.6,
    arrowCount: 14,
  },
  // Level 9: Emoji-Chaos
  {
    name: 'Emoji-Chaos',
    subtitle: 'Triff die Emojis! 😜',
    targets: [
      {
        x: -3, y: 2, z: 30, scale: 0.8, type: 'emoji', emojiIndex: 0,
        movement: { pattern: 'circle', speed: 28, range: 30 },
      },
      {
        x: 0, y: 2.5, z: 35, scale: 0.75, type: 'emoji', emojiIndex: 1,
        movement: { pattern: 'sine', speed: 35, range: 40 },
      },
      {
        x: 3, y: 2, z: 32, scale: 0.8, type: 'emoji', emojiIndex: 2,
        movement: { pattern: 'horizontal', speed: 38, range: 45 },
      },
      {
        x: -1.5, y: 3, z: 38, scale: 0.7, type: 'emoji', emojiIndex: 3,
        movement: { pattern: 'circle', speed: 30, range: 35 },
      },
      {
        x: 2, y: 2.5, z: 36, scale: 0.75, type: 'emoji', emojiIndex: 4,
        movement: { pattern: 'sine', speed: 42, range: 38 },
      },
    ],
    wind: 0.35,
    arrowCount: 14,
  },
  // Level 10: Der Meisterschuss
  {
    name: 'Der Meisterschuss',
    subtitle: 'Zeig was du kannst! 🏆',
    targets: [
      {
        x: -4, y: 2, z: 35, scale: 0.7, type: 'moving',
        movement: { pattern: 'circle', speed: 35, range: 35 },
      },
      {
        x: 0, y: 2.5, z: 40, scale: 0.65, type: 'duck',
        movement: { pattern: 'sine', speed: 42, range: 45 },
      },
      {
        x: 4, y: 2, z: 37, scale: 0.7, type: 'emoji', emojiIndex: 0,
        movement: { pattern: 'horizontal', speed: 45, range: 50 },
      },
      {
        x: -2, y: 3, z: 42, scale: 0.6, type: 'moving',
        movement: { pattern: 'sine', speed: 38, range: 40 },
      },
      {
        x: 2, y: 2.5, z: 45, scale: 0.65, type: 'emoji', emojiIndex: 2,
        movement: { pattern: 'circle', speed: 40, range: 42 },
      },
    ],
    wind: 0.5,
    arrowCount: 14,
  },
];

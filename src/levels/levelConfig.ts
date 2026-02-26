export interface TargetConfig {
  x: number;
  y: number;
  z: number;
  scale: number;
  type: 'static' | 'moving' | 'duck' | 'emoji' | 'bonus' | 'bomb';
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
      { x: -3, y: 1.5, z: 20, scale: 1.6, type: 'static' },
      { x: 0, y: 1.5, z: 22, scale: 1.6, type: 'static' },
      { x: 3, y: 1.5, z: 20, scale: 1.6, type: 'static' },
      { x: -1.5, y: 2, z: 24, scale: 1.5, type: 'static' },
      { x: 1.5, y: 2, z: 24, scale: 1.5, type: 'static' },
    ],
    wind: 0,
    arrowCount: 12,
  },
  // Level 2: Etwas weiter
  {
    name: 'Etwas weiter',
    subtitle: 'Die Ziele sind weiter weg...',
    targets: [
      { x: -4, y: 1.5, z: 30, scale: 1.3, type: 'static' },
      { x: -1, y: 2, z: 35, scale: 1.2, type: 'static' },
      { x: 2, y: 1.5, z: 32, scale: 1.25, type: 'static' },
      { x: -2, y: 2.5, z: 38, scale: 1.1, type: 'static' },
      { x: 4, y: 2, z: 34, scale: 1.2, type: 'static' },
    ],
    wind: 0,
    arrowCount: 10,
  },
  // Level 3: Windstille vorbei
  {
    name: 'Windstille vorbei',
    subtitle: 'Achtung, Wind! 💨',
    targets: [
      { x: -3, y: 1.5, z: 25, scale: 1.3, type: 'static' },
      { x: 1, y: 2, z: 28, scale: 1.2, type: 'static' },
      { x: 4, y: 1.5, z: 26, scale: 1.3, type: 'static' },
      { x: -1, y: 2.5, z: 30, scale: 1.15, type: 'static' },
      { x: 2.5, y: 2, z: 30, scale: 1.15, type: 'static' },
    ],
    wind: 0.3,
    arrowCount: 10,
  },
  // Level 4: Bewegliche Ziele
  {
    name: 'Bewegliche Ziele',
    subtitle: 'Sie bewegen sich!',
    targets: [
      { x: -3, y: 1.5, z: 25, scale: 1.2, type: 'static' },
      { x: 2, y: 1.5, z: 28, scale: 1.2, type: 'static' },
      { x: 5, y: 1.5, z: 26, scale: 1.15, type: 'static' },
      {
        x: -1, y: 2, z: 30, scale: 1.15, type: 'moving',
        movement: { pattern: 'horizontal', speed: 25, range: 50 },
      },
      {
        x: 3, y: 2, z: 32, scale: 1.1, type: 'moving',
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
      { x: -3, y: 1.5, z: 25, scale: 1.15, type: 'static' },
      { x: 0, y: 2, z: 30, scale: 1.1, type: 'static' },
      { x: 3, y: 1.5, z: 27, scale: 1.15, type: 'static' },
      { x: -1.5, y: 2.5, z: 33, scale: 1.05, type: 'static' },
      { x: 2, y: 2, z: 35, scale: 1.1, type: 'static' },
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
        x: -3, y: 1.5, z: 28, scale: 1.1, type: 'moving',
        movement: { pattern: 'horizontal', speed: 30, range: 45 },
      },
      {
        x: 0, y: 2, z: 32, scale: 1.1, type: 'moving',
        movement: { pattern: 'sine', speed: 22, range: 35 },
      },
      {
        x: 3, y: 1.5, z: 30, scale: 1.1, type: 'moving',
        movement: { pattern: 'vertical', speed: 20, range: 30 },
      },
      {
        x: -1.5, y: 2.5, z: 35, scale: 1.0, type: 'moving',
        movement: { pattern: 'circle', speed: 18, range: 25 },
      },
      {
        x: 2, y: 2, z: 33, scale: 1.0, type: 'moving',
        movement: { pattern: 'sine', speed: 32, range: 40 },
      },
      // Bonus target for extra points
      { x: 0, y: 3.5, z: 38, scale: 0.7, type: 'bonus', movement: { pattern: 'circle', speed: 25, range: 20 } },
    ],
    wind: 0.15,
    arrowCount: 18,
  },
  // Level 7: Enten-Jagd
  {
    name: 'Enten-Jagd',
    subtitle: 'Erwisch die Enten! 🦆',
    targets: [
      {
        x: -4, y: 1.5, z: 25, scale: 1.2, type: 'duck',
        movement: { pattern: 'horizontal', speed: 35, range: 60 },
      },
      {
        x: 0, y: 2, z: 30, scale: 1.15, type: 'duck',
        movement: { pattern: 'sine', speed: 25, range: 45 },
      },
      {
        x: 4, y: 1.5, z: 27, scale: 1.2, type: 'duck',
        movement: { pattern: 'horizontal', speed: 38, range: 55 },
      },
      {
        x: -2, y: 2.5, z: 33, scale: 1.1, type: 'duck',
        movement: { pattern: 'sine', speed: 30, range: 35 },
      },
      {
        x: 2, y: 2, z: 35, scale: 1.15, type: 'duck',
        movement: { pattern: 'horizontal', speed: 32, range: 50 },
      },
    ],
    wind: 0,
    arrowCount: 16,
  },
  // Level 8: Wind-Sturm
  {
    name: 'Wind-Sturm',
    subtitle: 'Starker Wind! 🌪️',
    targets: [
      { x: -3, y: 1.5, z: 28, scale: 1.1, type: 'static' },
      {
        x: 0, y: 2, z: 32, scale: 1.05, type: 'moving',
        movement: { pattern: 'horizontal', speed: 20, range: 25 },
      },
      { x: 3, y: 1.5, z: 30, scale: 1.1, type: 'static' },
      {
        x: -1.5, y: 2.5, z: 35, scale: 1.0, type: 'moving',
        movement: { pattern: 'vertical', speed: 18, range: 20 },
      },
      { x: 2, y: 2, z: 33, scale: 1.05, type: 'static' },
      // Bonus: hard to hit, worth 3x
      { x: 0, y: 4, z: 40, scale: 0.6, type: 'bonus', movement: { pattern: 'sine', speed: 30, range: 25 } },
      // Bomb: avoid hitting this!
      { x: -2, y: 1.5, z: 31, scale: 1.0, type: 'bomb' },
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
        x: -3, y: 2, z: 30, scale: 1.5, type: 'emoji', emojiIndex: 0,
        movement: { pattern: 'circle', speed: 28, range: 30 },
      },
      {
        x: 0, y: 2.5, z: 35, scale: 1.4, type: 'emoji', emojiIndex: 1,
        movement: { pattern: 'sine', speed: 35, range: 40 },
      },
      {
        x: 3, y: 2, z: 32, scale: 1.5, type: 'emoji', emojiIndex: 2,
        movement: { pattern: 'horizontal', speed: 38, range: 45 },
      },
      {
        x: -1.5, y: 3, z: 38, scale: 1.35, type: 'emoji', emojiIndex: 3,
        movement: { pattern: 'circle', speed: 30, range: 35 },
      },
      {
        x: 2, y: 2.5, z: 36, scale: 1.4, type: 'emoji', emojiIndex: 4,
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
        x: -4, y: 2, z: 35, scale: 0.95, type: 'moving',
        movement: { pattern: 'circle', speed: 35, range: 35 },
      },
      {
        x: 0, y: 2.5, z: 40, scale: 0.9, type: 'duck',
        movement: { pattern: 'sine', speed: 42, range: 45 },
      },
      {
        x: 4, y: 2, z: 37, scale: 0.95, type: 'emoji', emojiIndex: 0,
        movement: { pattern: 'horizontal', speed: 45, range: 50 },
      },
      {
        x: -2, y: 3, z: 42, scale: 0.85, type: 'moving',
        movement: { pattern: 'sine', speed: 38, range: 40 },
      },
      {
        x: 2, y: 2.5, z: 45, scale: 0.9, type: 'emoji', emojiIndex: 2,
        movement: { pattern: 'circle', speed: 40, range: 42 },
      },
    ],
    wind: 0.5,
    arrowCount: 14,
  },

  // Level 11: Hoch hinaus
  {
    name: 'Hoch hinaus',
    subtitle: 'Ziel nach oben! 🏔️',
    targets: [
      { x: -4, y: 3.5, z: 22, scale: 1.2, type: 'static' },
      { x: -1, y: 4.2, z: 26, scale: 1.1, type: 'static' },
      { x: 2, y: 3.8, z: 24, scale: 1.15, type: 'static' },
      { x: 0, y: 5, z: 30, scale: 1.0, type: 'static' },
      { x: 3.5, y: 4.5, z: 28, scale: 1.05, type: 'static' },
    ],
    wind: 0,
    arrowCount: 10,
  },

  // Level 12: Schnelle Enten
  {
    name: 'Schnelle Enten',
    subtitle: 'Die rasen! 🦆💨',
    targets: [
      {
        x: -4, y: 1.5, z: 24, scale: 1.15, type: 'duck',
        movement: { pattern: 'horizontal', speed: 48, range: 65 },
      },
      {
        x: 0, y: 2.5, z: 30, scale: 1.1, type: 'duck',
        movement: { pattern: 'sine', speed: 45, range: 55 },
      },
      {
        x: 3, y: 1.5, z: 26, scale: 1.15, type: 'duck',
        movement: { pattern: 'horizontal', speed: 52, range: 60 },
      },
      {
        x: -2, y: 2, z: 32, scale: 1.05, type: 'duck',
        movement: { pattern: 'sine', speed: 50, range: 50 },
      },
      {
        x: 2, y: 2, z: 28, scale: 1.1, type: 'duck',
        movement: { pattern: 'horizontal', speed: 55, range: 70 },
      },
    ],
    wind: 0.2,
    arrowCount: 12,
  },

  // Level 13: Mini-Ziele
  {
    name: 'Mini-Ziele',
    subtitle: 'Ganz genau zielen! 🔍',
    targets: [
      { x: -3, y: 1.5, z: 25, scale: 0.7, type: 'static' },
      { x: 1, y: 2, z: 28, scale: 0.65, type: 'static' },
      { x: -1, y: 2.5, z: 30, scale: 0.6, type: 'static' },
      { x: 3.5, y: 1.8, z: 26, scale: 0.7, type: 'static' },
      { x: 0, y: 1.5, z: 32, scale: 0.6, type: 'static' },
    ],
    wind: 0,
    arrowCount: 12,
  },

  // Level 14: Kreistanz
  {
    name: 'Kreistanz',
    subtitle: 'Alles dreht sich! 🎡',
    targets: [
      {
        x: -3, y: 2, z: 26, scale: 1.1, type: 'moving',
        movement: { pattern: 'circle', speed: 22, range: 30 },
      },
      {
        x: 0, y: 2.5, z: 30, scale: 1.0, type: 'moving',
        movement: { pattern: 'circle', speed: 28, range: 35 },
      },
      {
        x: 3, y: 2, z: 28, scale: 1.05, type: 'moving',
        movement: { pattern: 'circle', speed: 32, range: 40 },
      },
      {
        x: -1.5, y: 3, z: 34, scale: 0.95, type: 'moving',
        movement: { pattern: 'circle', speed: 36, range: 32 },
      },
      {
        x: 2, y: 2.5, z: 32, scale: 1.0, type: 'moving',
        movement: { pattern: 'circle', speed: 25, range: 38 },
      },
      // Bonus and bomb mixed in
      { x: 0, y: 4, z: 30, scale: 0.5, type: 'bonus', movement: { pattern: 'circle', speed: 40, range: 20 } },
      { x: 1, y: 1.5, z: 29, scale: 0.9, type: 'bomb', movement: { pattern: 'circle', speed: 20, range: 25 } },
    ],
    wind: 0.25,
    arrowCount: 14,
  },

  // Level 15: Entfernte Welten
  {
    name: 'Entfernte Welten',
    subtitle: 'So weit weg... 🌍',
    targets: [
      { x: -3, y: 2, z: 45, scale: 1.1, type: 'static' },
      { x: 1, y: 2.5, z: 50, scale: 1.0, type: 'static' },
      { x: -1, y: 1.8, z: 48, scale: 1.05, type: 'static' },
      { x: 3, y: 2.2, z: 55, scale: 1.0, type: 'static' },
      { x: 0, y: 2, z: 60, scale: 1.1, type: 'static' },
    ],
    wind: 0.4,
    arrowCount: 14,
  },

  // Level 16: Emoji-Party
  {
    name: 'Emoji-Party',
    subtitle: '7 Emojis! 🎉',
    targets: [
      {
        x: -4, y: 2, z: 26, scale: 1.3, type: 'emoji', emojiIndex: 0,
        movement: { pattern: 'horizontal', speed: 25, range: 35 },
      },
      {
        x: -1, y: 2.5, z: 30, scale: 1.2, type: 'emoji', emojiIndex: 1,
        movement: { pattern: 'sine', speed: 28, range: 30 },
      },
      {
        x: 2, y: 2, z: 28, scale: 1.3, type: 'emoji', emojiIndex: 2,
        movement: { pattern: 'vertical', speed: 22, range: 25 },
      },
      {
        x: 4, y: 2.5, z: 32, scale: 1.2, type: 'emoji', emojiIndex: 3,
        movement: { pattern: 'circle', speed: 20, range: 28 },
      },
      {
        x: -2, y: 3, z: 34, scale: 1.15, type: 'emoji', emojiIndex: 4,
        movement: { pattern: 'sine', speed: 30, range: 32 },
      },
      {
        x: 1, y: 1.5, z: 25, scale: 1.3, type: 'emoji', emojiIndex: 0,
        movement: { pattern: 'horizontal', speed: 32, range: 40 },
      },
      {
        x: -3, y: 3.5, z: 36, scale: 1.1, type: 'emoji', emojiIndex: 2,
        movement: { pattern: 'circle', speed: 26, range: 30 },
      },
    ],
    wind: 0.3,
    arrowCount: 16,
  },

  // Level 17: Sturm der Enten
  {
    name: 'Sturm der Enten',
    subtitle: 'Enten im Sturm! 🌊🦆',
    targets: [
      {
        x: -4, y: 1.5, z: 26, scale: 1.1, type: 'duck',
        movement: { pattern: 'sine', speed: 35, range: 50 },
      },
      {
        x: -1, y: 2.5, z: 30, scale: 1.05, type: 'duck',
        movement: { pattern: 'circle', speed: 30, range: 40 },
      },
      {
        x: 2, y: 1.5, z: 28, scale: 1.1, type: 'duck',
        movement: { pattern: 'horizontal', speed: 40, range: 55 },
      },
      {
        x: 4, y: 2, z: 32, scale: 1.0, type: 'duck',
        movement: { pattern: 'sine', speed: 38, range: 45 },
      },
      {
        x: -2, y: 2, z: 34, scale: 1.0, type: 'duck',
        movement: { pattern: 'circle', speed: 32, range: 42 },
      },
      {
        x: 1, y: 3, z: 36, scale: 0.95, type: 'duck',
        movement: { pattern: 'sine', speed: 42, range: 48 },
      },
    ],
    wind: 0.7,
    arrowCount: 16,
  },

  // Level 18: Zwergen-Scheiben
  {
    name: 'Zwergen-Scheiben',
    subtitle: 'Winzig und flink! 🎯',
    targets: [
      {
        x: -3, y: 2, z: 28, scale: 0.5, type: 'moving',
        movement: { pattern: 'sine', speed: 35, range: 40 },
      },
      {
        x: 0, y: 2.5, z: 32, scale: 0.5, type: 'moving',
        movement: { pattern: 'circle', speed: 30, range: 35 },
      },
      {
        x: 3, y: 2, z: 30, scale: 0.5, type: 'moving',
        movement: { pattern: 'horizontal', speed: 38, range: 45 },
      },
      {
        x: -1.5, y: 3, z: 35, scale: 0.5, type: 'moving',
        movement: { pattern: 'sine', speed: 40, range: 38 },
      },
      {
        x: 2, y: 2.5, z: 33, scale: 0.5, type: 'moving',
        movement: { pattern: 'circle', speed: 33, range: 42 },
      },
    ],
    wind: 0.3,
    arrowCount: 12,
  },

  // Level 19: Alles auf einmal
  {
    name: 'Alles auf einmal',
    subtitle: 'Totales Chaos! 🤯',
    targets: [
      { x: -4, y: 1.5, z: 25, scale: 0.8, type: 'static' },
      {
        x: -1, y: 2, z: 30, scale: 0.9, type: 'moving',
        movement: { pattern: 'horizontal', speed: 35, range: 45 },
      },
      {
        x: 2, y: 2.5, z: 28, scale: 1.0, type: 'duck',
        movement: { pattern: 'sine', speed: 38, range: 40 },
      },
      {
        x: 4, y: 2, z: 35, scale: 1.1, type: 'emoji', emojiIndex: 1,
        movement: { pattern: 'circle', speed: 30, range: 35 },
      },
      {
        x: -3, y: 3, z: 38, scale: 0.75, type: 'moving',
        movement: { pattern: 'sine', speed: 42, range: 42 },
      },
      {
        x: 0, y: 3.5, z: 40, scale: 0.85, type: 'duck',
        movement: { pattern: 'horizontal', speed: 45, range: 50 },
      },
      {
        x: 3, y: 2, z: 42, scale: 0.9, type: 'emoji', emojiIndex: 3,
        movement: { pattern: 'circle', speed: 35, range: 38 },
      },
      { x: -2, y: 4, z: 45, scale: 0.7, type: 'static' },
    ],
    wind: 0.6,
    arrowCount: 18,
  },

  // Level 20: Legende
  {
    name: 'Legende',
    subtitle: 'Bist du bereit? 🏆👑',
    targets: [
      {
        x: -4, y: 2, z: 40, scale: 0.5, type: 'moving',
        movement: { pattern: 'circle', speed: 45, range: 45 },
      },
      {
        x: 0, y: 3, z: 48, scale: 0.45, type: 'duck',
        movement: { pattern: 'sine', speed: 50, range: 50 },
      },
      {
        x: 3, y: 2.5, z: 44, scale: 0.5, type: 'emoji', emojiIndex: 0,
        movement: { pattern: 'horizontal', speed: 52, range: 55 },
      },
      {
        x: -2, y: 3.5, z: 50, scale: 0.45, type: 'moving',
        movement: { pattern: 'circle', speed: 48, range: 42 },
      },
      {
        x: 2, y: 2, z: 55, scale: 0.5, type: 'emoji', emojiIndex: 2,
        movement: { pattern: 'sine', speed: 55, range: 48 },
      },
      {
        x: -1, y: 4, z: 52, scale: 0.45, type: 'duck',
        movement: { pattern: 'circle', speed: 50, range: 46 },
      },
    ],
    wind: 0.8,
    arrowCount: 12,
  },
];

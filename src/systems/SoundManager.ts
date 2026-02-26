// Synthesized sound effects using Web Audio API — no audio files needed

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15, ramp = true) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    if (ramp) gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch { /* noop */ }
}

function playNoise(duration: number, volume = 0.1) {
  try {
    const c = getCtx();
    const bufferSize = c.sampleRate * duration;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = c.createBufferSource();
    source.buffer = buffer;
    const gain = c.createGain();
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    source.connect(gain).connect(c.destination);
    source.start();
  } catch { /* noop */ }
}

export const Sound = {
  /** Bow string release */
  shoot() {
    playTone(220, 0.15, 'sawtooth', 0.12);
    playNoise(0.08, 0.06);
  },

  /** Arrow hits target */
  hit() {
    playTone(880, 0.12, 'sine', 0.15);
    setTimeout(() => playTone(1100, 0.1, 'sine', 0.1), 60);
  },

  /** Arrow misses */
  miss() {
    playNoise(0.2, 0.05);
  },

  /** Combo bonus sound — higher pitch for bigger combo */
  combo(level: number) {
    const base = 600 + level * 150;
    playTone(base, 0.15, 'sine', 0.12);
    setTimeout(() => playTone(base * 1.25, 0.12, 'sine', 0.1), 80);
    setTimeout(() => playTone(base * 1.5, 0.1, 'sine', 0.08), 160);
  },

  /** Level complete fanfare */
  levelComplete() {
    [0, 100, 200, 300].forEach((delay, i) => {
      setTimeout(() => playTone(523 + i * 130, 0.3, 'sine', 0.12), delay);
    });
  },

  /** Game over */
  gameOver() {
    playTone(300, 0.3, 'sawtooth', 0.1);
    setTimeout(() => playTone(220, 0.4, 'sawtooth', 0.08), 200);
  },

  /** Button click */
  click() {
    playTone(600, 0.06, 'sine', 0.08);
  },

  /** New record */
  newRecord() {
    [0, 80, 160, 240, 320].forEach((delay, i) => {
      setTimeout(() => playTone(700 + i * 100, 0.2, 'sine', 0.12), delay);
    });
  },

  /** Buy item */
  buy() {
    playTone(500, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(800, 0.15, 'sine', 0.12), 100);
  }
};

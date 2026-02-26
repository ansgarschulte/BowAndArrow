import * as THREE from 'three';
import { Colors3D, GameSettings, BowType } from '../config/gameConfig';

export interface Target3DConfig {
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

export class Target3D {
  public mesh: THREE.Group;
  private config: Target3DConfig;
  private basePos: THREE.Vector3;
  private elapsed: number = 0;
  private hit: boolean = false;
  private hitRadius: number;
  private scene: THREE.Scene;
  private camera: THREE.Camera | null = null;

  constructor(scene: THREE.Scene, config: Target3DConfig, camera?: THREE.Camera) {
    this.scene = scene;
    this.config = config;
    this.camera = camera || null;
    this.basePos = new THREE.Vector3(config.x, config.y, config.z);
    this.mesh = new THREE.Group();
    this.hitRadius = 0.55 * config.scale * GameSettings.hitRadiusMultiplier;

    if (config.type === 'duck') {
      this.createDuck();
    } else if (config.type === 'emoji') {
      this.createEmoji(config.emojiIndex || 0);
    } else if (config.type === 'bonus') {
      this.createBonusTarget();
    } else if (config.type === 'bomb') {
      this.createBombTarget();
    } else {
      this.createTarget();
    }

    this.mesh.position.copy(this.basePos);
    this.mesh.castShadow = true;
    scene.add(this.mesh);
  }

  private createTarget(): void {
    const s = this.config.scale;
    const radius = 0.6 * s;

    // Draw target rings on canvas and render as Sprite (avoids flat-mesh rendering bugs)
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 4;

    // Rings from outside in: blue, white, red, white, red
    const rings: { r: number; color: string }[] = [
      { r: 1.0,  color: '#0074d9' },
      { r: 0.75, color: '#ffffff' },
      { r: 0.55, color: '#e0342e' },
      { r: 0.35, color: '#ffffff' },
      { r: 0.18, color: '#e0342e' },
    ];

    for (const ring of rings) {
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * ring.r, 0, Math.PI * 2);
      ctx.fillStyle = ring.color;
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(radius * 2, radius * 2, 1);
    this.mesh.add(sprite);

    // Stand
    const standMat = new THREE.MeshLambertMaterial({ color: Colors3D.wood });
    const standHeight = this.config.y;
    if (standHeight > 0.3) {
      const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.06, standHeight, 6),
        standMat
      );
      stand.position.y = -standHeight / 2;
      this.mesh.add(stand);
    }
  }

  private createDuck(): void {
    const s = this.config.scale;

    // Rubber duck facing +Z (toward camera after lookAt)
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const brightYellow = new THREE.MeshLambertMaterial({ color: 0xffeb3b });

    // Body - large round shape
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.45 * s, 16, 12), bodyMat);
    body.scale.set(1.1, 0.85, 1.0);
    this.mesh.add(body);

    // Belly highlight
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.35 * s, 12, 10), brightYellow);
    belly.position.set(0, -0.08 * s, 0.1 * s);
    belly.scale.set(0.9, 0.7, 0.8);
    this.mesh.add(belly);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25 * s, 14, 10), bodyMat);
    head.position.set(0, 0.35 * s, 0.15 * s);
    this.mesh.add(head);

    // Beak (orange, pointing toward +Z / camera)
    const beakMat = new THREE.MeshLambertMaterial({ color: 0xff6d00 });
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.09 * s, 0.22 * s, 8), beakMat);
    beak.position.set(0, 0.3 * s, 0.4 * s);
    beak.rotation.x = Math.PI / 2;
    this.mesh.add(beak);

    // Eyes - white sclera + black pupil
    const scleraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    for (const side of [-1, 1]) {
      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.06 * s, 8, 6), scleraMat);
      sclera.position.set(side * 0.12 * s, 0.42 * s, 0.3 * s);
      this.mesh.add(sclera);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.03 * s, 6, 4), pupilMat);
      pupil.position.set(side * 0.12 * s, 0.42 * s, 0.36 * s);
      this.mesh.add(pupil);
    }

    // Wings
    const wingMat = new THREE.MeshLambertMaterial({ color: 0xf0c800 });
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.SphereGeometry(0.18 * s, 8, 6), wingMat);
      wing.position.set(side * 0.38 * s, 0.05 * s, -0.05 * s);
      wing.scale.set(0.5, 0.7, 1.0);
      this.mesh.add(wing);
    }

    // Tail feathers
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1 * s, 0.18 * s, 6), bodyMat);
    tail.position.set(0, 0.15 * s, -0.42 * s);
    tail.rotation.x = -Math.PI / 3;
    this.mesh.add(tail);
  }

  private createEmoji(index: number): void {
    const emojis = ['🎯', '😜', '🤡', '🎪', '🦆'];
    const emoji = emojis[index % emojis.length];

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.font = '96px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8 * this.config.scale, 0.8 * this.config.scale),
      mat
    );
    this.mesh.add(plane);
  }

  private createBonusTarget(): void {
    const s = this.config.scale;
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;

    // Golden star
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ff8c00';
    ctx.shadowBlur = 20;
    this.drawStar(ctx, cx, cx, 5, size * 0.4, size * 0.2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('3×', cx, cx);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(s * 1.2, s * 1.2, 1);
    this.mesh.add(sprite);
  }

  private createBombTarget(): void {
    const s = this.config.scale;
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;

    // Black bomb circle
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(cx, cx + 20, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    // Fuse
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cx - size * 0.3);
    ctx.quadraticCurveTo(cx + 30, cx - size * 0.45, cx + 20, cx - size * 0.5);
    ctx.stroke();
    // Spark
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(cx + 20, cx - size * 0.5, 12, 0, Math.PI * 2);
    ctx.fill();
    // Skull emoji
    ctx.font = '72px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💣', cx, cx + 20);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(s * 1.2, s * 1.2, 1);
    this.mesh.add(sprite);
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerR: number, innerR: number): void {
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI * i) / spikes - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  update(delta: number): void {
    if (this.hit) return;

    this.elapsed += delta;

    if (this.config.movement) {
      const { pattern, speed, range } = this.config.movement;
      const t = this.elapsed * speed * 0.05;
      const r = range * 0.1; // scale range to 3D units

      switch (pattern) {
        case 'horizontal':
          this.mesh.position.x = this.basePos.x + Math.sin(t) * r;
          break;
        case 'vertical':
          this.mesh.position.y = this.basePos.y + Math.sin(t) * r;
          break;
        case 'sine':
          this.mesh.position.x = this.basePos.x + Math.sin(t) * r;
          this.mesh.position.y = this.basePos.y + Math.cos(t * 0.7) * r * 0.5;
          break;
        case 'circle':
          this.mesh.position.x = this.basePos.x + Math.cos(t) * r;
          this.mesh.position.y = this.basePos.y + Math.sin(t) * r;
          break;
      }
    }

    // Face camera
    if (this.camera) {
      const lookPos = this.camera.position.clone();
      lookPos.y = this.mesh.position.y;
      this.mesh.lookAt(lookPos);
    }
  }

  checkHit(arrowPos: THREE.Vector3): { hit: boolean; distance: number } {
    if (this.hit) return { hit: false, distance: Infinity };

    const dist = arrowPos.distanceTo(this.mesh.position);
    if (dist <= this.hitRadius) {
      return { hit: true, distance: dist };
    }
    return { hit: false, distance: dist };
  }

  getType(): string { return this.config.type; }
  isBonus(): boolean { return this.config.type === 'bonus'; }
  isBomb(): boolean { return this.config.type === 'bomb'; }
  isRequired(): boolean { return this.config.type !== 'bonus' && this.config.type !== 'bomb'; }

  onHit(bowType: BowType = 'classic'): void {
    this.hit = true;

    switch (bowType) {
      case 'fire':    this.hitEffectFire();      break;
      case 'ice':     this.hitEffectIce();       break;
      case 'lightning': this.hitEffectLightning(); break;
      case 'gold':    this.hitEffectGold();      break;
      case 'water':   this.hitEffectWater();     break;
      case 'smoke':   this.hitEffectSmoke();     break;
      case 'air':     this.hitEffectAir();       break;
      default:        this.hitEffectDefault();   break;
    }
  }

  private fadeOutMesh(delay: number, duration: number, scale: number = 1.3): void {
    const startTime = Date.now() + delay;
    const animate = () => {
      const now = Date.now();
      if (now < startTime) { requestAnimationFrame(animate); return; }
      const progress = (now - startTime) / duration;
      if (progress >= 1) { this.mesh.visible = false; return; }
      const s = 1 + progress * (scale - 1);
      this.mesh.scale.set(s, s, s);
      this.mesh.traverse(child => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.Material;
          mat.transparent = true;
          mat.opacity = 1 - progress;
        }
      });
      requestAnimationFrame(animate);
    };
    animate();
  }

  private spawnBurst(colors: number[], count: number, speed: number, size: number, duration: number, rise: boolean = false): void {
    const pos = this.mesh.position;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(size + Math.random() * size, 5, 5);
      const mat = new THREE.MeshBasicMaterial({ color: colors[Math.floor(Math.random() * colors.length)], transparent: true });
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(pos);
      this.scene.add(p);
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        rise ? Math.random() * 2 : (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(speed * (0.5 + Math.random() * 0.5));
      const start = Date.now();
      const tick = () => {
        const t = (Date.now() - start) / duration;
        if (t >= 1) { this.scene.remove(p); geo.dispose(); mat.dispose(); return; }
        p.position.addScaledVector(dir, 0.016);
        if (!rise) dir.y -= 9.8 * 0.016;
        mat.opacity = 1 - t;
        p.scale.setScalar(rise ? 1 + t * 2 : 1 - t * 0.5);
        requestAnimationFrame(tick);
      };
      tick();
    }
  }

  private spawnShards(colors: number[], count: number): void {
    const pos = this.mesh.position;
    for (let i = 0; i < count; i++) {
      const w = 0.05 + Math.random() * 0.15;
      const h = 0.15 + Math.random() * 0.25;
      const geo = new THREE.BoxGeometry(w, h, 0.03);
      const mat = new THREE.MeshBasicMaterial({ color: colors[Math.floor(Math.random() * colors.length)], transparent: true });
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(pos);
      p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.scene.add(p);
      const vel = new THREE.Vector3((Math.random()-0.5)*6, Math.random()*5+2, (Math.random()-0.5)*6);
      const rot = new THREE.Vector3((Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10);
      const start = Date.now();
      const tick = () => {
        const t = (Date.now() - start) / 700;
        if (t >= 1) { this.scene.remove(p); geo.dispose(); mat.dispose(); return; }
        p.position.addScaledVector(vel, 0.016);
        vel.y -= 9.8 * 0.016;
        p.rotation.x += rot.x * 0.016;
        p.rotation.y += rot.y * 0.016;
        mat.opacity = 1 - t;
        requestAnimationFrame(tick);
      };
      tick();
    }
  }

  private hitEffectDefault(): void {
    this.createHitParticles();
    this.fadeOutMesh(0, 400);
  }

  private hitEffectFire(): void {
    // Tint target red/orange, then burn away with rising flames
    this.mesh.traverse(child => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshBasicMaterial).color?.setHex(0xff4500);
      }
    });
    this.spawnBurst([0xff6d00, 0xff9100, 0xffab00, 0xff3d00, 0xdd2c00], 25, 3, 0.07, 1200, true);
    this.fadeOutMesh(100, 600);
  }

  private hitEffectIce(): void {
    // Tint target icy blue, then shatter into shards
    this.mesh.traverse(child => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshBasicMaterial).color?.setHex(0xa8d8ff);
      }
    });
    this.spawnShards([0xb3e5fc, 0x81d4fa, 0xe1f5fe, 0xffffff, 0x4fc3f7], 18);
    this.fadeOutMesh(50, 200);
  }

  private hitEffectLightning(): void {
    // Flash white, then electric burst
    this.mesh.traverse(child => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshBasicMaterial).color?.setHex(0xffffff);
      }
    });
    this.spawnBurst([0xffff00, 0xfff9c4, 0xffd600, 0xffffff, 0xffe57f], 20, 7, 0.04, 500);
    this.fadeOutMesh(0, 200);
  }

  private hitEffectGold(): void {
    // Gold coin explosion sparkle
    this.spawnBurst([0xffd700, 0xffe082, 0xffecb3, 0xffc107, 0xffffff], 22, 4, 0.06, 900);
    this.fadeOutMesh(0, 500);
  }

  private hitEffectWater(): void {
    // Water splash with blue droplets and scale-up
    this.spawnBurst([0x42a5f5, 0x64b5f6, 0x90caf9, 0xbbdefb, 0xffffff], 20, 6, 0.06, 700);
    this.fadeOutMesh(0, 350, 1.5);
  }

  private hitEffectSmoke(): void {
    // Big gray smoke puffs expanding
    this.spawnBurst([0x9e9e9e, 0xbdbdbd, 0x757575, 0x616161, 0xe0e0e0], 28, 1.5, 0.12, 1500, true);
    this.fadeOutMesh(0, 600);
  }

  private hitEffectAir(): void {
    // Wind swirl — light blue particles spinning outward
    this.spawnBurst([0xb3e5fc, 0x81d4fa, 0xe1f5fe, 0xffffff, 0x4fc3f7], 18, 5, 0.05, 600);
    this.fadeOutMesh(0, 300, 1.2);
  }

  private createHitParticles(): void {
    const colors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff];
    for (let i = 0; i < 15; i++) {
      const geo = new THREE.SphereGeometry(0.04 + Math.random() * 0.04, 4, 4);
      const mat = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
      });
      const particle = new THREE.Mesh(geo, mat);
      particle.position.copy(this.mesh.position);
      this.scene.add(particle);

      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
      );
      const speed = 2 + Math.random() * 3;
      const startTime = Date.now();

      const animateParticle = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed > 0.6) {
          this.scene.remove(particle);
          geo.dispose();
          mat.dispose();
          return;
        }
        particle.position.add(dir.clone().multiplyScalar(speed * 0.016));
        dir.y -= 9.8 * 0.016;
        mat.opacity = 1 - elapsed / 0.6;
        mat.transparent = true;
        requestAnimationFrame(animateParticle);
      };
      animateParticle();
    }
  }

  isHit(): boolean {
    return this.hit;
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  destroy(): void {
    this.scene.remove(this.mesh);
    this.mesh.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) child.material.dispose();
      }
    });
  }
}

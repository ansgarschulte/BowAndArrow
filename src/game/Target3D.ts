import * as THREE from 'three';
import { Colors3D, GameSettings } from '../config/gameConfig';

export interface Target3DConfig {
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

  onHit(): void {
    this.hit = true;
    this.createHitParticles();

    // Fade out
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / 400;
      if (progress >= 1) {
        this.mesh.visible = false;
        return;
      }
      const s = 1 + progress * 0.3;
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

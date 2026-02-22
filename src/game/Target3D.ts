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

  constructor(scene: THREE.Scene, config: Target3DConfig) {
    this.scene = scene;
    this.config = config;
    this.basePos = new THREE.Vector3(config.x, config.y, config.z);
    this.mesh = new THREE.Group();
    this.hitRadius = 0.5 * config.scale * GameSettings.hitRadiusMultiplier;

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
    // Create target as concentric cylinders (rings)
    const rings = [
      { radius: 0.5, color: Colors3D.targetRed },
      { radius: 0.4, color: Colors3D.targetWhite },
      { radius: 0.3, color: Colors3D.targetBlue },
      { radius: 0.2, color: Colors3D.targetRed },
      { radius: 0.1, color: Colors3D.targetYellow },
    ];

    rings.forEach((ring, i) => {
      const geo = new THREE.CylinderGeometry(
        ring.radius * this.config.scale,
        ring.radius * this.config.scale,
        0.05,
        24
      );
      const mat = new THREE.MeshLambertMaterial({ color: ring.color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = -i * 0.005;
      mesh.rotation.x = Math.PI / 2;
      this.mesh.add(mesh);
    });

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
    const duckMat = new THREE.MeshLambertMaterial({ color: 0xffeb3b });
    // Body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.3 * this.config.scale, 10, 8), duckMat);
    body.scale.set(1.2, 0.9, 1);
    this.mesh.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18 * this.config.scale, 8, 6), duckMat);
    head.position.set(0, 0.2 * this.config.scale, -0.2 * this.config.scale);
    this.mesh.add(head);

    // Beak
    const beakMat = new THREE.MeshLambertMaterial({ color: 0xff9800 });
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06 * this.config.scale, 0.15 * this.config.scale, 6), beakMat);
    beak.position.set(0, 0.2 * this.config.scale, -0.38 * this.config.scale);
    beak.rotation.x = -Math.PI / 2;
    this.mesh.add(beak);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), eyeMat);
    leftEye.position.set(-0.08 * this.config.scale, 0.25 * this.config.scale, -0.3 * this.config.scale);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), eyeMat);
    rightEye.position.set(0.08 * this.config.scale, 0.25 * this.config.scale, -0.3 * this.config.scale);
    this.mesh.add(leftEye, rightEye);
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

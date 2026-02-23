import * as THREE from 'three';
import { Colors3D, GameSettings, BowConfig, BowTypes, getSelectedBow } from '../config/gameConfig';

export class Arrow3D {
  public group: THREE.Group;
  private velocity: THREE.Vector3;
  private wind: number;
  private active: boolean = true;
  private trail: THREE.Points;
  private trailPositions: number[] = [];
  private maxTrailLength: number = 30;
  private scene: THREE.Scene;
  private bowConfig: BowConfig;
  private particles: THREE.Mesh[] = [];
  private particleTimer: number = 0;

  constructor(
    scene: THREE.Scene,
    startPos: THREE.Vector3,
    direction: THREE.Vector3,
    power: number,
    wind: number
  ) {
    this.scene = scene;
    this.wind = wind * GameSettings.windMax;
    this.group = new THREE.Group();
    this.bowConfig = BowTypes[getSelectedBow()];

    // Arrow shaft
    const shaftMat = new THREE.MeshLambertMaterial({ color: this.bowConfig.arrowColor });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 6), shaftMat);
    shaft.rotation.x = Math.PI / 2;
    this.group.add(shaft);

    // Arrow tip
    const tipMat = new THREE.MeshLambertMaterial({ color: this.bowConfig.tipColor });
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 6), tipMat);
    tip.position.set(0, 0, -0.44);
    tip.rotation.x = -Math.PI / 2;
    this.group.add(tip);

    // Fletching
    const fletchMat = new THREE.MeshLambertMaterial({ color: Colors3D.feather, side: THREE.DoubleSide });
    for (let i = 0; i < 3; i++) {
      const fletch = new THREE.Mesh(
        new THREE.PlaneGeometry(0.04, 0.07),
        fletchMat
      );
      fletch.position.set(0, 0, 0.37);
      fletch.rotation.y = (i / 3) * Math.PI;
      this.group.add(fletch);
    }

    // Glow effect for special bows
    if (this.bowConfig.glowColor) {
      const glowMat = new THREE.MeshBasicMaterial({
        color: this.bowConfig.glowColor,
        transparent: true,
        opacity: 0.3,
      });
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), glowMat);
      glow.position.set(0, 0, -0.35);
      this.group.add(glow);
    }

    this.group.position.copy(startPos);
    this.group.castShadow = true;

    // Velocity
    const speed = power * GameSettings.arrowSpeed;
    this.velocity = direction.clone().multiplyScalar(speed);

    // Trail
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
    const trailMat = new THREE.PointsMaterial({
      color: this.bowConfig.trailColor,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
    });
    this.trail = new THREE.Points(trailGeo, trailMat);
    scene.add(this.trail);

    scene.add(this.group);
  }

  update(delta: number): boolean {
    if (!this.active) return false;

    // Physics
    this.velocity.x += this.wind * delta;
    this.velocity.y -= GameSettings.gravity * delta;

    this.group.position.x += this.velocity.x * delta;
    this.group.position.y += this.velocity.y * delta;
    this.group.position.z += this.velocity.z * delta;

    // Orient arrow along velocity
    const dir = this.velocity.clone().normalize();
    const lookTarget = this.group.position.clone().add(dir);
    this.group.lookAt(lookTarget);

    // Trail
    this.trailPositions.push(
      this.group.position.x,
      this.group.position.y,
      this.group.position.z
    );
    if (this.trailPositions.length > this.maxTrailLength * 3) {
      this.trailPositions.splice(0, 3);
    }
    this.trail.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(this.trailPositions, 3)
    );

    // Spawn particles for special bows
    if (this.bowConfig.particleColors.length > 0) {
      this.particleTimer += delta;
      if (this.particleTimer > 0.03) {
        this.particleTimer = 0;
        this.spawnParticle();
      }
    }

    // Out of bounds
    if (
      this.group.position.y < -1 ||
      this.group.position.z > 100 ||
      this.group.position.z < -10 ||
      Math.abs(this.group.position.x) > 30
    ) {
      this.deactivate();
      return false;
    }

    return true;
  }

  getPosition(): THREE.Vector3 {
    return this.group.position.clone();
  }

  isActive(): boolean {
    return this.active;
  }

  deactivate(): void {
    this.active = false;
    // Fade out
    const startTime = Date.now();
    const fadeOut = () => {
      const elapsed = Date.now() - startTime;
      const alpha = 1 - elapsed / 400;
      if (alpha <= 0) {
        this.destroy();
        return;
      }
      this.group.traverse(child => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshLambertMaterial;
          mat.transparent = true;
          mat.opacity = alpha;
        }
      });
      requestAnimationFrame(fadeOut);
    };
    fadeOut();
  }

  destroy(): void {
    this.scene.remove(this.group);
    this.scene.remove(this.trail);
    this.particles.forEach(p => {
      this.scene.remove(p);
      p.geometry.dispose();
      (p.material as THREE.Material).dispose();
    });
    this.group.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) child.material.dispose();
      }
    });
    this.trail.geometry.dispose();
    (this.trail.material as THREE.Material).dispose();
  }

  private spawnParticle(): void {
    const colors = this.bowConfig.particleColors;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const geo = new THREE.SphereGeometry(0.02 + Math.random() * 0.03, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
    const p = new THREE.Mesh(geo, mat);
    p.position.copy(this.group.position);
    p.position.x += (Math.random() - 0.5) * 0.08;
    p.position.y += (Math.random() - 0.5) * 0.08;
    this.scene.add(p);
    this.particles.push(p);

    // Fade and remove
    const start = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - start) / 300;
      if (elapsed >= 1) {
        this.scene.remove(p);
        geo.dispose();
        mat.dispose();
        const idx = this.particles.indexOf(p);
        if (idx >= 0) this.particles.splice(idx, 1);
        return;
      }
      mat.opacity = 0.8 * (1 - elapsed);
      p.scale.setScalar(1 + elapsed * 0.5);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
}

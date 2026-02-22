import * as THREE from 'three';
import { Colors3D } from '../config/gameConfig';

export class Environment3D {
  private group: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();

    this.createSky(scene);
    this.createGround();
    this.createMountains();
    this.createTrees();
    this.createClouds();
    this.createShootingPlatform();

    scene.add(this.group);
  }

  private createSky(scene: THREE.Scene): void {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#4a90d9');
    gradient.addColorStop(0.4, '#87ceeb');
    gradient.addColorStop(0.8, '#c8e6f5');
    gradient.addColorStop(1, '#e8f4f8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    scene.background = texture;
  }

  private createGround(): void {
    // Main grass plane
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#4caf50';
    ctx.fillRect(0, 0, 512, 512);

    // Grass variation
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.random() > 0.5 ? '#388e3c' : '#66bb6a';
      ctx.fillStyle = shade;
      ctx.fillRect(x, y, 2 + Math.random() * 3, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);

    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshLambertMaterial({ map: texture });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.group.add(ground);
  }

  private createMountains(): void {
    const mountainColor = Colors3D.mountain;
    const mat = new THREE.MeshLambertMaterial({ color: mountainColor });

    const positions = [
      { x: -30, z: 80, scale: 12 },
      { x: -10, z: 90, scale: 18 },
      { x: 15, z: 85, scale: 14 },
      { x: 35, z: 88, scale: 16 },
      { x: -45, z: 75, scale: 10 },
    ];

    positions.forEach(p => {
      const geo = new THREE.ConeGeometry(p.scale, p.scale * 1.5, 6);
      const mountain = new THREE.Mesh(geo, mat);
      mountain.position.set(p.x, p.scale * 0.75 - 1, p.z);
      this.group.add(mountain);
    });
  }

  private createTrees(): void {
    const trunkMat = new THREE.MeshLambertMaterial({ color: Colors3D.treeTrunk });
    const leavesMat = new THREE.MeshLambertMaterial({ color: Colors3D.treeLeaves });
    const darkLeavesMat = new THREE.MeshLambertMaterial({ color: 0x1b5e20 });

    // Trees along the sides of the field
    const treePositions = [
      { x: -12, z: 10 }, { x: -14, z: 25 }, { x: -11, z: 40 },
      { x: -15, z: 55 }, { x: -13, z: 65 },
      { x: 12, z: 15 }, { x: 14, z: 30 }, { x: 11, z: 45 },
      { x: 15, z: 58 }, { x: 13, z: 70 },
    ];

    treePositions.forEach(p => {
      const h = 3 + Math.random() * 3;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, h * 0.4, 6),
        trunkMat
      );
      trunk.position.set(p.x, h * 0.2, p.z);
      trunk.castShadow = true;
      this.group.add(trunk);

      const mat = Math.random() > 0.5 ? leavesMat : darkLeavesMat;
      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(h * 0.35, 8, 6),
        mat
      );
      crown.position.set(p.x, h * 0.55, p.z);
      crown.castShadow = true;
      this.group.add(crown);
    });
  }

  private createClouds(): void {
    const mat = new THREE.MeshBasicMaterial({
      color: Colors3D.cloud,
      transparent: true,
      opacity: 0.8,
    });

    for (let i = 0; i < 8; i++) {
      const cloud = new THREE.Group();
      const numParts = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < numParts; j++) {
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(1.5 + Math.random() * 2, 8, 6),
          mat
        );
        sphere.position.set(
          (j - numParts / 2) * 1.8,
          Math.random() * 0.5,
          Math.random() * 0.5
        );
        sphere.scale.y = 0.5;
        cloud.add(sphere);
      }
      cloud.position.set(
        -40 + Math.random() * 80,
        18 + Math.random() * 10,
        20 + Math.random() * 60
      );
      this.group.add(cloud);
    }
  }

  private createShootingPlatform(): void {
    const woodMat = new THREE.MeshLambertMaterial({ color: Colors3D.wood });

    // Platform
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.15, 2),
      woodMat
    );
    platform.position.set(0, 0.07, 0);
    platform.receiveShadow = true;
    platform.castShadow = true;
    this.group.add(platform);
  }

  destroy(): void {
    this.group.parent?.remove(this.group);
    this.group.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) child.material.dispose();
      }
    });
  }
}

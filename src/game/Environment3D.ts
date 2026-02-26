import * as THREE from 'three';
import { Colors3D } from '../config/gameConfig';

export type WorldTheme = 'meadow' | 'desert' | 'snow' | 'volcano';

interface ThemeColors {
  skyTop: string;
  skyMid: string;
  skyLow: string;
  skyBot: string;
  ground: string;
  groundAlt1: string;
  groundAlt2: string;
  mountain: number;
  treeLeaves: number;
  treeTrunk: number;
  cloudColor: number;
  cloudOpacity: number;
}

const themes: Record<WorldTheme, ThemeColors> = {
  meadow: {
    skyTop: '#4a90d9', skyMid: '#87ceeb', skyLow: '#c8e6f5', skyBot: '#e8f4f8',
    ground: '#4caf50', groundAlt1: '#388e3c', groundAlt2: '#66bb6a',
    mountain: Colors3D.mountain, treeLeaves: Colors3D.treeLeaves, treeTrunk: Colors3D.treeTrunk,
    cloudColor: Colors3D.cloud, cloudOpacity: 0.8,
  },
  desert: {
    skyTop: '#e8a317', skyMid: '#f5c842', skyLow: '#fde8a0', skyBot: '#fff8e1',
    ground: '#d4a84b', groundAlt1: '#c49533', groundAlt2: '#e0be6a',
    mountain: 0x8b6914, treeLeaves: 0x6b8e23, treeTrunk: 0x8b7355,
    cloudColor: 0xfff8dc, cloudOpacity: 0.5,
  },
  snow: {
    skyTop: '#6e7b8b', skyMid: '#9fb4c7', skyLow: '#c8d8e4', skyBot: '#e8ecf0',
    ground: '#e8e8e8', groundAlt1: '#d0d0d0', groundAlt2: '#ffffff',
    mountain: 0xb0c4de, treeLeaves: 0x2e5a3e, treeTrunk: 0x5c4033,
    cloudColor: 0xc8c8c8, cloudOpacity: 0.9,
  },
  volcano: {
    skyTop: '#1a0a0a', skyMid: '#3d1414', skyLow: '#6b2020', skyBot: '#8b3a3a',
    ground: '#2a2a2a', groundAlt1: '#1a1a1a', groundAlt2: '#3a3a3a',
    mountain: 0x4a2020, treeLeaves: 0x333333, treeTrunk: 0x1a1a1a,
    cloudColor: 0x555555, cloudOpacity: 0.7,
  },
};

export function getWorldTheme(level: number): WorldTheme {
  if (level <= 5) return 'meadow';
  if (level <= 10) return 'desert';
  if (level <= 15) return 'snow';
  return 'volcano';
}

export class Environment3D {
  private group: THREE.Group;
  private theme: ThemeColors;

  constructor(scene: THREE.Scene, worldTheme: WorldTheme = 'meadow') {
    this.group = new THREE.Group();
    this.theme = themes[worldTheme];

    this.createSky(scene);
    this.createGround();
    this.createMountains();
    if (worldTheme === 'volcano') {
      this.createLavaFlows();
    } else {
      this.createTrees();
    }
    this.createClouds();
    this.createShootingPlatform();

    // Snow world: add snowflakes
    if (worldTheme === 'snow') this.createSnowParticles();
    // Desert: add cacti instead of some trees
    if (worldTheme === 'desert') this.createCacti();

    scene.add(this.group);
  }

  private createSky(scene: THREE.Scene): void {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, this.theme.skyTop);
    gradient.addColorStop(0.4, this.theme.skyMid);
    gradient.addColorStop(0.8, this.theme.skyLow);
    gradient.addColorStop(1, this.theme.skyBot);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    scene.background = texture;
  }

  private createGround(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = this.theme.ground;
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.random() > 0.5 ? this.theme.groundAlt1 : this.theme.groundAlt2;
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
    const mat = new THREE.MeshLambertMaterial({ color: this.theme.mountain });

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
    const trunkMat = new THREE.MeshLambertMaterial({ color: this.theme.treeTrunk });
    const leavesMat = new THREE.MeshLambertMaterial({ color: this.theme.treeLeaves });
    const darkLeavesMat = new THREE.MeshLambertMaterial({ color: 0x1b5e20 });

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

  private createCacti(): void {
    const cactusMat = new THREE.MeshLambertMaterial({ color: 0x2e8b2e });
    const positions = [
      { x: -10, z: 15 }, { x: 8, z: 22 }, { x: -6, z: 38 },
      { x: 11, z: 50 }, { x: -13, z: 60 },
    ];
    positions.forEach(p => {
      const h = 1.5 + Math.random() * 2;
      // Main trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, h, 6), cactusMat);
      trunk.position.set(p.x, h / 2, p.z);
      this.group.add(trunk);
      // Arm
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, h * 0.4, 5), cactusMat);
      arm.position.set(p.x + 0.4, h * 0.55, p.z);
      arm.rotation.z = -Math.PI / 4;
      this.group.add(arm);
    });
  }

  private createSnowParticles(): void {
    const count = 200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 25;
      positions[i * 3 + 2] = Math.random() * 80;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.8 });
    const snow = new THREE.Points(geo, mat);
    this.group.add(snow);
  }

  private createLavaFlows(): void {
    const lavaMat = new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.7 });
    // Lava streams
    for (let i = 0; i < 4; i++) {
      const x = -15 + Math.random() * 30;
      const z = 30 + Math.random() * 50;
      const lava = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5 + Math.random() * 2, 8 + Math.random() * 10),
        lavaMat
      );
      lava.rotation.x = -Math.PI / 2;
      lava.position.set(x, 0.02, z);
      this.group.add(lava);
    }
    // Glow light
    const glowLight = new THREE.PointLight(0xff4500, 0.4, 60);
    glowLight.position.set(0, 5, 50);
    this.group.add(glowLight);
  }

  private createClouds(): void {
    const mat = new THREE.MeshBasicMaterial({
      color: this.theme.cloudColor,
      transparent: true,
      opacity: this.theme.cloudOpacity,
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

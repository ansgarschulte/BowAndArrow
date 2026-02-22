import * as THREE from 'three';
import { Colors3D, GameSettings } from '../config/gameConfig';

export class AimSystem3D {
  private crosshair: THREE.Group;
  private aimLine: THREE.Line;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Crosshair (3D indicator in the scene)
    this.crosshair = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(0.25, 0.32, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    this.crosshair.add(ring);

    // Center dot
    const dotGeo = new THREE.CircleGeometry(0.06, 12);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    this.crosshair.add(dot);

    // Cross lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.7 });
    const hLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.4, 0, 0),
        new THREE.Vector3(0.4, 0, 0),
      ]),
      lineMat
    );
    const vLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -0.4, 0),
        new THREE.Vector3(0, 0.4, 0),
      ]),
      lineMat
    );
    this.crosshair.add(hLine, vLine);
    this.crosshair.visible = false;
    scene.add(this.crosshair);

    // Aim line (dashed)
    const aimLineMat = new THREE.LineDashedMaterial({
      color: Colors3D.aimLine,
      dashSize: 0.3,
      gapSize: 0.2,
      transparent: true,
      opacity: 0.6,
    });
    const aimLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 1),
    ]);
    this.aimLine = new THREE.Line(aimLineGeo, aimLineMat);
    this.aimLine.computeLineDistances();
    this.aimLine.visible = false;
    scene.add(this.aimLine);
  }

  update(
    startPos: THREE.Vector3,
    direction: THREE.Vector3,
    power: number,
    isAiming: boolean
  ): void {
    if (!isAiming || power < GameSettings.minPower) {
      this.crosshair.visible = false;
      this.aimLine.visible = false;
      return;
    }

    this.crosshair.visible = true;
    this.aimLine.visible = true;

    // Position crosshair along aim direction
    const dist = 8 + power * 15;
    const crosshairPos = startPos.clone().add(direction.clone().multiplyScalar(dist));
    this.crosshair.position.copy(crosshairPos);
    this.crosshair.lookAt(startPos);

    // Scale crosshair based on distance
    const scale = 0.5 + dist * 0.05;
    this.crosshair.scale.set(scale, scale, scale);

    // Aim line from start to partial distance
    const lineLength = dist * GameSettings.aimLineLength;
    const lineEnd = startPos.clone().add(direction.clone().multiplyScalar(lineLength));

    const points = [startPos.clone(), lineEnd];
    this.aimLine.geometry.setFromPoints(points);
    this.aimLine.computeLineDistances();
  }

  destroy(): void {
    this.scene.remove(this.crosshair);
    this.scene.remove(this.aimLine);
    this.crosshair.traverse(child => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) child.material.dispose();
      }
    });
    this.aimLine.geometry.dispose();
    (this.aimLine.material as THREE.Material).dispose();
  }
}

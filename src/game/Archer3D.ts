import * as THREE from 'three';
import { Colors3D, GameSettings } from '../config/gameConfig';

export class Archer3D {
  public group: THREE.Group;
  private body: THREE.Group;
  private bowArmGroup: THREE.Group;
  private drawArmGroup: THREE.Group;
  private bowMesh: THREE.Group;
  private stringLine: THREE.Line;
  private arrowOnBow: THREE.Group;
  private aimAngleH: number = 0;
  private aimAngleV: number = 0;
  private power: number = 0;
  private breatheOffset: number = 0;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.body = new THREE.Group();
    this.bowArmGroup = new THREE.Group();
    this.drawArmGroup = new THREE.Group();
    this.bowMesh = new THREE.Group();
    this.stringLine = new THREE.Line();
    this.arrowOnBow = new THREE.Group();

    this.buildCharacter();
    this.group.position.set(0, 0, 0);
    scene.add(this.group);
  }

  private buildCharacter(): void {
    // Boots
    const bootMat = new THREE.MeshLambertMaterial({ color: Colors3D.boots });
    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.3), bootMat);
    leftBoot.position.set(-0.12, 0.1, 0.02);
    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.3), bootMat);
    rightBoot.position.set(0.12, 0.1, 0.02);
    this.body.add(leftBoot, rightBoot);

    // Legs
    const pantsMat = new THREE.MeshLambertMaterial({ color: Colors3D.pants });
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.5, 8), pantsMat);
    leftLeg.position.set(-0.12, 0.45, 0);
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.5, 8), pantsMat);
    rightLeg.position.set(0.12, 0.45, 0);
    this.body.add(leftLeg, rightLeg);

    // Torso (tunic)
    const tunicMat = new THREE.MeshLambertMaterial({ color: Colors3D.tunic });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.25), tunicMat);
    torso.position.set(0, 0.97, 0);
    this.body.add(torso);

    // Belt
    const beltMat = new THREE.MeshLambertMaterial({ color: Colors3D.belt });
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.47, 0.06, 0.27), beltMat);
    belt.position.set(0, 0.73, 0);
    this.body.add(belt);

    // Belt buckle
    const buckleMat = new THREE.MeshLambertMaterial({ color: Colors3D.gold });
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), buckleMat);
    buckle.position.set(0, 0.73, -0.14);
    this.body.add(buckle);

    // Neck
    const skinMat = new THREE.MeshLambertMaterial({ color: Colors3D.skin });
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 8), skinMat);
    neck.position.set(0, 1.3, 0);
    this.body.add(neck);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), skinMat);
    head.position.set(0, 1.47, 0);
    this.body.add(head);

    // Hair (back of head)
    const hairMat = new THREE.MeshLambertMaterial({ color: Colors3D.hair });
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.155, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), hairMat);
    hair.position.set(0, 1.47, 0);
    hair.rotation.x = Math.PI * 0.1;
    this.body.add(hair);

    // Ears
    const leftEar = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), skinMat);
    leftEar.position.set(-0.16, 1.46, 0);
    const rightEar = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), skinMat);
    rightEar.position.set(0.16, 1.46, 0);
    this.body.add(leftEar, rightEar);

    // Robin Hood hat
    const hatMat = new THREE.MeshLambertMaterial({ color: Colors3D.hat });
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.3, 8), hatMat);
    hat.position.set(0, 1.7, 0);
    hat.rotation.z = 0.15;
    this.body.add(hat);

    // Hat brim
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 12), hatMat);
    brim.position.set(0, 1.56, 0);
    this.body.add(brim);

    // Feather
    const featherMat = new THREE.MeshLambertMaterial({ color: Colors3D.feather, side: THREE.DoubleSide });
    const featherShape = new THREE.Shape();
    featherShape.moveTo(0, 0);
    featherShape.quadraticCurveTo(0.05, 0.15, 0.02, 0.25);
    featherShape.quadraticCurveTo(-0.02, 0.15, 0, 0);
    const featherGeo = new THREE.ShapeGeometry(featherShape);
    const feather = new THREE.Mesh(featherGeo, featherMat);
    feather.position.set(0.12, 1.65, -0.05);
    feather.rotation.z = -0.3;
    this.body.add(feather);

    // Quiver on back
    const quiverMat = new THREE.MeshLambertMaterial({ color: Colors3D.quiver });
    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.5, 8), quiverMat);
    quiver.position.set(0.1, 1.05, 0.15);
    quiver.rotation.x = 0.15;
    this.body.add(quiver);

    // Arrow tips in quiver
    const tipMat = new THREE.MeshLambertMaterial({ color: 0x9e9e9e });
    for (let i = 0; i < 3; i++) {
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.05, 4), tipMat);
      tip.position.set(0.08 + i * 0.02, 1.33, 0.14);
      this.body.add(tip);
    }

    // Build arms
    this.buildBowArm();
    this.buildDrawArm();
    this.buildBow();
    this.buildArrowOnBow();

    this.body.add(this.bowArmGroup);
    this.body.add(this.drawArmGroup);
    this.group.add(this.body);

    // Enable shadows
    this.body.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });
  }

  private buildBowArm(): void {
    // Left arm holds the bow (extends forward)
    const skinMat = new THREE.MeshLambertMaterial({ color: Colors3D.skin });
    const sleeveMat = new THREE.MeshLambertMaterial({ color: Colors3D.tunic });

    // Upper arm (sleeve)
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.3, 8), sleeveMat);
    upperArm.position.set(0, -0.15, 0);

    // Forearm
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 8), skinMat);
    forearm.position.set(0, -0.45, 0);

    // Hand
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), skinMat);
    hand.position.set(0, -0.6, 0);

    this.bowArmGroup.add(upperArm, forearm, hand);
    this.bowArmGroup.position.set(-0.28, 1.15, 0);
    this.bowArmGroup.rotation.x = -Math.PI / 2 + 0.3;
  }

  private buildDrawArm(): void {
    const skinMat = new THREE.MeshLambertMaterial({ color: Colors3D.skin });
    const sleeveMat = new THREE.MeshLambertMaterial({ color: Colors3D.tunic });

    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.3, 8), sleeveMat);
    upperArm.position.set(0, -0.15, 0);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 8), skinMat);
    forearm.position.set(0, -0.45, 0);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), skinMat);
    hand.position.set(0, -0.6, 0);

    this.drawArmGroup.add(upperArm, forearm, hand);
    this.drawArmGroup.position.set(0.28, 1.15, 0);
    // At rest, arm hangs down
    this.drawArmGroup.rotation.x = 0.2;
  }

  private buildBow(): void {
    // Bow curve
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0.45, 0),
      new THREE.Vector3(0, 0, -0.25),
      new THREE.Vector3(0, -0.45, 0)
    );
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
    const bowMat = new THREE.MeshLambertMaterial({ color: Colors3D.wood });
    const bowCurve = new THREE.Mesh(tubeGeo, bowMat);
    this.bowMesh.add(bowCurve);

    // String (will be updated dynamically)
    const stringMat = new THREE.LineBasicMaterial({ color: Colors3D.bowString });
    const points = [
      new THREE.Vector3(0, 0.45, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -0.45, 0),
    ];
    const stringGeo = new THREE.BufferGeometry().setFromPoints(points);
    this.stringLine = new THREE.Line(stringGeo, stringMat);
    this.bowMesh.add(this.stringLine);

    // Position the bow at the bow arm's hand
    this.bowMesh.position.set(-0.28, 1.15, -0.6);
    this.group.add(this.bowMesh);
  }

  private buildArrowOnBow(): void {
    const shaftMat = new THREE.MeshLambertMaterial({ color: Colors3D.arrow });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.7, 6), shaftMat);
    shaft.rotation.x = Math.PI / 2;

    const tipMat = new THREE.MeshLambertMaterial({ color: 0x9e9e9e });
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 6), tipMat);
    tip.position.set(0, 0, -0.38);
    tip.rotation.x = -Math.PI / 2;

    const fletchMat = new THREE.MeshLambertMaterial({ color: Colors3D.feather, side: THREE.DoubleSide });
    for (let i = 0; i < 3; i++) {
      const fletch = new THREE.Mesh(
        new THREE.PlaneGeometry(0.03, 0.06),
        fletchMat
      );
      fletch.position.set(0, 0, 0.32);
      fletch.rotation.y = (i / 3) * Math.PI;
      this.arrowOnBow.add(fletch);
    }

    this.arrowOnBow.add(shaft, tip);
    this.arrowOnBow.position.set(-0.28, 1.15, -0.6);
    this.arrowOnBow.visible = false;
    this.group.add(this.arrowOnBow);
  }

  update(delta: number, aimH: number, aimV: number, power: number, isAiming: boolean): void {
    this.aimAngleH = aimH;
    this.aimAngleV = aimV;
    this.power = power;

    // Breathing
    this.breatheOffset += delta * 2;
    const breathe = Math.sin(this.breatheOffset) * 0.005;
    this.body.position.y = breathe;

    // Rotate body to aim direction
    this.group.rotation.y = -aimH * 0.5;

    // Bow arm – extends forward when aiming
    if (isAiming || power > 0) {
      this.bowArmGroup.rotation.x = -Math.PI / 2 + 0.1 + aimV * 0.3;
      this.bowArmGroup.rotation.z = -aimH * 0.2;

      // Draw arm pulls back
      const pullBack = power * 0.6;
      this.drawArmGroup.rotation.x = -Math.PI / 2 + 0.3 + pullBack;
      this.drawArmGroup.position.z = pullBack * 0.3;

      // Update string
      this.updateString(power);

      // Show arrow
      this.arrowOnBow.visible = power > 0;
      if (power > 0) {
        this.arrowOnBow.position.z = -0.6 + power * 0.25;
        this.arrowOnBow.rotation.y = -aimH * 0.5;
      }

      // Bow follows aim
      this.bowMesh.rotation.y = -aimH * 0.3;
      this.bowMesh.rotation.x = aimV * 0.2;
    } else {
      // Idle
      this.bowArmGroup.rotation.x = -Math.PI / 2 + 0.3;
      this.bowArmGroup.rotation.z = 0;
      this.drawArmGroup.rotation.x = 0.2;
      this.drawArmGroup.position.z = 0;
      this.arrowOnBow.visible = false;
      this.updateString(0);
      this.bowMesh.rotation.y = 0;
      this.bowMesh.rotation.x = 0;
    }
  }

  private updateString(power: number): void {
    const pullBack = power * 0.2;
    const positions = this.stringLine.geometry.attributes.position;
    if (positions) {
      // Update middle point of string
      (positions as THREE.BufferAttribute).setXYZ(1, 0, 0, pullBack);
      positions.needsUpdate = true;
    }
  }

  getShootPosition(): THREE.Vector3 {
    return new THREE.Vector3(0, 1.2, 0.5);
  }

  getShootDirection(aimH: number, aimV: number): THREE.Vector3 {
    const dir = new THREE.Vector3(
      Math.sin(aimH) * Math.cos(aimV),
      Math.sin(aimV) + 0.15,
      Math.cos(aimH) * Math.cos(aimV)
    );
    return dir.normalize();
  }

  hideArrow(): void {
    this.arrowOnBow.visible = false;
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

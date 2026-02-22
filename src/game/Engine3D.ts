import * as THREE from 'three';
import { CameraSettings } from '../config/gameConfig';
import { Game3D } from './Game3D';
import { MenuScreen } from '../ui/MenuScreen';

export class Engine3D {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private game: Game3D | null = null;
  private menu: MenuScreen;
  private animationId: number = 0;

  constructor(container: HTMLElement) {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      CameraSettings.fov,
      window.innerWidth / window.innerHeight,
      CameraSettings.near,
      CameraSettings.far
    );
    this.resetCamera();

    // Lighting
    this.setupLighting();

    // Clock
    this.clock = new THREE.Clock();

    // Menu
    this.menu = new MenuScreen((level: number) => this.startLevel(level));

    // Resize
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.onResize(), 100);
    });
  }

  resetCamera(): void {
    this.camera.position.set(CameraSettings.posX, CameraSettings.posY, CameraSettings.posZ);
    this.camera.lookAt(CameraSettings.lookAtX, CameraSettings.lookAtY, CameraSettings.lookAtZ);
  }

  private setupLighting(): void {
    // Hemisphere light (sky + ground)
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x4caf50, 0.6);
    this.scene.add(hemiLight);

    // Directional light (sun)
    const dirLight = new THREE.DirectionalLight(0xfff4e0, 1.2);
    dirLight.position.set(10, 20, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -5;
    this.scene.add(dirLight);

    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
    this.scene.add(ambientLight);
  }

  private onResize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  startLevel(level: number): void {
    this.menu.hide();
    if (this.game) {
      this.game.destroy();
    }
    this.game = new Game3D(this, level);
  }

  showMenu(): void {
    if (this.game) {
      this.game.destroy();
      this.game = null;
    }
    // Clear scene
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    this.setupLighting();
    this.resetCamera();
    this.menu.show();
  }

  start(): void {
    this.menu.show();
    this.animate();
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();

    if (this.game) {
      this.game.update(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

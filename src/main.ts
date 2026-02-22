import { Engine3D } from './game/Engine3D';

const container = document.getElementById('game-container')!;
const engine = new Engine3D(container);
engine.start();

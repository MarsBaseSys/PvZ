import { Game } from './engine/Game';
import './style.css';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
if (!canvas) {
  throw new Error('#game-canvas element not found');
}

const game = new Game(canvas);
game.start();

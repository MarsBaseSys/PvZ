import { Grid } from '../objects/Grid';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../utils/constants';
import { EventBus } from '../utils/EventBus';
import { GameLoop } from './GameLoop';
import { InputManager } from './InputManager';

export class Game {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly grid = new Grid();
  private readonly loop = new GameLoop(
    (dt) => this.update(dt),
    () => this.render(),
  );
  readonly events = new EventBus();
  readonly input: InputManager;

  constructor(private readonly canvas: HTMLCanvasElement) {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to acquire 2D rendering context');
    }
    this.ctx = ctx;

    this.input = new InputManager(canvas);
  }

  start(): void {
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
  }

  private update(_dt: number): void {
    // 后续在此更新植物/僵尸/子弹等游戏对象
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.grid.render(this.ctx);
  }
}

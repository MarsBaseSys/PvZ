import type { AABB } from '../utils/math';

export abstract class GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  alive = true;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get bounds(): AABB {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  abstract update(dt: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
}

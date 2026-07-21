import { GameObject } from './GameObject';

export abstract class Projectile extends GameObject {
  damage: number;
  speed: number;

  constructor(x: number, y: number, width: number, height: number, damage: number, speed: number) {
    super(x, y, width, height);
    this.damage = damage;
    this.speed = speed;
  }

  update(dt: number): void {
    this.x += this.speed * dt;
  }
}

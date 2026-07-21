import { GameObject } from './GameObject';

export abstract class Zombie extends GameObject {
  health: number;
  speed: number;

  constructor(x: number, y: number, width: number, height: number, health: number, speed: number) {
    super(x, y, width, height);
    this.health = health;
    this.speed = speed;
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.alive = false;
    }
  }

  update(dt: number): void {
    this.x -= this.speed * dt;
  }
}

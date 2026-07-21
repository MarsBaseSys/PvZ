import { GameObject } from './GameObject';

export abstract class Plant extends GameObject {
  health: number;

  constructor(x: number, y: number, width: number, height: number, health: number) {
    super(x, y, width, height);
    this.health = health;
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.alive = false;
    }
  }
}

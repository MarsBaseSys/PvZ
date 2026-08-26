import { Projectile } from './Projectile';
import { GAME_CONFIG } from '../config/gameConfig';

const PEA_SIZE = 10;

export class Pea extends Projectile {
  constructor(
    x: number,
    y: number,
    row: number,
    damage = GAME_CONFIG.plants.peashooter.damage,
    speed = GAME_CONFIG.plants.peashooter.peaSpeed,
  ) {
    super(x, y, PEA_SIZE, PEA_SIZE, damage, speed, row);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;

    ctx.save();

    const gradient = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
    gradient.addColorStop(0, '#aed581');
    gradient.addColorStop(0.6, '#66bb6a');
    gradient.addColorStop(1, '#2e7d32');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1b5e20';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

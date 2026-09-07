import { Projectile } from './Projectile';
import { GAME_CONFIG } from '../config/gameConfig';

const SEED_SIZE = 10;
const SPIKE_COUNT = 5;

export class Seed extends Projectile {
  /** Set once by GameEngine when this seed crosses an Emberroot's cell; doubles damage and drops the freeze effect. */
  ignited = false;

  constructor(
    x: number,
    y: number,
    row: number,
    damage: number = GAME_CONFIG.plants.thornsnap.damage,
    speed: number = GAME_CONFIG.plants.thornsnap.seedSpeed,
    readonly slows = false,
  ) {
    super(x, y, SEED_SIZE, SEED_SIZE, damage, speed, row);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;

    ctx.save();

    const gradient = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
    if (this.ignited) {
      gradient.addColorStop(0, '#fff59d');
      gradient.addColorStop(0.6, '#ff9800');
      gradient.addColorStop(1, '#e65100');
    } else if (this.slows) {
      gradient.addColorStop(0, '#e1f5fe');
      gradient.addColorStop(0.6, '#4fc3f7');
      gradient.addColorStop(1, '#0277bd');
    } else {
      gradient.addColorStop(0, '#ce93d8');
      gradient.addColorStop(0.6, '#8e24aa');
      gradient.addColorStop(1, '#4a148c');
    }

    // small spike nubs ringing the seed core — reads as a spiky seed pod
    // rather than a smooth pea
    const spikeColor = this.ignited ? '#e65100' : this.slows ? '#01579b' : '#4a148c';
    ctx.fillStyle = spikeColor;
    for (let i = 0; i < SPIKE_COUNT; i++) {
      const angle = (i / SPIKE_COUNT) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r * 0.7, cy + Math.sin(angle) * r * 0.7);
      ctx.lineTo(cx + Math.cos(angle) * r * 1.35, cy + Math.sin(angle) * r * 1.35);
      ctx.lineTo(cx + Math.cos(angle + 0.35) * r * 0.7, cy + Math.sin(angle + 0.35) * r * 0.7);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = spikeColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

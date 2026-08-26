import { GameObject } from './GameObject';
import { GAME_CONFIG } from '../config/gameConfig';

const SUN_SIZE = 40;
const FALL_SPEED = 60;

export class Sun extends GameObject {
  value: number;
  private targetY: number;

  constructor(x: number, startY: number, targetY: number, value = GAME_CONFIG.economy.sunValue) {
    super(x, startY, SUN_SIZE, SUN_SIZE);
    this.value = value;
    this.targetY = targetY;
  }

  update(dt: number): void {
    if (this.y < this.targetY) {
      this.y = Math.min(this.targetY, this.y + FALL_SPEED * dt);
    }
  }

  containsPoint(px: number, py: number): boolean {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;
    return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;

    ctx.save();

    // soft outer halo
    ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // radiating rays
    const rayCount = 10;
    ctx.fillStyle = '#ffd54f';
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const innerR = r * 0.55;
      const outerR = r * 0.92;
      const spread = Math.PI / rayCount / 1.6;

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle - spread) * innerR, cy + Math.sin(angle - spread) * innerR);
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.lineTo(cx + Math.cos(angle + spread) * innerR, cy + Math.sin(angle + spread) * innerR);
      ctx.closePath();
      ctx.fill();
    }

    // glowing core
    const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.6);
    coreGradient.addColorStop(0, '#fffde7');
    coreGradient.addColorStop(0.5, '#ffee58');
    coreGradient.addColorStop(1, '#ffb300');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.58, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

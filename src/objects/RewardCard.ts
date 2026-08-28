import { GameObject } from './GameObject';
import { PLANT_LABELS, renderPlantIcon, type PlantType } from './Plant';

const CARD_WIDTH = 90;
const CARD_HEIGHT = 100;

export class RewardCard extends GameObject {
  private pulseTimer = 0;

  constructor(readonly plantType: PlantType, centerX: number, centerY: number) {
    super(centerX - CARD_WIDTH / 2, centerY - CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);
  }

  containsPoint(px: number, py: number): boolean {
    return px >= this.x && px <= this.x + this.width && py >= this.y && py <= this.y + this.height;
  }

  update(dt: number): void {
    this.pulseTimer += dt;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const glowRadius = this.width * 0.75 + Math.sin(this.pulseTimer * 3) * 6;

    ctx.save();

    const glowGradient = ctx.createRadialGradient(cx, cy, glowRadius * 0.2, cx, cy, glowRadius);
    glowGradient.addColorStop(0, 'rgba(255, 235, 59, 0.45)');
    glowGradient.addColorStop(1, 'rgba(255, 235, 59, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;

    const cardGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    cardGradient.addColorStop(0, '#fffef5');
    cardGradient.addColorStop(1, '#fff0c2');
    ctx.fillStyle = cardGradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 4;
    ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

    const iconCx = cx;
    const iconCy = this.y + this.height * 0.4;
    const r = this.width * 0.3;
    renderPlantIcon(ctx, this.plantType, iconCx, iconCy, r);

    ctx.fillStyle = '#212121';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(PLANT_LABELS[this.plantType], iconCx, this.y + this.height - 14);
    ctx.textAlign = 'left';

    ctx.restore();
  }
}

import { GameObject } from './GameObject';
import { Pea } from './Pea';
import { Sun } from './Sun';
import { GAME_CONFIG } from '../config/gameConfig';
import { CELL_SIZE } from '../utils/constants';

export interface PlantContext {
  zombieAheadInRow(row: number, x: number): boolean;
}

export type PlantType = 'sunflower' | 'peashooter' | 'wallnut';

export const PLANT_COSTS: Record<PlantType, number> = {
  sunflower: GAME_CONFIG.plants.sunflower.cost,
  peashooter: GAME_CONFIG.plants.peashooter.cost,
  wallnut: GAME_CONFIG.plants.wallnut.cost,
};

export const PLANT_COOLDOWNS: Record<PlantType, number> = {
  sunflower: GAME_CONFIG.plants.sunflower.cooldown,
  peashooter: GAME_CONFIG.plants.peashooter.cooldown,
  wallnut: GAME_CONFIG.plants.wallnut.cooldown,
};

export abstract class Plant extends GameObject {
  hp: number;
  cost: number;
  cooldown: number;
  row: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    hp: number,
    cost: number,
    cooldown: number,
    row: number,
  ) {
    super(x, y, width, height);
    this.hp = hp;
    this.cost = cost;
    this.cooldown = cooldown;
    this.row = row;
  }

  takeDamage(amount: number): void {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.active = false;
    }
  }

  update(_dt: number): void {
    // 植物不移动；具体计时/生产逻辑见 produce()
  }

  produce(_dt: number, _context: PlantContext): GameObject | null {
    return null;
  }
}

export class Sunflower extends Plant {
  private static readonly SUN_INTERVAL = GAME_CONFIG.plants.sunflower.sunInterval;
  private static readonly HP = GAME_CONFIG.plants.sunflower.hp;
  private static readonly COST = PLANT_COSTS.sunflower;

  private timer = 0;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, Sunflower.HP, Sunflower.COST, PLANT_COOLDOWNS.sunflower, row);
  }

  produce(dt: number): Sun | null {
    this.timer += dt;
    if (this.timer >= Sunflower.SUN_INTERVAL) {
      this.timer -= Sunflower.SUN_INTERVAL;
      const sunX = this.x + this.width + 10;
      return new Sun(sunX, this.y - 20, this.y + this.height / 2 - 20);
    }
    return null;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;

    ctx.save();

    // leaves at the base
    ctx.fillStyle = '#558b2f';
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy + r * 0.85);
    ctx.quadraticCurveTo(cx - r * 0.7, cy + r * 0.7, cx - r * 0.55, cy + r * 1.05);
    ctx.quadraticCurveTo(cx - r * 0.2, cy + r * 0.95, cx - 4, cy + r * 0.85);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy + r * 0.85);
    ctx.quadraticCurveTo(cx + r * 0.7, cy + r * 0.7, cx + r * 0.55, cy + r * 1.05);
    ctx.quadraticCurveTo(cx + r * 0.2, cy + r * 0.95, cx + 4, cy + r * 0.85);
    ctx.fill();

    // stem
    ctx.fillStyle = '#689f38';
    ctx.fillRect(cx - 4, cy, 8, r);

    // petals
    const petalCount = 8;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const px = cx + Math.cos(angle) * r * 0.6;
      const py = cy + Math.sin(angle) * r * 0.6;

      const petalGradient = ctx.createRadialGradient(px, py, 0, px, py, r * 0.4);
      petalGradient.addColorStop(0, '#fff59d');
      petalGradient.addColorStop(1, '#fbc02d');
      ctx.fillStyle = petalGradient;
      ctx.strokeStyle = '#f57f17';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(px, py, r * 0.35, r * 0.22, angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // center face disc
    const faceGradient = ctx.createRadialGradient(
      cx - r * 0.15,
      cy - r * 0.15,
      r * 0.05,
      cx,
      cy,
      r * 0.45,
    );
    faceGradient.addColorStop(0, '#a1751f');
    faceGradient.addColorStop(1, '#6d4c21');
    ctx.fillStyle = faceGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // face: eyes + smile
    ctx.fillStyle = '#3e2b12';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.15, cy - r * 0.08, r * 0.06, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.15, cy - r * 0.08, r * 0.06, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3e2b12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.02, r * 0.2, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }
}

export class Peashooter extends Plant {
  private static readonly SHOOT_INTERVAL = GAME_CONFIG.plants.peashooter.attackInterval;
  private static readonly HP = GAME_CONFIG.plants.peashooter.hp;
  private static readonly COST = PLANT_COSTS.peashooter;
  private static readonly DAMAGE = GAME_CONFIG.plants.peashooter.damage;
  private static readonly PEA_SPEED = GAME_CONFIG.plants.peashooter.peaSpeed;

  private timer = 0;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, Peashooter.HP, Peashooter.COST, PLANT_COOLDOWNS.peashooter, row);
  }

  produce(dt: number, context: PlantContext): Pea | null {
    if (!context.zombieAheadInRow(this.row, this.x)) {
      return null;
    }

    this.timer += dt;
    if (this.timer >= Peashooter.SHOOT_INTERVAL) {
      this.timer -= Peashooter.SHOOT_INTERVAL;
      const peaY = this.y + this.height / 2 - 5;
      return new Pea(this.x + this.width, peaY, this.row, Peashooter.DAMAGE, Peashooter.PEA_SPEED);
    }
    return null;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;

    ctx.save();

    // leaves at the base
    ctx.fillStyle = '#558b2f';
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + r * 0.75);
    ctx.quadraticCurveTo(cx - r * 0.75, cy + r * 0.65, cx - r * 0.5, cy + r * 0.95);
    ctx.quadraticCurveTo(cx - r * 0.2, cy + r * 0.85, cx - 6, cy + r * 0.75);
    ctx.fill();

    // body (bulb)
    const bodyGradient = ctx.createRadialGradient(
      cx - r * 0.2,
      cy + r * 0.05,
      r * 0.1,
      cx,
      cy + r * 0.15,
      r * 0.8,
    );
    bodyGradient.addColorStop(0, '#81c784');
    bodyGradient.addColorStop(1, '#2e7d32');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.15, r * 0.72, 0, Math.PI * 2);
    ctx.fill();

    // head
    const headGradient = ctx.createRadialGradient(
      cx - r * 0.25,
      cy - r * 0.35,
      r * 0.08,
      cx - r * 0.1,
      cy - r * 0.2,
      r * 0.5,
    );
    headGradient.addColorStop(0, '#8bc34a');
    headGradient.addColorStop(1, '#33691e');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(cx - r * 0.1, cy - r * 0.2, r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.25, cy - r * 0.32, r * 0.11, r * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.02, cy - r * 0.32, r * 0.11, r * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1b1b1b';
    ctx.beginPath();
    ctx.arc(cx - r * 0.22, cy - r * 0.3, r * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + r * 0.05, cy - r * 0.3, r * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // shooting tube (pointing right)
    const tubeY = cy - r * 0.35 - 5;
    const tubeHeight = 10;
    ctx.fillStyle = '#1b5e20';
    ctx.fillRect(cx + r * 0.2, tubeY, r * 0.85, tubeHeight);
    ctx.fillStyle = '#66bb6a';
    ctx.fillRect(cx + r * 0.2, tubeY + 2, r * 0.85, 2.5);
    ctx.fillStyle = '#1b5e20';
    ctx.fillRect(cx + r * 0.2 + r * 0.85 - 4, tubeY - 1, 4, tubeHeight + 2);

    ctx.restore();
  }
}

export class WallNut extends Plant {
  private static readonly HP = GAME_CONFIG.plants.wallnut.hp;
  private static readonly COST = PLANT_COSTS.wallnut;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, WallNut.HP, WallNut.COST, PLANT_COOLDOWNS.wallnut, row);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;
    const hpRatio = this.hp / WallNut.HP;

    ctx.save();

    const shellBase = hpRatio < 0.33 ? '#6d4c26' : hpRatio < 0.66 ? '#8d6b3a' : '#a9784a';
    const shellHighlight = hpRatio < 0.33 ? '#8d6b3a' : hpRatio < 0.66 ? '#ab8552' : '#c8a06a';
    const shellGradient = ctx.createRadialGradient(
      cx - r * 0.3,
      cy - r * 0.3,
      r * 0.1,
      cx,
      cy,
      r * 0.95,
    );
    shellGradient.addColorStop(0, shellHighlight);
    shellGradient.addColorStop(1, shellBase);
    ctx.fillStyle = shellGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.95, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#5d4321';
    ctx.lineWidth = 3;
    ctx.stroke();

    // face: expression grows more strained as HP drops
    ctx.fillStyle = '#3e2b12';
    const browTilt = hpRatio < 0.33 ? r * 0.06 : hpRatio < 0.66 ? r * 0.03 : 0;
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.28, cy - r * 0.15 + browTilt, r * 0.07, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.1, cy - r * 0.15 + browTilt, r * 0.07, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3e2b12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (hpRatio < 0.33) {
      // gritted, straight-line mouth
      ctx.moveTo(cx - r * 0.25, cy + r * 0.18);
      ctx.lineTo(cx + r * 0.15, cy + r * 0.18);
    } else {
      // calm, slightly upturned smile
      ctx.arc(cx - r * 0.05, cy + r * 0.02, r * 0.22, 0.1 * Math.PI, 0.75 * Math.PI);
    }
    ctx.stroke();

    if (hpRatio < 0.66) {
      ctx.strokeStyle = '#4a3418';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.5, cy - r * 0.4);
      ctx.lineTo(cx - r * 0.1, cy);
      ctx.lineTo(cx - r * 0.4, cy + r * 0.5);
      ctx.moveTo(cx + r * 0.3, cy - r * 0.5);
      ctx.lineTo(cx + r * 0.15, cy - r * 0.05);
      ctx.stroke();
    }

    if (hpRatio < 0.33) {
      ctx.strokeStyle = '#4a3418';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.1, cy + r * 0.1);
      ctx.lineTo(cx + r * 0.45, cy + r * 0.35);
      ctx.moveTo(cx - r * 0.6, cy - r * 0.1);
      ctx.lineTo(cx - r * 0.3, cy + r * 0.2);
      ctx.stroke();

      ctx.fillStyle = '#5d4321';
      ctx.beginPath();
      ctx.arc(cx + r * 0.85, cy - r * 0.2, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - r * 0.75, cy + r * 0.45, r * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

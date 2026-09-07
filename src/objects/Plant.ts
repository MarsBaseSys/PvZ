import { GameObject } from './GameObject';
import { Seed } from './Seed';
import { Sun } from './Sun';
import { GAME_CONFIG } from '../config/gameConfig';
import { CELL_SIZE } from '../utils/constants';

export interface PlantContext {
  zombieAheadInRow(row: number, x: number): boolean;
}

export type PlantType =
  | 'moonbud'
  | 'thornsnap'
  | 'barkbulwark'
  | 'frostlily'
  | 'twinfang'
  | 'blastcap'
  | 'emberroot'
  | 'dreamspore'
  | 'glacierbloom';

export const PLANT_COSTS: Record<PlantType, number> = {
  moonbud: GAME_CONFIG.plants.moonbud.cost,
  thornsnap: GAME_CONFIG.plants.thornsnap.cost,
  barkbulwark: GAME_CONFIG.plants.barkbulwark.cost,
  frostlily: GAME_CONFIG.plants.frostlily.cost,
  twinfang: GAME_CONFIG.plants.twinfang.cost,
  blastcap: GAME_CONFIG.plants.blastcap.cost,
  emberroot: GAME_CONFIG.plants.emberroot.cost,
  dreamspore: GAME_CONFIG.plants.dreamspore.cost,
  glacierbloom: GAME_CONFIG.plants.glacierbloom.cost,
};

export const PLANT_COOLDOWNS: Record<PlantType, number> = {
  moonbud: GAME_CONFIG.plants.moonbud.cooldown,
  thornsnap: GAME_CONFIG.plants.thornsnap.cooldown,
  barkbulwark: GAME_CONFIG.plants.barkbulwark.cooldown,
  frostlily: GAME_CONFIG.plants.frostlily.cooldown,
  twinfang: GAME_CONFIG.plants.twinfang.cooldown,
  blastcap: GAME_CONFIG.plants.blastcap.cooldown,
  emberroot: GAME_CONFIG.plants.emberroot.cooldown,
  dreamspore: GAME_CONFIG.plants.dreamspore.cooldown,
  glacierbloom: GAME_CONFIG.plants.glacierbloom.cooldown,
};

export const PLANT_LABELS: Record<PlantType, string> = {
  moonbud: '月苞',
  thornsnap: '荆棘蔓',
  barkbulwark: '树瘤壁',
  frostlily: '霜百合',
  twinfang: '双牙蔓',
  blastcap: '爆裂菇',
  emberroot: '燃根桩',
  dreamspore: '幻梦菇',
  glacierbloom: '冰川绽',
};

export const PLANT_NAMES_EN: Record<PlantType, string> = {
  moonbud: 'Moonbud',
  thornsnap: 'Thornsnap',
  barkbulwark: 'Bark Bulwark',
  frostlily: 'Frost Lily',
  twinfang: 'Twin Fang',
  blastcap: 'Blastcap',
  emberroot: 'Emberroot',
  dreamspore: 'Dreamspore',
  glacierbloom: 'Glacier Bloom',
};

function renderVineHead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  headColor: string,
  stalkColor: string,
  fangColor: string,
  fangCount: 1 | 2,
): void {
  ctx.fillStyle = stalkColor;
  ctx.fillRect(cx - r * 0.12, cy, r * 0.24, r * 0.65);

  ctx.fillStyle = headColor;
  ctx.beginPath();
  ctx.arc(cx - r * 0.05, cy - r * 0.25, r * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.25, cy - r * 0.32, r * 0.16, r * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1b1b1b';
  ctx.beginPath();
  ctx.arc(cx - r * 0.22, cy - r * 0.3, r * 0.07, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = fangColor;
  ctx.fillRect(cx + r * 0.25, cy - r * 0.35 - 4, r * 0.75, 8);
  if (fangCount === 2) {
    ctx.fillRect(cx + r * 0.25, cy - r * 0.35 + 8, r * 0.75, 8);
  }
}

/** Simplified icon shared by the HUD plant cards and the reward-card popup. */
export function renderPlantIcon(
  ctx: CanvasRenderingContext2D,
  type: PlantType,
  cx: number,
  cy: number,
  r: number,
): void {
  if (type === 'moonbud') {
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(cx - r * 0.08, cy + r * 0.1, r * 0.16, r * 0.75);
    const g = ctx.createLinearGradient(cx, cy - r, cx, cy + r * 0.2);
    g.addColorStop(0, '#e1f5fe');
    g.addColorStop(1, '#1565c0');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.quadraticCurveTo(cx + r * 0.4, cy - r * 0.5, cx + r * 0.24, cy + r * 0.15);
    ctx.quadraticCurveTo(cx, cy + r * 0.35, cx - r * 0.24, cy + r * 0.15);
    ctx.quadraticCurveTo(cx - r * 0.4, cy - r * 0.5, cx, cy - r);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fffde7';
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.2, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'thornsnap' || type === 'frostlily' || type === 'twinfang') {
    const headColor = type === 'frostlily' ? '#81d4fa' : '#9c27b0';
    const stalkColor = type === 'frostlily' ? '#0277bd' : '#4a148c';
    const fangColor = type === 'frostlily' ? '#01579b' : '#311b92';
    renderVineHead(ctx, cx, cy, r, headColor, stalkColor, fangColor, type === 'twinfang' ? 2 : 1);
  } else if (type === 'barkbulwark') {
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.95, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(78, 52, 46, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.55, r * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#2b1a17';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.28, cy - r * 0.1, r * 0.07, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.1, cy - r * 0.1, r * 0.07, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'emberroot') {
    ctx.fillStyle = '#4e342e';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.35, r * 0.65, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - r * 0.5, cy - r * 0.2, r, r * 0.5);
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.2, cy - r * 0.1);
    ctx.lineTo(cx, cy + r * 0.1);
    ctx.moveTo(cx + r * 0.15, cy - r * 0.15);
    ctx.lineTo(cx + r * 0.05, cy + r * 0.05);
    ctx.stroke();
    const flame = ctx.createRadialGradient(cx, cy - r * 0.45, 2, cx, cy - r * 0.4, r * 0.5);
    flame.addColorStop(0, '#fff59d');
    flame.addColorStop(0.6, '#ff9800');
    flame.addColorStop(1, 'rgba(230, 81, 0, 0)');
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.4, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'dreamspore' || type === 'glacierbloom') {
    if (type === 'glacierbloom') {
      ctx.fillStyle = '#0277bd';
      ctx.fillRect(cx - r * 0.1, cy + r * 0.1, r * 0.2, r * 0.65);
      const g = ctx.createLinearGradient(cx, cy - r, cx, cy + r * 0.2);
      g.addColorStop(0, '#e1f5fe');
      g.addColorStop(1, '#0288d1');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.quadraticCurveTo(cx + r * 0.42, cy - r * 0.5, cx + r * 0.24, cy + r * 0.15);
      ctx.quadraticCurveTo(cx, cy + r * 0.35, cx - r * 0.24, cy + r * 0.15);
      ctx.quadraticCurveTo(cx - r * 0.42, cy - r * 0.5, cx, cy - r);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.35, cy - r * 0.2);
      ctx.lineTo(cx + r * 0.5, cy - r * 0.05);
      ctx.lineTo(cx + r * 0.35, cy + r * 0.1);
      ctx.lineTo(cx + r * 0.2, cy - r * 0.05);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = '#e1bee7';
      ctx.fillRect(cx - r * 0.1, cy + r * 0.1, r * 0.2, r * 0.6);
      const g = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.3, r * 0.1, cx, cy - r * 0.1, r * 0.7);
      g.addColorStop(0, '#f3e5f5');
      g.addColorStop(1, '#6a1b9a');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, cy - r * 0.1, r * 0.7, r * 0.45, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#f8bbd0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.12, r * 0.25, 0, Math.PI * 1.5);
      ctx.stroke();
    }
  } else {
    // blastcap
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(cx - r * 0.14, cy + r * 0.1, r * 0.28, r * 0.5);
    const g = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.1, cx, cy - r * 0.1, r * 0.85);
    g.addColorStop(0, '#ff8a65');
    g.addColorStop(0.6, '#e53935');
    g.addColorStop(1, '#b71c1c');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.1, r * 0.85, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fff8e1';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.35, cy - r * 0.35, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.15, cy - r * 0.5, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

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

export class Moonbud extends Plant {
  private static readonly SUN_INTERVAL = GAME_CONFIG.plants.moonbud.sunInterval;
  private static readonly HP = GAME_CONFIG.plants.moonbud.hp;
  private static readonly COST = PLANT_COSTS.moonbud;

  private timer = 0;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, Moonbud.HP, Moonbud.COST, PLANT_COOLDOWNS.moonbud, row);
  }

  produce(dt: number): Sun | null {
    this.timer += dt;
    if (this.timer >= Moonbud.SUN_INTERVAL) {
      this.timer -= Moonbud.SUN_INTERVAL;
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

    // stem
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(cx - 5, cy + r * 0.1, 10, r * 0.85);

    // two slim closed-petal flaps peeling open near the top of the bud
    ctx.fillStyle = '#90caf9';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.5);
    ctx.lineTo(cx - r * 0.32, cy - r * 0.1);
    ctx.lineTo(cx - r * 0.06, cy - r * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.5);
    ctx.lineTo(cx + r * 0.32, cy - r * 0.1);
    ctx.lineTo(cx + r * 0.06, cy - r * 0.2);
    ctx.closePath();
    ctx.fill();

    // the bud itself — a tall crystalline teardrop, cool blue-silver
    const bodyGradient = ctx.createLinearGradient(cx, cy - r * 1.05, cx, cy + r * 0.15);
    bodyGradient.addColorStop(0, '#e1f5fe');
    bodyGradient.addColorStop(0.55, '#4fc3f7');
    bodyGradient.addColorStop(1, '#1565c0');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 1.05);
    ctx.quadraticCurveTo(cx + r * 0.42, cy - r * 0.55, cx + r * 0.25, cy + r * 0.15);
    ctx.quadraticCurveTo(cx, cy + r * 0.38, cx - r * 0.25, cy + r * 0.15);
    ctx.quadraticCurveTo(cx - r * 0.42, cy - r * 0.55, cx, cy - r * 1.05);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#90caf9';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // glowing core + calm crescent "face"
    ctx.fillStyle = '#fffde7';
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.2, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#01579b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.22, r * 0.32, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }
}

export class Thornsnap extends Plant {
  private static readonly SHOOT_INTERVAL = GAME_CONFIG.plants.thornsnap.attackInterval;
  private static readonly HP = GAME_CONFIG.plants.thornsnap.hp;
  private static readonly COST = PLANT_COSTS.thornsnap;
  private static readonly DAMAGE = GAME_CONFIG.plants.thornsnap.damage;
  private static readonly SEED_SPEED = GAME_CONFIG.plants.thornsnap.seedSpeed;

  private timer = 0;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, Thornsnap.HP, Thornsnap.COST, PLANT_COOLDOWNS.thornsnap, row);
  }

  produce(dt: number, context: PlantContext): Seed | null {
    if (!context.zombieAheadInRow(this.row, this.x)) {
      return null;
    }

    this.timer += dt;
    if (this.timer >= Thornsnap.SHOOT_INTERVAL) {
      this.timer -= Thornsnap.SHOOT_INTERVAL;
      const seedY = this.y + this.height / 2 - 5;
      return new Seed(this.x + this.width, seedY, this.row, Thornsnap.DAMAGE, Thornsnap.SEED_SPEED);
    }
    return null;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;

    ctx.save();

    // coiled vine stem, S-curved instead of a straight stalk
    ctx.strokeStyle = '#33691e';
    ctx.lineWidth = r * 0.24;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.1, cy + r * 0.85);
    ctx.quadraticCurveTo(cx - r * 0.55, cy + r * 0.4, cx - r * 0.15, cy + r * 0.05);
    ctx.quadraticCurveTo(cx + r * 0.2, cy - r * 0.25, cx - r * 0.05, cy - r * 0.5);
    ctx.stroke();

    const headCx = cx - r * 0.05;
    const headCy = cy - r * 0.58;
    const headR = r * 0.5;

    const headGradient = ctx.createRadialGradient(
      headCx - headR * 0.35,
      headCy - headR * 0.35,
      headR * 0.1,
      headCx,
      headCy,
      headR,
    );
    headGradient.addColorStop(0, '#ab47bc');
    headGradient.addColorStop(1, '#4a148c');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(headCx, headCy, headR, 0, Math.PI * 2);
    ctx.fill();

    // thorn spikes ringing the head
    ctx.fillStyle = '#311b92';
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      ctx.save();
      ctx.translate(headCx + Math.cos(angle) * headR, headCy + Math.sin(angle) * headR);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -headR * 0.14);
      ctx.lineTo(headR * 0.34, 0);
      ctx.lineTo(0, headR * 0.14);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // eyes, alert
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(headCx - headR * 0.3, headCy - headR * 0.12, headR * 0.24, headR * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headCx + headR * 0.28, headCy - headR * 0.12, headR * 0.24, headR * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b1b1b';
    ctx.beginPath();
    ctx.arc(headCx - headR * 0.22, headCy - headR * 0.14, headR * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headCx + headR * 0.36, headCy - headR * 0.14, headR * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // fanged maw pointing right, where seeds launch from
    ctx.fillStyle = '#7b1fa2';
    ctx.beginPath();
    ctx.moveTo(headCx + headR * 0.55, headCy - headR * 0.1);
    ctx.lineTo(headCx + headR * 1.15, headCy - headR * 0.28);
    ctx.lineTo(headCx + headR * 1.15, headCy + headR * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ede7f6';
    ctx.beginPath();
    ctx.moveTo(headCx + headR * 0.6, headCy - headR * 0.06);
    ctx.lineTo(headCx + headR * 0.85, headCy - headR * 0.14);
    ctx.lineTo(headCx + headR * 0.6, headCy + headR * 0.02);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

export class BarkBulwark extends Plant {
  private static readonly HP = GAME_CONFIG.plants.barkbulwark.hp;
  private static readonly COST = PLANT_COSTS.barkbulwark;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, BarkBulwark.HP, BarkBulwark.COST, PLANT_COOLDOWNS.barkbulwark, row);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;
    const hpRatio = this.hp / BarkBulwark.HP;

    ctx.save();

    const shellBase = hpRatio < 0.33 ? '#4e342e' : hpRatio < 0.66 ? '#6d4c41' : '#8d6e63';
    const shellHighlight = hpRatio < 0.33 ? '#6d4c41' : hpRatio < 0.66 ? '#8d6e63' : '#a1887f';
    const shellGradient = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r * 0.95);
    shellGradient.addColorStop(0, shellHighlight);
    shellGradient.addColorStop(1, shellBase);
    ctx.fillStyle = shellGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.95, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 3;
    ctx.stroke();

    // wood-ring texture
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.45)';
    ctx.lineWidth = 2;
    for (let rr = 0.25; rr < 0.85; rr += 0.2) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 0.95 * rr, r * 0.8 * rr, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // face: expression grows more strained as HP drops
    ctx.fillStyle = '#2b1a17';
    const browTilt = hpRatio < 0.33 ? r * 0.06 : hpRatio < 0.66 ? r * 0.03 : 0;
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.28, cy - r * 0.15 + browTilt, r * 0.07, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.1, cy - r * 0.15 + browTilt, r * 0.07, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2b1a17';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (hpRatio < 0.33) {
      ctx.moveTo(cx - r * 0.25, cy + r * 0.18);
      ctx.lineTo(cx + r * 0.15, cy + r * 0.18);
    } else {
      ctx.arc(cx - r * 0.05, cy + r * 0.02, r * 0.22, 0.1 * Math.PI, 0.75 * Math.PI);
    }
    ctx.stroke();

    if (hpRatio < 0.66) {
      ctx.strokeStyle = '#3e2723';
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
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.1, cy + r * 0.1);
      ctx.lineTo(cx + r * 0.45, cy + r * 0.35);
      ctx.moveTo(cx - r * 0.6, cy - r * 0.1);
      ctx.lineTo(cx - r * 0.3, cy + r * 0.2);
      ctx.stroke();

      // tiny sprouted twigs breaking through cracked bark near death
      ctx.strokeStyle = '#558b2f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.7, cy - r * 0.3);
      ctx.lineTo(cx + r * 0.85, cy - r * 0.5);
      ctx.moveTo(cx - r * 0.7, cy + r * 0.35);
      ctx.lineTo(cx - r * 0.85, cy + r * 0.5);
      ctx.stroke();
    }

    ctx.restore();
  }
}

export class FrostLily extends Plant {
  private static readonly SHOOT_INTERVAL = GAME_CONFIG.plants.frostlily.attackInterval;
  private static readonly HP = GAME_CONFIG.plants.frostlily.hp;
  private static readonly COST = PLANT_COSTS.frostlily;
  private static readonly DAMAGE = GAME_CONFIG.plants.frostlily.damage;
  private static readonly SEED_SPEED = GAME_CONFIG.plants.frostlily.seedSpeed;

  private timer = 0;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, FrostLily.HP, FrostLily.COST, PLANT_COOLDOWNS.frostlily, row);
  }

  produce(dt: number, context: PlantContext): Seed | null {
    if (!context.zombieAheadInRow(this.row, this.x)) {
      return null;
    }

    this.timer += dt;
    if (this.timer >= FrostLily.SHOOT_INTERVAL) {
      this.timer -= FrostLily.SHOOT_INTERVAL;
      const seedY = this.y + this.height / 2 - 5;
      return new Seed(this.x + this.width, seedY, this.row, FrostLily.DAMAGE, FrostLily.SEED_SPEED, true);
    }
    return null;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;
    renderLilyBloom(ctx, cx, cy, r, false);
  }
}

function renderLilyBloom(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  armored: boolean,
): void {
  ctx.save();
  ctx.fillStyle = '#0277bd';
  ctx.fillRect(cx - 5, cy + r * 0.15, 10, r * 0.7);

  const petal = (angle: number) => {
    ctx.save();
    ctx.translate(cx, cy - r * 0.1);
    ctx.rotate(angle);
    const g = ctx.createLinearGradient(0, -r * 0.95, 0, 0);
    g.addColorStop(0, '#e1f5fe');
    g.addColorStop(1, '#4fc3f7');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(r * 0.2, -r * 0.6, 0, -r * 0.95);
    ctx.quadraticCurveTo(-r * 0.2, -r * 0.6, 0, 0);
    ctx.fill();
    ctx.strokeStyle = '#01579b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  };
  [-0.4, 0, 0.4].forEach(petal);

  if (armored) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.strokeStyle = '#0277bd';
    ctx.lineWidth = 1.5;
    [-0.75, 0.75].forEach((ang) => {
      ctx.save();
      ctx.translate(cx, cy - r * 0.1);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.75);
      ctx.lineTo(r * 0.18, -r * 0.4);
      ctx.lineTo(0, -r * 0.15);
      ctx.lineTo(-r * 0.18, -r * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  ctx.fillStyle = '#b3e5fc';
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.2, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#01579b';
  ctx.beginPath();
  ctx.arc(cx - r * 0.06, cy - r * 0.24, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.08, cy - r * 0.24, r * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // dew droplet
  ctx.fillStyle = '#81d4fa';
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.55, cy - r * 0.45);
  ctx.quadraticCurveTo(cx + r * 0.75, cy - r * 0.2, cx + r * 0.55, cy - r * 0.05);
  ctx.quadraticCurveTo(cx + r * 0.35, cy - r * 0.2, cx + r * 0.55, cy - r * 0.45);
  ctx.fill();

  ctx.restore();
}

export class TwinFang extends Plant {
  private static readonly SHOOT_INTERVAL = GAME_CONFIG.plants.twinfang.attackInterval;
  private static readonly HP = GAME_CONFIG.plants.twinfang.hp;
  private static readonly COST = PLANT_COSTS.twinfang;
  private static readonly DAMAGE = GAME_CONFIG.plants.twinfang.damage;
  private static readonly SEED_SPEED = GAME_CONFIG.plants.twinfang.seedSpeed;
  private static readonly SECOND_SHOT_DELAY = GAME_CONFIG.plants.twinfang.secondShotDelay;

  private timer = 0;
  private pendingSecondShot = 0;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, TwinFang.HP, TwinFang.COST, PLANT_COOLDOWNS.twinfang, row);
  }

  produce(dt: number, context: PlantContext): Seed | null {
    if (this.pendingSecondShot > 0) {
      this.pendingSecondShot -= dt;
      if (this.pendingSecondShot <= 0) {
        this.pendingSecondShot = 0;
        return this.fireOne();
      }
      return null;
    }

    if (!context.zombieAheadInRow(this.row, this.x)) {
      return null;
    }

    this.timer += dt;
    if (this.timer >= TwinFang.SHOOT_INTERVAL) {
      this.timer -= TwinFang.SHOOT_INTERVAL;
      this.pendingSecondShot = TwinFang.SECOND_SHOT_DELAY;
      return this.fireOne();
    }
    return null;
  }

  private fireOne(): Seed {
    const seedY = this.y + this.height / 2 - 5;
    return new Seed(this.x + this.width, seedY, this.row, TwinFang.DAMAGE, TwinFang.SEED_SPEED);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;

    ctx.save();
    ctx.fillStyle = '#1b5e20';
    ctx.fillRect(cx - 6, cy + r * 0.15, 12, r * 0.7);

    [-r * 0.32, r * 0.32].forEach((dx) => {
      const headCx = cx + dx;
      const headCy = cy - r * 0.35;
      const headR = r * 0.42;
      const g = ctx.createRadialGradient(
        headCx - headR * 0.3,
        headCy - headR * 0.3,
        headR * 0.1,
        headCx,
        headCy,
        headR,
      );
      g.addColorStop(0, '#66bb6a');
      g.addColorStop(1, '#1b5e20');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(headCx, headCy, headR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(headCx - headR * 0.25, headCy - headR * 0.1, headR * 0.18, headR * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1b1b1b';
      ctx.beginPath();
      ctx.arc(headCx - headR * 0.2, headCy - headR * 0.1, headR * 0.09, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0d3d10';
      ctx.fillRect(headCx + headR * 0.3, headCy - 5, headR * 0.7, 9);
    });

    ctx.restore();
  }
}

export class Blastcap extends Plant {
  private static readonly HP = GAME_CONFIG.plants.blastcap.hp;
  private static readonly COST = PLANT_COSTS.blastcap;
  private static readonly FUSE_DURATION = GAME_CONFIG.plants.blastcap.fuseDuration;

  private fuseTimer = Blastcap.FUSE_DURATION;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, Blastcap.HP, Blastcap.COST, PLANT_COOLDOWNS.blastcap, row);
  }

  produce(dt: number): null {
    this.fuseTimer -= dt;
    if (this.fuseTimer <= 0) {
      this.active = false;
    }
    return null;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;

    ctx.save();
    if (this.fuseTimer < Blastcap.FUSE_DURATION) {
      const flashRadius = r * 1.7 * (1 - this.fuseTimer / Blastcap.FUSE_DURATION);
      ctx.fillStyle = `rgba(255, 200, 80, ${Math.max(0, this.fuseTimer / Blastcap.FUSE_DURATION)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, flashRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // stem
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(cx - r * 0.15, cy + r * 0.1, r * 0.3, r * 0.5);

    // single round mushroom cap
    const capGradient = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.35, r * 0.1, cx, cy - r * 0.1, r * 0.85);
    capGradient.addColorStop(0, '#ff8a65');
    capGradient.addColorStop(0.6, '#e53935');
    capGradient.addColorStop(1, '#b71c1c');
    ctx.fillStyle = capGradient;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.1, r * 0.85, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#7f0000';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff8e1';
    [
      [-0.35, -0.35],
      [0.15, -0.55],
      [0.4, -0.1],
    ].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.ellipse(cx + dx * r, cy + dy * r, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // fuse + spark
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.9);
    ctx.quadraticCurveTo(cx + r * 0.15, cy - r * 1.15, cx + r * 0.03, cy - r * 1.3);
    ctx.stroke();
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(cx + r * 0.03, cy - r * 1.35, r * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Passive: does not attack on its own. Any seed passing through its cell in
 * the same row gets ignited once (see GameEngine's collision handling),
 * doubling that seed's damage.
 */
export class Emberroot extends Plant {
  private static readonly HP = GAME_CONFIG.plants.emberroot.hp;
  private static readonly COST = PLANT_COSTS.emberroot;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, Emberroot.HP, Emberroot.COST, PLANT_COOLDOWNS.emberroot, row);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;

    ctx.save();

    const gnarl = ctx.createRadialGradient(cx - r * 0.15, cy + r * 0.1, r * 0.15, cx, cy + r * 0.2, r * 0.9);
    gnarl.addColorStop(0, '#6d4c41');
    gnarl.addColorStop(1, '#3e2723');
    ctx.fillStyle = gnarl;
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.35, r * 0.75, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - r * 0.55, cy - r * 0.35, r * 1.1, r * 0.7);
    ctx.strokeStyle = '#2b1a17';
    ctx.lineWidth = 2;
    ctx.stroke();

    // glowing cracks running through the wood
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.3, cy - r * 0.2);
    ctx.lineTo(cx - r * 0.1, cy + r * 0.1);
    ctx.lineTo(cx - r * 0.25, cy + r * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.25, cy - r * 0.25);
    ctx.lineTo(cx + r * 0.08, cy);
    ctx.lineTo(cx + r * 0.3, cy + r * 0.35);
    ctx.stroke();

    // ember glow flaring from the top
    const flame = ctx.createRadialGradient(cx, cy - r * 0.55, 2, cx, cy - r * 0.5, r * 0.6);
    flame.addColorStop(0, '#fff59d');
    flame.addColorStop(0.55, '#ff9800');
    flame.addColorStop(1, 'rgba(230, 81, 0, 0)');
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.5, r * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Passive: does not attack on its own. When a zombie's bite finishes it off,
 * GameEngine hypnotizes that zombie instead of just removing the plant.
 */
export class Dreamspore extends Plant {
  private static readonly HP = GAME_CONFIG.plants.dreamspore.hp;
  private static readonly COST = PLANT_COSTS.dreamspore;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, Dreamspore.HP, Dreamspore.COST, PLANT_COOLDOWNS.dreamspore, row);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;

    ctx.save();
    ctx.fillStyle = '#e1bee7';
    ctx.fillRect(cx - r * 0.15, cy + r * 0.1, r * 0.3, r * 0.6);

    const capGradient = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.1, cx, cy - r * 0.1, r * 0.9);
    capGradient.addColorStop(0, '#f3e5f5');
    capGradient.addColorStop(1, '#6a1b9a');
    ctx.fillStyle = capGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.1, r * 0.9, r * 0.55, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#4a148c';
    ctx.lineWidth = 2;
    ctx.stroke();

    // dreamy hypnotic spiral across the cap
    ctx.strokeStyle = '#f8bbd0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let t = 0; t < 3.2; t += 0.1) {
      const rr = 3 + t * (r * 0.11);
      const x = cx + Math.cos(t * 4) * rr;
      const y = cy - r * 0.15 + Math.sin(t * 4) * rr * 0.6;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.restore();
  }
}

export class GlacierBloom extends Plant {
  private static readonly SHOOT_INTERVAL = GAME_CONFIG.plants.glacierbloom.attackInterval;
  private static readonly HP = GAME_CONFIG.plants.glacierbloom.hp;
  private static readonly COST = PLANT_COSTS.glacierbloom;
  private static readonly DAMAGE = GAME_CONFIG.plants.glacierbloom.damage;
  private static readonly SEED_SPEED = GAME_CONFIG.plants.glacierbloom.seedSpeed;

  private timer = 0;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, GlacierBloom.HP, GlacierBloom.COST, PLANT_COOLDOWNS.glacierbloom, row);
  }

  produce(dt: number, context: PlantContext): Seed | null {
    if (!context.zombieAheadInRow(this.row, this.x)) {
      return null;
    }

    this.timer += dt;
    if (this.timer >= GlacierBloom.SHOOT_INTERVAL) {
      this.timer -= GlacierBloom.SHOOT_INTERVAL;
      const seedY = this.y + this.height / 2 - 5;
      return new Seed(this.x + this.width, seedY, this.row, GlacierBloom.DAMAGE, GlacierBloom.SEED_SPEED, true);
    }
    return null;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;
    renderLilyBloom(ctx, cx, cy, r * 1.05, true);
  }
}

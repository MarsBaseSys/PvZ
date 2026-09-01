import { GameObject } from './GameObject';
import { Pea } from './Pea';
import { Sun } from './Sun';
import { GAME_CONFIG } from '../config/gameConfig';
import { CELL_SIZE } from '../utils/constants';

export interface PlantContext {
  zombieAheadInRow(row: number, x: number): boolean;
}

export type PlantType =
  | 'sunflower'
  | 'peashooter'
  | 'wallnut'
  | 'snowpea'
  | 'repeater'
  | 'cherrybomb'
  | 'torchwood'
  | 'hypnoshroom'
  | 'iceshroom';

export const PLANT_COSTS: Record<PlantType, number> = {
  sunflower: GAME_CONFIG.plants.sunflower.cost,
  peashooter: GAME_CONFIG.plants.peashooter.cost,
  wallnut: GAME_CONFIG.plants.wallnut.cost,
  snowpea: GAME_CONFIG.plants.snowpea.cost,
  repeater: GAME_CONFIG.plants.repeater.cost,
  cherrybomb: GAME_CONFIG.plants.cherrybomb.cost,
  torchwood: GAME_CONFIG.plants.torchwood.cost,
  hypnoshroom: GAME_CONFIG.plants.hypnoshroom.cost,
  iceshroom: GAME_CONFIG.plants.iceshroom.cost,
};

export const PLANT_COOLDOWNS: Record<PlantType, number> = {
  sunflower: GAME_CONFIG.plants.sunflower.cooldown,
  peashooter: GAME_CONFIG.plants.peashooter.cooldown,
  wallnut: GAME_CONFIG.plants.wallnut.cooldown,
  snowpea: GAME_CONFIG.plants.snowpea.cooldown,
  repeater: GAME_CONFIG.plants.repeater.cooldown,
  cherrybomb: GAME_CONFIG.plants.cherrybomb.cooldown,
  torchwood: GAME_CONFIG.plants.torchwood.cooldown,
  hypnoshroom: GAME_CONFIG.plants.hypnoshroom.cooldown,
  iceshroom: GAME_CONFIG.plants.iceshroom.cooldown,
};

export const PLANT_LABELS: Record<PlantType, string> = {
  sunflower: '向日葵',
  peashooter: '豌豆射手',
  wallnut: '坚果墙',
  snowpea: '寒冰射手',
  repeater: '双发射手',
  cherrybomb: '樱桃炸弹',
  torchwood: '火炬树桩',
  hypnoshroom: '催眠蘑菇',
  iceshroom: '冰蘑菇',
};

/** Simplified icon shared by the HUD plant cards and the reward-card popup. */
export function renderPlantIcon(
  ctx: CanvasRenderingContext2D,
  type: PlantType,
  cx: number,
  cy: number,
  r: number,
): void {
  if (type === 'sunflower') {
    const petalCount = 8;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const px = cx + Math.cos(angle) * r * 0.6;
      const py = cy + Math.sin(angle) * r * 0.6;
      ctx.fillStyle = '#fbc02d';
      ctx.beginPath();
      ctx.ellipse(px, py, r * 0.35, r * 0.22, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#6d4c21';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3e2b12';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.15, cy - r * 0.08, r * 0.06, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.15, cy - r * 0.08, r * 0.06, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'peashooter' || type === 'snowpea' || type === 'repeater') {
    // round head on a thin stalk — matches Peashooter's full-size render silhouette
    const headColor = type === 'snowpea' ? '#81d4fa' : '#9ccc65';
    const stalkColor = type === 'snowpea' ? '#0277bd' : '#33691e';
    const tubeColor = type === 'snowpea' ? '#01579b' : '#1b5e20';

    ctx.fillStyle = stalkColor;
    ctx.fillRect(cx - r * 0.12, cy, r * 0.24, r * 0.65);

    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.arc(cx - r * 0.05, cy - r * 0.25, r * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = tubeColor;
    ctx.fillRect(cx + r * 0.25, cy - r * 0.35 - 4, r * 0.75, 8);
    if (type === 'repeater') {
      ctx.fillRect(cx + r * 0.25, cy - r * 0.35 + 8, r * 0.75, 8);
    }
  } else if (type === 'wallnut') {
    ctx.fillStyle = '#a9784a';
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.95, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5d4321';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#3e2b12';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.28, cy - r * 0.15, r * 0.07, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.1, cy - r * 0.15, r * 0.07, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'torchwood') {
    ctx.fillStyle = '#6d4c26';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.5, r * 0.6, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8d6b3a';
    ctx.fillRect(cx - r * 0.42, cy - r * 0.1, r * 0.84, r * 0.6);
    ctx.strokeStyle = '#5d4321';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - r * 0.42, cy - r * 0.1, r * 0.84, r * 0.6);

    const flameGradient = ctx.createRadialGradient(cx, cy - r * 0.5, 0, cx, cy - r * 0.45, r * 0.55);
    flameGradient.addColorStop(0, '#fff59d');
    flameGradient.addColorStop(0.55, '#ff9800');
    flameGradient.addColorStop(1, '#e65100');
    ctx.fillStyle = flameGradient;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.95);
    ctx.quadraticCurveTo(cx + r * 0.38, cy - r * 0.55, cx + r * 0.16, cy - r * 0.15);
    ctx.quadraticCurveTo(cx + r * 0.05, cy - r * 0.35, cx, cy - r * 0.2);
    ctx.quadraticCurveTo(cx - r * 0.05, cy - r * 0.35, cx - r * 0.16, cy - r * 0.15);
    ctx.quadraticCurveTo(cx - r * 0.38, cy - r * 0.55, cx, cy - r * 0.95);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'hypnoshroom' || type === 'iceshroom') {
    const iceLike = type === 'iceshroom';
    const stemColor = iceLike ? '#e1f5fe' : '#e8d5c4';
    const capHighlight = iceLike ? '#b3e5fc' : '#ce93d8';
    const capShadow = iceLike ? '#01579b' : '#6a1b9a';
    const spotColor = iceLike ? '#e1f5fe' : '#f3e5f5';

    ctx.fillStyle = stemColor;
    ctx.fillRect(cx - r * 0.22, cy, r * 0.44, r * 0.55);

    const capGradient = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r * 0.75);
    capGradient.addColorStop(0, capHighlight);
    capGradient.addColorStop(1, capShadow);
    ctx.fillStyle = capGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.05, r * 0.72, r * 0.5, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = capShadow;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = spotColor;
    const spots: Array<[number, number]> = [
      [-0.3, -0.25],
      [0.25, -0.3],
      [0, -0.05],
    ];
    for (const [dx, dy] of spots) {
      ctx.beginPath();
      ctx.ellipse(cx + dx * r, cy + dy * r, r * 0.08, r * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!iceLike) {
      ctx.strokeStyle = '#f8bbd0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.15, r * 0.18, 0, Math.PI * 1.5);
      ctx.stroke();
    }
  } else {
    // cherrybomb
    ctx.strokeStyle = '#3e2b12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.2);
    ctx.lineTo(cx - r * 0.05, cy - r * 0.9);
    ctx.moveTo(cx + r * 0.3, cy - r * 0.3);
    ctx.lineTo(cx - r * 0.05, cy - r * 0.9);
    ctx.stroke();

    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.arc(cx - r * 0.28, cy + r * 0.05, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + r * 0.32, cy - r * 0.05, r * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.4, cy - r * 0.1, r * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + r * 0.2, cy - r * 0.2, r * 0.13, 0, Math.PI * 2);
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

    // head sits high, roughly twice the stalk's width — the classic silhouette
    // is a big round head on a narrow stem, not two similarly-sized circles
    const headCx = cx - r * 0.05;
    const headCy = cy - r * 0.32;
    const headR = r * 0.62;

    // leaves at the base of the stalk
    ctx.fillStyle = '#558b2f';
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + r * 0.55);
    ctx.quadraticCurveTo(cx - r * 0.7, cy + r * 0.45, cx - r * 0.45, cy + r * 0.72);
    ctx.quadraticCurveTo(cx - r * 0.15, cy + r * 0.62, cx - 6, cy + r * 0.55);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy + r * 0.6);
    ctx.quadraticCurveTo(cx + r * 0.65, cy + r * 0.5, cx + r * 0.4, cy + r * 0.75);
    ctx.quadraticCurveTo(cx + r * 0.12, cy + r * 0.68, cx + 6, cy + r * 0.6);
    ctx.fill();

    // thin stalk connecting the head to the ground
    const stalkTopY = headCy + headR * 0.5;
    const stalkBottomY = cy + r * 0.85;
    const stalkGradient = ctx.createLinearGradient(cx - 10, 0, cx + 10, 0);
    stalkGradient.addColorStop(0, '#33691e');
    stalkGradient.addColorStop(1, '#558b2f');
    ctx.fillStyle = stalkGradient;
    ctx.beginPath();
    ctx.moveTo(cx - 9, stalkTopY);
    ctx.lineTo(cx + 9, stalkTopY);
    ctx.lineTo(cx + 6, stalkBottomY);
    ctx.lineTo(cx - 6, stalkBottomY);
    ctx.closePath();
    ctx.fill();
    const headGradient = ctx.createRadialGradient(
      headCx - headR * 0.35,
      headCy - headR * 0.35,
      headR * 0.1,
      headCx,
      headCy,
      headR,
    );
    headGradient.addColorStop(0, '#9ccc65');
    headGradient.addColorStop(1, '#33691e');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(headCx, headCy, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1b5e20';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // eyes — bigger, round, alert
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(headCx - headR * 0.32, headCy - headR * 0.1, headR * 0.26, headR * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headCx + headR * 0.28, headCy - headR * 0.1, headR * 0.26, headR * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1b1b1b';
    ctx.beginPath();
    ctx.arc(headCx - headR * 0.22, headCy - headR * 0.12, headR * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headCx + headR * 0.38, headCy - headR * 0.12, headR * 0.13, 0, Math.PI * 2);
    ctx.fill();

    // shooting tube (pointing right), rounded cannon-style tip
    const tubeY = headCy - 6;
    const tubeHeight = 12;
    const tubeStartX = headCx + headR * 0.6;
    const tubeLength = r * 0.85;
    ctx.fillStyle = '#1b5e20';
    ctx.fillRect(tubeStartX, tubeY, tubeLength, tubeHeight);
    ctx.fillStyle = '#66bb6a';
    ctx.fillRect(tubeStartX, tubeY + 2, tubeLength, 3);
    ctx.fillStyle = '#0d3d10';
    ctx.beginPath();
    ctx.arc(tubeStartX + tubeLength, tubeY + tubeHeight / 2, tubeHeight / 2 + 1, 0, Math.PI * 2);
    ctx.fill();

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

export class SnowPea extends Plant {
  private static readonly SHOOT_INTERVAL = GAME_CONFIG.plants.snowpea.attackInterval;
  private static readonly HP = GAME_CONFIG.plants.snowpea.hp;
  private static readonly COST = PLANT_COSTS.snowpea;
  private static readonly DAMAGE = GAME_CONFIG.plants.snowpea.damage;
  private static readonly PEA_SPEED = GAME_CONFIG.plants.snowpea.peaSpeed;

  private timer = 0;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, SnowPea.HP, SnowPea.COST, PLANT_COOLDOWNS.snowpea, row);
  }

  produce(dt: number, context: PlantContext): Pea | null {
    if (!context.zombieAheadInRow(this.row, this.x)) {
      return null;
    }

    this.timer += dt;
    if (this.timer >= SnowPea.SHOOT_INTERVAL) {
      this.timer -= SnowPea.SHOOT_INTERVAL;
      const peaY = this.y + this.height / 2 - 5;
      return new Pea(this.x + this.width, peaY, this.row, SnowPea.DAMAGE, SnowPea.PEA_SPEED, true);
    }
    return null;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;
    renderPlantIcon(ctx, 'snowpea', cx, cy, r * 1.35);
  }
}

export class Repeater extends Plant {
  private static readonly SHOOT_INTERVAL = GAME_CONFIG.plants.repeater.attackInterval;
  private static readonly HP = GAME_CONFIG.plants.repeater.hp;
  private static readonly COST = PLANT_COSTS.repeater;
  private static readonly DAMAGE = GAME_CONFIG.plants.repeater.damage;
  private static readonly PEA_SPEED = GAME_CONFIG.plants.repeater.peaSpeed;
  private static readonly SECOND_SHOT_DELAY = GAME_CONFIG.plants.repeater.secondShotDelay;

  private timer = 0;
  private pendingSecondShot = 0;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, Repeater.HP, Repeater.COST, PLANT_COOLDOWNS.repeater, row);
  }

  produce(dt: number, context: PlantContext): Pea | null {
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
    if (this.timer >= Repeater.SHOOT_INTERVAL) {
      this.timer -= Repeater.SHOOT_INTERVAL;
      this.pendingSecondShot = Repeater.SECOND_SHOT_DELAY;
      return this.fireOne();
    }
    return null;
  }

  private fireOne(): Pea {
    const peaY = this.y + this.height / 2 - 5;
    return new Pea(this.x + this.width, peaY, this.row, Repeater.DAMAGE, Repeater.PEA_SPEED);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;
    renderPlantIcon(ctx, 'repeater', cx, cy, r * 1.35);
  }
}

export class CherryBomb extends Plant {
  private static readonly HP = GAME_CONFIG.plants.cherrybomb.hp;
  private static readonly COST = PLANT_COSTS.cherrybomb;
  private static readonly FUSE_DURATION = GAME_CONFIG.plants.cherrybomb.fuseDuration;

  private fuseTimer = CherryBomb.FUSE_DURATION;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, CherryBomb.HP, CherryBomb.COST, PLANT_COOLDOWNS.cherrybomb, row);
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
    if (this.fuseTimer < CherryBomb.FUSE_DURATION) {
      const flashRadius = r * 1.6 * (1 - this.fuseTimer / CherryBomb.FUSE_DURATION);
      ctx.fillStyle = `rgba(255, 200, 80, ${Math.max(0, this.fuseTimer / CherryBomb.FUSE_DURATION)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, flashRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    renderPlantIcon(ctx, 'cherrybomb', cx, cy, r * 1.1);
    ctx.restore();
  }
}

/**
 * Passive: does not attack on its own. Any pea passing through its cell in
 * the same row gets ignited once (see GameEngine's pea-collision handling),
 * doubling that pea's damage.
 */
export class TorchWood extends Plant {
  private static readonly HP = GAME_CONFIG.plants.torchwood.hp;
  private static readonly COST = PLANT_COSTS.torchwood;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, TorchWood.HP, TorchWood.COST, PLANT_COOLDOWNS.torchwood, row);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;
    renderPlantIcon(ctx, 'torchwood', cx, cy, r * 1.2);
  }
}

/**
 * Passive: does not attack on its own. When a zombie's bite finishes it off,
 * GameEngine hypnotizes that zombie instead of just removing the plant.
 */
export class HypnoShroom extends Plant {
  private static readonly HP = GAME_CONFIG.plants.hypnoshroom.hp;
  private static readonly COST = PLANT_COSTS.hypnoshroom;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, HypnoShroom.HP, HypnoShroom.COST, PLANT_COOLDOWNS.hypnoshroom, row);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;
    renderPlantIcon(ctx, 'hypnoshroom', cx, cy, r * 1.2);
  }
}

export class IceMushroom extends Plant {
  private static readonly SHOOT_INTERVAL = GAME_CONFIG.plants.iceshroom.attackInterval;
  private static readonly HP = GAME_CONFIG.plants.iceshroom.hp;
  private static readonly COST = PLANT_COSTS.iceshroom;
  private static readonly DAMAGE = GAME_CONFIG.plants.iceshroom.damage;
  private static readonly PEA_SPEED = GAME_CONFIG.plants.iceshroom.peaSpeed;

  private timer = 0;

  constructor(x: number, y: number, row: number) {
    super(x, y, CELL_SIZE - 10, CELL_SIZE - 10, IceMushroom.HP, IceMushroom.COST, PLANT_COOLDOWNS.iceshroom, row);
  }

  produce(dt: number, context: PlantContext): Pea | null {
    if (!context.zombieAheadInRow(this.row, this.x)) {
      return null;
    }

    this.timer += dt;
    if (this.timer >= IceMushroom.SHOOT_INTERVAL) {
      this.timer -= IceMushroom.SHOOT_INTERVAL;
      const peaY = this.y + this.height / 2 - 5;
      return new Pea(this.x + this.width, peaY, this.row, IceMushroom.DAMAGE, IceMushroom.PEA_SPEED, true);
    }
    return null;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;
    renderPlantIcon(ctx, 'iceshroom', cx, cy, r * 1.2);
  }
}

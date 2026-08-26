import { GameObject } from './GameObject';
import { GAME_CONFIG } from '../config/gameConfig';

export type ZombieType = 'basic' | 'conehead';

export abstract class Zombie extends GameObject {
  hp: number;
  speed: number;
  attackPower: number;
  row: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    hp: number,
    speed: number,
    attackPower: number,
    row: number,
  ) {
    super(x, y, width, height);
    this.hp = hp;
    this.speed = speed;
    this.attackPower = attackPower;
    this.row = row;
  }

  takeDamage(amount: number): void {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.active = false;
    }
  }

  update(dt: number): void {
    this.x -= this.speed * dt;
  }

  protected renderBody(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const headCy = this.y + this.height * 0.15;
    const headR = this.width * 0.35;

    ctx.save();

    // legs hint
    ctx.fillStyle = '#455a64';
    ctx.fillRect(this.x + this.width * 0.15, this.y + this.height * 0.92, this.width * 0.25, this.height * 0.08);
    ctx.fillRect(this.x + this.width * 0.6, this.y + this.height * 0.92, this.width * 0.25, this.height * 0.08);

    // torso: tattered shirt via a jagged bottom/side edge
    const torsoTop = this.y + this.height * 0.25;
    const torsoBottom = this.y + this.height * 0.92;
    ctx.fillStyle = '#e8e3d3';
    ctx.beginPath();
    ctx.moveTo(this.x, torsoTop);
    ctx.lineTo(this.x + this.width, torsoTop);
    ctx.lineTo(this.x + this.width, torsoBottom - 10);
    ctx.lineTo(this.x + this.width * 0.85, torsoBottom);
    ctx.lineTo(this.x + this.width * 0.7, torsoBottom - 8);
    ctx.lineTo(this.x + this.width * 0.55, torsoBottom);
    ctx.lineTo(this.x + this.width * 0.4, torsoBottom - 10);
    ctx.lineTo(this.x + this.width * 0.22, torsoBottom);
    ctx.lineTo(this.x, torsoBottom - 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c9c2a8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // grime/rip marks
    ctx.strokeStyle = '#9e9880';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width * 0.3, torsoTop + 8);
    ctx.lineTo(this.x + this.width * 0.38, torsoTop + 22);
    ctx.moveTo(this.x + this.width * 0.65, torsoTop + 14);
    ctx.lineTo(this.x + this.width * 0.58, torsoTop + 30);
    ctx.stroke();

    // head with olive-green gradient skin
    const headGradient = ctx.createRadialGradient(
      cx - headR * 0.3,
      headCy - headR * 0.3,
      headR * 0.1,
      cx,
      headCy,
      headR,
    );
    headGradient.addColorStop(0, '#a6ad6a');
    headGradient.addColorStop(1, '#6d7a42');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(cx, headCy, headR, 0, Math.PI * 2);
    ctx.fill();

    // eyes
    ctx.fillStyle = '#1b1b1b';
    ctx.beginPath();
    ctx.ellipse(cx - headR * 0.35, headCy - headR * 0.1, headR * 0.14, headR * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + headR * 0.15, headCy - headR * 0.1, headR * 0.14, headR * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // groaning open mouth
    ctx.fillStyle = '#3e2f1c';
    ctx.beginPath();
    ctx.ellipse(cx - headR * 0.1, headCy + headR * 0.42, headR * 0.3, headR * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // arms: short filled "sleeve" segments ending in fists, reaching forward
    ctx.fillStyle = '#d8d2bd';
    ctx.strokeStyle = '#8d9ea6';
    const armY = this.y + this.height * 0.4;

    ctx.save();
    ctx.translate(this.x, armY);
    ctx.rotate(-0.15);
    ctx.fillRect(-18, -5, 18, 10);
    ctx.restore();
    ctx.fillStyle = '#6d7a42';
    ctx.beginPath();
    ctx.arc(this.x - 16, armY - 3, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d8d2bd';
    ctx.save();
    ctx.translate(this.x + this.width, armY);
    ctx.rotate(0.15);
    ctx.fillRect(0, -5, 18, 10);
    ctx.restore();
    ctx.fillStyle = '#6d7a42';
    ctx.beginPath();
    ctx.arc(this.x + this.width + 16, armY - 3, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export class BasicZombie extends Zombie {
  private static readonly HP = GAME_CONFIG.zombies.basic.hp;
  private static readonly SPEED = GAME_CONFIG.zombies.basic.speed;
  private static readonly ATTACK_POWER = GAME_CONFIG.zombies.basic.attackPower;
  private static readonly WIDTH = 50;
  private static readonly HEIGHT = 70;

  constructor(x: number, y: number, row: number) {
    super(
      x,
      y,
      BasicZombie.WIDTH,
      BasicZombie.HEIGHT,
      BasicZombie.HP,
      BasicZombie.SPEED,
      BasicZombie.ATTACK_POWER,
      row,
    );
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.renderBody(ctx);
  }
}

export class ConeheadZombie extends Zombie {
  private static readonly HP = GAME_CONFIG.zombies.conehead.hp;
  private static readonly SPEED = GAME_CONFIG.zombies.conehead.speed;
  private static readonly ATTACK_POWER = GAME_CONFIG.zombies.conehead.attackPower;
  private static readonly WIDTH = 50;
  private static readonly HEIGHT = 70;
  private static readonly ARMOR_HP = GAME_CONFIG.zombies.conehead.armorHp;

  armorHp: number;

  constructor(x: number, y: number, row: number) {
    super(
      x,
      y,
      ConeheadZombie.WIDTH,
      ConeheadZombie.HEIGHT,
      ConeheadZombie.HP,
      ConeheadZombie.SPEED,
      ConeheadZombie.ATTACK_POWER,
      row,
    );
    this.armorHp = ConeheadZombie.ARMOR_HP;
  }

  takeDamage(amount: number): void {
    if (this.armorHp > 0) {
      this.armorHp -= amount;
      if (this.armorHp < 0) {
        const overflow = -this.armorHp;
        this.armorHp = 0;
        super.takeDamage(overflow);
      }
      return;
    }
    super.takeDamage(amount);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.renderBody(ctx);

    if (this.armorHp > 0) {
      ctx.save();
      const headCx = this.x + this.width / 2;
      const headTopY = this.y + this.height * 0.15 - this.width * 0.35;
      const coneTipY = headTopY - 18;
      const coneBaseY = headTopY + 2;

      const coneGradient = ctx.createLinearGradient(headCx - 16, coneTipY, headCx + 16, coneBaseY);
      coneGradient.addColorStop(0, '#ffb74d');
      coneGradient.addColorStop(0.5, '#fb8c00');
      coneGradient.addColorStop(1, '#e65100');
      ctx.fillStyle = coneGradient;
      ctx.beginPath();
      ctx.moveTo(headCx, coneTipY);
      ctx.lineTo(headCx - 16, coneBaseY);
      ctx.lineTo(headCx + 16, coneBaseY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#e65100';
      ctx.lineWidth = 2;
      ctx.stroke();

      // reflective stripes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      const stripe1 = 0.45;
      const stripe2 = 0.72;
      ctx.beginPath();
      ctx.moveTo(headCx - 16 * stripe1, coneTipY + (coneBaseY - coneTipY) * stripe1);
      ctx.lineTo(headCx + 16 * stripe1, coneTipY + (coneBaseY - coneTipY) * stripe1);
      ctx.moveTo(headCx - 16 * stripe2, coneTipY + (coneBaseY - coneTipY) * stripe2);
      ctx.lineTo(headCx + 16 * stripe2, coneTipY + (coneBaseY - coneTipY) * stripe2);
      ctx.stroke();

      ctx.restore();
    }
  }
}

export function createZombie(type: ZombieType, x: number, y: number, row: number): Zombie {
  return type === 'basic' ? new BasicZombie(x, y, row) : new ConeheadZombie(x, y, row);
}

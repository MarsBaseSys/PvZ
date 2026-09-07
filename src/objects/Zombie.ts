import { GameObject } from './GameObject';
import { GAME_CONFIG } from '../config/gameConfig';

export type ZombieType = 'husk' | 'podhead' | 'stumphusk';

export const ZOMBIE_LABELS: Record<ZombieType, string> = {
  husk: '腐蔓伏尸',
  podhead: '荚壳伏尸',
  stumphusk: '树桩伏尸',
};

export const ZOMBIE_NAMES_EN: Record<ZombieType, string> = {
  husk: 'Husk',
  podhead: 'Pod-Head Husk',
  stumphusk: 'Stump Husk',
};

export abstract class Zombie extends GameObject {
  hp: number;
  speed: number;
  attackPower: number;
  row: number;

  /** Set once by a Dreamspore's dying bite; reverses movement and turns this zombie against its former allies. */
  hypnotized = false;

  private slowMultiplier = 1;
  private slowTimer = 0;

  private attacking = false;
  private attackAnimTimer = 0;

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

  /** Refreshes the slow effect if this one is at least as strong as any already active. */
  applySlow(duration: number, factor: number): void {
    if (this.slowTimer <= 0 || factor <= this.slowMultiplier) {
      this.slowMultiplier = factor;
    }
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  /** Flips this zombie to fight for the player: it now walks back toward the spawn edge. */
  hypnotize(): void {
    this.hypnotized = true;
  }

  /** GameEngine calls this every frame to say whether this zombie is currently biting a target this frame. */
  setAttacking(isAttacking: boolean): void {
    this.attacking = isAttacking;
    if (!isAttacking) {
      this.attackAnimTimer = 0;
    }
  }

  /** Advances the bite-cycle clock; only meaningful while `attacking`. */
  tickAttackAnimation(dt: number): void {
    if (this.attacking) {
      this.attackAnimTimer += dt;
    }
  }

  update(dt: number): void {
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) {
        this.slowTimer = 0;
        this.slowMultiplier = 1;
      }
    }
    const direction = this.hypnotized ? 1 : -1;
    this.x += direction * this.speed * this.slowMultiplier * dt;
  }

  protected renderSlowTint(ctx: CanvasRenderingContext2D): void {
    if (this.slowTimer <= 0) {
      return;
    }
    ctx.save();
    ctx.fillStyle = 'rgba(79, 195, 247, 0.28)';
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width / 2,
      this.y + this.height * 0.55,
      this.width * 0.55,
      this.height * 0.5,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }

  protected renderHypnoTint(ctx: CanvasRenderingContext2D): void {
    if (!this.hypnotized) {
      return;
    }
    ctx.save();
    ctx.fillStyle = 'rgba(186, 104, 200, 0.35)';
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width / 2,
      this.y + this.height * 0.55,
      this.width * 0.55,
      this.height * 0.5,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }

  protected renderBody(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const headCy = this.y + this.height * 0.15;
    const headR = this.width * 0.35;

    // A 0..1 "chomp" pulse while attacking — drives the vine-arm lunge and
    // maw gape below so a biting Husk visibly moves instead of standing frozen.
    const bite = this.attacking ? (1 - Math.cos(this.attackAnimTimer * 9)) / 2 : 0;

    ctx.save();

    // gnarled root stubs for legs
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(this.x + this.width * 0.15, this.y + this.height * 0.92, this.width * 0.25, this.height * 0.08);
    ctx.fillRect(this.x + this.width * 0.6, this.y + this.height * 0.92, this.width * 0.25, this.height * 0.08);

    // torso: a ragged cloak of overlapping dead leaves, mossy green-brown —
    // a plant-matter husk instead of a clothed human silhouette
    const torsoTop = this.y + this.height * 0.25;
    const torsoBottom = this.y + this.height * 0.92;
    const torsoGradient = ctx.createLinearGradient(this.x, torsoTop, this.x, torsoBottom);
    torsoGradient.addColorStop(0, '#6d7a42');
    torsoGradient.addColorStop(1, '#4b5320');
    ctx.fillStyle = torsoGradient;
    ctx.beginPath();
    ctx.moveTo(this.x, torsoTop);
    ctx.lineTo(this.x + this.width * 0.5, torsoTop - 6);
    ctx.lineTo(this.x + this.width, torsoTop);
    ctx.lineTo(this.x + this.width, torsoBottom - 12);
    ctx.lineTo(this.x + this.width * 0.82, torsoBottom + 4);
    ctx.lineTo(this.x + this.width * 0.64, torsoBottom - 10);
    ctx.lineTo(this.x + this.width * 0.46, torsoBottom + 6);
    ctx.lineTo(this.x + this.width * 0.28, torsoBottom - 10);
    ctx.lineTo(this.x + this.width * 0.1, torsoBottom + 2);
    ctx.lineTo(this.x, torsoBottom - 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#33390f';
    ctx.lineWidth = 1;
    ctx.stroke();

    // leaf veins down the front instead of a shirt/tie
    ctx.strokeStyle = 'rgba(51, 57, 15, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, torsoTop + 2);
    ctx.lineTo(cx, torsoBottom - 8);
    for (let i = 1; i <= 3; i++) {
      const y = torsoTop + ((torsoBottom - torsoTop) * i) / 4;
      ctx.moveTo(cx, y);
      ctx.lineTo(cx - this.width * 0.16, y + 6);
      ctx.moveTo(cx, y);
      ctx.lineTo(cx + this.width * 0.16, y + 6);
    }
    ctx.stroke();

    // head — same olive-green creature skin as before, reads fine as
    // "rotting plant matter" rather than specifically human
    const headGradient = ctx.createRadialGradient(
      cx - headR * 0.3,
      headCy - headR * 0.3,
      headR * 0.1,
      cx,
      headCy,
      headR,
    );
    headGradient.addColorStop(0, '#a8b74a');
    headGradient.addColorStop(1, '#5d6b2f');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(cx, headCy, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3f4a22';
    ctx.lineWidth = 1;
    ctx.stroke();

    // a couple of dry twig sprouts on top instead of hair
    ctx.strokeStyle = '#4b5320';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - headR * 0.3, headCy - headR * 0.85);
    ctx.lineTo(cx - headR * 0.42, headCy - headR * 1.25);
    ctx.moveTo(cx + headR * 0.15, headCy - headR * 0.9);
    ctx.lineTo(cx + headR * 0.25, headCy - headR * 1.3);
    ctx.stroke();

    // sunken eye sockets, then the glowing hollow eyes themselves
    ctx.fillStyle = 'rgba(20, 15, 5, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx - headR * 0.35, headCy - headR * 0.08, headR * 0.24, headR * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + headR * 0.15, headCy - headR * 0.08, headR * 0.24, headR * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.ellipse(cx - headR * 0.35, headCy - headR * 0.1, headR * 0.12, headR * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + headR * 0.15, headCy - headR * 0.1, headR * 0.12, headR * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // thorny maw — gapes wider mid-bite, small thorn "teeth" instead of human teeth
    const mouthOpen = headR * (0.18 + bite * 0.22);
    ctx.fillStyle = '#2b1e10';
    ctx.beginPath();
    ctx.ellipse(cx - headR * 0.1, headCy + headR * 0.42, headR * 0.3, mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c8d67a';
    ctx.beginPath();
    ctx.moveTo(cx - headR * 0.22, headCy + headR * (0.3 + bite * 0.15));
    ctx.lineTo(cx - headR * 0.16, headCy + headR * (0.42 + bite * 0.2));
    ctx.lineTo(cx - headR * 0.1, headCy + headR * (0.3 + bite * 0.15));
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + headR * 0.05, headCy + headR * (0.3 + bite * 0.15));
    ctx.lineTo(cx + headR * 0.11, headCy + headR * (0.42 + bite * 0.2));
    ctx.lineTo(cx + headR * 0.17, headCy + headR * (0.3 + bite * 0.15));
    ctx.closePath();
    ctx.fill();

    // arms: woven-vine "sleeves" ending in small leaf-cluster fists — swing
    // further in and out while attacking to read as an actual bite/grab
    const armY = this.y + this.height * 0.4;
    const armSwing = bite * 0.35;
    const armReach = 18 + bite * 6;

    ctx.fillStyle = '#5c6b2f';
    ctx.save();
    ctx.translate(this.x, armY);
    ctx.rotate(-0.15 - armSwing);
    ctx.fillRect(-armReach, -5, armReach, 10);
    ctx.restore();
    renderLeafFist(ctx, this.x - armReach + 2, armY - 3);

    ctx.fillStyle = '#5c6b2f';
    ctx.save();
    ctx.translate(this.x + this.width, armY);
    ctx.rotate(0.15 + armSwing);
    ctx.fillRect(0, -5, armReach, 10);
    ctx.restore();
    renderLeafFist(ctx, this.x + this.width + armReach - 2, armY - 3);

    ctx.restore();
  }
}

function renderLeafFist(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = '#4b5320';
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(angle) * 3, cy + Math.sin(angle) * 3, 4.5, 3, angle, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class Husk extends Zombie {
  private static readonly HP = GAME_CONFIG.zombies.husk.hp;
  private static readonly SPEED = GAME_CONFIG.zombies.husk.speed;
  private static readonly ATTACK_POWER = GAME_CONFIG.zombies.husk.attackPower;
  private static readonly WIDTH = 50;
  private static readonly HEIGHT = 70;

  constructor(x: number, y: number, row: number) {
    super(x, y, Husk.WIDTH, Husk.HEIGHT, Husk.HP, Husk.SPEED, Husk.ATTACK_POWER, row);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.renderBody(ctx);
    this.renderSlowTint(ctx);
    this.renderHypnoTint(ctx);
  }
}

/** Shared base for Husks that carry natural headgear absorbing damage before health. */
export abstract class ArmoredZombie extends Zombie {
  armorHp: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    hp: number,
    speed: number,
    attackPower: number,
    row: number,
    armorHp: number,
  ) {
    super(x, y, width, height, hp, speed, attackPower, row);
    this.armorHp = armorHp;
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
}

export class PodHeadHusk extends ArmoredZombie {
  private static readonly HP = GAME_CONFIG.zombies.podhead.hp;
  private static readonly SPEED = GAME_CONFIG.zombies.podhead.speed;
  private static readonly ATTACK_POWER = GAME_CONFIG.zombies.podhead.attackPower;
  private static readonly WIDTH = 50;
  private static readonly HEIGHT = 70;
  private static readonly ARMOR_HP = GAME_CONFIG.zombies.podhead.armorHp;

  constructor(x: number, y: number, row: number) {
    super(
      x,
      y,
      PodHeadHusk.WIDTH,
      PodHeadHusk.HEIGHT,
      PodHeadHusk.HP,
      PodHeadHusk.SPEED,
      PodHeadHusk.ATTACK_POWER,
      row,
      PodHeadHusk.ARMOR_HP,
    );
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.renderBody(ctx);
    this.renderSlowTint(ctx);
    this.renderHypnoTint(ctx);

    if (this.armorHp > 0) {
      ctx.save();
      const headCx = this.x + this.width / 2;
      const headTopY = this.y + this.height * 0.15 - this.width * 0.35;
      const podTop = headTopY - 20;
      const podBottom = headTopY + 4;

      const podGradient = ctx.createLinearGradient(headCx - 15, podTop, headCx + 15, podBottom);
      podGradient.addColorStop(0, '#a1887f');
      podGradient.addColorStop(0.5, '#795548');
      podGradient.addColorStop(1, '#4e342e');
      ctx.fillStyle = podGradient;
      ctx.beginPath();
      ctx.ellipse(headCx, (podTop + podBottom) / 2, 15, (podBottom - podTop) / 2 + 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 2;
      ctx.stroke();

      // seam lines across the seed pod
      ctx.strokeStyle = 'rgba(62, 39, 35, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(headCx - 12, podTop + 6);
      ctx.lineTo(headCx + 12, podTop + 6);
      ctx.moveTo(headCx - 13, podTop + 14);
      ctx.lineTo(headCx + 13, podTop + 14);
      ctx.stroke();

      // dried stem nub on top
      ctx.strokeStyle = '#4e342e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headCx, podTop - 1);
      ctx.lineTo(headCx + 3, podTop - 8);
      ctx.stroke();

      ctx.restore();
    }
  }
}

export class StumpHusk extends ArmoredZombie {
  private static readonly HP = GAME_CONFIG.zombies.stumphusk.hp;
  private static readonly SPEED = GAME_CONFIG.zombies.stumphusk.speed;
  private static readonly ATTACK_POWER = GAME_CONFIG.zombies.stumphusk.attackPower;
  private static readonly WIDTH = 50;
  private static readonly HEIGHT = 70;
  private static readonly ARMOR_HP = GAME_CONFIG.zombies.stumphusk.armorHp;

  constructor(x: number, y: number, row: number) {
    super(
      x,
      y,
      StumpHusk.WIDTH,
      StumpHusk.HEIGHT,
      StumpHusk.HP,
      StumpHusk.SPEED,
      StumpHusk.ATTACK_POWER,
      row,
      StumpHusk.ARMOR_HP,
    );
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.renderBody(ctx);
    this.renderSlowTint(ctx);
    this.renderHypnoTint(ctx);

    if (this.armorHp > 0) {
      ctx.save();
      const headCx = this.x + this.width / 2;
      const headTopY = this.y + this.height * 0.15 - this.width * 0.35;
      const stumpTop = headTopY - 20;
      const stumpBottom = headTopY + 4;
      const stumpHalfWidth = 17;

      const stumpGradient = ctx.createLinearGradient(headCx - stumpHalfWidth, stumpTop, headCx + stumpHalfWidth, stumpBottom);
      stumpGradient.addColorStop(0, '#a1887f');
      stumpGradient.addColorStop(0.5, '#795548');
      stumpGradient.addColorStop(1, '#4e342e');
      ctx.fillStyle = stumpGradient;
      ctx.beginPath();
      ctx.moveTo(headCx - stumpHalfWidth * 0.85, stumpTop);
      ctx.lineTo(headCx + stumpHalfWidth * 0.85, stumpTop);
      ctx.lineTo(headCx + stumpHalfWidth, stumpBottom);
      ctx.lineTo(headCx - stumpHalfWidth, stumpBottom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 2;
      ctx.stroke();

      // wood-ring top + bark texture lines
      ctx.strokeStyle = 'rgba(62, 39, 35, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(headCx, stumpTop, stumpHalfWidth * 0.95, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(headCx, stumpTop, stumpHalfWidth * 0.6, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(headCx - stumpHalfWidth * 0.6, stumpTop + 6);
      ctx.lineTo(headCx - stumpHalfWidth * 0.6, stumpBottom - 4);
      ctx.stroke();

      ctx.restore();
    }
  }
}

const ZOMBIE_FACTORIES: Record<ZombieType, (x: number, y: number, row: number) => Zombie> = {
  husk: (x, y, row) => new Husk(x, y, row),
  podhead: (x, y, row) => new PodHeadHusk(x, y, row),
  stumphusk: (x, y, row) => new StumpHusk(x, y, row),
};

export function createZombie(type: ZombieType, x: number, y: number, row: number): Zombie {
  return ZOMBIE_FACTORIES[type](x, y, row);
}

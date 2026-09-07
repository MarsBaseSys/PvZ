import { Seed } from '../objects/Seed';
import {
  Blastcap,
  Dreamspore,
  Emberroot,
  Plant,
  PLANT_COSTS,
  PLANT_LABELS,
  PLANT_NAMES_EN,
  renderPlantIcon,
  type PlantContext,
  type PlantType,
} from '../objects/Plant';
import { RewardCard } from '../objects/RewardCard';
import { Sun } from '../objects/Sun';
import {
  createZombie,
  Husk,
  PodHeadHusk,
  StumpHusk,
  Zombie,
  ZOMBIE_LABELS,
  ZOMBIE_NAMES_EN,
  type ZombieType,
} from '../objects/Zombie';
import { LevelManager } from './LevelManager';
import { LEVEL_ORDER, LEVELS } from '../config/levelConfig';
import {
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CELL_SIZE,
  GRID_COLS,
} from '../utils/constants';
import { intersects } from '../utils/math';
import { SoundEngine } from '../utils/SoundEngine';
import { Narrator } from '../utils/Narrator';
import { GAME_CONFIG } from '../config/gameConfig';
import { PLANT_ALMANAC, ZOMBIE_ALMANAC } from '../config/almanac';

interface ZombieAttackState {
  target: Plant;
  timer: number;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  LEVEL_CLEARED = 'LEVEL_CLEARED',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  ALMANAC = 'ALMANAC',
}

interface ButtonRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function hitsButton(x: number, y: number, rect: ButtonRect): boolean {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

// Single button rect shared by every settlement overlay (restart / next-level) — only one is ever shown at a time.
const MODAL_BUTTON: ButtonRect = {
  width: 220,
  height: 56,
  x: CANVAS_WIDTH / 2 - 110,
  y: CANVAS_HEIGHT / 2 + 40,
};

const ALMANAC_BUTTON: ButtonRect = { x: CANVAS_WIDTH - 102, y: 34, width: 90, height: 32 };
const ALMANAC_CLOSE_BUTTON: ButtonRect = { x: CANVAS_WIDTH / 2 - 90, y: CANVAS_HEIGHT - 70, width: 180, height: 48 };

// 3x3 level-select grid; render and click hit-testing both read from this so they can't drift apart.
const LEVEL_SELECT_COLS = 3;
const LEVEL_SELECT_BUTTON_WIDTH = 220;
const LEVEL_SELECT_BUTTON_HEIGHT = 120;
const LEVEL_SELECT_GAP_X = 30;
const LEVEL_SELECT_GAP_Y = 24;
const LEVEL_SELECT_GRID_TOP = 130;
const LEVEL_SELECT_MARGIN_X =
  (CANVAS_WIDTH - (LEVEL_SELECT_COLS * LEVEL_SELECT_BUTTON_WIDTH + (LEVEL_SELECT_COLS - 1) * LEVEL_SELECT_GAP_X)) / 2;

const LEVEL_SELECT_BUTTONS: Array<{ id: string; rect: ButtonRect }> = LEVEL_ORDER.map((id, index) => {
  const col = index % LEVEL_SELECT_COLS;
  const row = Math.floor(index / LEVEL_SELECT_COLS);
  return {
    id,
    rect: {
      x: LEVEL_SELECT_MARGIN_X + col * (LEVEL_SELECT_BUTTON_WIDTH + LEVEL_SELECT_GAP_X),
      y: LEVEL_SELECT_GRID_TOP + row * (LEVEL_SELECT_BUTTON_HEIGHT + LEVEL_SELECT_GAP_Y),
      width: LEVEL_SELECT_BUTTON_WIDTH,
      height: LEVEL_SELECT_BUTTON_HEIGHT,
    },
  };
});

const FINAL_WAVE_BANNER_DURATION = 3.5;

const ALMANAC_PLANT_TYPES: PlantType[] = [
  'moonbud',
  'thornsnap',
  'barkbulwark',
  'frostlily',
  'twinfang',
  'blastcap',
  'emberroot',
  'dreamspore',
  'glacierbloom',
];
const ALMANAC_ZOMBIE_TYPES: ZombieType[] = ['husk', 'podhead', 'stumphusk'];

export abstract class GameEngine {
  protected readonly ctx: CanvasRenderingContext2D;

  protected plants: Plant[] = [];
  protected zombies: Zombie[] = [];
  protected seeds: Seed[] = [];
  protected suns: Sun[] = [];
  protected rewardCard: RewardCard | null = null;

  protected state: GameState = GameState.MENU;

  protected readonly levelManager = new LevelManager();

  private readonly zombieAttacks = new Map<Zombie, ZombieAttackState>();
  private readonly zombieDuels = new Map<Zombie, { target: Zombie; timer: number }>();
  private static readonly ZOMBIE_ATTACK_INTERVAL = GAME_CONFIG.combat.zombieAttackInterval;

  private static readonly FROST_SLOW_FACTOR = GAME_CONFIG.plants.frostlily.slowFactor;
  private static readonly FROST_SLOW_DURATION = GAME_CONFIG.plants.frostlily.slowDuration;

  private static readonly BLASTCAP_DAMAGE = GAME_CONFIG.plants.blastcap.damage;
  private static readonly BLASTCAP_RADIUS_PX =
    GAME_CONFIG.plants.blastcap.radiusCells * CELL_SIZE + CELL_SIZE / 2;

  private naturalSunTimer = 0;
  private static readonly NATURAL_SUN_INTERVAL = GAME_CONFIG.economy.naturalSunInterval;

  private rewardClaimed = false;

  private announcedFinalWave = false;
  private finalWaveBannerTimer = 0;

  private lastTime = 0;
  private rafId: number | null = null;

  private readonly sound = new SoundEngine();
  protected readonly narrator = new Narrator();

  constructor(protected readonly canvas: HTMLCanvasElement) {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to acquire 2D rendering context');
    }
    this.ctx = ctx;
  }

  start(): void {
    this.lastTime = performance.now();
    this.sound.playBGM();
    this.narrator.narrateWelcome();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  protected addPlant(plant: Plant): void {
    this.plants.push(plant);
    this.sound.playPlant();

    if (plant instanceof Blastcap) {
      this.detonateBlastcap(plant);
    }
  }

  private detonateBlastcap(bomb: Blastcap): void {
    for (const zombie of this.zombies) {
      if (!zombie.active || zombie.hypnotized) continue;
      if (Math.abs(zombie.row - bomb.row) > 1) continue;
      if (Math.abs(zombie.x - bomb.x) > GameEngine.BLASTCAP_RADIUS_PX) continue;
      zombie.takeDamage(GameEngine.BLASTCAP_DAMAGE);
    }
    this.sound.playExplode();
  }

  protected addZombie(zombie: Zombie): void {
    this.zombies.push(zombie);
  }

  protected addSeed(seed: Seed): void {
    this.seeds.push(seed);
    this.sound.playShoot();
  }

  protected addSun(sun: Sun): void {
    this.suns.push(sun);
  }

  protected collectSunAt(x: number, y: number): number | null {
    for (const sun of this.suns) {
      if (sun.active && sun.containsPoint(x, y)) {
        sun.active = false;
        this.sound.playSunCollect();
        this.narrator.narrateSunCollected();
        return sun.value;
      }
    }
    return null;
  }

  protected collectRewardCardAt(x: number, y: number): PlantType | null {
    if (this.rewardCard?.active && this.rewardCard.containsPoint(x, y)) {
      this.rewardCard.active = false;
      this.sound.playVictory();
      this.rewardClaimed = true;

      const plantType = this.rewardCard.plantType;
      this.narrator.narrateReward(plantType);
      this.resolveLevelEnd();
      return plantType;
    }
    return null;
  }

  /**
   * Decides what happens once a level's zombies are cleared (and any reward
   * claimed): move on to the next level's settlement screen, or — if this
   * was the last level — show the final victory screen. Depends only on
   * whether a next level exists, not on whether this level handed out a
   * reward (the last level has neither).
   */
  private resolveLevelEnd(): void {
    this.state = this.levelManager.currentLevel.nextLevelId
      ? GameState.LEVEL_COMPLETE
      : GameState.VICTORY;
  }

  protected startLevel(levelId: string): void {
    this.plants = [];
    this.zombies = [];
    this.seeds = [];
    this.suns = [];
    this.rewardCard = null;
    this.zombieAttacks.clear();
    this.zombieDuels.clear();
    this.naturalSunTimer = 0;
    this.rewardClaimed = false;
    this.announcedFinalWave = false;
    this.finalWaveBannerTimer = 0;
    this.levelManager.loadLevel(levelId);
    this.state = GameState.PLAYING;
  }

  protected handleGlobalClick(x: number, y: number): boolean {
    if (this.state === GameState.PLAYING && hitsButton(x, y, ALMANAC_BUTTON)) {
      this.state = GameState.ALMANAC;
      return true;
    }

    if (this.state === GameState.ALMANAC) {
      if (hitsButton(x, y, ALMANAC_CLOSE_BUTTON)) {
        this.state = GameState.PLAYING;
      }
      return true;
    }

    if (this.state === GameState.MENU) {
      const picked = LEVEL_SELECT_BUTTONS.find((btn) => hitsButton(x, y, btn.rect));
      if (picked) {
        this.startLevel(picked.id);
      }
      return true;
    }

    if (this.state === GameState.PLAYING || this.state === GameState.LEVEL_CLEARED) {
      return false;
    }

    if (this.state === GameState.LEVEL_COMPLETE && hitsButton(x, y, MODAL_BUTTON)) {
      const nextLevelId = this.levelManager.currentLevel.nextLevelId;
      if (nextLevelId) {
        this.startLevel(nextLevelId);
      }
      return true;
    }

    if ((this.state === GameState.GAME_OVER || this.state === GameState.VICTORY) && hitsButton(x, y, MODAL_BUTTON)) {
      this.startLevel(this.levelManager.currentLevel.id);
    }
    return true;
  }

  private tick = (time: number): void => {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    if (this.state === GameState.PLAYING) {
      this.update(dt);
      this.simulate(dt);
    }
    this.draw();
    this.renderEntities();
    this.renderOverlay();

    this.rafId = requestAnimationFrame(this.tick);
  };

  private simulate(dt: number): void {
    this.handleZombieMovementAndAttacks(dt);
    this.handleSeedMovementAndCollisions(dt);
    this.handlePlantProduction(dt);
    this.handleSunFalling(dt);
    this.handleNaturalSunSpawn(dt);
    this.handleWaveSpawns(dt);
    this.checkFinalWaveAnnouncement(dt);
    this.removeEscapedHypnotizedZombies();
    this.cleanupInactive();
    this.checkGameOverConditions();
  }

  // Hypnotized zombies walk back toward the spawn edge and simply leave the field once they reach it.
  private removeEscapedHypnotizedZombies(): void {
    for (const zombie of this.zombies) {
      if (zombie.hypnotized && zombie.x > CANVAS_WIDTH) {
        zombie.active = false;
      }
    }
  }

  // Fires once per level, the instant the final wave's WAVE_ACTIVE phase begins
  // (waveNumber only reaches totalWaves right as that phase starts).
  private checkFinalWaveAnnouncement(dt: number): void {
    if (this.finalWaveBannerTimer > 0) {
      this.finalWaveBannerTimer -= dt;
    }

    if (
      !this.announcedFinalWave &&
      this.levelManager.totalWaves > 1 &&
      this.levelManager.waveNumber === this.levelManager.totalWaves
    ) {
      this.announcedFinalWave = true;
      this.finalWaveBannerTimer = FINAL_WAVE_BANNER_DURATION;
      this.narrator.narrateFinalWave();
    }
  }

  private handleZombieMovementAndAttacks(dt: number): void {
    for (const zombie of this.zombies) {
      if (!zombie.active) continue;

      // A hypnotized zombie walking back through the crowd fights the first regular
      // zombie it meets in its row (and vice versa) instead of attacking plants.
      const opponent = this.findZombieOpponent(zombie);
      if (opponent) {
        this.zombieAttacks.delete(zombie);
        zombie.setAttacking(true);
        zombie.tickAttackAnimation(dt);
        this.resolveZombieDuel(zombie, opponent, dt);
        continue;
      }
      this.zombieDuels.delete(zombie);

      if (zombie.hypnotized) {
        zombie.setAttacking(false);
        zombie.update(dt);
        continue;
      }

      const attackState = this.zombieAttacks.get(zombie);
      if (attackState) {
        if (!attackState.target.active || !intersects(zombie.bounds, attackState.target.bounds)) {
          this.zombieAttacks.delete(zombie);
          zombie.setAttacking(false);
        } else {
          zombie.setAttacking(true);
          zombie.tickAttackAnimation(dt);
          attackState.timer -= dt;
          if (attackState.timer <= 0) {
            attackState.target.takeDamage(zombie.attackPower * GameEngine.ZOMBIE_ATTACK_INTERVAL);
            attackState.timer = GameEngine.ZOMBIE_ATTACK_INTERVAL;
            // A Dreamspore that dies to this bite hypnotizes its attacker instead of just vanishing.
            if (!attackState.target.active && attackState.target instanceof Dreamspore) {
              zombie.hypnotize();
              this.zombieAttacks.delete(zombie);
            }
          }
          continue;
        }
      }

      const blockingPlant = this.plants.find(
        (plant) => plant.active && intersects(zombie.bounds, plant.bounds),
      );
      if (blockingPlant) {
        this.zombieAttacks.set(zombie, {
          target: blockingPlant,
          timer: GameEngine.ZOMBIE_ATTACK_INTERVAL,
        });
        zombie.setAttacking(true);
        zombie.tickAttackAnimation(dt);
        continue;
      }

      zombie.setAttacking(false);
      zombie.update(dt);
    }
  }

  private findZombieOpponent(zombie: Zombie): Zombie | null {
    return (
      this.zombies.find(
        (other) =>
          other !== zombie &&
          other.active &&
          other.row === zombie.row &&
          other.hypnotized !== zombie.hypnotized &&
          intersects(zombie.bounds, other.bounds),
      ) ?? null
    );
  }

  private resolveZombieDuel(zombie: Zombie, opponent: Zombie, dt: number): void {
    const state = this.zombieDuels.get(zombie);
    if (state && state.target === opponent) {
      state.timer -= dt;
      if (state.timer <= 0) {
        opponent.takeDamage(zombie.attackPower * GameEngine.ZOMBIE_ATTACK_INTERVAL);
        state.timer = GameEngine.ZOMBIE_ATTACK_INTERVAL;
      }
      return;
    }
    this.zombieDuels.set(zombie, { target: opponent, timer: GameEngine.ZOMBIE_ATTACK_INTERVAL });
  }

  private handleSeedMovementAndCollisions(dt: number): void {
    for (const seed of this.seeds) {
      if (!seed.active) continue;
      seed.update(dt);

      if (!seed.ignited) {
        const ember = this.plants.find(
          (plant) =>
            plant.active &&
            plant instanceof Emberroot &&
            plant.row === seed.row &&
            intersects(seed.bounds, plant.bounds),
        );
        if (ember) {
          seed.ignited = true;
          seed.damage *= 2;
        }
      }

      for (const zombie of this.zombies) {
        if (!zombie.active || zombie.hypnotized || zombie.row !== seed.row) continue;
        if (intersects(seed.bounds, zombie.bounds)) {
          zombie.takeDamage(seed.damage);
          if (seed.slows && !seed.ignited) {
            zombie.applySlow(GameEngine.FROST_SLOW_DURATION, GameEngine.FROST_SLOW_FACTOR);
          }
          seed.active = false;
          this.sound.playSplat();
          break;
        }
      }
    }
  }

  private handlePlantProduction(dt: number): void {
    const context: PlantContext = {
      zombieAheadInRow: (row, x) =>
        this.zombies.some(
          (zombie) => zombie.active && !zombie.hypnotized && zombie.row === row && zombie.x >= x,
        ),
    };

    for (const plant of this.plants) {
      if (!plant.active) continue;

      const produced = plant.produce(dt, context);
      if (produced instanceof Sun) {
        this.addSun(produced);
      } else if (produced instanceof Seed) {
        this.addSeed(produced);
      }
    }
  }

  private handleSunFalling(dt: number): void {
    for (const sun of this.suns) {
      if (sun.active) {
        sun.update(dt);
      }
    }
  }

  private handleNaturalSunSpawn(dt: number): void {
    this.naturalSunTimer += dt;
    if (this.naturalSunTimer >= GameEngine.NATURAL_SUN_INTERVAL) {
      this.naturalSunTimer -= GameEngine.NATURAL_SUN_INTERVAL;

      const activeRows = this.levelManager.currentLevel.activeRows;
      const row = activeRows[Math.floor(Math.random() * activeRows.length)];
      const col = Math.floor(Math.random() * GRID_COLS);
      const sunSize = 40;
      const x = BOARD_OFFSET_X + col * CELL_SIZE + (CELL_SIZE - sunSize) / 2;
      const targetY = BOARD_OFFSET_Y + row * CELL_SIZE + (CELL_SIZE - sunSize) / 2;
      this.addSun(new Sun(x, BOARD_OFFSET_Y - 40, targetY));
    }
  }

  private handleWaveSpawns(dt: number): void {
    const aliveZombieCount = this.zombies.filter((zombie) => zombie.active).length;
    const spawns = this.levelManager.update(dt, aliveZombieCount);

    for (const spawn of spawns) {
      const zombieHeight = 70;
      const rowCenterY = BOARD_OFFSET_Y + spawn.row * CELL_SIZE + CELL_SIZE / 2;
      const spawnY = rowCenterY - zombieHeight / 2;
      this.addZombie(createZombie(spawn.type, CANVAS_WIDTH, spawnY, spawn.row));
      this.narrator.narrateZombieSpawned(spawn.type);
    }
  }

  private checkGameOverConditions(): void {
    const breached = this.zombies.some((zombie) => zombie.active && zombie.x < BOARD_OFFSET_X);
    if (breached) {
      this.state = GameState.GAME_OVER;
      this.sound.playExplode();
      return;
    }

    if (
      this.state === GameState.PLAYING &&
      !this.rewardClaimed &&
      this.levelManager.isLevelComplete() &&
      this.zombies.length === 0
    ) {
      const rewardPlant = this.levelManager.currentLevel.rewardPlant;
      if (rewardPlant) {
        const activeRows = this.levelManager.currentLevel.activeRows;
        const centerRow = activeRows[Math.floor(activeRows.length / 2)];
        const centerX = BOARD_OFFSET_X + (GRID_COLS * CELL_SIZE) / 2;
        const centerY = BOARD_OFFSET_Y + centerRow * CELL_SIZE + CELL_SIZE / 2;
        this.rewardCard = new RewardCard(rewardPlant, centerX, centerY);
        this.state = GameState.LEVEL_CLEARED;
      } else {
        this.resolveLevelEnd();
      }
    }
  }

  private cleanupInactive(): void {
    this.plants = this.plants.filter((plant) => plant.active);
    this.zombies = this.zombies.filter((zombie) => zombie.active);
    this.seeds = this.seeds.filter((seed) => seed.active);
    this.suns = this.suns.filter((sun) => sun.active);

    for (const [zombie, state] of this.zombieAttacks) {
      if (!zombie.active || !state.target.active) {
        this.zombieAttacks.delete(zombie);
      }
    }
    for (const [zombie, state] of this.zombieDuels) {
      if (!zombie.active || !state.target.active) {
        this.zombieDuels.delete(zombie);
      }
    }
  }

  private renderEntities(): void {
    for (const plant of this.plants) {
      plant.render(this.ctx);
    }
    for (const zombie of this.zombies) {
      zombie.render(this.ctx);
    }
    for (const seed of this.seeds) {
      seed.render(this.ctx);
    }
    for (const sun of this.suns) {
      sun.render(this.ctx);
    }
    if (this.rewardCard?.active) {
      this.rewardCard.render(this.ctx);
    }
  }

  private renderOverlay(): void {
    if (this.state === GameState.ALMANAC) {
      this.renderAlmanacOverlay();
      return;
    }

    if (this.state === GameState.MENU) {
      this.renderLevelSelectOverlay();
      return;
    }

    if (this.state === GameState.PLAYING) {
      this.renderPlayingHud();
      return;
    }

    if (this.state === GameState.LEVEL_COMPLETE) {
      this.renderLevelCompleteOverlay();
      return;
    }

    if (this.state !== GameState.GAME_OVER && this.state !== GameState.VICTORY) {
      return;
    }

    this.ctx.save();

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 48px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    const title = this.state === GameState.GAME_OVER ? '游戏结束' : '恭喜通关！';
    this.ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

    this.ctx.fillStyle = '#43a047';
    this.ctx.fillRect(MODAL_BUTTON.x, MODAL_BUTTON.y, MODAL_BUTTON.width, MODAL_BUTTON.height);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px sans-serif';
    this.ctx.fillText(
      '重新开始 (Restart)',
      MODAL_BUTTON.x + MODAL_BUTTON.width / 2,
      MODAL_BUTTON.y + MODAL_BUTTON.height / 2,
    );

    this.ctx.restore();
  }

  private renderPlayingHud(): void {
    this.ctx.save();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'alphabetic';
    this.ctx.fillText(`Level ${this.levelManager.currentLevel.id}`, CANVAS_WIDTH - 12, 24);
    this.ctx.textAlign = 'left';

    this.ctx.fillStyle = '#fff8e1';
    this.ctx.fillRect(ALMANAC_BUTTON.x, ALMANAC_BUTTON.y, ALMANAC_BUTTON.width, ALMANAC_BUTTON.height);
    this.ctx.strokeStyle = '#4e342e';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(ALMANAC_BUTTON.x, ALMANAC_BUTTON.y, ALMANAC_BUTTON.width, ALMANAC_BUTTON.height);
    this.ctx.fillStyle = '#212121';
    this.ctx.font = 'bold 15px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      '📖 图鉴',
      ALMANAC_BUTTON.x + ALMANAC_BUTTON.width / 2,
      ALMANAC_BUTTON.y + ALMANAC_BUTTON.height / 2,
    );

    this.ctx.restore();

    if (this.finalWaveBannerTimer > 0) {
      this.renderFinalWaveBanner();
    }
  }

  private renderFinalWaveBanner(): void {
    this.ctx.save();

    const bannerY = BOARD_OFFSET_Y - 46;
    const alpha = Math.min(1, this.finalWaveBannerTimer);
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = 'rgba(198, 40, 40, 0.85)';
    this.ctx.fillRect(CANVAS_WIDTH / 2 - 180, bannerY - 20, 360, 36);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('⚠ 最后一波僵尸来袭！', CANVAS_WIDTH / 2, bannerY - 2);

    this.ctx.restore();
  }

  private renderLevelSelectOverlay(): void {
    this.ctx.save();

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 32px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'alphabetic';
    this.ctx.fillText('选择关卡 Select Level', CANVAS_WIDTH / 2, 70);

    this.ctx.font = '14px sans-serif';
    this.ctx.fillStyle = '#cfd8dc';
    this.ctx.fillText('点击任意关卡直接开始', CANVAS_WIDTH / 2, 96);

    for (const { id, rect } of LEVEL_SELECT_BUTTONS) {
      const level = LEVELS[id];
      const subtitle = level.rewardPlant ? `解锁：${PLANT_LABELS[level.rewardPlant]}` : '进阶挑战关';

      this.ctx.fillStyle = '#43a047';
      this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      this.ctx.strokeStyle = '#1b5e20';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 24px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(`Level ${id}`, rect.x + rect.width / 2, rect.y + rect.height / 2 - 14);

      this.ctx.font = '14px sans-serif';
      this.ctx.fillText(subtitle, rect.x + rect.width / 2, rect.y + rect.height / 2 + 18);
    }

    this.ctx.restore();
  }

  private renderAlmanacOverlay(): void {
    this.ctx.save();

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 26px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'alphabetic';
    this.ctx.fillText('图鉴 Almanac', CANVAS_WIDTH / 2, 44);

    const cols = 3;
    const marginX = 60;
    const cellWidth = (CANVAS_WIDTH - marginX * 2) / cols;
    const rowHeight = 72;

    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#fdd835';
    this.ctx.font = 'bold 16px sans-serif';
    this.ctx.fillText('植物', marginX, 78);

    const plantGridTop = 92;
    ALMANAC_PLANT_TYPES.forEach((type, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const cellX = marginX + col * cellWidth;
      const cellY = plantGridTop + row * rowHeight;
      const iconCx = cellX + 32;
      const iconCy = cellY + 32;

      renderPlantIcon(this.ctx, type, iconCx, iconCy, 24);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 14px sans-serif';
      this.ctx.fillText(`${PLANT_LABELS[type]} ${PLANT_NAMES_EN[type]}`, cellX + 64, cellY + 18);

      this.ctx.fillStyle = '#fdd835';
      this.ctx.font = '12px sans-serif';
      this.ctx.fillText(`费用 ${PLANT_COSTS[type]}`, cellX + 64, cellY + 36);

      this.ctx.fillStyle = '#e0e0e0';
      this.ctx.font = '12px sans-serif';
      this.ctx.fillText(PLANT_ALMANAC[type].description, cellX + 64, cellY + 54);
    });

    const zombieLabelY = plantGridTop + Math.ceil(ALMANAC_PLANT_TYPES.length / cols) * rowHeight + 16;
    this.ctx.fillStyle = '#ef5350';
    this.ctx.font = 'bold 16px sans-serif';
    this.ctx.fillText('僵尸', marginX, zombieLabelY);

    const zombieGridTop = zombieLabelY + 14;
    ALMANAC_ZOMBIE_TYPES.forEach((type, index) => {
      const cellX = marginX + index * cellWidth;
      const cellCenterX = cellX + cellWidth / 2;

      const zombie =
        type === 'husk'
          ? new Husk(0, 0, 0)
          : type === 'podhead'
            ? new PodHeadHusk(0, 0, 0)
            : new StumpHusk(0, 0, 0);
      zombie.x = cellCenterX - zombie.width / 2;
      zombie.y = zombieGridTop;
      zombie.render(this.ctx);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 14px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${ZOMBIE_LABELS[type]} ${ZOMBIE_NAMES_EN[type]}`, cellCenterX, zombieGridTop + 90);

      this.ctx.fillStyle = '#e0e0e0';
      this.ctx.font = '12px sans-serif';
      this.ctx.fillText(ZOMBIE_ALMANAC[type].description, cellCenterX, zombieGridTop + 108);
      this.ctx.textAlign = 'left';
    });

    this.ctx.fillStyle = '#607d8b';
    this.ctx.fillRect(ALMANAC_CLOSE_BUTTON.x, ALMANAC_CLOSE_BUTTON.y, ALMANAC_CLOSE_BUTTON.width, ALMANAC_CLOSE_BUTTON.height);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 18px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      '关闭 (Close)',
      ALMANAC_CLOSE_BUTTON.x + ALMANAC_CLOSE_BUTTON.width / 2,
      ALMANAC_CLOSE_BUTTON.y + ALMANAC_CLOSE_BUTTON.height / 2,
    );

    this.ctx.restore();
  }

  // Reached via resolveLevelEnd() whenever the just-cleared level has a nextLevelId.
  private renderLevelCompleteOverlay(): void {
    const level = this.levelManager.currentLevel;
    const message = level.rewardPlant
      ? `你获得了${PLANT_LABELS[level.rewardPlant]}！准备进入 Level ${level.nextLevelId}`
      : `你胜利了！准备进入 Level ${level.nextLevelId}`;

    this.ctx.save();

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 34px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

    this.ctx.fillStyle = '#fdd835';
    this.ctx.fillRect(
      MODAL_BUTTON.x,
      MODAL_BUTTON.y,
      MODAL_BUTTON.width,
      MODAL_BUTTON.height,
    );

    this.ctx.fillStyle = '#212121';
    this.ctx.font = 'bold 20px sans-serif';
    this.ctx.fillText(
      '下一关',
      MODAL_BUTTON.x + MODAL_BUTTON.width / 2,
      MODAL_BUTTON.y + MODAL_BUTTON.height / 2,
    );

    this.ctx.restore();
  }

  protected abstract update(dt: number): void;
  protected abstract draw(): void;
}

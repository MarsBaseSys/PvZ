import { Pea } from '../objects/Pea';
import { Plant, type PlantContext, type PlantType } from '../objects/Plant';
import { RewardCard } from '../objects/RewardCard';
import { Sun } from '../objects/Sun';
import { createZombie, Zombie } from '../objects/Zombie';
import { LevelManager } from './LevelManager';
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
}

// Single button rect shared by every settlement overlay (restart / next-level) — only one is ever shown at a time.
const MODAL_BUTTON = {
  width: 220,
  height: 56,
  x: CANVAS_WIDTH / 2 - 110,
  y: CANVAS_HEIGHT / 2 + 40,
};

const PLANT_LABELS: Record<PlantType, string> = {
  sunflower: '向日葵',
  peashooter: '豌豆射手',
  wallnut: '坚果墙',
};

export abstract class GameEngine {
  protected readonly ctx: CanvasRenderingContext2D;

  protected plants: Plant[] = [];
  protected zombies: Zombie[] = [];
  protected peas: Pea[] = [];
  protected suns: Sun[] = [];
  protected rewardCard: RewardCard | null = null;

  protected state: GameState = GameState.MENU;

  protected readonly levelManager = new LevelManager();

  private readonly zombieAttacks = new Map<Zombie, ZombieAttackState>();
  private static readonly ZOMBIE_ATTACK_INTERVAL = GAME_CONFIG.combat.zombieAttackInterval;

  private naturalSunTimer = 0;
  private static readonly NATURAL_SUN_INTERVAL = GAME_CONFIG.economy.naturalSunInterval;

  private rewardClaimed = false;

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
    this.startLevel('1-1');
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
  }

  protected addZombie(zombie: Zombie): void {
    this.zombies.push(zombie);
  }

  protected addPea(pea: Pea): void {
    this.peas.push(pea);
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
      const nextLevelId = this.levelManager.currentLevel.nextLevelId;
      // With a next level queued up, freeze on a settlement screen; otherwise
      // hand the plant straight to the caller and let play continue.
      this.state = nextLevelId ? GameState.LEVEL_COMPLETE : GameState.PLAYING;
      return plantType;
    }
    return null;
  }

  protected startLevel(levelId: string): void {
    this.plants = [];
    this.zombies = [];
    this.peas = [];
    this.suns = [];
    this.rewardCard = null;
    this.zombieAttacks.clear();
    this.naturalSunTimer = 0;
    this.rewardClaimed = false;
    this.levelManager.loadLevel(levelId);
    this.state = GameState.PLAYING;
  }

  protected handleGlobalClick(x: number, y: number): boolean {
    if (this.state === GameState.PLAYING || this.state === GameState.MENU || this.state === GameState.LEVEL_CLEARED) {
      return false;
    }

    if (
      this.state === GameState.LEVEL_COMPLETE &&
      x >= MODAL_BUTTON.x &&
      x <= MODAL_BUTTON.x + MODAL_BUTTON.width &&
      y >= MODAL_BUTTON.y &&
      y <= MODAL_BUTTON.y + MODAL_BUTTON.height
    ) {
      const nextLevelId = this.levelManager.currentLevel.nextLevelId;
      if (nextLevelId) {
        this.startLevel(nextLevelId);
      }
      return true;
    }

    if (
      (this.state === GameState.GAME_OVER || this.state === GameState.VICTORY) &&
      x >= MODAL_BUTTON.x &&
      x <= MODAL_BUTTON.x + MODAL_BUTTON.width &&
      y >= MODAL_BUTTON.y &&
      y <= MODAL_BUTTON.y + MODAL_BUTTON.height
    ) {
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
    this.handlePeaMovementAndCollisions(dt);
    this.handlePlantProduction(dt);
    this.handleSunFalling(dt);
    this.handleNaturalSunSpawn(dt);
    this.handleWaveSpawns(dt);
    this.cleanupInactive();
    this.checkGameOverConditions();
  }

  private handleZombieMovementAndAttacks(dt: number): void {
    for (const zombie of this.zombies) {
      if (!zombie.active) continue;

      const attackState = this.zombieAttacks.get(zombie);
      if (attackState) {
        if (!attackState.target.active || !intersects(zombie.bounds, attackState.target.bounds)) {
          this.zombieAttacks.delete(zombie);
        } else {
          attackState.timer -= dt;
          if (attackState.timer <= 0) {
            attackState.target.takeDamage(zombie.attackPower * GameEngine.ZOMBIE_ATTACK_INTERVAL);
            attackState.timer = GameEngine.ZOMBIE_ATTACK_INTERVAL;
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
        continue;
      }

      zombie.update(dt);
    }
  }

  private handlePeaMovementAndCollisions(dt: number): void {
    for (const pea of this.peas) {
      if (!pea.active) continue;
      pea.update(dt);

      for (const zombie of this.zombies) {
        if (!zombie.active || zombie.row !== pea.row) continue;
        if (intersects(pea.bounds, zombie.bounds)) {
          zombie.takeDamage(pea.damage);
          pea.active = false;
          this.sound.playSplat();
          break;
        }
      }
    }
  }

  private handlePlantProduction(dt: number): void {
    const context: PlantContext = {
      zombieAheadInRow: (row, x) =>
        this.zombies.some((zombie) => zombie.active && zombie.row === row && zombie.x >= x),
    };

    for (const plant of this.plants) {
      if (!plant.active) continue;

      const produced = plant.produce(dt, context);
      if (produced instanceof Sun) {
        this.addSun(produced);
      } else if (produced instanceof Pea) {
        this.addPea(produced);
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
        this.state = GameState.VICTORY;
      }
    }
  }

  private cleanupInactive(): void {
    this.plants = this.plants.filter((plant) => plant.active);
    this.zombies = this.zombies.filter((zombie) => zombie.active);
    this.peas = this.peas.filter((pea) => pea.active);
    this.suns = this.suns.filter((sun) => sun.active);

    for (const [zombie, state] of this.zombieAttacks) {
      if (!zombie.active || !state.target.active) {
        this.zombieAttacks.delete(zombie);
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
    for (const pea of this.peas) {
      pea.render(this.ctx);
    }
    for (const sun of this.suns) {
      sun.render(this.ctx);
    }
    if (this.rewardCard?.active) {
      this.rewardCard.render(this.ctx);
    }
  }

  private renderOverlay(): void {
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
    const title = this.state === GameState.GAME_OVER ? '游戏结束' : '胜利！';
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

  // Only reachable when the current level has a nextLevelId (see collectRewardCardAt) —
  // levels without one hand the reward straight back to PLAYING instead of freezing here.
  private renderLevelCompleteOverlay(): void {
    const level = this.levelManager.currentLevel;
    const rewardLabel = level.rewardPlant ? PLANT_LABELS[level.rewardPlant] : '';

    this.ctx.save();

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 34px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      `你获得了${rewardLabel}！解锁 Level ${level.nextLevelId}`,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 - 20,
    );

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

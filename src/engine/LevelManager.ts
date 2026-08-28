import { LEVELS, type LevelConfig } from '../config/levelConfig';
import type { ZombieType } from '../objects/Zombie';

export interface ZombieSpawnRequest {
  type: ZombieType;
  row: number;
}

type Phase = 'INTERWAVE' | 'WAVE_ACTIVE' | 'COMPLETE';

export class LevelManager {
  private level: LevelConfig = LEVELS['1-1'];
  private waveIndex = -1;
  private phase: Phase = 'INTERWAVE';
  private phaseTimer = 0;
  private spawnPointer = 0;

  get currentLevel(): LevelConfig {
    return this.level;
  }

  get waveNumber(): number {
    return Math.max(1, Math.min(this.waveIndex + 1, this.level.waves.length));
  }

  get totalWaves(): number {
    return this.level.waves.length;
  }

  loadLevel(id: string): void {
    const level = LEVELS[id];
    if (!level) {
      throw new Error(`Unknown level: ${id}`);
    }
    this.level = level;
    this.waveIndex = -1;
    this.phase = 'INTERWAVE';
    this.phaseTimer = 0;
    this.spawnPointer = 0;
  }

  isRowActive(row: number): boolean {
    return this.level.activeRows.includes(row);
  }

  isLevelComplete(): boolean {
    return this.phase === 'COMPLETE';
  }

  update(dt: number, aliveZombieCount: number): ZombieSpawnRequest[] {
    if (this.phase === 'INTERWAVE') {
      this.phaseTimer += dt;
      const delay = this.waveIndex < 0 ? 0 : this.level.interWaveDelay;
      if (this.phaseTimer >= delay) {
        this.waveIndex++;
        this.phaseTimer = 0;
        this.spawnPointer = 0;
        this.phase = 'WAVE_ACTIVE';
      }
      return [];
    }

    if (this.phase === 'COMPLETE') {
      return [];
    }

    // WAVE_ACTIVE
    const wave = this.level.waves[this.waveIndex];

    // All of this wave's zombies were already dispatched on a previous call —
    // only now is aliveZombieCount guaranteed to reflect them, so the
    // completion check must live here rather than after this call's spawns.
    if (this.spawnPointer >= wave.zombies.length) {
      if (aliveZombieCount === 0) {
        if (this.waveIndex >= this.level.waves.length - 1) {
          this.phase = 'COMPLETE';
        } else {
          this.phase = 'INTERWAVE';
          this.phaseTimer = 0;
        }
      }
      return [];
    }

    this.phaseTimer += dt;
    const spawns: ZombieSpawnRequest[] = [];

    while (this.spawnPointer < wave.zombies.length && wave.zombies[this.spawnPointer].delay <= this.phaseTimer) {
      const { type } = wave.zombies[this.spawnPointer];
      spawns.push({ type, row: this.pickRow() });
      this.spawnPointer++;
    }

    return spawns;
  }

  private pickRow(): number {
    const rows = this.level.activeRows;
    return rows[Math.floor(Math.random() * rows.length)];
  }
}

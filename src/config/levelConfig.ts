import type { PlantType } from '../objects/Plant';
import type { ZombieType } from '../objects/Zombie';

export interface WaveZombieSpawn {
  type: ZombieType;
  delay: number; // seconds after the wave starts
}

export interface WaveConfig {
  zombies: WaveZombieSpawn[];
}

export interface LevelConfig {
  id: string;
  activeRows: number[];
  unlockedPlants: PlantType[];
  waves: WaveConfig[];
  interWaveDelay: number;
  initialSun: number;
  rewardPlant?: PlantType;
  nextLevelId?: string;
}

export const LEVELS: Record<string, LevelConfig> = {
  '1-1': {
    id: '1-1',
    activeRows: [2],
    unlockedPlants: ['peashooter'],
    waves: [
      { zombies: [{ type: 'basic', delay: 0 }] },
      { zombies: [{ type: 'basic', delay: 0 }, { type: 'basic', delay: 3 }] },
      { zombies: [{ type: 'basic', delay: 0 }, { type: 'basic', delay: 2.5 }] },
    ],
    interWaveDelay: 14,
    initialSun: 150,
    rewardPlant: 'sunflower',
  },
};

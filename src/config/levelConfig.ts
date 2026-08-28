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

const ALL_ROWS = [0, 1, 2, 3, 4];

export const LEVELS: Record<string, LevelConfig> = {
  '1-1': {
    id: '1-1',
    activeRows: ALL_ROWS,
    unlockedPlants: ['peashooter'],
    waves: [
      { zombies: [{ type: 'basic', delay: 0 }] },
      { zombies: [{ type: 'basic', delay: 0 }, { type: 'basic', delay: 3 }] },
      { zombies: [{ type: 'basic', delay: 0 }, { type: 'basic', delay: 2.5 }, { type: 'basic', delay: 5 }] },
    ],
    interWaveDelay: 14,
    initialSun: 150,
    rewardPlant: 'sunflower',
    nextLevelId: '1-2',
  },
  '1-2': {
    id: '1-2',
    activeRows: ALL_ROWS,
    unlockedPlants: ['peashooter', 'sunflower'],
    waves: [
      { zombies: [{ type: 'basic', delay: 0 }, { type: 'basic', delay: 2 }] },
      { zombies: [{ type: 'basic', delay: 0 }, { type: 'conehead', delay: 3 }] },
      { zombies: [{ type: 'basic', delay: 0 }, { type: 'basic', delay: 2 }, { type: 'conehead', delay: 4 }, { type: 'conehead', delay: 6 }] },
    ],
    interWaveDelay: 13,
    initialSun: 175,
    rewardPlant: 'wallnut',
    nextLevelId: '1-3',
  },
  '1-3': {
    id: '1-3',
    activeRows: ALL_ROWS,
    unlockedPlants: ['peashooter', 'sunflower', 'wallnut'],
    waves: [
      { zombies: [{ type: 'basic', delay: 0 }, { type: 'basic', delay: 2 }, { type: 'conehead', delay: 4 }] },
      { zombies: [{ type: 'conehead', delay: 0 }, { type: 'conehead', delay: 3 }, { type: 'basic', delay: 5 }] },
      { zombies: [{ type: 'basic', delay: 0 }, { type: 'basic', delay: 1.5 }, { type: 'basic', delay: 3 }, { type: 'conehead', delay: 5 }] },
      { zombies: [{ type: 'conehead', delay: 0 }, { type: 'conehead', delay: 2.5 }, { type: 'basic', delay: 4 }, { type: 'basic', delay: 5.5 }, { type: 'conehead', delay: 7 }] },
    ],
    interWaveDelay: 12,
    initialSun: 200,
    rewardPlant: 'snowpea',
    nextLevelId: '1-4',
  },
  '1-4': {
    id: '1-4',
    activeRows: ALL_ROWS,
    unlockedPlants: ['peashooter', 'sunflower', 'wallnut', 'snowpea'],
    waves: [
      { zombies: [{ type: 'conehead', delay: 0 }, { type: 'conehead', delay: 3 }] },
      { zombies: [{ type: 'buckethead', delay: 0 }, { type: 'basic', delay: 2 }, { type: 'basic', delay: 4 }] },
      { zombies: [{ type: 'conehead', delay: 0 }, { type: 'conehead', delay: 2.5 }, { type: 'buckethead', delay: 5 }] },
      { zombies: [{ type: 'basic', delay: 0 }, { type: 'basic', delay: 1.5 }, { type: 'basic', delay: 3 }, { type: 'conehead', delay: 4.5 }, { type: 'conehead', delay: 6 }, { type: 'buckethead', delay: 7.5 }] },
    ],
    interWaveDelay: 12,
    initialSun: 225,
    rewardPlant: 'repeater',
    nextLevelId: '1-5',
  },
  '1-5': {
    id: '1-5',
    activeRows: ALL_ROWS,
    unlockedPlants: ['peashooter', 'sunflower', 'wallnut', 'snowpea', 'repeater'],
    waves: [
      { zombies: [{ type: 'buckethead', delay: 0 }, { type: 'buckethead', delay: 3 }] },
      { zombies: [{ type: 'conehead', delay: 0 }, { type: 'conehead', delay: 2 }, { type: 'conehead', delay: 4 }, { type: 'buckethead', delay: 6 }] },
      { zombies: [{ type: 'buckethead', delay: 0 }, { type: 'basic', delay: 2 }, { type: 'buckethead', delay: 4 }] },
      { zombies: [{ type: 'conehead', delay: 0 }, { type: 'conehead', delay: 2 }, { type: 'buckethead', delay: 4 }, { type: 'buckethead', delay: 6.5 }] },
      { zombies: [{ type: 'basic', delay: 0 }, { type: 'basic', delay: 1.5 }, { type: 'basic', delay: 3 }, { type: 'basic', delay: 4.5 }, { type: 'conehead', delay: 6 }, { type: 'conehead', delay: 7.5 }, { type: 'buckethead', delay: 9 }] },
    ],
    interWaveDelay: 11,
    initialSun: 250,
    rewardPlant: 'cherrybomb',
    nextLevelId: '1-6',
  },
  '1-6': {
    id: '1-6',
    activeRows: ALL_ROWS,
    unlockedPlants: ['peashooter', 'sunflower', 'wallnut', 'snowpea', 'repeater', 'cherrybomb'],
    waves: [
      { zombies: [{ type: 'conehead', delay: 0 }, { type: 'conehead', delay: 2 }, { type: 'buckethead', delay: 4 }] },
      { zombies: [{ type: 'basic', delay: 0 }, { type: 'basic', delay: 1.5 }, { type: 'basic', delay: 3 }, { type: 'buckethead', delay: 4.5 }, { type: 'buckethead', delay: 7 }] },
      { zombies: [{ type: 'conehead', delay: 0 }, { type: 'conehead', delay: 2 }, { type: 'conehead', delay: 4 }, { type: 'buckethead', delay: 6 }, { type: 'buckethead', delay: 8 }] },
      { zombies: [{ type: 'basic', delay: 0 }, { type: 'basic', delay: 1.5 }, { type: 'basic', delay: 3 }, { type: 'basic', delay: 4.5 }, { type: 'basic', delay: 6 }, { type: 'conehead', delay: 7.5 }, { type: 'conehead', delay: 9 }] },
      { zombies: [{ type: 'buckethead', delay: 0 }, { type: 'buckethead', delay: 2.5 }, { type: 'conehead', delay: 5 }, { type: 'conehead', delay: 7 }] },
      { zombies: [{ type: 'buckethead', delay: 0 }, { type: 'buckethead', delay: 2 }, { type: 'buckethead', delay: 4 }, { type: 'conehead', delay: 6 }, { type: 'conehead', delay: 7.5 }, { type: 'basic', delay: 9 }, { type: 'basic', delay: 10 }, { type: 'basic', delay: 11.5 }] },
    ],
    interWaveDelay: 10,
    initialSun: 275,
  },
};

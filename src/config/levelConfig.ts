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
    unlockedPlants: ['thornsnap'],
    waves: [
      { zombies: [{ type: 'husk', delay: 0 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 3 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 2.5 }, { type: 'husk', delay: 5 }] },
    ],
    interWaveDelay: 14,
    initialSun: 150,
    rewardPlant: 'moonbud',
    nextLevelId: '1-2',
  },
  '1-2': {
    id: '1-2',
    activeRows: ALL_ROWS,
    unlockedPlants: ['thornsnap', 'moonbud'],
    waves: [
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 2 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'podhead', delay: 3 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 2 }, { type: 'podhead', delay: 4 }, { type: 'podhead', delay: 6 }] },
    ],
    interWaveDelay: 13,
    initialSun: 175,
    rewardPlant: 'barkbulwark',
    nextLevelId: '1-3',
  },
  '1-3': {
    id: '1-3',
    activeRows: ALL_ROWS,
    unlockedPlants: ['thornsnap', 'moonbud', 'barkbulwark'],
    waves: [
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 2 }, { type: 'podhead', delay: 4 }] },
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 3 }, { type: 'husk', delay: 5 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 1.5 }, { type: 'husk', delay: 3 }, { type: 'podhead', delay: 5 }] },
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 2.5 }, { type: 'husk', delay: 4 }, { type: 'husk', delay: 5.5 }, { type: 'podhead', delay: 7 }] },
    ],
    interWaveDelay: 12,
    initialSun: 200,
    rewardPlant: 'frostlily',
    nextLevelId: '1-4',
  },
  '1-4': {
    id: '1-4',
    activeRows: ALL_ROWS,
    unlockedPlants: ['thornsnap', 'moonbud', 'barkbulwark', 'frostlily'],
    waves: [
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 3 }] },
      { zombies: [{ type: 'stumphusk', delay: 0 }, { type: 'husk', delay: 2 }, { type: 'husk', delay: 4 }] },
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 2.5 }, { type: 'stumphusk', delay: 5 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 1.5 }, { type: 'husk', delay: 3 }, { type: 'podhead', delay: 4.5 }, { type: 'podhead', delay: 6 }, { type: 'stumphusk', delay: 7.5 }] },
    ],
    interWaveDelay: 12,
    initialSun: 225,
    rewardPlant: 'twinfang',
    nextLevelId: '1-5',
  },
  '1-5': {
    id: '1-5',
    activeRows: ALL_ROWS,
    unlockedPlants: ['thornsnap', 'moonbud', 'barkbulwark', 'frostlily', 'twinfang'],
    waves: [
      { zombies: [{ type: 'stumphusk', delay: 0 }, { type: 'stumphusk', delay: 3 }] },
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 2 }, { type: 'podhead', delay: 4 }, { type: 'stumphusk', delay: 6 }] },
      { zombies: [{ type: 'stumphusk', delay: 0 }, { type: 'husk', delay: 2 }, { type: 'stumphusk', delay: 4 }] },
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 2 }, { type: 'stumphusk', delay: 4 }, { type: 'stumphusk', delay: 6.5 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 1.5 }, { type: 'husk', delay: 3 }, { type: 'husk', delay: 4.5 }, { type: 'podhead', delay: 6 }, { type: 'podhead', delay: 7.5 }, { type: 'stumphusk', delay: 9 }] },
    ],
    interWaveDelay: 11,
    initialSun: 250,
    rewardPlant: 'blastcap',
    nextLevelId: '1-6',
  },
  '1-6': {
    id: '1-6',
    activeRows: ALL_ROWS,
    unlockedPlants: ['thornsnap', 'moonbud', 'barkbulwark', 'frostlily', 'twinfang', 'blastcap'],
    waves: [
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 2 }, { type: 'stumphusk', delay: 4 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 1.5 }, { type: 'husk', delay: 3 }, { type: 'stumphusk', delay: 4.5 }, { type: 'stumphusk', delay: 7 }] },
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 2 }, { type: 'podhead', delay: 4 }, { type: 'stumphusk', delay: 6 }, { type: 'stumphusk', delay: 8 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 1.5 }, { type: 'husk', delay: 3 }, { type: 'husk', delay: 4.5 }, { type: 'husk', delay: 6 }, { type: 'podhead', delay: 7.5 }, { type: 'podhead', delay: 9 }] },
      { zombies: [{ type: 'stumphusk', delay: 0 }, { type: 'stumphusk', delay: 2.5 }, { type: 'podhead', delay: 5 }, { type: 'podhead', delay: 7 }] },
      { zombies: [{ type: 'stumphusk', delay: 0 }, { type: 'stumphusk', delay: 2 }, { type: 'stumphusk', delay: 4 }, { type: 'podhead', delay: 6 }, { type: 'podhead', delay: 7.5 }, { type: 'husk', delay: 9 }, { type: 'husk', delay: 10 }, { type: 'husk', delay: 11.5 }] },
    ],
    interWaveDelay: 10,
    initialSun: 275,
    nextLevelId: '1-7',
  },
  '1-7': {
    id: '1-7',
    activeRows: ALL_ROWS,
    unlockedPlants: ['thornsnap', 'moonbud', 'barkbulwark', 'frostlily', 'twinfang', 'blastcap'],
    waves: [
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 2 }, { type: 'podhead', delay: 4 }, { type: 'stumphusk', delay: 6 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 1.5 }, { type: 'husk', delay: 3 }, { type: 'husk', delay: 4.5 }, { type: 'stumphusk', delay: 6 }, { type: 'stumphusk', delay: 8 }] },
      { zombies: [{ type: 'stumphusk', delay: 0 }, { type: 'stumphusk', delay: 2 }, { type: 'podhead', delay: 4 }, { type: 'podhead', delay: 5.5 }, { type: 'podhead', delay: 7 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 1.5 }, { type: 'husk', delay: 3 }, { type: 'husk', delay: 4.5 }, { type: 'husk', delay: 6 }, { type: 'stumphusk', delay: 7.5 }, { type: 'stumphusk', delay: 9 }] },
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 2 }, { type: 'stumphusk', delay: 4 }, { type: 'stumphusk', delay: 6 }, { type: 'stumphusk', delay: 8 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 1.2 }, { type: 'husk', delay: 2.4 }, { type: 'husk', delay: 3.6 }, { type: 'podhead', delay: 5 }, { type: 'podhead', delay: 6.5 }, { type: 'podhead', delay: 8 }, { type: 'stumphusk', delay: 9.5 }, { type: 'stumphusk', delay: 11 }] },
    ],
    interWaveDelay: 9.5,
    initialSun: 300,
    rewardPlant: 'emberroot',
    nextLevelId: '1-8',
  },
  '1-8': {
    id: '1-8',
    activeRows: ALL_ROWS,
    unlockedPlants: ['thornsnap', 'moonbud', 'barkbulwark', 'frostlily', 'twinfang', 'blastcap', 'emberroot'],
    waves: [
      { zombies: [{ type: 'stumphusk', delay: 0 }, { type: 'stumphusk', delay: 2.5 }, { type: 'podhead', delay: 5 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 1.5 }, { type: 'husk', delay: 3 }, { type: 'podhead', delay: 4.5 }, { type: 'podhead', delay: 6 }, { type: 'stumphusk', delay: 7.5 }] },
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 2 }, { type: 'podhead', delay: 4 }, { type: 'stumphusk', delay: 6 }, { type: 'stumphusk', delay: 8 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 1.2 }, { type: 'husk', delay: 2.4 }, { type: 'husk', delay: 3.6 }, { type: 'husk', delay: 4.8 }, { type: 'stumphusk', delay: 6 }, { type: 'stumphusk', delay: 7.5 }] },
      { zombies: [{ type: 'stumphusk', delay: 0 }, { type: 'stumphusk', delay: 2 }, { type: 'stumphusk', delay: 4 }, { type: 'podhead', delay: 6 }, { type: 'podhead', delay: 7.5 }] },
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 1.5 }, { type: 'podhead', delay: 3 }, { type: 'podhead', delay: 4.5 }, { type: 'stumphusk', delay: 6 }, { type: 'stumphusk', delay: 7.5 }, { type: 'stumphusk', delay: 9 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 1 }, { type: 'husk', delay: 2 }, { type: 'husk', delay: 3 }, { type: 'husk', delay: 4 }, { type: 'podhead', delay: 5.5 }, { type: 'podhead', delay: 7 }, { type: 'podhead', delay: 8.5 }, { type: 'stumphusk', delay: 10 }, { type: 'stumphusk', delay: 11.5 }] },
    ],
    interWaveDelay: 9,
    initialSun: 325,
    rewardPlant: 'dreamspore',
    nextLevelId: '1-9',
  },
  '1-9': {
    id: '1-9',
    activeRows: ALL_ROWS,
    unlockedPlants: ['thornsnap', 'moonbud', 'barkbulwark', 'frostlily', 'twinfang', 'blastcap', 'emberroot', 'dreamspore'],
    waves: [
      { zombies: [{ type: 'stumphusk', delay: 0 }, { type: 'stumphusk', delay: 2 }, { type: 'stumphusk', delay: 4 }] },
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 1.5 }, { type: 'podhead', delay: 3 }, { type: 'podhead', delay: 4.5 }, { type: 'stumphusk', delay: 6 }, { type: 'stumphusk', delay: 7.5 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 1 }, { type: 'husk', delay: 2 }, { type: 'husk', delay: 3 }, { type: 'husk', delay: 4 }, { type: 'stumphusk', delay: 5.5 }, { type: 'stumphusk', delay: 7 }] },
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 2 }, { type: 'podhead', delay: 4 }, { type: 'podhead', delay: 6 }, { type: 'stumphusk', delay: 8 }, { type: 'stumphusk', delay: 9.5 }] },
      { zombies: [{ type: 'stumphusk', delay: 0 }, { type: 'stumphusk', delay: 1.5 }, { type: 'stumphusk', delay: 3 }, { type: 'stumphusk', delay: 4.5 }, { type: 'podhead', delay: 6 }, { type: 'podhead', delay: 7.5 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 1 }, { type: 'husk', delay: 2 }, { type: 'husk', delay: 3 }, { type: 'husk', delay: 4 }, { type: 'husk', delay: 5 }, { type: 'podhead', delay: 6.5 }, { type: 'podhead', delay: 8 }, { type: 'stumphusk', delay: 9.5 }, { type: 'stumphusk', delay: 11 }] },
      { zombies: [{ type: 'podhead', delay: 0 }, { type: 'podhead', delay: 1.5 }, { type: 'podhead', delay: 3 }, { type: 'stumphusk', delay: 4.5 }, { type: 'stumphusk', delay: 6 }, { type: 'stumphusk', delay: 7.5 }, { type: 'stumphusk', delay: 9 }] },
      { zombies: [{ type: 'husk', delay: 0 }, { type: 'husk', delay: 1 }, { type: 'husk', delay: 2 }, { type: 'husk', delay: 3 }, { type: 'podhead', delay: 4.5 }, { type: 'podhead', delay: 5.5 }, { type: 'podhead', delay: 6.5 }, { type: 'podhead', delay: 7.5 }, { type: 'stumphusk', delay: 9 }, { type: 'stumphusk', delay: 10.5 }, { type: 'stumphusk', delay: 12 }, { type: 'stumphusk', delay: 13.5 }] },
    ],
    interWaveDelay: 8,
    initialSun: 350,
    rewardPlant: 'glacierbloom',
  },
};

export const LEVEL_ORDER: string[] = ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9'];

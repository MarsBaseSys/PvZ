import type { GameObject } from '../objects/GameObject';
import { Peashooter, Sunflower, WallNut } from '../objects/Plant';
import { createZombie } from '../objects/Zombie';
import { Sun } from '../objects/Sun';

export interface VocabEntry {
  id: string;
  prompt: string;
  word: string;
  nativeWidth: number;
  nativeHeight: number;
  createIcon(x: number, y: number): GameObject;
}

export const VOCABULARY: VocabEntry[] = [
  {
    id: 'sun',
    prompt: 'Find the sun!',
    word: 'Sun',
    nativeWidth: 40,
    nativeHeight: 40,
    createIcon: (x, y) => new Sun(x, y, y),
  },
  {
    id: 'sunflower',
    prompt: 'Find the sunflower!',
    word: 'Sunflower',
    nativeWidth: 70,
    nativeHeight: 70,
    createIcon: (x, y) => new Sunflower(x, y, 0),
  },
  {
    id: 'peashooter',
    prompt: 'Find the peashooter!',
    word: 'Peashooter',
    nativeWidth: 70,
    nativeHeight: 70,
    createIcon: (x, y) => new Peashooter(x, y, 0),
  },
  {
    id: 'wallnut',
    prompt: 'Find the wall-nut!',
    word: 'Wall-nut',
    nativeWidth: 70,
    nativeHeight: 70,
    createIcon: (x, y) => new WallNut(x, y, 0),
  },
  {
    id: 'zombie',
    prompt: 'Find the zombie!',
    word: 'Zombie',
    nativeWidth: 50,
    nativeHeight: 70,
    createIcon: (x, y) => createZombie('basic', x, y, 0),
  },
  {
    id: 'conehead',
    prompt: 'Find the cone-head zombie!',
    word: 'Cone-head Zombie',
    nativeWidth: 50,
    nativeHeight: 70,
    createIcon: (x, y) => createZombie('conehead', x, y, 0),
  },
];

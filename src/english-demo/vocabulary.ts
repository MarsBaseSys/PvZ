import type { GameObject } from '../objects/GameObject';
import { BarkBulwark, Moonbud, Thornsnap } from '../objects/Plant';
import { createZombie } from '../objects/Zombie';
import { Sun } from '../objects/Sun';

export interface VocabEntry {
  id: string;
  prompt: string;
  word: string;
  /** Chinese translation of `word`. */
  translationZh: string;
  /** Short English definition, shown in the word list. */
  explanationEn: string;
  /** Short Chinese explanation, shown in the word list. */
  explanationZh: string;
  nativeWidth: number;
  nativeHeight: number;
  createIcon(x: number, y: number): GameObject;
}

export const VOCABULARY: VocabEntry[] = [
  {
    id: 'sun',
    prompt: 'Find the sun!',
    word: 'Sun',
    translationZh: '太阳',
    explanationEn: 'The bright star that gives the Earth light and warmth during the day.',
    explanationZh: '白天照亮天空、给大地带来光和热的那颗星球。',
    nativeWidth: 40,
    nativeHeight: 40,
    createIcon: (x, y) => new Sun(x, y, y),
  },
  {
    id: 'bud',
    prompt: 'Find the bud!',
    word: 'Bud',
    translationZh: '花苞',
    explanationEn: 'A small, tightly closed part on a plant that will open into a flower or leaf.',
    explanationZh: '植物上还没打开、之后会长成花朵或叶子的小突起。',
    nativeWidth: 70,
    nativeHeight: 70,
    createIcon: (x, y) => new Moonbud(x, y, 0),
  },
  {
    id: 'thorn',
    prompt: 'Find the thorn!',
    word: 'Thorn',
    translationZh: '刺',
    explanationEn: 'A small, sharp, pointed growth on the stem of a plant.',
    explanationZh: '长在植物茎干上、又尖又硬的小刺。',
    nativeWidth: 70,
    nativeHeight: 70,
    createIcon: (x, y) => new Thornsnap(x, y, 0),
  },
  {
    id: 'stump',
    prompt: 'Find the stump!',
    word: 'Stump',
    translationZh: '树桩',
    explanationEn: 'The short, bottom part of a tree trunk that is left in the ground after the tree falls or is cut down.',
    explanationZh: '树木倒下或被砍伐后，留在地面上的树干底部。',
    nativeWidth: 70,
    nativeHeight: 70,
    createIcon: (x, y) => new BarkBulwark(x, y, 0),
  },
  {
    id: 'husk',
    prompt: 'Find the husk!',
    word: 'Husk',
    translationZh: '外壳；（游戏中指）枯叶伏尸',
    explanationEn: 'The dry, outer covering of a seed or fruit; here, a shambling creature made of dead leaves and vines.',
    explanationZh: '种子或果实外面干燥的外皮；在游戏里指由枯叶藤蔓缠成的伏尸。',
    nativeWidth: 50,
    nativeHeight: 70,
    createIcon: (x, y) => createZombie('husk', x, y, 0),
  },
  {
    id: 'pod',
    prompt: 'Find the pod!',
    word: 'Pod',
    translationZh: '豆荚',
    explanationEn: 'A long seed case that grows on plants like peas or beans.',
    explanationZh: '豌豆、豆类等植物用来包裹种子的长条形荚壳。',
    nativeWidth: 50,
    nativeHeight: 70,
    createIcon: (x, y) => createZombie('podhead', x, y, 0),
  },
];

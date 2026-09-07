import type { PlantType } from '../objects/Plant';
import type { ZombieType } from '../objects/Zombie';
import { PLANT_COSTS } from '../objects/Plant';

export interface AlmanacEntry {
  description: string;
}

export const PLANT_ALMANAC: Record<PlantType, AlmanacEntry> = {
  moonbud: { description: '花苞定期绽放释放阳光，是经济的核心' },
  thornsnap: { description: '朝本行的伏尸甩出带刺种子，最基础的攻击手段' },
  barkbulwark: { description: '血量极高，专职拖延伏尸，自己不会攻击' },
  frostlily: { description: '甩出的种子会让伏尸减速，配合输出效果更好' },
  twinfang: { description: '一茎双头，一次连续甩出两颗种子，火力翻倍' },
  blastcap: { description: '种下后立即在周围爆裂，秒杀范围内的伏尸' },
  emberroot: { description: '种子穿过它的余烬时伤害翻倍，是输出蔓的绝配' },
  dreamspore: { description: '被伏尸吃掉时反过来催眠对方，让它为你作战' },
  glacierbloom: { description: '加大版霜百合，血量厚实，攻击附带减速' },
};

export const ZOMBIE_ALMANAC: Record<ZombieType, AlmanacEntry> = {
  husk: { description: '枯叶藤蔓缠成的最普通伏尸，没有护甲，血量也不高' },
  podhead: { description: '头顶天然荚壳当护甲，比普通伏尸更耐打' },
  stumphusk: { description: '头肩融合一截树桩，护甲相当厚重，要小心应对' },
};

export function almanacCostLabel(type: PlantType): string {
  return `${PLANT_COSTS[type]} 阳光`;
}

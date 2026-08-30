import type { PlantType } from '../objects/Plant';
import type { ZombieType } from '../objects/Zombie';
import { PLANT_COSTS } from '../objects/Plant';

export interface AlmanacEntry {
  description: string;
}

export const PLANT_ALMANAC: Record<PlantType, AlmanacEntry> = {
  sunflower: { description: '阳光"发电站"，定期产出阳光，是经济的核心' },
  peashooter: { description: '向本行的僵尸发射豌豆，最基础的攻击手段' },
  wallnut: { description: '血量极高，专职拖延僵尸，自己不会攻击' },
  snowpea: { description: '发射的豌豆会让僵尸减速，配合输出效果更好' },
  repeater: { description: '一次连续发射两颗豌豆，火力是豌豆射手的两倍' },
  cherrybomb: { description: '种下后立即在周围爆炸，秒杀范围内的僵尸' },
  torchwood: { description: '豌豆穿过它的火焰时伤害翻倍，是射手类植物的绝配' },
  hypnoshroom: { description: '被僵尸吃掉时反过来催眠对方，让它为你作战' },
  iceshroom: { description: '增强版寒冰射手，血量厚实，攻击附带减速' },
};

export const ZOMBIE_ALMANAC: Record<ZombieType, AlmanacEntry> = {
  basic: { description: '最普通的僵尸，没有护甲，血量也不高' },
  conehead: { description: '头戴路障当护甲，比普通僵尸更耐打' },
  buckethead: { description: '头顶铁桶，护甲相当厚重，要小心应对' },
};

export function almanacCostLabel(type: PlantType): string {
  return `${PLANT_COSTS[type]} 阳光`;
}

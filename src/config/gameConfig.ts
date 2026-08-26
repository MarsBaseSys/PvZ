export const GAME_CONFIG = {
  economy: {
    naturalSunInterval: 10,
    sunValue: 25,
  },
  plants: {
    sunflower: {
      cost: 50,
      cooldown: 7.5,
      hp: 300,
      sunInterval: 24,
    },
    peashooter: {
      cost: 100,
      cooldown: 7.5,
      hp: 300,
      damage: 20,
      attackInterval: 1.4,
      peaSpeed: 300,
    },
    wallnut: {
      cost: 50,
      cooldown: 30,
      hp: 4000,
    },
  },
  zombies: {
    basic: {
      hp: 200,
      speed: 15,
      attackPower: 100,
    },
    conehead: {
      hp: 200,
      armorHp: 370,
      speed: 15,
      attackPower: 100,
    },
  },
  combat: {
    zombieAttackInterval: 1,
  },
} as const;

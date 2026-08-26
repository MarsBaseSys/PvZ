import type { PlantType } from '../objects/Plant';
import type { ZombieType } from '../objects/Zombie';
import { SpeechService } from './SpeechService';

const SUN_PHRASES = [
  'Sunshine!',
  'You are clicking sunshine!',
  'You caught the sun!',
  'Sun power!',
];

const PLANTED_PHRASES: Record<PlantType, string[]> = {
  sunflower: ['Sunflower!', 'You planted a sunflower!', 'Nice sunflower!'],
  peashooter: ['Peashooter!', 'You planted a peashooter!', 'Peashooter, ready to shoot!'],
  wallnut: ['Wall-nut!', 'Strong wall-nut!', 'You planted a wall-nut!'],
};

const ZOMBIE_PHRASES: Record<ZombieType, string[]> = {
  basic: ['A zombie is coming!', 'Watch out, zombie!', 'Here comes a zombie!'],
  conehead: ['A cone-head zombie is coming!', 'Watch out for the cone-head zombie!'],
};

const REWARD_PHRASES: Record<PlantType, string[]> = {
  sunflower: ['Great job! You unlocked the sunflower!', 'Awesome! Say hello to your new sunflower!'],
  peashooter: ['Great job! You unlocked the peashooter!', 'Awesome! Say hello to your new peashooter!'],
  wallnut: ['Great job! You unlocked the wall-nut!', 'Awesome! Say hello to your new wall-nut!'],
};

const WELCOME_PHRASES = ["Let's plant and learn English!", 'Ready, set, grow!'];

// Keeps in-game narration from talking over itself: a cooldown per event
// category, plus a cap on how many lines can be queued up waiting to play.
const COOLDOWN_SECONDS = 2.5;
const MAX_QUEUED = 2;

export class Narrator {
  private readonly speech = new SpeechService();
  private readonly lastSpokenAt = new Map<string, number>();
  private queuedCount = 0;

  narrateSunCollected(): void {
    this.say('sun', SUN_PHRASES);
  }

  narratePlanted(type: PlantType): void {
    this.say(`planted-${type}`, PLANTED_PHRASES[type]);
  }

  narrateZombieSpawned(type: ZombieType): void {
    this.say(`zombie-${type}`, ZOMBIE_PHRASES[type]);
  }

  narrateReward(type: PlantType): void {
    this.say(`reward-${type}`, REWARD_PHRASES[type]);
  }

  narrateWelcome(): void {
    this.say('welcome', WELCOME_PHRASES);
  }

  private say(cooldownKey: string, pool: string[]): void {
    if (this.queuedCount >= MAX_QUEUED) {
      return;
    }

    const now = performance.now() / 1000;
    const last = this.lastSpokenAt.get(cooldownKey) ?? -Infinity;
    if (now - last < COOLDOWN_SECONDS) {
      return;
    }
    this.lastSpokenAt.set(cooldownKey, now);

    const text = pool[Math.floor(Math.random() * pool.length)];
    this.queuedCount++;
    this.speech.speak(text, {
      interrupt: false,
      onEnd: () => {
        this.queuedCount = Math.max(0, this.queuedCount - 1);
      },
    });
  }
}

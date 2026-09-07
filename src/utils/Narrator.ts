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
  moonbud: ['Moonbud!', 'You planted a moonbud!', 'Nice moonbud!'],
  thornsnap: ['Thornsnap!', 'You planted a thornsnap!', 'Thornsnap, ready to strike!'],
  barkbulwark: ['Bark Bulwark!', 'Strong bark bulwark!', 'You planted a bark bulwark!'],
  frostlily: ['Frost Lily!', 'You planted a frost lily!', 'Frost lily, ready to freeze!'],
  twinfang: ['Twin Fang!', 'You planted a twin fang!', 'Double the seeds!'],
  blastcap: ['Blastcap!', 'You planted a blastcap!', 'Boom, incoming!'],
  emberroot: ['Emberroot!', 'You planted an emberroot!', 'Fired up and ready!'],
  dreamspore: ['Dreamspore!', 'You planted a dreamspore!', 'Time to hypnotize!'],
  glacierbloom: ['Glacier Bloom!', 'You planted a glacier bloom!', 'Chilly and ready!'],
};

const ZOMBIE_PHRASES: Record<ZombieType, string[]> = {
  husk: ['A husk is coming!', 'Watch out, husk!', 'Here comes a husk!'],
  podhead: ['A pod-head husk is coming!', 'Watch out for the pod-head husk!'],
  stumphusk: ['A stump husk is coming!', 'Watch out, stump husk!'],
};

const REWARD_PHRASES: Record<PlantType, string[]> = {
  moonbud: ['Great job! You unlocked the moonbud!', 'Awesome! Say hello to your new moonbud!'],
  thornsnap: ['Great job! You unlocked the thornsnap!', 'Awesome! Say hello to your new thornsnap!'],
  barkbulwark: ['Great job! You unlocked the bark bulwark!', 'Awesome! Say hello to your new bark bulwark!'],
  frostlily: ['Great job! You unlocked the frost lily!', 'Awesome! Say hello to your new frost lily!'],
  twinfang: ['Great job! You unlocked the twin fang!', 'Awesome! Say hello to your new twin fang!'],
  blastcap: ['Great job! You unlocked the blastcap!', 'Awesome! Say hello to your new blastcap!'],
  emberroot: ['Great job! You unlocked the emberroot!', 'Awesome! Say hello to your new emberroot!'],
  dreamspore: ['Great job! You unlocked the dreamspore!', 'Awesome! Say hello to your new dreamspore!'],
  glacierbloom: ['Great job! You unlocked the glacier bloom!', 'Awesome! Say hello to your new glacier bloom!'],
};

const WELCOME_PHRASES = ["Let's plant and learn English!", 'Ready, set, grow!'];

const FINAL_WAVE_PHRASES = ['Final wave! Hold the line!', 'Last wave incoming!', 'Here comes the last wave!'];

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

  narrateFinalWave(): void {
    this.say('final-wave', FINAL_WAVE_PHRASES);
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

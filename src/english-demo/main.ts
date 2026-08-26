import { VOCABULARY, type VocabEntry } from './vocabulary';
import { SpeechService } from '../utils/SpeechService';
import { SoundEngine } from '../utils/SoundEngine';
import './style.css';

const TOTAL_ROUNDS = 8;
const CHOICES_PER_ROUND = 3;
const CANVAS_RESOLUTION = 200;
const HINT_AFTER_WRONG_ATTEMPTS = 2;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function drawIcon(canvas: HTMLCanvasElement, entry: VocabEntry): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const targetSize = canvas.width * 0.7;
  const scale = targetSize / Math.max(entry.nativeWidth, entry.nativeHeight);
  const drawWidth = entry.nativeWidth * scale;
  const drawHeight = entry.nativeHeight * scale;
  const offsetX = (canvas.width - drawWidth) / 2;
  const offsetY = (canvas.height - drawHeight) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  entry.createIcon(0, 0).render(ctx);
  ctx.restore();
}

class EnglishDemo {
  private readonly speech = new SpeechService();
  private readonly sound = new SoundEngine();

  private score = 0;
  private round = 0;
  private lastTargetId: string | null = null;
  private wrongAttempts = 0;
  private target: VocabEntry = VOCABULARY[0];
  private resolved = false;

  private readonly startScreen: HTMLElement;
  private readonly gameScreen: HTMLElement;
  private readonly summaryScreen: HTMLElement;
  private readonly hudRound: HTMLElement;
  private readonly hudStars: HTMLElement;
  private readonly cardRow: HTMLElement;
  private readonly listenButton: HTMLButtonElement;
  private readonly summaryStars: HTMLElement;

  constructor(root: HTMLElement) {
    root.innerHTML = `
      <section class="screen" id="start-screen">
        <h1>🌻 Learn English with Plants vs Zombies! 🧟</h1>
        <p class="subtitle">Listen carefully, then tap the right picture!</p>
        <button class="big-button" id="start-button">▶ Start</button>
      </section>

      <section class="screen hidden" id="game-screen">
        <div class="hud">
          <span id="hud-round">Round 1 / ${TOTAL_ROUNDS}</span>
          <span id="hud-stars">⭐ 0</span>
        </div>
        <button class="listen-button" id="listen-button">🔊 Listen again</button>
        <div class="card-row" id="card-row"></div>
      </section>

      <section class="screen hidden" id="summary-screen">
        <h1>🎉 Great job!</h1>
        <div class="summary-stars" id="summary-stars"></div>
        <button class="big-button" id="restart-button">🔁 Play again</button>
      </section>
    `;

    this.startScreen = this.require(root, '#start-screen');
    this.gameScreen = this.require(root, '#game-screen');
    this.summaryScreen = this.require(root, '#summary-screen');
    this.hudRound = this.require(root, '#hud-round');
    this.hudStars = this.require(root, '#hud-stars');
    this.cardRow = this.require(root, '#card-row');
    this.listenButton = this.require(root, '#listen-button') as HTMLButtonElement;
    this.summaryStars = this.require(root, '#summary-stars');

    this.require(root, '#start-button').addEventListener('click', () => this.beginSession());
    this.require(root, '#restart-button').addEventListener('click', () => this.beginSession());
    this.listenButton.addEventListener('click', () => this.speakPrompt());
  }

  private require(root: HTMLElement, selector: string): HTMLElement {
    const el = root.querySelector<HTMLElement>(selector);
    if (!el) {
      throw new Error(`Missing element: ${selector}`);
    }
    return el;
  }

  private beginSession(): void {
    this.score = 0;
    this.round = 0;
    this.lastTargetId = null;
    this.showScreen(this.gameScreen);
    this.nextRound();
  }

  private showScreen(screen: HTMLElement): void {
    for (const s of [this.startScreen, this.gameScreen, this.summaryScreen]) {
      s.classList.toggle('hidden', s !== screen);
    }
  }

  private nextRound(): void {
    this.round++;
    if (this.round > TOTAL_ROUNDS) {
      this.showSummary();
      return;
    }

    this.wrongAttempts = 0;
    this.resolved = false;
    this.target = this.pickTarget();
    const choices = this.pickChoices(this.target);

    this.hudRound.textContent = `Round ${this.round} / ${TOTAL_ROUNDS}`;
    this.hudStars.textContent = `⭐ ${this.score}`;
    this.renderCards(choices);
    this.speakPrompt();
  }

  private pickTarget(): VocabEntry {
    let candidate: VocabEntry;
    do {
      candidate = VOCABULARY[Math.floor(Math.random() * VOCABULARY.length)];
    } while (candidate.id === this.lastTargetId && VOCABULARY.length > 1);
    this.lastTargetId = candidate.id;
    return candidate;
  }

  private pickChoices(target: VocabEntry): VocabEntry[] {
    const distractors = shuffle(VOCABULARY.filter((entry) => entry.id !== target.id)).slice(
      0,
      CHOICES_PER_ROUND - 1,
    );
    return shuffle([target, ...distractors]);
  }

  private renderCards(choices: VocabEntry[]): void {
    this.cardRow.innerHTML = '';

    for (const entry of choices) {
      const card = document.createElement('button');
      card.className = 'card';
      card.dataset.id = entry.id;

      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_RESOLUTION;
      canvas.height = CANVAS_RESOLUTION;
      drawIcon(canvas, entry);

      const label = document.createElement('p');
      label.className = 'card-label';

      card.appendChild(canvas);
      card.appendChild(label);
      card.addEventListener('click', () => this.handleCardClick(entry, card, label));

      this.cardRow.appendChild(card);
    }
  }

  private handleCardClick(entry: VocabEntry, card: HTMLButtonElement, label: HTMLElement): void {
    if (this.resolved || card.classList.contains('disabled')) {
      return;
    }

    if (entry.id === this.target.id) {
      this.resolved = true;
      this.score++;
      card.classList.add('correct');
      label.textContent = this.target.word;
      this.sound.playSunCollect();
      this.speech.speak(`Great job! ${this.target.word}!`);
      window.setTimeout(() => this.nextRound(), 1400);
      return;
    }

    card.classList.add('wrong', 'disabled');
    this.wrongAttempts++;
    this.sound.playTryAgain();
    this.speech.speak('Try again!', { onEnd: () => this.speakPrompt() });

    if (this.wrongAttempts >= HINT_AFTER_WRONG_ATTEMPTS) {
      const correctCard = this.cardRow.querySelector<HTMLElement>(`[data-id="${this.target.id}"]`);
      correctCard?.classList.add('hint');
    }
  }

  private speakPrompt(): void {
    this.speech.speak(this.target.prompt);
  }

  private showSummary(): void {
    this.showScreen(this.summaryScreen);
    this.summaryStars.textContent = `⭐ ${this.score} / ${TOTAL_ROUNDS}`;
    this.sound.playVictory();
  }
}

const root = document.getElementById('app');
if (!root) {
  throw new Error('#app element not found');
}
new EnglishDemo(root);

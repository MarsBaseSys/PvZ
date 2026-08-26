interface SpeakOptions {
  onEnd?: () => void;
  // Cancels any utterance still playing before starting this one. Prompts that
  // replace each other (e.g. a quiz question) want this; narration lines that
  // should queue up one after another (e.g. in-game commentary) don't.
  interrupt?: boolean;
}

// Names that tend to sound clearer than a generic OS default voice, checked
// in order. Matched loosely against SpeechSynthesisVoice.name.
const PREFERRED_VOICE_NAME_HINTS = [
  'Google US English',
  'Microsoft Aria Online',
  'Microsoft Ava Online',
  'Samantha',
  'Alex',
];

export class SpeechService {
  private voice: SpeechSynthesisVoice | null = null;
  private loggedVoice = false;

  private refreshVoice(): void {
    if (!('speechSynthesis' in window)) {
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      return;
    }

    const byHint = PREFERRED_VOICE_NAME_HINTS.map((hint) =>
      voices.find((voice) => voice.lang.startsWith('en') && voice.name.includes(hint)),
    ).find((voice): voice is SpeechSynthesisVoice => Boolean(voice));

    this.voice =
      byHint ??
      voices.find((voice) => voice.lang === 'en-US') ??
      voices.find((voice) => voice.lang.startsWith('en')) ??
      null;

    if (this.voice && !this.loggedVoice) {
      this.loggedVoice = true;
      console.info(`[SpeechService] Using voice: ${this.voice.name} (${this.voice.lang})`);
    }
  }

  speak(text: string, options?: SpeakOptions): void {
    // Voices can finish loading asynchronously after this service is constructed,
    // so re-resolve on every call rather than caching a possibly-empty result.
    this.refreshVoice();

    if (!('speechSynthesis' in window)) {
      options?.onEnd?.();
      return;
    }

    if (options?.interrupt ?? true) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    if (this.voice) {
      utterance.voice = this.voice;
    }
    if (options?.onEnd) {
      utterance.onend = options.onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }
}

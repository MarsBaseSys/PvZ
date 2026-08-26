export class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgmStarted = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType,
    peakGain: number,
  ): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(freqStart, 1), now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playNoiseBurst(duration: number, peakGain: number): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peakGain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(gain).connect(ctx.destination);
    source.start(now);
    source.stop(now + duration + 0.02);
  }

  playSunCollect(): void {
    this.playTone(500, 1000, 0.1, 'sine', 0.25);
  }

  playPlant(): void {
    this.playTone(220, 320, 0.15, 'sine', 0.2);
    this.playNoiseBurst(0.05, 0.08);
  }

  playShoot(): void {
    this.playTone(600, 1400, 0.08, 'triangle', 0.2);
  }

  playSplat(): void {
    this.playNoiseBurst(0.06, 0.2);
    this.playTone(220, 80, 0.1, 'square', 0.2);
  }

  playTryAgain(): void {
    this.playTone(320, 260, 0.12, 'sine', 0.15);
    setTimeout(() => this.playTone(260, 220, 0.14, 'sine', 0.12), 130);
  }

  playVictory(): void {
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, freq, 0.25, 'sine', 0.22), i * 120);
    });
  }

  playExplode(): void {
    this.playNoiseBurst(0.3, 0.25);
    this.playTone(150, 35, 0.6, 'sawtooth', 0.3);
  }

  playBGM(): void {
    if (this.bgmStarted) {
      return;
    }
    this.bgmStarted = true;

    const bassLine = [110, 130.81, 146.83, 130.81];
    const stepDurationMs = 550;
    let step = 0;

    const playStep = (): void => {
      const freq = bassLine[step % bassLine.length];
      this.playTone(freq, freq, 0.45, 'triangle', 0.06);
      step++;
      setTimeout(playStep, stepDurationMs);
    };

    playStep();
  }
}

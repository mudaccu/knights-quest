import type { Phase } from "../types";

/**
 * Procedural ambience, synthesised live with the Web Audio API — no audio files,
 * so nothing to license. Built only after an explicit user gesture.
 *
 *  • Music: a slow, melancholic D-minor progression — string-like pads, a low
 *    drone and a plucked lute (Karplus–Strong) improvising sparse phrases.
 *  • Ambience: wind always; birdsong by day; crickets at dusk; a crackling fire at night.
 */

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// D minor: Dm – B♭ – F – C | Dm – Gm – B♭ – A
const PROGRESSION: { root: number; tones: number[] }[] = [
  { root: 38, tones: [50, 53, 57] },
  { root: 34, tones: [50, 53, 58] },
  { root: 41, tones: [48, 53, 57] },
  { root: 36, tones: [48, 52, 55] },
  { root: 38, tones: [50, 53, 57] },
  { root: 43, tones: [50, 55, 58] },
  { root: 34, tones: [50, 53, 58] },
  { root: 45, tones: [49, 52, 57] },
];
// Melody pool per chord (upper register), favouring chord tones.
const MELODY: number[][] = [
  [62, 65, 69, 67, 64],
  [62, 65, 70, 69, 67],
  [60, 65, 69, 67, 72],
  [60, 64, 67, 65, 62],
  [62, 65, 69, 72, 70],
  [62, 67, 70, 69, 65],
  [62, 65, 70, 67, 69],
  [61, 64, 69, 67, 64],
];

const BEAT = 60 / 54; // seconds per beat
const BAR = BEAT * 4;

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0..1
  music: boolean;
  ambience: boolean;
}

export class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private ambBus!: GainNode;
  private birdBus!: GainNode;
  private cricketBus!: GainNode;
  private fireBus!: GainNode;
  private reverb!: ConvolverNode;
  private reverbSend!: GainNode;
  private noise!: AudioBuffer;
  private pluckCache = new Map<number, AudioBuffer>();
  private timers: number[] = [];
  private nextBarTime = 0;
  private bar = 0;
  private phase: Phase = "afternoon";
  private settings: SoundSettings = { enabled: false, volume: 0.5, music: true, ambience: true };

  get running() {
    return !!this.ctx && this.ctx.state === "running";
  }

  /** Must be called from a user gesture (click/keypress). */
  async start() {
    if (!this.ctx) this.build();
    if (this.ctx!.state !== "running") await this.ctx!.resume();
    this.apply(true);
  }

  async suspend() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0, t, 0.25);
    window.setTimeout(() => {
      if (!this.settings.enabled) void this.ctx?.suspend();
    }, 1200);
  }

  update(next: Partial<SoundSettings>) {
    this.settings = { ...this.settings, ...next };
    this.apply();
  }

  setPhase(phase: Phase) {
    this.phase = phase;
    this.apply();
  }

  dispose() {
    this.timers.forEach((t) => window.clearInterval(t));
    this.timers = [];
    void this.ctx?.close();
    this.ctx = null;
  }

  /* ───────────── graph ───────────── */

  private build() {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -14;
    limiter.ratio.value = 4;
    this.master.connect(limiter).connect(ctx.destination);

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.impulse(4.2, 2.6);
    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = 0.55;
    this.reverbSend.connect(this.reverb).connect(this.master);

    this.musicBus = ctx.createGain();
    this.musicBus.connect(this.master);
    this.musicBus.connect(this.reverbSend);

    this.ambBus = ctx.createGain();
    this.ambBus.connect(this.master);
    this.birdBus = ctx.createGain();
    this.cricketBus = ctx.createGain();
    this.fireBus = ctx.createGain();
    [this.birdBus, this.cricketBus, this.fireBus].forEach((b) => {
      b.gain.value = 0;
      b.connect(this.ambBus);
    });
    this.birdBus.connect(this.reverbSend);

    // Two seconds of white noise, reused by wind, fire and crickets.
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    this.startWind();
    this.startFireBed();
    this.nextBarTime = ctx.currentTime + 0.3;
    this.timers.push(window.setInterval(() => this.scheduleMusic(), 250));
    this.timers.push(window.setInterval(() => this.ambientTick(), 500));
  }

  private apply(fadeIn = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const s = this.settings;
    const target = s.enabled ? 0.42 * Math.pow(s.volume, 1.6) : 0;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(target, t, fadeIn ? 1.2 : 0.3);
    this.musicBus.gain.setTargetAtTime(s.music ? 0.9 : 0, t, 0.8);
    this.ambBus.gain.setTargetAtTime(s.ambience ? 1 : 0, t, 0.8);
    const day = this.phase === "morning" || this.phase === "afternoon";
    this.birdBus.gain.setTargetAtTime(day ? 1 : 0, t, 2.5);
    this.cricketBus.gain.setTargetAtTime(this.phase === "sunset" ? 0.8 : this.phase === "night" ? 0.45 : 0, t, 2.5);
    this.fireBus.gain.setTargetAtTime(this.phase === "night" ? 1 : 0, t, 2.5);
  }

  private impulse(seconds: number, decay: number) {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  /* ───────────── music ───────────── */

  private scheduleMusic() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running") return;
    // Background tabs throttle timers; never try to "catch up" on missed bars.
    if (this.nextBarTime < ctx.currentTime - 0.1) this.nextBarTime = ctx.currentTime + 0.1;
    while (this.nextBarTime < ctx.currentTime + 1.6) {
      this.playBar(this.bar, this.nextBarTime);
      this.nextBarTime += BAR;
      this.bar = (this.bar + 1) % PROGRESSION.length;
    }
  }

  private playBar(i: number, t: number) {
    const chord = PROGRESSION[i];
    // Pad: two detuned saws per tone through a soft low-pass.
    chord.tones.forEach((n, k) => this.pad(midi(n), t + k * 0.06, BAR + 0.6, 0.032));
    this.pad(midi(chord.root), t, BAR + 0.6, 0.05, 420);
    if (i % 4 === 0) this.drone(midi(26), t, BAR * 4 + 1);

    // Lute: a sparse, unhurried phrase. Rests are part of the melancholy.
    const pool = MELODY[i];
    const shapes = [
      [0, 1.5, 2, 3],
      [0, 1, 2.5],
      [0.5, 2, 3.5],
      [0, 2],
      [1, 1.5, 2, 3],
    ];
    const rhythm = shapes[Math.floor(Math.random() * shapes.length)];
    let idx = Math.floor(Math.random() * 3);
    rhythm.forEach((beat) => {
      if (Math.random() < 0.18) return;
      idx = Math.max(0, Math.min(pool.length - 1, idx + (Math.random() < 0.5 ? -1 : 1)));
      this.pluck(midi(pool[idx]), t + beat * BEAT + (Math.random() - 0.5) * 0.03, 0.16 + Math.random() * 0.06);
    });
    // Low answering note on the last bar of each phrase.
    if (i === 3 || i === 7) this.pluck(midi(chord.tones[0] - 12), t + BEAT * 3, 0.14);
  }

  private pad(freq: number, t: number, dur: number, gain: number, cutoff = 900) {
    const ctx = this.ctx!;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(gain, t + 1.6);
    env.gain.setValueAtTime(gain, t + dur - 1.4);
    env.gain.linearRampToValueAtTime(0, t + dur + 1.2);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = cutoff;
    lp.Q.value = 0.4;
    lp.connect(env).connect(this.musicBus);
    [-7, 6].forEach((cents) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = freq;
      o.detune.value = cents;
      o.connect(lp);
      o.start(t);
      o.stop(t + dur + 1.4);
    });
  }

  private drone(freq: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.07, t + 3);
    g.gain.setValueAtTime(0.07, t + dur - 3);
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g).connect(this.musicBus);
    o.start(t);
    o.stop(t + dur + 0.1);
  }

  /** Karplus–Strong plucked string, rendered once per pitch and cached. */
  private pluckBuffer(freq: number) {
    const key = Math.round(freq * 10);
    const hit = this.pluckCache.get(key);
    if (hit) return hit;
    const ctx = this.ctx!;
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * 3.2);
    const buf = ctx.createBuffer(1, len, sr);
    const out = buf.getChannelData(0);
    const period = Math.max(2, Math.round(sr / freq));
    const ring = new Float32Array(period);
    let prev = 0;
    for (let i = 0; i < period; i++) {
      // Softened excitation for a warm, gut-string attack.
      const n = Math.random() * 2 - 1;
      prev = prev * 0.55 + n * 0.45;
      ring[i] = prev;
    }
    let p = 0;
    const decay = 0.9965;
    for (let i = 0; i < len; i++) {
      const next = (p + 1) % period;
      const v = ring[p];
      ring[p] = decay * 0.5 * (ring[p] + ring[next]);
      out[i] = v;
      p = next;
    }
    this.pluckCache.set(key, buf);
    return buf;
  }

  private pluck(freq: number, t: number, gain: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.pluckBuffer(freq);
    const g = ctx.createGain();
    g.gain.value = gain;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2600;
    const pan = ctx.createStereoPanner();
    pan.pan.value = (Math.random() - 0.5) * 0.5;
    src.connect(lp).connect(g).connect(pan).connect(this.musicBus);
    src.start(t);
  }

  /* ───────────── ambience ───────────── */

  private noiseSource() {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    return src;
  }

  private startWind() {
    const ctx = this.ctx!;
    const src = this.noiseSource();
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 420;
    bp.Q.value = 0.6;
    const g = ctx.createGain();
    g.gain.value = 0.05;
    // Slow gusts: LFOs on loudness and colour.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.035;
    lfo.connect(lfoGain).connect(g.gain);
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.045;
    const lfo2Gain = ctx.createGain();
    lfo2Gain.gain.value = 180;
    lfo2.connect(lfo2Gain).connect(bp.frequency);
    src.connect(bp).connect(g).connect(this.ambBus);
    src.start();
    lfo.start();
    lfo2.start();
  }

  private startFireBed() {
    const ctx = this.ctx!;
    const src = this.noiseSource();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 260;
    const g = ctx.createGain();
    g.gain.value = 0.09;
    src.connect(lp).connect(g).connect(this.fireBus);
    src.start();
  }

  private ambientTick() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running" || !this.settings.ambience) return;
    const t = ctx.currentTime;
    if (this.phase === "night") {
      const pops = Math.floor(Math.random() * 4);
      for (let i = 0; i < pops; i++) this.crackle(t + Math.random() * 0.5);
    }
    if ((this.phase === "morning" || this.phase === "afternoon") && Math.random() < 0.09) this.birdSong(t + Math.random() * 0.4);
    if ((this.phase === "sunset" || this.phase === "night") && Math.random() < 0.35) this.cricket(t + Math.random() * 0.4);
  }

  private crackle(t: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1200 + Math.random() * 2400;
    const g = ctx.createGain();
    const peak = 0.04 + Math.random() * 0.12;
    const len = 0.006 + Math.random() * 0.03;
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    src.connect(hp).connect(g).connect(this.fireBus);
    src.start(t, Math.random() * 1.5, len + 0.02);
  }

  private birdSong(t: number) {
    const ctx = this.ctx!;
    const notes = 2 + Math.floor(Math.random() * 4);
    const base = 2200 + Math.random() * 1600;
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    pan.connect(this.birdBus);
    for (let i = 0; i < notes; i++) {
      const start = t + i * (0.11 + Math.random() * 0.06);
      const o = ctx.createOscillator();
      o.type = "sine";
      const f = base * (0.9 + Math.random() * 0.3);
      o.frequency.setValueAtTime(f, start);
      o.frequency.exponentialRampToValueAtTime(f * (1.25 + Math.random() * 0.4), start + 0.07);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.018, start + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);
      o.connect(g).connect(pan);
      o.start(start);
      o.stop(start + 0.1);
    }
  }

  private cricket(t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = 4300 + Math.random() * 400;
    const g = ctx.createGain();
    g.gain.value = 0;
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.4 - 0.7;
    o.connect(g).connect(pan).connect(this.cricketBus);
    const pulses = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < pulses; i++) {
      const s = t + i * 0.045;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.006, s + 0.01);
      g.gain.linearRampToValueAtTime(0, s + 0.03);
    }
    o.start(t);
    o.stop(t + pulses * 0.045 + 0.05);
  }
}

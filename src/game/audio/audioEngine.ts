/**
 * Zero-asset procedural audio engine (Web Audio).
 * Synthesises all SFX and a looping synthwave bed so the game ships with no
 * binary audio downloads. Volumes are driven by the persisted settings store.
 */
import { useMetaStore } from "../state/metaStore";

type Ctx = AudioContext & { __master?: GainNode };

let ctx: Ctx | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicTimer: number | null = null;
let musicMode: "menu" | "battle" | "boss" | null = null;

function ensure(): Ctx | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC() as Ctx;
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.25;
    musicGain.connect(master);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function volumes() {
  const { musicVolume, sfxVolume, muted } = useMetaStore.getState().settings;
  return { music: muted ? 0 : musicVolume, sfx: muted ? 0 : sfxVolume };
}

export function applyVolumes() {
  if (musicGain) musicGain.gain.value = volumes().music * 0.5;
}

interface ToneOpts {
  freq: number;
  to?: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
}

function tone({ freq, to, dur = 0.12, type = "square", gain = 0.2, delay = 0 }: ToneOpts) {
  const c = ensure();
  if (!c || !master) return;
  const v = volumes().sfx;
  if (v <= 0) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain * v, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise(dur = 0.25, gain = 0.3, filterFreq = 900) {
  const c = ensure();
  if (!c || !master) return;
  const v = volumes().sfx;
  if (v <= 0) return;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = filterFreq;
  const g = c.createGain();
  g.gain.value = gain * v;
  src.connect(filter).connect(g).connect(master);
  src.start();
}

export const sfx = {
  shoot: () => tone({ freq: 720, to: 240, dur: 0.07, type: "square", gain: 0.08 }),
  laser: () => tone({ freq: 1400, to: 300, dur: 0.16, type: "sawtooth", gain: 0.1 }),
  hit: () => tone({ freq: 320, to: 120, dur: 0.06, type: "triangle", gain: 0.12 }),
  hurt: () => tone({ freq: 180, to: 60, dur: 0.22, type: "sawtooth", gain: 0.18 }),
  explode: () => {
    noise(0.4, 0.35, 700);
    tone({ freq: 120, to: 40, dur: 0.35, type: "sine", gain: 0.25 });
  },
  pickup: () => tone({ freq: 880, to: 1320, dur: 0.08, type: "sine", gain: 0.1 }),
  coin: () => {
    tone({ freq: 1200, dur: 0.05, type: "sine", gain: 0.08 });
    tone({ freq: 1800, dur: 0.06, type: "sine", gain: 0.07, delay: 0.05 });
  },
  levelUp: () => {
    [523, 659, 784, 1046].forEach((f, i) =>
      tone({ freq: f, dur: 0.18, type: "triangle", gain: 0.16, delay: i * 0.08 }),
    );
  },
  click: () => tone({ freq: 620, to: 900, dur: 0.05, type: "square", gain: 0.09 }),
  hover: () => tone({ freq: 1100, dur: 0.03, type: "sine", gain: 0.04 }),
  boss: () => {
    tone({ freq: 90, to: 40, dur: 1.2, type: "sawtooth", gain: 0.25 });
    noise(0.8, 0.2, 400);
  },
  victory: () => {
    [523, 659, 784, 1046, 1318].forEach((f, i) =>
      tone({ freq: f, dur: 0.28, type: "triangle", gain: 0.18, delay: i * 0.14 }),
    );
  },
  gameOver: () => {
    [440, 349, 261, 174].forEach((f, i) =>
      tone({ freq: f, dur: 0.4, type: "sawtooth", gain: 0.16, delay: i * 0.22 }),
    );
  },
};

const PATTERNS: Record<"menu" | "battle" | "boss", { root: number[]; step: number }> = {
  menu: { root: [130.8, 155.6, 174.6, 196.0], step: 480 },
  battle: { root: [98, 116.5, 130.8, 87.3], step: 300 },
  boss: { root: [73.4, 77.8, 87.3, 65.4], step: 220 },
};

/** Simple sequencer loop — arpeggiated bass + shimmer lead. */
export function playMusic(mode: "menu" | "battle" | "boss") {
  const c = ensure();
  if (!c || !musicGain) return;
  if (musicMode === mode) return;
  stopMusic();
  musicMode = mode;
  applyVolumes();
  const pattern = PATTERNS[mode];
  let step = 0;

  const tick = () => {
    if (!ctx || !musicGain) return;
    const t = ctx.currentTime;
    const note = pattern.root[step % pattern.root.length];
    const bass = ctx.createOscillator();
    const bg = ctx.createGain();
    bass.type = "sawtooth";
    bass.frequency.value = note;
    bg.gain.setValueAtTime(0.0001, t);
    bg.gain.exponentialRampToValueAtTime(0.28, t + 0.03);
    bg.gain.exponentialRampToValueAtTime(0.0001, t + pattern.step / 1000);
    bass.connect(bg).connect(musicGain);
    bass.start(t);
    bass.stop(t + pattern.step / 1000 + 0.05);

    if (step % 2 === 0) {
      const lead = ctx.createOscillator();
      const lg = ctx.createGain();
      lead.type = "triangle";
      lead.frequency.value = note * 4;
      lg.gain.setValueAtTime(0.0001, t);
      lg.gain.exponentialRampToValueAtTime(0.09, t + 0.02);
      lg.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      lead.connect(lg).connect(musicGain);
      lead.start(t);
      lead.stop(t + 0.45);
    }
    step++;
  };

  tick();
  musicTimer = window.setInterval(tick, pattern.step);
}

export function stopMusic() {
  if (musicTimer !== null) window.clearInterval(musicTimer);
  musicTimer = null;
  musicMode = null;
}

export function unlockAudio() {
  ensure();
}

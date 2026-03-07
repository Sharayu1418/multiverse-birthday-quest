import type { WorldId } from "@/lib/worldsData";

let currentCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    return new Ctx();
  } catch {
    return null;
  }
}

function stop() {
  if (currentCtx) {
    currentCtx.close().catch(() => {});
    currentCtx = null;
  }
}

function playNote(ctx: AudioContext, masterGain: GainNode, freq: number, start: number, dur: number, type: OscillatorType = "triangle") {
  const osc = ctx.createOscillator();
  const noteGain = ctx.createGain();
  osc.connect(noteGain);
  noteGain.connect(masterGain);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  noteGain.gain.setValueAtTime(0, start);
  noteGain.gain.linearRampToValueAtTime(0.2, start + 0.03);
  noteGain.gain.setValueAtTime(0.2, start + dur * 0.7);
  noteGain.gain.linearRampToValueAtTime(0, start + dur);
  osc.start(start);
  osc.stop(start + dur + 0.01);
}

// Short theme snippets: [freq, duration][]
const themes: Partial<Record<WorldId, [number, number][]>> = {
  marvel: [
    [261.63, 0.2], [329.63, 0.2], [392, 0.2], [523.25, 0.4],
    [392, 0.15], [523.25, 0.5],
  ],
  potter: [
    [493.88, 0.35], [659.25, 0.5], [783.99, 0.18], [739.99, 0.35],
    [659.25, 0.7], [987.77, 0.35], [880, 0.6],
  ],
  percy: [
    [329.63, 0.25], [392, 0.25], [493.88, 0.25], [392, 0.25],
    [329.63, 0.5], [261.63, 0.25], [329.63, 0.5],
  ],
  friends: [
    [392, 0.2], [392, 0.2], [440, 0.3], [493.88, 0.3],
    [440, 0.2], [392, 0.4],
  ],
  stranger: [
    [220, 0.4], [196, 0.3], [174.61, 0.5],
    [220, 0.3], [261.63, 0.4], [220, 0.6],
  ],
};

export function playWorldTheme(worldId: WorldId) {
  stop();
  const melody = themes[worldId];
  if (!melody) return;

  const ctx = getCtx();
  if (!ctx) return;
  currentCtx = ctx;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const totalDur = melody.reduce((s, [, d]) => s + d, 0) + 0.15;
  let t = ctx.currentTime + 0.05;

  // Loop melody while hovering (stop is called on mouse leave)
  for (let i = 0; i < 8; i++) {
    for (const [freq, dur] of melody) {
      playNote(ctx, masterGain, freq, t, dur, worldId === "stranger" ? "sawtooth" : "triangle");
      t += dur;
    }
    t += 0.2;
  }
}

export function stopWorldTheme() {
  stop();
}

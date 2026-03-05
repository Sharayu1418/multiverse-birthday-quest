/**
 * Procedural synth audio engine for the Vecna success sequence.
 * Uses Web Audio API to create dark-synth sounds synced with clock animation.
 */

export function playSuccessAudio() {
  let ctx: AudioContext;
  try {
    ctx = new AudioContext();
  } catch {
    return { stop: () => {} };
  }

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const now = ctx.currentTime;

  // ── 1. RISING SYNTH PAD (starts at clock spin ~0s, rises over 2s) ──
  const pad1 = ctx.createOscillator();
  const pad1Gain = ctx.createGain();
  const pad1Filter = ctx.createBiquadFilter();
  pad1.type = "sawtooth";
  pad1.frequency.value = 55; // low A
  pad1.frequency.linearRampToValueAtTime(110, now + 2);
  pad1Filter.type = "lowpass";
  pad1Filter.frequency.value = 200;
  pad1Filter.frequency.linearRampToValueAtTime(1200, now + 1.8);
  pad1Gain.gain.value = 0;
  pad1Gain.gain.linearRampToValueAtTime(0.12, now + 0.5);
  pad1Gain.gain.linearRampToValueAtTime(0.22, now + 1.8);
  pad1Gain.gain.linearRampToValueAtTime(0, now + 2.05); // abrupt cut at clock stop
  pad1.connect(pad1Filter);
  pad1Filter.connect(pad1Gain);
  pad1Gain.connect(master);
  pad1.start(now);
  pad1.stop(now + 2.1);

  // ── 2. SECOND DETUNED PAD (chorus effect) ──
  const pad2 = ctx.createOscillator();
  const pad2Gain = ctx.createGain();
  pad2.type = "sawtooth";
  pad2.frequency.value = 55.5;
  pad2.frequency.linearRampToValueAtTime(111, now + 2);
  pad2Gain.gain.value = 0;
  pad2Gain.gain.linearRampToValueAtTime(0.08, now + 0.5);
  pad2Gain.gain.linearRampToValueAtTime(0.16, now + 1.8);
  pad2Gain.gain.linearRampToValueAtTime(0, now + 2.05);
  pad2.connect(pad1Filter); // share filter
  pad2Gain.gain.value = 0.08;
  pad2.connect(pad2Gain);
  pad2Gain.connect(master);
  pad2.start(now);
  pad2.stop(now + 2.1);

  // ── 3. DEEP BASS PULSES (4 pulses over 2s) ──
  for (let i = 0; i < 5; i++) {
    const t = now + i * 0.4;
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = "sine";
    bass.frequency.value = 35 + i * 3; // rising pitch
    bassGain.gain.setValueAtTime(0, t);
    bassGain.gain.linearRampToValueAtTime(0.18 + i * 0.03, t + 0.05);
    bassGain.gain.linearRampToValueAtTime(0, t + 0.35);
    bass.connect(bassGain);
    bassGain.connect(master);
    bass.start(t);
    bass.stop(t + 0.4);
  }

  // ── 4. METALLIC CLOCK TICKING ECHOES (accelerating) ──
  const tickCount = 12;
  for (let i = 0; i < tickCount; i++) {
    // Accelerating: ticks get closer together
    const t = now + (i / tickCount) * 1.8 * (1 - i / (tickCount * 3));
    const tick = ctx.createOscillator();
    const tickGain = ctx.createGain();
    const tickFilter = ctx.createBiquadFilter();
    tick.type = "square";
    tick.frequency.value = 2000 + Math.random() * 1000;
    tickFilter.type = "bandpass";
    tickFilter.frequency.value = 3000;
    tickFilter.Q.value = 8;
    tickGain.gain.setValueAtTime(0, t);
    tickGain.gain.linearRampToValueAtTime(0.04 + i * 0.005, t + 0.005);
    tickGain.gain.linearRampToValueAtTime(0, t + 0.06);
    tick.connect(tickFilter);
    tickFilter.connect(tickGain);
    tickGain.connect(master);
    tick.start(t);
    tick.stop(t + 0.08);
  }

  // ── 5. DISTANT THUNDER RUMBLE (noise burst at ~1s) ──
  const noiseLen = 1.5;
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * noiseLen, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * 0.5;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 150;
  noiseGain.gain.setValueAtTime(0, now + 0.8);
  noiseGain.gain.linearRampToValueAtTime(0.12, now + 1.0);
  noiseGain.gain.linearRampToValueAtTime(0.06, now + 1.5);
  noiseGain.gain.linearRampToValueAtTime(0, now + 2.0);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(now + 0.8);
  noise.stop(now + 2.1);

  // ── 6. RISING HIGH TENSION (white noise sweep) ──
  const sweepBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const sweepData = sweepBuffer.getChannelData(0);
  for (let i = 0; i < sweepData.length; i++) {
    sweepData[i] = (Math.random() * 2 - 1);
  }
  const sweep = ctx.createBufferSource();
  sweep.buffer = sweepBuffer;
  const sweepFilter = ctx.createBiquadFilter();
  sweepFilter.type = "bandpass";
  sweepFilter.frequency.value = 500;
  sweepFilter.frequency.linearRampToValueAtTime(4000, now + 1.9);
  sweepFilter.Q.value = 3;
  const sweepGain = ctx.createGain();
  sweepGain.gain.setValueAtTime(0, now);
  sweepGain.gain.linearRampToValueAtTime(0.06, now + 1.5);
  sweepGain.gain.linearRampToValueAtTime(0, now + 2.05); // cut
  sweep.connect(sweepFilter);
  sweepFilter.connect(sweepGain);
  sweepGain.connect(master);
  sweep.start(now);
  sweep.stop(now + 2.1);

  // ── MASTER FADE IN ──
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.8, now + 0.3);
  master.gain.setValueAtTime(0.8, now + 1.9);
  // ── ABRUPT CUT at 2s (clock stops) ──
  master.gain.linearRampToValueAtTime(0, now + 2.05);

  // ── 7. POST-STOP: LOW ATMOSPHERIC HUM (starts after brief silence) ──
  const hum1 = ctx.createOscillator();
  const hum2 = ctx.createOscillator();
  const humGain = ctx.createGain();
  const humFilter = ctx.createBiquadFilter();
  hum1.type = "sine";
  hum1.frequency.value = 48;
  hum2.type = "sine";
  hum2.frequency.value = 72;
  humFilter.type = "lowpass";
  humFilter.frequency.value = 120;
  humGain.gain.setValueAtTime(0, now + 2.4);
  humGain.gain.linearRampToValueAtTime(0.1, now + 3.2);
  humGain.gain.setValueAtTime(0.1, now + 6);
  humGain.gain.linearRampToValueAtTime(0, now + 9);
  hum1.connect(humFilter);
  hum2.connect(humFilter);
  humFilter.connect(humGain);
  humGain.connect(ctx.destination); // bypass master (which is cut)
  hum1.start(now + 2.4);
  hum2.start(now + 2.4);
  hum1.stop(now + 9.5);
  hum2.stop(now + 9.5);

  // Cleanup
  const cleanup = setTimeout(() => {
    try { ctx.close(); } catch {}
  }, 10000);

  return {
    stop: () => {
      clearTimeout(cleanup);
      try {
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        humGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        setTimeout(() => { try { ctx.close(); } catch {} }, 200);
      } catch {}
    },
  };
}

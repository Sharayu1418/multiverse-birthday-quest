import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import skylineImg from "@/assets/new_york_skyline.jpg";
import ClockFace from "./ClockFace";
import PortalRift from "./PortalRift";
import ColorSequenceDisplay, { type ToneColor, COLOR_MAP } from "./ColorSequenceDisplay";
import SequenceInputButtons from "./SequenceInputButtons";

type Phase = "entry" | "playing" | "input" | "success";

// Forward sequence shown to player
const FORWARD_SEQUENCE: ToneColor[] = ["green", "blue", "red", "yellow", "blue", "red"];
// Correct answer (reversed)
const ANSWER: ToneColor[] = ["red", "blue", "yellow", "red", "blue", "green"];

function playTone(freq: number, duration = 0.35) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.13;
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.1);
    setTimeout(() => ctx.close(), (duration + 0.2) * 1000);
  } catch {}
}

export default function VecnaClockReversal() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("entry");
  const [activeLight, setActiveLight] = useState<ToneColor | null>(null);
  const [playerInput, setPlayerInput] = useState<ToneColor[]>([]);
  const [pressedButton, setPressedButton] = useState<ToneColor | null>(null);
  const [error, setError] = useState(false);
  const [clockCracked, setClockCracked] = useState(false);
  const [clockSpinning, setClockSpinning] = useState(false);
  const [clockStopped, setClockStopped] = useState(false);
  const [lightningStrike, setLightningStrike] = useState(false);
  const [portalCollapse, setPortalCollapse] = useState(0);
  const [vinesRetreat, setVinesRetreat] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  // Ambient lightning (random flashes during play)
  const [ambientFlash, setAmbientFlash] = useState(false);
  useEffect(() => {
    if (phase === "success") return;
    const flash = () => {
      setAmbientFlash(true);
      setTimeout(() => setAmbientFlash(false), 150);
    };
    const schedule = () => setTimeout(() => { flash(); schedule(); }, 4000 + Math.random() * 8000);
    const t = schedule();
    return () => clearTimeout(t as any);
  }, [phase]);

  // Spores
  const spores = useMemo(
    () =>
      Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 4,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * 4,
        drift: (Math.random() - 0.5) * 60,
      })),
    []
  );

  // ─── ENTRY ───
  useEffect(() => {
    if (phase !== "entry") return;
    try {
      const ctx = new AudioContext();
      audioRef.current = ctx;
      const tick = () => {
        if (ctx.state === "closed") return;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "square";
        o.frequency.value = 800;
        g.gain.value = 0.07;
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.06);
      };
      tickRef.current = setInterval(tick, 1000);
    } catch {}
    const t = setTimeout(() => setPhase("playing"), 4500);
    return () => {
      clearTimeout(t);
      if (tickRef.current) clearInterval(tickRef.current);
      if (audioRef.current && audioRef.current.state !== "closed") {
        try { audioRef.current.close(); } catch {}
      }
    };
  }, [phase]);

  // ─── PLAY SEQUENCE ───
  useEffect(() => {
    if (phase !== "playing") return;
    let cancelled = false;
    const run = async () => {
      for (let i = 0; i < FORWARD_SEQUENCE.length; i++) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 550));
        if (cancelled) return;
        const c = FORWARD_SEQUENCE[i];
        setActiveLight(c);
        playTone(COLOR_MAP[c].freq);
        await new Promise((r) => setTimeout(r, 450));
        if (cancelled) return;
        setActiveLight(null);
      }
      await new Promise((r) => setTimeout(r, 350));
      if (!cancelled) setPhase("input");
    };
    run();
    return () => { cancelled = true; };
  }, [phase]);

  // Auto-replay
  useEffect(() => {
    if (phase !== "input") return;
    const t = setTimeout(() => { setPlayerInput([]); setPhase("playing"); }, 12000);
    return () => clearTimeout(t);
  }, [phase, playerInput]);

  // ─── INPUT ───
  const handlePress = useCallback(
    (color: ToneColor) => {
      if (phase !== "input") return;
      playTone(COLOR_MAP[color].freq);
      setPressedButton(color);
      setTimeout(() => setPressedButton(null), 200);

      const next = [...playerInput, color];
      setPlayerInput(next);

      const idx = next.length - 1;
      if (next[idx] !== ANSWER[idx]) {
        setError(true);
        setTimeout(() => { setError(false); setPlayerInput([]); setPhase("playing"); }, 1200);
        return;
      }

      if (next.length === ANSWER.length) {
        if (tickRef.current) clearInterval(tickRef.current);
        if (audioRef.current && audioRef.current.state !== "closed") {
          try { audioRef.current.close(); } catch {}
        }
        setPhase("success");
      }
    },
    [phase, playerInput]
  );

  // ─── SUCCESS ───
  useEffect(() => {
    if (phase !== "success") return;
    const t1 = setTimeout(() => setClockCracked(true), 500);
    const t2 = setTimeout(() => setLightningStrike(true), 1200);
    const t3 = setTimeout(() => setLightningStrike(false), 1600);
    const t4 = setTimeout(() => setVinesRetreat(true), 1400);
    const t5 = setTimeout(() => setClockSpinning(true), 2000);
    const t6 = setTimeout(() => { setClockSpinning(false); setClockStopped(true); }, 4000);
    const t7 = setTimeout(() => {
      const start = Date.now();
      const animate = () => {
        const p = Math.min(1, (Date.now() - start) / 3500);
        setPortalCollapse(p);
        if (p < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, 2200);
    return () => { [t1, t2, t3, t4, t5, t6, t7].forEach(clearTimeout); };
  }, [phase]);

  const isSuccess = phase === "success";

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "hsl(0 10% 3%)" }}>
      {/* ── BACKGROUND ── */}
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${skylineImg})`,
            filter: "brightness(0.42) contrast(1.15) saturate(0.3)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, hsl(0 30% 5% / 0.55) 0%, hsl(0 20% 3% / 0.25) 50%, hsl(0 40% 8% / 0.45) 100%)" }}
        />
      </motion.div>

      {/* ── PORTAL ── */}
      <PortalRift collapse={portalCollapse} active={!isSuccess || portalCollapse < 1} />

      {/* ── FOG ── */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute z-[4] pointer-events-none"
          style={{
            bottom: `${5 + i * 8}%`,
            width: "140%",
            height: 60 + i * 20,
            background: `linear-gradient(90deg, transparent, hsl(0 15% 12% / ${0.12 + i * 0.04}), transparent)`,
            filter: "blur(18px)",
          }}
          animate={{ x: ["-20%", "10%", "-20%"] }}
          transition={{ duration: 14 + i * 4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ── SPORES ── */}
      <div className="absolute inset-0 z-[6] pointer-events-none">
        {spores.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full"
            style={{
              width: s.size,
              height: s.size,
              left: `${s.x}%`,
              top: `${s.y}%`,
              background: "radial-gradient(circle, hsl(0 30% 55% / 0.4), transparent)",
            }}
            animate={{ y: [0, -50 - Math.random() * 60], x: [0, s.drift], opacity: [0, 0.5, 0] }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
          />
        ))}
      </div>

      {/* ── VINES ── */}
      {["left", "right"].map((side) => (
        <motion.div
          key={side}
          className="absolute top-0 bottom-0 z-[9] pointer-events-none"
          style={{
            [side]: 0,
            width: 60,
            background:
              side === "left"
                ? "linear-gradient(90deg, hsl(140 30% 8% / 0.7), transparent)"
                : "linear-gradient(270deg, hsl(140 30% 8% / 0.7), transparent)",
          }}
          animate={vinesRetreat ? { opacity: 0, x: side === "left" ? -80 : 80 } : { opacity: [0.4, 0.7, 0.4] }}
          transition={vinesRetreat ? { duration: 1.5 } : { duration: 5, repeat: Infinity }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 2 + Math.random() * 3,
                height: 40 + Math.random() * 100,
                background: "hsl(140 25% 15% / 0.6)",
                [side]: Math.random() * 30,
                top: `${10 + i * 14}%`,
                borderRadius: 3,
              }}
              animate={!vinesRetreat ? { scaleY: [1, 1.05, 1], rotate: [0, side === "left" ? 3 : -3, 0] } : {}}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
            />
          ))}
        </motion.div>
      ))}

      {/* ── LIGHTNING ── */}
      <AnimatePresence>
        {(lightningStrike || ambientFlash) && (
          <motion.div
            className="absolute inset-0 z-[30] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.15, 0.7, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: lightningStrike ? 0.45 : 0.2 }}
            style={{ background: `hsl(${lightningStrike ? "0 60% 70%" : "220 40% 80%"} / ${lightningStrike ? 0.35 : 0.15})` }}
          />
        )}
      </AnimatePresence>

      {/* ── SCANLINES & VIGNETTE ── */}
      <div
        className="absolute inset-0 z-[7] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 0% 0% / 0.06) 2px, hsl(0 0% 0% / 0.06) 4px)" }}
      />
      <div
        className="absolute inset-0 z-[8] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, hsl(0 30% 4% / 0.8) 100%)" }}
      />

      {/* ══════════ PHASES ══════════ */}
      <AnimatePresence mode="wait">
        {/* ── ENTRY ── */}
        {phase === "entry" && (
          <motion.div key="entry" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Grandfather clock body */}
            <motion.div
              className="relative"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1.4, ease: "easeOut" }}
            >
              <div
                className="relative w-36 h-52 sm:w-44 sm:h-64 flex flex-col items-center"
                style={{
                  background: "linear-gradient(180deg, hsl(30 30% 15%), hsl(20 25% 10%))",
                  borderRadius: "10px 10px 4px 4px",
                  border: "2px solid hsl(30 20% 20%)",
                  boxShadow: "0 0 45px hsl(0 50% 15% / 0.5), inset 0 0 20px hsl(0 20% 5% / 0.5)",
                }}
              >
                <div className="mt-3">
                  <ClockFace size="large" />
                </div>
                {/* Pendulum */}
                <motion.div
                  className="mt-2 w-0.5 h-16 sm:h-20 origin-top"
                  style={{ background: "hsl(30 20% 25%)" }}
                  animate={{ rotate: [-15, 15, -15] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
                    style={{
                      background: "radial-gradient(circle, hsl(40 40% 50%), hsl(30 30% 30%))",
                      border: "1px solid hsl(30 20% 25%)",
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
            {/* Warning text */}
            <motion.div className="text-center space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
              <motion.p
                className="font-mono text-lg sm:text-2xl font-black tracking-[0.2em] uppercase"
                style={{ color: "hsl(0 80% 55%)", textShadow: "0 0 20px hsl(0 80% 40%), 0 0 40px hsl(0 70% 30%)" }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ⚠ WARNING ⚠
              </motion.p>
              <motion.p
                className="font-mono text-sm sm:text-lg tracking-[0.15em] uppercase"
                style={{ color: "hsl(0 60% 50%)", textShadow: "0 0 15px hsl(0 60% 35%)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                VECNA SIGNAL DETECTED
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {/* ── PLAYING / INPUT ── */}
        {(phase === "playing" || phase === "input") && (
          <motion.div key="puzzle" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 sm:gap-5 px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Mini clock top-right */}
            <div className="absolute top-4 right-4">
              <ClockFace size="small" />
            </div>

            {/* Clue */}
            <div className="text-center space-y-1">
              <p className="font-mono text-xs sm:text-sm tracking-[0.12em] uppercase" style={{ color: "hsl(0 65% 55%)", textShadow: "0 0 10px hsl(0 60% 35%)" }}>
                TIME MOVES FORWARD
              </p>
              <p className="font-mono text-xs sm:text-sm tracking-[0.12em] uppercase" style={{ color: "hsl(0 65% 55%)", textShadow: "0 0 10px hsl(0 60% 35%)" }}>
                BUT THE UPSIDE DOWN MOVES BACKWARD
              </p>
              <p className="font-mono text-[10px] sm:text-xs tracking-wider mt-1" style={{ color: "hsl(0 40% 45%)" }}>
                REPEAT THE SEQUENCE TO SEAL THE GATE
              </p>
            </div>

            {/* Colored light display */}
            <ColorSequenceDisplay activeLight={activeLight} />

            {/* Progress dots */}
            <div className="flex gap-1.5">
              {ANSWER.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: i < playerInput.length ? "hsl(0 70% 55%)" : "hsl(0 15% 20%)",
                    boxShadow: i < playerInput.length ? "0 0 6px hsl(0 70% 50%)" : "none",
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <SequenceInputButtons disabled={phase !== "input"} pressedButton={pressedButton} onPress={handlePress} />

            {/* Feedback */}
            <AnimatePresence>
              {error && (
                <motion.p className="font-mono text-xs tracking-wider uppercase" style={{ color: "hsl(0 80% 55%)" }} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  Wrong sequence — listen again
                </motion.p>
              )}
            </AnimatePresence>
            {phase === "input" && !error && (
              <motion.p className="font-mono text-[10px] tracking-wider" style={{ color: "hsl(0 35% 40%)" }} animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                Your turn — press the buttons
              </motion.p>
            )}
          </motion.div>
        )}

        {/* ── SUCCESS ── */}
        {phase === "success" && (
          <motion.div key="success" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            {/* Cracking clock */}
            <motion.div className="relative">
              <div
                className="relative w-36 h-52 sm:w-44 sm:h-64 flex flex-col items-center"
                style={{
                  background: "linear-gradient(180deg, hsl(30 30% 15%), hsl(20 25% 10%))",
                  borderRadius: "10px 10px 4px 4px",
                  border: "2px solid hsl(30 20% 20%)",
                  boxShadow: clockCracked
                    ? "0 0 50px hsl(0 70% 30% / 0.7), 0 0 100px hsl(0 60% 20% / 0.3)"
                    : "0 0 25px hsl(0 40% 15% / 0.5)",
                }}
              >
                <div className="mt-3">
                  <ClockFace size="large" cracked={clockCracked} spinning={clockSpinning} stoppedAt1111={clockStopped} />
                </div>
                {/* Stopped pendulum */}
                <div className="mt-2 w-0.5 h-16 sm:h-20" style={{ background: "hsl(30 20% 25%)" }}>
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
                    style={{
                      background: "radial-gradient(circle, hsl(40 40% 50%), hsl(30 30% 30%))",
                      border: "1px solid hsl(30 20% 25%)",
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div className="text-center space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4.5 }}>
              <motion.h1
                className="font-mono text-2xl sm:text-4xl font-black tracking-[0.15em] uppercase"
                style={{ color: "hsl(120 60% 50%)", textShadow: "0 0 25px hsl(120 70% 40%), 0 0 50px hsl(120 60% 30%)" }}
              >
                THE GATE IS SEALED
              </motion.h1>
              <motion.p
                className="font-mono text-lg sm:text-2xl font-bold tracking-[0.2em] uppercase"
                style={{ color: "hsl(120 50% 45%)", textShadow: "0 0 15px hsl(120 60% 35%)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.8, 1] }}
                transition={{ delay: 6, duration: 2 }}
              >
                NEW YORK IS SAFE
              </motion.p>
            </motion.div>

            {/* Return button */}
            <motion.button
              onClick={() => navigate("/hub")}
              className="font-mono text-xs sm:text-sm uppercase tracking-[0.3em] px-8 py-3 rounded-sm cursor-pointer border"
              style={{
                color: "hsl(120 50% 50%)",
                borderColor: "hsl(120 30% 25%)",
                background: "hsl(120 15% 8% / 0.8)",
                boxShadow: "0 0 20px hsl(120 40% 20% / 0.4)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 7.5 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsl(120 50% 25% / 0.6)" }}
              whileTap={{ scale: 0.97 }}
            >
              Return to Hub
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

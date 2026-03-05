import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import skylineImg from "@/assets/new_york_skyline.jpg";

type Phase = "entry" | "playing" | "input" | "success";

const SEQUENCE = ["red", "blue", "yellow", "blue"] as const;
type ToneColor = (typeof SEQUENCE)[number];

const COLOR_MAP: Record<ToneColor, { bg: string; glow: string; freq: number }> = {
  red: { bg: "hsl(0 80% 50%)", glow: "hsl(0 90% 40%)", freq: 261.63 },
  blue: { bg: "hsl(220 80% 55%)", glow: "hsl(220 90% 45%)", freq: 329.63 },
  yellow: { bg: "hsl(50 90% 55%)", glow: "hsl(50 95% 45%)", freq: 392.0 },
};

const TONE_ORDER: ToneColor[] = ["red", "blue", "yellow"];

function playTone(freq: number, duration = 0.4) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.15;
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.1);
    setTimeout(() => ctx.close(), (duration + 0.2) * 1000);
  } catch {}
}

export default function VecnaClockSignal() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("entry");
  const [activeLight, setActiveLight] = useState<ToneColor | null>(null);
  const [playerInput, setPlayerInput] = useState<ToneColor[]>([]);
  const [pressedButton, setPressedButton] = useState<ToneColor | null>(null);
  const [error, setError] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [clockCracked, setClockCracked] = useState(false);
  const [lightningStrike, setLightningStrike] = useState(false);
  const [portalCollapse, setPortalCollapse] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  // Entry phase → playing after delay
  useEffect(() => {
    if (phase !== "entry") return;

    // Start ticking sound
    try {
      const ctx = new AudioContext();
      audioRef.current = ctx;
      const tick = () => {
        if (ctx.state === "closed") return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = 800;
        gain.gain.value = 0.08;
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      };
      tickRef.current = setInterval(tick, 1000);
    } catch {}

    const t = setTimeout(() => setPhase("playing"), 4000);
    return () => {
      clearTimeout(t);
      if (tickRef.current) clearInterval(tickRef.current);
      if (audioRef.current && audioRef.current.state !== "closed") {
        try { audioRef.current.close(); } catch {}
      }
    };
  }, [phase]);

  // Play the sequence
  useEffect(() => {
    if (phase !== "playing") return;
    let cancelled = false;

    const playSequence = async () => {
      for (let i = 0; i < SEQUENCE.length; i++) {
        if (cancelled) return;
        await new Promise(r => setTimeout(r, 600));
        if (cancelled) return;
        const color = SEQUENCE[i];
        setActiveLight(color);
        playTone(COLOR_MAP[color].freq);
        await new Promise(r => setTimeout(r, 500));
        if (cancelled) return;
        setActiveLight(null);
      }
      await new Promise(r => setTimeout(r, 400));
      if (!cancelled) {
        setPhase("input");
        setPlayCount(c => c + 1);
      }
    };

    playSequence();
    return () => { cancelled = true; };
  }, [phase]);

  // Replay every 8 seconds if idle
  useEffect(() => {
    if (phase !== "input") return;
    const t = setTimeout(() => {
      setPlayerInput([]);
      setPhase("playing");
    }, 10000);
    return () => clearTimeout(t);
  }, [phase, playerInput]);

  const handleButtonPress = useCallback((color: ToneColor) => {
    if (phase !== "input") return;
    playTone(COLOR_MAP[color].freq);
    setPressedButton(color);
    setTimeout(() => setPressedButton(null), 200);

    const next = [...playerInput, color];
    setPlayerInput(next);

    // Check correctness so far
    const idx = next.length - 1;
    if (next[idx] !== SEQUENCE[idx]) {
      setError(true);
      setTimeout(() => {
        setError(false);
        setPlayerInput([]);
        setPhase("playing");
      }, 1000);
      return;
    }

    // Complete?
    if (next.length === SEQUENCE.length) {
      if (tickRef.current) clearInterval(tickRef.current);
      if (audioRef.current && audioRef.current.state !== "closed") {
        try { audioRef.current.close(); } catch {}
      }
      setPhase("success");
    }
  }, [phase, playerInput]);

  // Success animation sequence
  useEffect(() => {
    if (phase !== "success") return;

    // Clock cracks
    const t1 = setTimeout(() => setClockCracked(true), 500);
    // Lightning
    const t2 = setTimeout(() => setLightningStrike(true), 1200);
    const t3 = setTimeout(() => setLightningStrike(false), 1500);
    // Portal collapse
    const t4 = setTimeout(() => {
      const start = Date.now();
      const animate = () => {
        const p = Math.min(1, (Date.now() - start) / 3000);
        setPortalCollapse(p);
        if (p < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, 1800);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [phase]);

  // Spores
  const spores = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: 1 + Math.random() * 4, duration: 4 + Math.random() * 6,
    delay: Math.random() * 4, drift: (Math.random() - 0.5) * 60,
  })), []);

  // Clock crack lines
  const cracks = useMemo(() => Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * 360;
    const len = 30 + Math.random() * 50;
    return { angle, len, width: 1 + Math.random() * 2 };
  }), []);

  const isSuccess = phase === "success";

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "hsl(0 10% 3%)" }}>
      {/* NY Skyline background */}
      <motion.div className="absolute inset-0"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${skylineImg})`,
            filter: "brightness(0.4) contrast(1.2) saturate(0.3)",
          }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, hsl(0 30% 5% / 0.6) 0%, hsl(0 20% 3% / 0.3) 50%, hsl(0 40% 8% / 0.5) 100%)" }} />
      </motion.div>

      {/* Upside Down portal in sky */}
      <motion.div className="absolute top-[8%] left-1/2 -translate-x-1/2 z-[5]"
        style={{
          width: isSuccess ? 200 * (1 - portalCollapse) : 280,
          height: isSuccess ? 100 * (1 - portalCollapse) : 140,
          background: `radial-gradient(ellipse, hsl(0 80% 25% / ${isSuccess ? 0.1 * (1 - portalCollapse) : 0.35}), transparent 70%)`,
          filter: `blur(${isSuccess ? 30 * (1 - portalCollapse) : 25}px)`,
          borderRadius: "50%",
        }}
        animate={!isSuccess ? { opacity: [0.4, 0.8, 0.4] } : {}}
        transition={{ duration: 3, repeat: Infinity }} />

      {/* Floating spores */}
      <div className="absolute inset-0 z-[6] pointer-events-none">
        {spores.map(s => (
          <motion.div key={s.id} className="absolute rounded-full"
            style={{
              width: s.size, height: s.size,
              left: `${s.x}%`, top: `${s.y}%`,
              background: "radial-gradient(circle, hsl(0 30% 55% / 0.4), transparent)",
            }}
            animate={{ y: [0, -50 - Math.random() * 60], x: [0, s.drift], opacity: [0, 0.5, 0] }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }} />
        ))}
      </div>

      {/* Lightning flash */}
      <AnimatePresence>
        {lightningStrike && (
          <motion.div className="absolute inset-0 z-[30] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.2, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ background: "hsl(220 40% 80% / 0.4)" }} />
        )}
      </AnimatePresence>

      {/* Scanlines */}
      <div className="absolute inset-0 z-[7] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 0% 0% / 0.06) 2px, hsl(0 0% 0% / 0.06) 4px)" }} />

      {/* Vignette */}
      <div className="absolute inset-0 z-[8] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, hsl(0 30% 4% / 0.8) 100%)" }} />

      {/* ===== ENTRY PHASE ===== */}
      <AnimatePresence mode="wait">
        {phase === "entry" && (
          <motion.div key="entry" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Grandfather clock */}
            <motion.div className="relative"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}>
              {/* Clock body */}
              <div className="relative w-32 h-48 sm:w-40 sm:h-60 flex flex-col items-center"
                style={{
                  background: "linear-gradient(180deg, hsl(30 30% 15%), hsl(20 25% 10%))",
                  borderRadius: "8px 8px 4px 4px",
                  border: "2px solid hsl(30 20% 20%)",
                  boxShadow: "0 0 40px hsl(0 50% 15% / 0.5), inset 0 0 20px hsl(0 20% 5% / 0.5)",
                }}>
                {/* Clock face */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full mt-3 flex items-center justify-center"
                  style={{
                    background: "radial-gradient(circle, hsl(40 20% 85%), hsl(30 15% 70%))",
                    border: "3px solid hsl(30 30% 25%)",
                    boxShadow: "inset 0 0 10px hsl(0 10% 30% / 0.3)",
                  }}>
                  {/* Roman numerals */}
                  {["XII", "III", "VI", "IX"].map((num, i) => {
                    const angle = i * 90 - 90;
                    const rad = (angle * Math.PI) / 180;
                    const r = 38;
                    return (
                      <span key={num} className="absolute font-serif text-[8px] sm:text-[10px] font-bold"
                        style={{
                          color: "hsl(0 20% 20%)",
                          left: `calc(50% + ${Math.cos(rad) * r}px - 8px)`,
                          top: `calc(50% + ${Math.sin(rad) * r}px - 6px)`,
                        }}>
                        {num}
                      </span>
                    );
                  })}
                  {/* Clock hands */}
                  <motion.div className="absolute w-0.5 h-8 origin-bottom rounded-full"
                    style={{ background: "hsl(0 20% 15%)", bottom: "50%", left: "calc(50% - 1px)" }}
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
                  <motion.div className="absolute w-1 h-6 origin-bottom rounded-full"
                    style={{ background: "hsl(0 30% 20%)", bottom: "50%", left: "calc(50% - 2px)" }}
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }} />
                  <div className="absolute w-2 h-2 rounded-full" style={{ background: "hsl(0 20% 15%)" }} />
                </div>
                {/* Pendulum */}
                <motion.div className="mt-2 w-0.5 h-16 sm:h-20 origin-top"
                  style={{ background: "hsl(30 20% 25%)" }}
                  animate={{ rotate: [-15, 15, -15] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
                    style={{ background: "radial-gradient(circle, hsl(40 40% 50%), hsl(30 30% 30%))", border: "1px solid hsl(30 20% 25%)" }} />
                </motion.div>
              </div>
            </motion.div>

            {/* Warning text */}
            <motion.div className="text-center space-y-2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
              <motion.p className="font-mono text-lg sm:text-2xl font-black tracking-[0.2em] uppercase"
                style={{ color: "hsl(0 80% 55%)", textShadow: "0 0 20px hsl(0 80% 40%), 0 0 40px hsl(0 70% 30%)" }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}>
                ⚠ WARNING ⚠
              </motion.p>
              <motion.p className="font-mono text-sm sm:text-lg tracking-[0.15em] uppercase"
                style={{ color: "hsl(0 60% 50%)", textShadow: "0 0 15px hsl(0 60% 35%)" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
                VECNA SIGNAL DETECTED
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {/* ===== PLAYING / INPUT PHASE ===== */}
        {(phase === "playing" || phase === "input") && (
          <motion.div key="puzzle" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 sm:gap-6 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Small clock in corner */}
            <motion.div className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, hsl(40 15% 75%), hsl(30 10% 55%))",
                border: "2px solid hsl(30 25% 25%)",
                boxShadow: "0 0 15px hsl(0 40% 20% / 0.5)",
              }}>
              <motion.div className="absolute w-0.5 h-3 origin-bottom rounded-full"
                style={{ background: "hsl(0 20% 15%)", bottom: "50%" }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
            </motion.div>

            {/* Clue text */}
            <div className="text-center space-y-1">
              <p className="font-mono text-xs sm:text-sm tracking-[0.15em] uppercase"
                style={{ color: "hsl(0 65% 55%)", textShadow: "0 0 10px hsl(0 60% 35%)" }}>
                THE CLOCK SPEAKS IN PATTERNS
              </p>
              <p className="font-mono text-[10px] sm:text-xs tracking-wider"
                style={{ color: "hsl(0 40% 45%)" }}>
                REPEAT THE SEQUENCE TO SEAL THE GATE
              </p>
            </div>

            {/* Tone visualization - colored lights */}
            <div className="flex items-center gap-4 sm:gap-6">
              {TONE_ORDER.map(color => {
                const isActive = activeLight === color;
                const isPressed = pressedButton === color;
                const lit = isActive || isPressed;
                const cfg = COLOR_MAP[color];
                return (
                  <motion.div key={color}
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-full"
                    style={{
                      background: lit ? cfg.bg : `${cfg.bg.replace(/\d+%\)$/, "15%)")}`,
                      boxShadow: lit ? `0 0 30px ${cfg.glow}, 0 0 60px ${cfg.glow}` : `0 0 5px ${cfg.glow.replace(/\d+%\)$/, "10%)")}`,
                      border: `2px solid ${cfg.bg.replace(/\d+%\)$/, "30%)")}`,
                      transition: "all 0.15s",
                    }}
                    animate={lit ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  />
                );
              })}
            </div>

            {/* Sequence progress */}
            <div className="flex gap-2">
              {SEQUENCE.map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full"
                  style={{
                    background: i < playerInput.length
                      ? "hsl(0 70% 55%)"
                      : "hsl(0 15% 20%)",
                    boxShadow: i < playerInput.length ? "0 0 6px hsl(0 70% 50%)" : "none",
                  }} />
              ))}
            </div>

            {/* Player buttons */}
            <div className="flex items-center gap-3 sm:gap-5">
              {TONE_ORDER.map(color => {
                const cfg = COLOR_MAP[color];
                return (
                  <motion.button key={color}
                    onClick={() => handleButtonPress(color)}
                    disabled={phase !== "input"}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl cursor-pointer disabled:cursor-not-allowed font-mono text-xs font-bold uppercase tracking-wider"
                    style={{
                      background: `linear-gradient(135deg, ${cfg.bg}, ${cfg.bg.replace(/\d+%\)$/, "35%)")})`,
                      border: `2px solid ${cfg.bg.replace(/\d+%\)$/, "50%)")}`,
                      color: "hsl(0 0% 95%)",
                      boxShadow: pressedButton === color
                        ? `0 0 25px ${cfg.glow}, inset 0 0 15px ${cfg.glow}`
                        : `0 0 8px ${cfg.glow.replace(/\d+%\)$/, "15%)")}`,
                      opacity: phase === "input" ? 1 : 0.5,
                    }}
                    whileHover={phase === "input" ? { scale: 1.08 } : {}}
                    whileTap={phase === "input" ? { scale: 0.92 } : {}}>
                    {color}
                  </motion.button>
                );
              })}
            </div>

            {/* Error feedback */}
            <AnimatePresence>
              {error && (
                <motion.p className="font-mono text-xs tracking-wider uppercase"
                  style={{ color: "hsl(0 80% 55%)" }}
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  Wrong sequence — listen again
                </motion.p>
              )}
            </AnimatePresence>

            {phase === "input" && !error && (
              <motion.p className="font-mono text-[10px] tracking-wider"
                style={{ color: "hsl(0 35% 40%)" }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}>
                Your turn — press the buttons
              </motion.p>
            )}
          </motion.div>
        )}

        {/* ===== SUCCESS PHASE ===== */}
        {phase === "success" && (
          <motion.div key="success" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            {/* Cracking clock */}
            <motion.div className="relative"
              animate={clockCracked ? { scale: [1, 1.1, 0.9, 1], rotate: [0, -5, 5, 0] } : {}}
              transition={{ duration: 0.6 }}>
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle, hsl(40 20% 80%), hsl(30 15% 60%))",
                  border: "3px solid hsl(30 25% 25%)",
                  boxShadow: clockCracked
                    ? "0 0 40px hsl(0 70% 30% / 0.6), 0 0 80px hsl(0 60% 20% / 0.3)"
                    : "0 0 20px hsl(0 40% 15% / 0.4)",
                }}>
                {/* Crack lines */}
                {clockCracked && cracks.map((crack, i) => (
                  <motion.div key={i} className="absolute origin-center"
                    style={{
                      width: crack.width,
                      height: crack.len,
                      background: "hsl(0 60% 25%)",
                      transform: `rotate(${crack.angle}deg)`,
                      top: "50%",
                      left: "50%",
                      transformOrigin: "0 0",
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }} />
                ))}
                {/* Stopped hands */}
                <div className="absolute w-0.5 h-10 origin-bottom rounded-full"
                  style={{ background: "hsl(0 20% 15%)", bottom: "50%", left: "calc(50% - 1px)", transform: "rotate(45deg)" }} />
                <div className="absolute w-1 h-7 origin-bottom rounded-full"
                  style={{ background: "hsl(0 30% 20%)", bottom: "50%", left: "calc(50% - 2px)", transform: "rotate(-30deg)" }} />
              </div>
            </motion.div>

            {/* Success text */}
            <motion.div className="text-center space-y-3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
              <motion.h1 className="font-mono text-2xl sm:text-4xl font-black tracking-[0.15em] uppercase"
                style={{
                  color: "hsl(120 60% 50%)",
                  textShadow: "0 0 25px hsl(120 70% 40%), 0 0 50px hsl(120 60% 30%)",
                }}>
                THE GATE IS SEALED
              </motion.h1>
              <motion.p className="font-mono text-lg sm:text-2xl font-bold tracking-[0.2em] uppercase"
                style={{
                  color: "hsl(120 50% 45%)",
                  textShadow: "0 0 15px hsl(120 60% 35%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.8, 1] }}
                transition={{ delay: 4, duration: 2 }}>
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
              transition={{ delay: 5.5 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsl(120 50% 25% / 0.6)" }}
              whileTap={{ scale: 0.97 }}>
              Return to Hub
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

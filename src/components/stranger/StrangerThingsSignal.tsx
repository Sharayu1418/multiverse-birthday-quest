import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useIsMobile } from "@/hooks/use-mobile";
import ChristmasLightAlphabet from "./ChristmasLightAlphabet";
import CinematicSuccessScene from "./CinematicSuccessScene";
import { ArrowLeft } from "lucide-react";

type Phase = "glitch" | "video" | "decode" | "solved" | "portal";

const FLASH_SEQUENCE = [20, 8, 5, 7, 1, 20, 5, 9, 19, 15, 16, 5, 14, 14, 5, 23, 25, 15, 18, 11, 9, 19, 14, 5, 24, 20];
const CORRECT_ANSWER = "THE GATE IS OPEN NEW YORK IS NEXT";

// Simulated "video" duration in ms
const VIDEO_DURATION = 11000;
// How long each number flashes
const FLASH_DURATION = 200;

const CREEPING_VINES = [
  { d: "M0,0 Q20,60 5,120 Q-15,180 10,240 Q30,300 5,360", side: "left" as const, w: 60, h: 400 },
  { d: "M0,100 Q35,130 20,170 Q5,210 25,250 Q40,290 15,340", side: "left" as const, w: 60, h: 400 },
  { d: "M60,0 Q40,50 55,110 Q70,170 45,230 Q30,290 50,350", side: "right" as const, w: 60, h: 400 },
  { d: "M60,80 Q35,120 50,160 Q65,200 40,250 Q25,300 55,340", side: "right" as const, w: 60, h: 400 },
  { d: "M0,0 Q80,25 160,10 Q240,30 320,5 Q400,20 480,8", side: "top" as const, w: 500, h: 40 },
  { d: "M0,30 Q120,5 240,25 Q360,0 480,20 Q600,5 720,30", side: "bottom" as const, w: 900, h: 35 },
];

const LIGHT_COLORS = [
  "hsl(0 85% 55%)", "hsl(45 90% 55%)", "hsl(120 70% 45%)",
  "hsl(210 80% 55%)", "hsl(280 70% 55%)", "hsl(30 90% 55%)",
];

export default function StrangerThingsSignal() {
  const navigate = useNavigate();
  const { markSolved } = useGameProgress();
  const isMobile = useIsMobile();

  const [phase, setPhase] = useState<Phase>("glitch");
  const [currentFlash, setCurrentFlash] = useState<number | null>(null);
  const [revealedNumbers, setRevealedNumbers] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [shake, setShake] = useState(false);
  const [hint, setHint] = useState(false);
  const [monsterProximity, setMonsterProximity] = useState(0);
  const [vineProgress, setVineProgress] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);
  const monsterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Phase 1: Glitch → Video
  useEffect(() => {
    if (phase !== "glitch") return;
    const t = setTimeout(() => setPhase("video"), 3000);
    return () => clearTimeout(t);
  }, [phase]);

  // Phase 2: Video with flashing numbers
  useEffect(() => {
    if (phase !== "video") return;

    const interval = VIDEO_DURATION / FLASH_SEQUENCE.length;
    const timers: ReturnType<typeof setTimeout>[] = [];

    FLASH_SEQUENCE.forEach((num, i) => {
      // Show number
      timers.push(setTimeout(() => {
        setCurrentFlash(num);
        setRevealedNumbers(prev => [...prev, num]);
      }, i * interval));
      // Hide number
      timers.push(setTimeout(() => {
        setCurrentFlash(null);
      }, i * interval + FLASH_DURATION));
    });

    // Transition to decode phase
    timers.push(setTimeout(() => {
      setPhase("decode");
    }, VIDEO_DURATION + 500));

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Monster approach during decode
  useEffect(() => {
    if (phase !== "decode") return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / 45000); // 45 seconds to full danger
      setMonsterProximity(progress);
      setVineProgress(progress);
      if (elapsed < 45000) rafId = requestAnimationFrame(tick);
    };
    let rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [phase]);

  // Eerie audio during decode
  useEffect(() => {
    if (phase !== "decode") return;
    try {
      const ctx = new AudioContext();
      audioRef.current = ctx;

      const createDrone = (freq: number, vol: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        filter.type = "lowpass";
        filter.frequency.value = 200;
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 2);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        return { osc, gain };
      };

      const d1 = createDrone(55, 0.06);
      const d2 = createDrone(82.5, 0.03);
      const d3 = createDrone(38, 0.04);

      // Monster sounds that get more frequent as proximity increases
      monsterIntervalRef.current = setInterval(() => {
        if (ctx.state === "closed") return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        const base = 30 + Math.random() * 50;
        osc.frequency.value = base;
        osc.frequency.linearRampToValueAtTime(base * 0.4, ctx.currentTime + 1.5);
        const vol = 0.03 + monsterProximity * 0.08;
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.3);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2.5);
      }, Math.max(1500, 4000 - monsterProximity * 3000));

      return () => {
        if (monsterIntervalRef.current) clearInterval(monsterIntervalRef.current);
        try {
          d1.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
          d2.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
          d3.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
          setTimeout(() => {
            try { d1.osc.stop(); d2.osc.stop(); d3.osc.stop(); ctx.close(); } catch {}
          }, 400);
        } catch {}
      };
    } catch {}
  }, [phase]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().toUpperCase() === CORRECT_ANSWER) {
      if (monsterIntervalRef.current) clearInterval(monsterIntervalRef.current);
      if (audioRef.current && audioRef.current.state !== "closed") {
        try { audioRef.current.close(); } catch {}
      }
      markSolved("stranger");
      setPhase("solved");
      setTimeout(() => setPhase("portal"), 3500);
    } else {
      setShake(true);
      setHint(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [inputValue, markSolved]);

  const spores = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 4,
    duration: 3 + Math.random() * 7,
    delay: Math.random() * 5,
    drift: (Math.random() - 0.5) * 50,
    glow: Math.random() > 0.6,
  })), []);

  // Simulated video: flickering Christmas lights on a dark wall
  const videoLights = useMemo(() => Array.from({ length: 26 }).map((_, i) => ({
    char: String.fromCharCode(65 + i),
    x: 10 + (i % 7) * 13,
    y: 20 + Math.floor(i / 7) * 18,
    color: LIGHT_COLORS[i % LIGHT_COLORS.length],
  })), []);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "hsl(0 15% 4%)" }}>
      {/* VHS static overlay - always present */}
      <div className="fixed inset-0 z-[15] pointer-events-none mix-blend-overlay opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }} />

      {/* VHS scan lines */}
      <div className="fixed inset-0 z-[16] pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 0% 0% / 0.08) 2px, hsl(0 0% 0% / 0.08) 4px)",
        }} />

      {/* Glitch entry */}
      <AnimatePresence>
        {phase === "glitch" && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center"
            exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            {/* Static noise */}
            <motion.div className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
                backgroundSize: "150px",
              }}
              animate={{
                opacity: [0.8, 0.3, 0.9, 0.2, 0.7],
                backgroundPosition: ["0 0", "10px 5px", "-5px 10px"],
              }}
              transition={{ duration: 0.2, repeat: Infinity }} />
            {/* Glitch bars */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={i} className="absolute left-0 right-0"
                style={{
                  height: 2 + Math.random() * 6,
                  top: `${Math.random() * 100}%`,
                  background: `hsl(${Math.random() * 60} 70% 50% / 0.25)`,
                }}
                animate={{ x: [-30, 30, -15, 20, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 0.12, repeat: Infinity, delay: i * 0.04 }} />
            ))}
            {/* Desaturation */}
            <div className="absolute inset-0" style={{ background: "hsl(0 0% 10% / 0.6)", mixBlendMode: "saturation" }} />
            {/* Entry text */}
            <motion.div className="relative z-10 text-center space-y-3 px-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <motion.p className="font-mono text-xs sm:text-sm tracking-[0.3em] uppercase"
                style={{ color: "hsl(0 70% 55%)" }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity }}>
                Signal Detected From The Upside Down
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating spores */}
      <div className="fixed inset-0 z-[5] pointer-events-none">
        {spores.map((s) => (
          <motion.div key={s.id} className="absolute rounded-full"
            style={{
              width: s.size, height: s.size,
              left: `${s.x}%`, top: `${s.y}%`,
              background: s.glow
                ? "radial-gradient(circle, hsl(0 30% 60% / 0.5), hsl(0 20% 40% / 0.1))"
                : "hsl(0 20% 50% / 0.2)",
              boxShadow: s.glow ? "0 0 6px hsl(0 40% 50% / 0.3)" : "none",
            }}
            animate={{
              y: [0, -40 - Math.random() * 70],
              x: [0, s.drift],
              opacity: [0, s.glow ? 0.6 : 0.3, 0],
            }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }} />
        ))}
      </div>

      {/* Creeping vines */}
      {(phase === "decode" || phase === "solved") && (
        <div className="fixed inset-0 z-10 pointer-events-none">
          {CREEPING_VINES.map((vine, i) => {
            const pos = vine.side === "left" ? "top-0 left-0"
              : vine.side === "right" ? "top-0 right-0"
              : vine.side === "top" ? "top-0 left-0"
              : "bottom-0 left-0";
            return (
              <svg key={i} className={`absolute ${pos}`}
                style={{ width: vine.w, height: vine.h, opacity: 0.3 + vineProgress * 0.4 }}
                viewBox={`0 0 ${vine.w} ${vine.h}`}>
                <motion.path d={vine.d} stroke="hsl(120 30% 18%)"
                  strokeWidth={2 + vineProgress * 2} fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: phase === "solved" ? 1 : vineProgress }}
                  transition={{ duration: phase === "solved" ? 1 : 0.5 }} />
              </svg>
            );
          })}
        </div>
      )}

      {/* Monster proximity darkness overlay */}
      {phase === "decode" && monsterProximity > 0.2 && (
        <motion.div className="fixed inset-0 z-[8] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 30%, hsl(0 20% 3% / ${monsterProximity * 0.6}))`,
          }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1 + (1 - monsterProximity) * 2, repeat: Infinity }} />
      )}

      {/* Monster silhouette */}
      {phase === "decode" && monsterProximity > 0.4 && (
        <motion.div className="fixed z-[9] pointer-events-none"
          style={{
            bottom: "5%",
            right: `${Math.max(5, 50 - monsterProximity * 50)}%`,
            width: 80 + monsterProximity * 60,
            height: 160 + monsterProximity * 80,
            background: "radial-gradient(ellipse at center bottom, hsl(0 15% 5% / 0.9), transparent 70%)",
            filter: "blur(3px)",
          }}
          animate={{ opacity: [0.3, 0.7, 0.3], x: [-5, 5, -5] }}
          transition={{ duration: 2 - monsterProximity, repeat: Infinity }}>
          {/* Tendrils */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div key={i} className="absolute"
              style={{
                width: 3,
                height: 30 + Math.random() * 40,
                background: "hsl(0 10% 8%)",
                left: `${20 + i * 15}%`,
                top: "10%",
                transformOrigin: "bottom",
              }}
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </motion.div>
      )}

      {/* Urgency warning */}
      {phase === "decode" && monsterProximity > 0.5 && (
        <motion.div className="fixed top-4 left-0 right-0 z-20 text-center pointer-events-none"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity }}>
          <span className="font-mono text-xs px-4 py-1 rounded"
            style={{ color: "hsl(0 80% 55%)", background: "hsl(0 30% 10% / 0.7)" }}>
            ⚠ SOMETHING IS APPROACHING ⚠
          </span>
        </motion.div>
      )}

      {/* Back button */}
      <motion.button onClick={() => navigate("/hub")}
        className="fixed top-6 left-6 flex items-center gap-2 transition-colors font-mono cursor-pointer z-30"
        style={{ color: "hsl(0 40% 50%)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }}>
        <ArrowLeft className="w-4 h-4" />Back
      </motion.button>

      {/* ===== VIDEO PHASE ===== */}
      <AnimatePresence mode="wait">
        {phase === "video" && (
          <motion.div key="video" className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4"
            initial={{ rotateX: 0, opacity: 0 }}
            animate={{ rotateX: 180, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ perspective: "1000px" }}>

            {/* Intro text */}
            <motion.div className="text-center space-y-2 mb-8"
              style={{ transform: "rotateX(180deg)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <p className="font-mono text-xs sm:text-sm tracking-[0.2em] uppercase"
                style={{ color: "hsl(0 65% 55%)", textShadow: "0 0 10px hsl(0 70% 40%)" }}>
                Signal Detected From The Upside Down
              </p>
              <p className="font-mono text-[10px] sm:text-xs tracking-wider"
                style={{ color: "hsl(0 40% 45%)" }}>
                The message is hidden in the interference
              </p>
              <motion.p className="font-mono text-[10px] tracking-wider"
                style={{ color: "hsl(0 50% 50%)" }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}>
                Watch carefully
              </motion.p>
            </motion.div>

            {/* Simulated video: Christmas lights on a wall */}
            <div className="relative w-full max-w-md aspect-video rounded-sm overflow-hidden border"
              style={{
                borderColor: "hsl(0 30% 15%)",
                background: "hsl(0 15% 6%)",
                transform: "rotateX(180deg)",
              }}>
              {/* Wall texture */}
              <div className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse at 50% 40%, hsl(30 15% 12%), hsl(0 10% 5%))" }} />

              {/* Christmas lights */}
              {videoLights.map((light, i) => (
                <motion.div key={i} className="absolute"
                  style={{
                    left: `${light.x}%`, top: `${light.y}%`,
                    width: 8, height: 10,
                    borderRadius: "50%",
                    background: light.color,
                  }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 0.3 + Math.random() * 0.5, repeat: Infinity, delay: Math.random() * 2 }}>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-px h-2"
                    style={{ background: "hsl(120 30% 20%)" }} />
                </motion.div>
              ))}

              {/* VHS tracking lines */}
              <motion.div className="absolute inset-0"
                style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, hsl(0 0% 100% / 0.02) 3px, hsl(0 0% 100% / 0.02) 4px)" }}
                animate={{ y: [0, 10] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }} />
            </div>

            {/* FLASHING NUMBER OVERLAY */}
            <AnimatePresence>
              {currentFlash !== null && (
                <motion.div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.05 }}>
                  <motion.span className="font-mono font-black"
                    style={{
                      fontSize: "clamp(4rem, 15vw, 10rem)",
                      color: "hsl(0 90% 55% / 0.7)",
                      textShadow: "0 0 40px hsl(0 90% 50%), 0 0 80px hsl(0 80% 40%), 0 0 120px hsl(0 70% 30%)",
                      transform: "rotateX(180deg)",
                    }}
                    animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }}
                    transition={{ duration: 0.15 }}>
                    {currentFlash}
                  </motion.span>
                  {/* Glitch bars during flash */}
                  <motion.div className="absolute left-0 right-0" style={{
                    height: 3, top: `${30 + Math.random() * 40}%`,
                    background: "hsl(0 80% 50% / 0.3)",
                  }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ===== DECODE PHASE ===== */}
        {phase === "decode" && (
          <motion.div key="decode"
            className="relative z-20 h-screen flex flex-col items-center justify-center px-3 py-2 gap-2"
            initial={{ rotateX: 0, opacity: 0 }}
            animate={{ rotateX: 180, opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{ perspective: "1000px" }}>

            {isMobile && (
              <motion.p className="text-[10px] font-mono text-center"
                style={{ color: "hsl(0 50% 50%)", transform: "rotateX(180deg)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0] }}
                transition={{ duration: 3, repeat: 2 }}>
                Turn your phone to read the message.
              </motion.p>
            )}

            {/* Combined content - all in one flipped container */}
            <div className="flex flex-col items-center gap-2 w-full max-w-md" style={{ transform: "rotateX(180deg)" }}>

              {/* Instruction text */}
              <div className="text-center">
                <p className="font-mono text-xs sm:text-sm" style={{ color: "hsl(0 70% 60%)" }}>
                  The Upside Down speaks through lights.
                </p>
                <p className="font-mono text-[10px] sm:text-xs" style={{ color: "hsl(0 45% 45%)" }}>
                  Find the letters the signal points to.
                </p>
              </div>

              {/* Radio transmission style numbers - compact */}
              <div className="w-full max-w-xs mx-auto rounded border px-3 py-2 space-y-0.5"
                style={{
                  background: "hsl(0 10% 5% / 0.8)",
                  borderColor: "hsl(0 30% 18%)",
                  boxShadow: "inset 0 0 20px hsl(0 20% 5% / 0.5), 0 0 10px hsl(0 40% 15% / 0.3)",
                }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[8px] tracking-[0.3em] uppercase" style={{ color: "hsl(0 40% 35%)" }}>
                    ▸ INCOMING TRANSMISSION
                  </span>
                  <motion.span className="font-mono text-[8px]" style={{ color: "hsl(0 60% 45%)" }}
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
                    ● REC
                  </motion.span>
                </div>
                {(() => {
                  const wordBreaks = [3, 7, 9, 13, 17, 21];
                  const lines: number[][] = [];
                  let current: number[] = [];
                  revealedNumbers.forEach((num, i) => {
                    if (wordBreaks.includes(i) && current.length > 0) {
                      lines.push(current);
                      current = [];
                    }
                    current.push(num);
                  });
                  if (current.length > 0) lines.push(current);
                  return lines.map((line, li) => (
                    <motion.div key={li} className="flex items-center gap-0.5"
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: li * 0.1 }}>
                      <span className="font-mono text-[9px] mr-1 select-none" style={{ color: "hsl(0 30% 30%)" }}>▸</span>
                      {line.map((num, ni) => (
                        <motion.span key={ni}
                          className="font-mono text-xs sm:text-sm font-bold tracking-wider"
                          style={{
                            color: "hsl(0 75% 55%)",
                            textShadow: "0 0 8px hsl(0 70% 40% / 0.6)",
                          }}
                          initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1] }}
                          transition={{ delay: li * 0.1 + ni * 0.04, duration: 0.3 }}>
                          {num}{ni < line.length - 1 && (
                            <span className="mx-0.5" style={{ color: "hsl(0 30% 30%)" }}>·</span>
                          )}
                        </motion.span>
                      ))}
                    </motion.div>
                  ));
                })()}
              </div>

              {/* Alphabet wall - compact */}
              <div className="transform scale-[0.8] sm:scale-90 origin-center">
                <ChristmasLightAlphabet highlightedLetters={[]} blinkingLetter={null} flipped={false} />
              </div>

              {/* Input field */}
              <motion.form onSubmit={handleSubmit}
                className="space-y-2 w-full max-w-xs"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <label className="block text-center font-mono text-[10px] sm:text-xs tracking-wider uppercase"
                  style={{ color: "hsl(0 50% 45%)" }}>
                  Enter the message from the signal
                </label>
                <motion.div animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}>
                  <input type="text" value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type the decoded message..."
                    className="w-full px-3 py-2 rounded-lg border font-mono text-center text-xs sm:text-sm tracking-wider uppercase focus:outline-none focus:ring-2 transition-all"
                    style={{
                      background: "hsl(0 10% 8%)",
                      borderColor: `hsl(0 ${40 + monsterProximity * 30}% ${25 + monsterProximity * 15}%)`,
                      color: "hsl(0 70% 65%)",
                      boxShadow: monsterProximity > 0.5
                        ? `0 0 ${monsterProximity * 15}px hsl(0 60% 20% / ${monsterProximity * 0.5})`
                        : "none",
                    }}
                    autoComplete="off" />
                </motion.div>

                <motion.button type="submit"
                  className="w-full py-2 rounded-lg font-mono font-bold text-xs uppercase tracking-wider cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{
                    background: "linear-gradient(135deg, hsl(0 60% 30%), hsl(0 70% 20%))",
                    color: "hsl(0 70% 70%)",
                    boxShadow: "0 0 15px hsl(0 60% 20% / 0.5)",
                  }}
                  whileTap={{ scale: 0.98 }}>
                  Decode Signal
                </motion.button>

                {hint && (
                  <motion.p className="text-[10px] font-mono text-center"
                    style={{ color: "hsl(0 50% 45%)" }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    1=A, 2=B ... 26=Z — decode ALL numbers into a full sentence
                  </motion.p>
                )}
              </motion.form>
            </div>
          </motion.div>
        )}

        {/* ===== SOLVED / PORTAL — Cinematic NY Scene ===== */}
        {(phase === "solved" || phase === "portal") && (
          <CinematicSuccessScene />
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useIsMobile } from "@/hooks/use-mobile";
import ChristmasLightAlphabet from "./ChristmasLightAlphabet";
import BlinkingLightSequence from "./BlinkingLightSequence";
import PuzzleInput from "./PuzzleInput";
import PortalRift from "./PortalRift";
import { ArrowLeft } from "lucide-react";

type Phase = "glitch" | "flipped" | "solved" | "portal";

const SEQUENCE = [8, 5, 12, 16];
const HIGHLIGHTED_LETTERS = ["H", "E", "L", "P"];

const CREEPING_VINES = [
  { d: "M0,0 Q20,60 5,120 Q-15,180 10,240 Q30,300 5,360", delay: 0, side: "left" as const, w: 60, h: 400 },
  { d: "M0,100 Q35,130 20,170 Q5,210 25,250 Q40,290 15,340", delay: 8, side: "left" as const, w: 60, h: 400 },
  { d: "M0,200 Q30,230 15,270 Q-5,310 20,350 Q35,390 10,420", delay: 16, side: "left" as const, w: 60, h: 450 },
  { d: "M60,0 Q40,50 55,110 Q70,170 45,230 Q30,290 50,350", delay: 4, side: "right" as const, w: 60, h: 400 },
  { d: "M60,80 Q35,120 50,160 Q65,200 40,250 Q25,300 55,340", delay: 12, side: "right" as const, w: 60, h: 400 },
  { d: "M60,180 Q40,220 55,260 Q70,300 45,340 Q30,380 50,430", delay: 20, side: "right" as const, w: 60, h: 450 },
  { d: "M0,0 Q80,25 160,10 Q240,30 320,5 Q400,20 480,8", delay: 6, side: "top" as const, w: 500, h: 40 },
  { d: "M100,0 Q180,20 260,5 Q340,25 420,10 Q500,30 580,5", delay: 14, side: "top" as const, w: 600, h: 40 },
  { d: "M0,30 Q120,5 240,25 Q360,0 480,20 Q600,5 720,30 Q800,10 900,25", delay: 10, side: "bottom" as const, w: 900, h: 35 },
  { d: "M50,35 Q150,10 250,30 Q350,5 450,25 Q550,8 650,28", delay: 18, side: "bottom" as const, w: 700, h: 40 },
];

export default function UpsideDownScene() {
  const navigate = useNavigate();
  const { markSolved, isSolved } = useGameProgress();
  const alreadySolved = isSolved("stranger");
  const isMobile = useIsMobile();

  const [phase, setPhase] = useState<Phase>(alreadySolved ? "portal" : "glitch");
  const [blinkingLetter, setBlinkingLetter] = useState<string | null>(null);
  const [sequenceDone, setSequenceDone] = useState(false);
  const [vineProgress, setVineProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const droneIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Glitch entry
  useEffect(() => {
    if (phase !== "glitch") return;
    const timer = setTimeout(() => {
      setTimeout(() => setPhase("flipped"), 800);
    }, 2500);
    return () => clearTimeout(timer);
  }, [phase]);

  // Progressive vine growth during puzzle
  useEffect(() => {
    if (phase !== "flipped") return;
    const start = Date.now();
    const duration = 60000;
    const tick = () => {
      const elapsed = Date.now() - start;
      setVineProgress(Math.min(1, elapsed / duration));
      if (elapsed < duration) rafId = requestAnimationFrame(tick);
    };
    let rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [phase]);

  // Eerie ambient sounds using Web Audio API
  useEffect(() => {
    if (phase !== "flipped") return;

    try {
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const createDrone = (freq: number, vol: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        filter.type = "lowpass";
        filter.frequency.value = 200;
        filter.Q.value = 5;
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 3);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        return { osc, gain };
      };

      const d1 = createDrone(55, 0.06);
      const d2 = createDrone(82.5, 0.03);
      const d3 = createDrone(38, 0.04);

      const playMonsterSound = () => {
        if (ctx.state === "closed") return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = "sawtooth";
        const base = 40 + Math.random() * 60;
        osc.frequency.value = base;
        osc.frequency.linearRampToValueAtTime(base * (0.5 + Math.random()), ctx.currentTime + 1.5);
        filter.type = "lowpass";
        filter.frequency.value = 150 + Math.random() * 100;
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(0.04 + Math.random() * 0.03, ctx.currentTime + 0.5);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5 + Math.random());
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2.5);
      };

      droneIntervalRef.current = setInterval(() => {
        if (Math.random() < 0.4) playMonsterSound();
      }, 3000 + Math.random() * 4000);

      return () => {
        if (droneIntervalRef.current) clearInterval(droneIntervalRef.current);
        d1.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        d2.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        d3.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        setTimeout(() => {
          try { d1.osc.stop(); } catch {}
          try { d2.osc.stop(); } catch {}
          try { d3.osc.stop(); } catch {}
          ctx.close();
        }, 600);
      };
    } catch {
      // Web Audio not supported
    }
  }, [phase]);

  const handleSequenceComplete = useCallback(() => setSequenceDone(true), []);

  const handleCorrectAnswer = useCallback(() => {
    if (droneIntervalRef.current) clearInterval(droneIntervalRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try { audioContextRef.current.close(); } catch {}
    }
    setPhase("solved");
    markSolved("stranger");
    setTimeout(() => setPhase("portal"), 3000);
  }, [markSolved]);

  const spores = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 4,
    duration: 3 + Math.random() * 8,
    delay: Math.random() * 6,
    drift: (Math.random() - 0.5) * 60,
    glow: Math.random() > 0.7,
  })), []);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "hsl(0 15% 5%)" }}>
      {/* Glitch overlay */}
      <AnimatePresence>
        {phase === "glitch" && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
                backgroundSize: "150px",
                mixBlendMode: "overlay",
              }}
              animate={{
                opacity: [0.8, 0.3, 0.9, 0.2, 0.7, 0.4],
                backgroundPosition: ["0 0", "10px 5px", "-5px 10px", "3px -3px"],
              }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-0 right-0"
                style={{
                  height: 2 + Math.random() * 4,
                  top: `${Math.random() * 100}%`,
                  background: `hsl(${Math.random() * 360} 80% 60% / 0.3)`,
                }}
                animate={{
                  x: [-20, 20, -10, 15, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 0.15, repeat: Infinity, delay: i * 0.05 }}
              />
            ))}
            <div className="absolute inset-0" style={{ background: "hsl(0 0% 10% / 0.6)", mixBlendMode: "saturation" }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creeping vines */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        {CREEPING_VINES.map((vine, i) => {
          const vineStart = vine.delay / 25;
          const vineEnd = vineStart + 0.4;
          const thisProgress = Math.max(0, Math.min(1, (vineProgress - vineStart) / (vineEnd - vineStart)));
          if (thisProgress <= 0 && phase === "flipped") return null;

          const pos = vine.side === "left" ? "top-0 left-0"
            : vine.side === "right" ? "top-0 right-0"
            : vine.side === "top" ? "top-0 left-0"
            : "bottom-0 left-0";

          return (
            <svg key={i} className={`absolute ${pos}`}
              style={{ width: vine.w, height: vine.h, opacity: 0.35 + vineProgress * 0.3 }}
              viewBox={`0 0 ${vine.w} ${vine.h}`}>
              <motion.path d={vine.d} stroke="hsl(120 30% 18%)"
                strokeWidth={2 + vineProgress * 1.5} fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: phase === "solved" ? 1 : thisProgress }}
                transition={{ duration: 0.5 }} />
            </svg>
          );
        })}

        {vineProgress > 0.3 && (
          <>
            <motion.div className="absolute top-0 left-0 w-16 h-full"
              style={{ background: "linear-gradient(to right, hsl(120 30% 10% / 0.3), transparent)" }}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }} />
            <motion.div className="absolute top-0 right-0 w-16 h-full"
              style={{ background: "linear-gradient(to left, hsl(120 30% 10% / 0.3), transparent)" }}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }} />
          </>
        )}
      </div>

      {/* Floating spores */}
      <div className="fixed inset-0 z-[5] pointer-events-none">
        {spores.map((s) => (
          <motion.div key={s.id} className="absolute rounded-full"
            style={{
              width: s.size, height: s.size,
              left: `${s.x}%`, top: `${s.y}%`,
              background: s.glow
                ? "radial-gradient(circle, hsl(0 30% 60% / 0.5), hsl(0 20% 40% / 0.1))"
                : "hsl(0 20% 50% / 0.25)",
              boxShadow: s.glow ? "0 0 6px hsl(0 40% 50% / 0.3)" : "none",
            }}
            animate={{
              y: [0, -50 - Math.random() * 80],
              x: [0, s.drift],
              opacity: [0, s.glow ? 0.7 : 0.35, 0],
              scale: s.glow ? [0.8, 1.3, 0.8] : [1, 1, 1],
            }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }} />
        ))}
      </div>

      {/* Fog layers */}
      <div className="fixed inset-0 z-[4] pointer-events-none overflow-hidden">
        <motion.div className="absolute w-[200%] h-32 top-1/4"
          style={{ background: "linear-gradient(90deg, transparent, hsl(0 15% 15% / 0.15), transparent, hsl(0 15% 15% / 0.1), transparent)" }}
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
        <motion.div className="absolute w-[200%] h-24 top-2/3"
          style={{ background: "linear-gradient(90deg, transparent, hsl(0 10% 20% / 0.12), transparent, hsl(0 10% 20% / 0.08), transparent)" }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }} />
      </div>

      {/* Back button */}
      <motion.button
        onClick={() => navigate("/hub")}
        className="fixed top-6 left-6 flex items-center gap-2 transition-colors font-mono cursor-pointer z-30"
        style={{ color: "hsl(0 40% 50%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </motion.button>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {phase === "flipped" && (
          <motion.div
            key="flipped"
            className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6"
            initial={{ rotateX: 0, opacity: 0 }}
            animate={{ rotateX: 180, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ perspective: "1000px" }}
          >
            {isMobile && (
              <motion.p className="text-xs font-mono text-center"
                style={{ color: "hsl(0 50% 50%)", transform: "rotate(180deg)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0] }}
                transition={{ duration: 3, repeat: 2 }}>
                Turn your phone to read the message.
              </motion.p>
            )}

            <ChristmasLightAlphabet
              highlightedLetters={HIGHLIGHTED_LETTERS}
              blinkingLetter={blinkingLetter}
              flipped
            />

            <BlinkingLightSequence
              sequence={SEQUENCE}
              onSequenceComplete={handleSequenceComplete}
              onCurrentLetter={setBlinkingLetter}
            />

            {sequenceDone && (
              <PuzzleInput onCorrect={handleCorrectAnswer} flipped />
            )}
          </motion.div>
        )}

        {phase === "solved" && (
          <motion.div key="solved" className="fixed inset-0 z-30 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="absolute inset-0"
              animate={{ x: [-2, 2, -3, 1, 0], y: [-1, 2, -1, 1, 0] }}
              transition={{ duration: 0.3, repeat: 6 }}
              style={{ background: "hsl(0 15% 5%)" }} />
            <motion.div className="absolute inset-0"
              animate={{ opacity: [0, 0.3, 0, 0.5, 0, 0.2, 0] }}
              transition={{ duration: 0.5, repeat: 4 }}
              style={{ background: "hsl(0 80% 40% / 0.15)" }} />
            <motion.p className="relative z-10 font-mono text-xl sm:text-3xl font-bold"
              style={{ color: "hsl(0 75% 55%)", textShadow: "0 0 20px hsl(0 80% 40%), 0 0 40px hsl(0 70% 30%)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              The gate is open.
            </motion.p>
          </motion.div>
        )}

        {phase === "portal" && <PortalRift />}
      </AnimatePresence>
    </div>
  );
}

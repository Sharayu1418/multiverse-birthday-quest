import { useState, useEffect, useCallback } from "react";
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

// H=8, E=5, L=12, P=16
const SEQUENCE = [8, 5, 12, 16];
const HIGHLIGHTED_LETTERS = ["H", "E", "L", "P"];

export default function UpsideDownScene() {
  const navigate = useNavigate();
  const { markSolved, isSolved } = useGameProgress();
  const alreadySolved = isSolved("stranger");
  const isMobile = useIsMobile();

  const [phase, setPhase] = useState<Phase>(alreadySolved ? "portal" : "glitch");
  const [blinkingLetter, setBlinkingLetter] = useState<string | null>(null);
  const [sequenceDone, setSequenceDone] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(1);

  // Glitch entry effect
  useEffect(() => {
    if (phase !== "glitch") return;
    const timer = setTimeout(() => {
      setGlitchIntensity(0);
      setTimeout(() => setPhase("flipped"), 800);
    }, 2500);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleSequenceComplete = useCallback(() => {
    setSequenceDone(true);
  }, []);

  const handleCorrectAnswer = useCallback(() => {
    setPhase("solved");
    markSolved("stranger");
    setTimeout(() => setPhase("portal"), 3000);
  }, [markSolved]);

  // Floating spores
  const spores = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 4,
  }));

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
            {/* Static noise */}
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
            {/* Glitch lines */}
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
                  top: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                }}
                transition={{ duration: 0.15, repeat: Infinity, delay: i * 0.05 }}
              />
            ))}
            {/* Desaturation overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "hsl(0 0% 10% / 0.6)",
                mixBlendMode: "saturation",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vines on edges */}
      <motion.div
        className="fixed inset-0 z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase !== "glitch" ? 1 : 0 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        {/* Top-left vine */}
        <svg className="absolute top-0 left-0 w-40 h-60 opacity-40" viewBox="0 0 160 240">
          <motion.path
            d="M0,0 Q30,40 10,80 Q-10,120 20,160 Q40,200 15,240"
            stroke="hsl(120 30% 20%)" strokeWidth="3" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 1 }}
          />
          <motion.path
            d="M10,60 Q40,70 30,100" stroke="hsl(120 25% 18%)" strokeWidth="2" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 2 }}
          />
        </svg>
        {/* Top-right vine */}
        <svg className="absolute top-0 right-0 w-40 h-60 opacity-40" viewBox="0 0 160 240">
          <motion.path
            d="M160,0 Q130,50 150,100 Q170,140 140,180 Q120,220 145,240"
            stroke="hsl(120 30% 20%)" strokeWidth="3" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 1.2 }}
          />
        </svg>
        {/* Bottom vines */}
        <svg className="absolute bottom-0 left-0 w-full h-20 opacity-30" viewBox="0 0 800 80">
          <motion.path
            d="M0,80 Q100,40 200,70 Q300,30 400,60 Q500,20 600,50 Q700,30 800,80"
            stroke="hsl(120 25% 18%)" strokeWidth="3" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 4, delay: 1.5 }}
          />
        </svg>
      </motion.div>

      {/* Floating spores */}
      <div className="fixed inset-0 z-5 pointer-events-none">
        {spores.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full"
            style={{
              width: s.size,
              height: s.size,
              left: `${s.x}%`,
              top: `${s.y}%`,
              background: "hsl(0 20% 50% / 0.3)",
            }}
            animate={{
              y: [0, -40 - Math.random() * 60],
              x: [0, (Math.random() - 0.5) * 40],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              delay: s.delay,
            }}
          />
        ))}
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
            {/* Mobile hint */}
            {isMobile && (
              <motion.p
                className="text-xs font-mono text-center"
                style={{
                  color: "hsl(0 50% 50%)",
                  transform: "rotate(180deg)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0] }}
                transition={{ duration: 3, repeat: 2 }}
              >
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
          <motion.div
            key="solved"
            className="fixed inset-0 z-30 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Screen shake */}
            <motion.div
              className="absolute inset-0"
              animate={{ x: [-2, 2, -3, 1, 0], y: [-1, 2, -1, 1, 0] }}
              transition={{ duration: 0.3, repeat: 6 }}
              style={{ background: "hsl(0 15% 5%)" }}
            />

            {/* Flickering lights effect */}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0, 0.3, 0, 0.5, 0, 0.2, 0] }}
              transition={{ duration: 0.5, repeat: 4 }}
              style={{ background: "hsl(0 80% 40% / 0.15)" }}
            />

            {/* Vine spread */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 2 }}
            >
              <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.path
                    key={i}
                    d={`M${Math.random() * 800},${Math.random() * 600} Q${Math.random() * 800},${Math.random() * 600} ${Math.random() * 800},${Math.random() * 600}`}
                    stroke="hsl(120 30% 18%)" strokeWidth="2" fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: i * 0.1 }}
                  />
                ))}
              </svg>
            </motion.div>

            <motion.p
              className="relative z-10 font-mono text-xl sm:text-3xl font-bold"
              style={{
                color: "hsl(0 75% 55%)",
                textShadow: "0 0 20px hsl(0 80% 40%), 0 0 40px hsl(0 70% 30%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              The gate is open.
            </motion.p>
          </motion.div>
        )}

        {phase === "portal" && <PortalRift />}
      </AnimatePresence>
    </div>
  );
}

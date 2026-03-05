import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameProgress } from "@/hooks/useGameProgress";
import ForestWorld from "./ForestWorld";
import WandLight from "./WandLight";
import SpellBar from "./SpellBar";
import SpellRearrange from "./SpellRearrange";
import { ArrowLeft } from "lucide-react";

type Phase = "explore" | "rearrange" | "illuminated" | "complete";

export default function HarryPotterForbiddenForest() {
  const navigate = useNavigate();
  const { markSolved, isSolved } = useGameProgress();
  const alreadySolved = isSolved("potter");
  const [phase, setPhase] = useState<Phase>(alreadySolved ? "complete" : "explore");
  const [wandPos, setWandPos] = useState({ x: -1000, y: -1000 });
  const [discoveredLetters, setDiscoveredLetters] = useState<string[]>([]);
  const [scrollX, setScrollX] = useState(0);

  // Scroll the forest based on cursor horizontal position
  const scrollSpeed = useRef(0);
  const scrollRef = useRef(0);
  const WORLD_WIDTH = 5000; // total world width in px
  const maxScroll = WORLD_WIDTH - window.innerWidth;

  useEffect(() => {
    if (phase !== "explore") return;

    const tick = () => {
      // Edge-scroll: cursor near left/right edges scrolls the world
      const edgeZone = window.innerWidth * 0.2;
      if (wandPos.x < edgeZone && wandPos.x > 0) {
        scrollSpeed.current = -((edgeZone - wandPos.x) / edgeZone) * 6;
      } else if (wandPos.x > window.innerWidth - edgeZone && wandPos.x < window.innerWidth) {
        scrollSpeed.current = ((wandPos.x - (window.innerWidth - edgeZone)) / edgeZone) * 6;
      } else {
        scrollSpeed.current *= 0.9; // decelerate
      }

      scrollRef.current = Math.max(0, Math.min(maxScroll, scrollRef.current + scrollSpeed.current));
      setScrollX(scrollRef.current);
      rafId = requestAnimationFrame(tick);
    };

    let rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [phase, wandPos.x, maxScroll]);

  const handleWandMove = useCallback((x: number, y: number) => {
    setWandPos({ x, y });
  }, []);

  const handleLetterFound = useCallback((letter: string) => {
    setDiscoveredLetters((prev) => {
      if (prev.includes(letter)) return prev;
      return [...prev, letter];
    });
  }, []);

  const handleAllFound = useCallback(() => {
    setPhase("rearrange");
  }, []);

  const handleRearrangeComplete = useCallback(() => {
    setPhase("illuminated");
    markSolved("potter");
    setTimeout(() => setPhase("complete"), 4000);
  }, [markSolved]);

  const isIlluminated = phase === "illuminated" || phase === "complete";

  return (
    <div className="relative min-h-screen overflow-hidden select-none" style={{ cursor: phase === "explore" ? "none" : "auto" }}>
      {/* Back button */}
      <motion.button
        onClick={() => navigate("/hub")}
        className="fixed top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body cursor-pointer z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </motion.button>

      <AnimatePresence mode="wait">
        {phase === "explore" && (
          <motion.div
            key="explore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ForestWorld
              scrollX={scrollX}
              worldWidth={WORLD_WIDTH}
              illuminated={false}
              wandX={wandPos.x}
              wandY={wandPos.y}
              discoveredLetters={discoveredLetters}
              onLetterFound={handleLetterFound}
              onAllFound={handleAllFound}
            />
            <WandLight enabled onPositionChange={handleWandMove} />
            <SpellBar discovered={discoveredLetters} total={5} />

            {/* Scroll hint arrows */}
            <motion.div
              className="fixed top-1/2 left-4 -translate-y-1/2 z-20 pointer-events-none"
              animate={{ opacity: scrollX > 50 ? 0 : [0.2, 0.5, 0.2], x: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-2xl" style={{ color: "hsl(42 60% 50% / 0.5)" }}>◂</span>
            </motion.div>
            <motion.div
              className="fixed top-1/2 right-4 -translate-y-1/2 z-20 pointer-events-none"
              animate={{ opacity: scrollX < maxScroll - 50 ? [0.2, 0.5, 0.2] : 0, x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-2xl" style={{ color: "hsl(42 60% 50% / 0.5)" }}>▸</span>
            </motion.div>

            <motion.p
              className="fixed top-16 left-1/2 -translate-x-1/2 text-sm font-body z-20 text-center px-4"
              style={{ color: "hsl(42 40% 55% / 0.7)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1 }}
            >
              Move your wand to the edges to explore the forest
            </motion.p>
          </motion.div>
        )}

        {phase === "rearrange" && (
          <motion.div key="rearrange" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ForestWorld scrollX={scrollX} worldWidth={WORLD_WIDTH} illuminated={false} wandX={-1000} wandY={-1000} discoveredLetters={discoveredLetters} onLetterFound={() => {}} onAllFound={() => {}} />
            <SpellRearrange discoveredLetters={discoveredLetters} onComplete={handleRearrangeComplete} />
          </motion.div>
        )}

        {phase === "illuminated" && (
          <motion.div key="illuminated" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ForestWorld scrollX={scrollX} worldWidth={WORLD_WIDTH} illuminated wandX={-1000} wandY={-1000} discoveredLetters={discoveredLetters} onLetterFound={() => {}} onAllFound={() => {}} />
            <motion.div className="fixed inset-0 flex items-center justify-center z-20">
              <div className="text-center space-y-6">
                <motion.p
                  className="font-display text-2xl sm:text-4xl font-bold"
                  style={{ color: "hsl(42 85% 75%)", textShadow: "0 0 30px hsl(42 80% 50%), 0 0 60px hsl(42 70% 40%)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  The spell is cast.
                </motion.p>
                <motion.p
                  className="font-display text-4xl sm:text-6xl font-bold italic"
                  style={{ color: "hsl(42 90% 80%)", textShadow: "0 0 40px hsl(42 85% 60%), 0 0 80px hsl(42 75% 50%)" }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, type: "spring" }}
                >
                  Lumos.
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {phase === "complete" && (
          <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ForestWorld scrollX={scrollX} worldWidth={WORLD_WIDTH} illuminated wandX={-1000} wandY={-1000} discoveredLetters={discoveredLetters} onLetterFound={() => {}} onAllFound={() => {}} />
            <motion.div className="fixed inset-0 flex items-center justify-center z-20">
              <div className="text-center space-y-8 px-6">
                <motion.p className="font-display text-xl sm:text-3xl font-bold" style={{ color: "hsl(42 80% 70%)", textShadow: "0 0 25px hsl(42 70% 45%)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  The Wizarding World recognizes your magic.
                </motion.p>
                <motion.div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(42 80% 55%), hsl(42 90% 70%))", boxShadow: "0 0 30px hsl(42 80% 55% / 0.5), 0 0 60px hsl(42 70% 45% / 0.3)" }} initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ delay: 0.8, type: "spring" }}>
                  <span className="text-3xl">⚡</span>
                </motion.div>
                <motion.h2 className="text-2xl sm:text-3xl font-display font-bold" style={{ color: "hsl(42 85% 65%)", textShadow: "0 0 20px hsl(42 75% 50%)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                  Portal Restored!
                </motion.h2>
                <motion.button onClick={() => navigate("/hub")} className="px-8 py-3 rounded-full font-body font-semibold cursor-pointer hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg, hsl(42 70% 45%), hsl(42 85% 60%))", color: "hsl(42 10% 10%)", boxShadow: "0 0 20px hsl(42 70% 45% / 0.4)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} whileTap={{ scale: 0.95 }}>
                  Return to Multiverse
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

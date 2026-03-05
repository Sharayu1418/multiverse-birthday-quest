import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameProgress } from "@/hooks/useGameProgress";
import ForbiddenForestBackground from "./ForbiddenForestBackground";
import WandLight from "./WandLight";
import HiddenLetters from "./HiddenLetters";
import SpellRearrange from "./SpellRearrange";
import { ArrowLeft } from "lucide-react";

type Phase = "explore" | "rearrange" | "illuminated" | "complete";

export default function HarryPotterForbiddenForest() {
  const navigate = useNavigate();
  const { markSolved, isSolved } = useGameProgress();
  const alreadySolved = isSolved("potter");
  const [phase, setPhase] = useState<Phase>(alreadySolved ? "complete" : "explore");
  const [wandPos, setWandPos] = useState({ x: -1000, y: -1000 });
  const [showHint, setShowHint] = useState(true);

  const handleWandMove = useCallback((x: number, y: number) => {
    setWandPos({ x, y });
    setShowHint(false);
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
      <ForbiddenForestBackground illuminated={isIlluminated} />

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
        {/* EXPLORE - wand light + hidden letters */}
        {phase === "explore" && (
          <motion.div
            key="explore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WandLight enabled onPositionChange={handleWandMove} />
            <HiddenLetters
              wandEnabled
              wandX={wandPos.x}
              wandY={wandPos.y}
              onAllFound={handleAllFound}
            />
            {showHint && (
              <motion.p
                className="fixed top-16 left-1/2 -translate-x-1/2 text-muted-foreground text-sm font-body z-20 text-center px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.5 }}
              >
                Move your wand through the forest to find the hidden spell
              </motion.p>
            )}
          </motion.div>
        )}

        {/* REARRANGE */}
        {phase === "rearrange" && (
          <SpellRearrange
            key="rearrange"
            discoveredLetters={["M", "S", "L", "O", "U"]} // Will show jumbled first
            onComplete={handleRearrangeComplete}
          />
        )}

        {/* ILLUMINATED */}
        {phase === "illuminated" && (
          <motion.div
            key="illuminated"
            className="fixed inset-0 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center space-y-6">
              <motion.p
                className="font-display text-2xl sm:text-4xl font-bold"
                style={{
                  color: "hsl(42 85% 75%)",
                  textShadow: "0 0 30px hsl(42 80% 50%), 0 0 60px hsl(42 70% 40%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                The spell is cast.
              </motion.p>
              <motion.p
                className="font-display text-4xl sm:text-6xl font-bold italic"
                style={{
                  color: "hsl(42 90% 80%)",
                  textShadow: "0 0 40px hsl(42 85% 60%), 0 0 80px hsl(42 75% 50%)",
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, type: "spring" }}
              >
                Lumos.
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* COMPLETE */}
        {phase === "complete" && (
          <motion.div
            key="complete"
            className="fixed inset-0 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center space-y-8 px-6">
              <motion.p
                className="font-display text-xl sm:text-3xl font-bold"
                style={{
                  color: "hsl(42 80% 70%)",
                  textShadow: "0 0 25px hsl(42 70% 45%)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                The Wizarding World recognizes your magic.
              </motion.p>

              <motion.div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(42 80% 55%), hsl(42 90% 70%))",
                  boxShadow: "0 0 30px hsl(42 80% 55% / 0.5), 0 0 60px hsl(42 70% 45% / 0.3)",
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                <span className="text-3xl">⚡</span>
              </motion.div>

              <motion.h2
                className="text-2xl sm:text-3xl font-display font-bold"
                style={{
                  color: "hsl(42 85% 65%)",
                  textShadow: "0 0 20px hsl(42 75% 50%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Portal Restored!
              </motion.h2>

              <motion.button
                onClick={() => navigate("/hub")}
                className="px-8 py-3 rounded-full font-body font-semibold cursor-pointer hover:scale-105 transition-transform"
                style={{
                  background: "linear-gradient(135deg, hsl(42 70% 45%), hsl(42 85% 60%))",
                  color: "hsl(42 10% 10%)",
                  boxShadow: "0 0 20px hsl(42 70% 45% / 0.4)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                whileTap={{ scale: 0.95 }}
              >
                Return to Multiverse
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

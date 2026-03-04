import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import StarfieldBackground from "@/components/StarfieldBackground";
import { worlds, WorldId } from "@/lib/worldsData";
import { checkAnswer, getHint } from "@/lib/puzzleLogic";
import { useGameProgress } from "@/hooks/useGameProgress";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function PuzzlePage() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { isSolved, markSolved } = useGameProgress();

  const world = worlds.find((w) => w.id === worldId);

  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [shake, setShake] = useState(false);

  // Check solved state after hooks
  const alreadySolved = world ? isSolved(world.id) : false;
  const isSolvedState = solved || alreadySolved;

  if (!world) {
    return (
      <div className="min-h-screen flex items-center justify-center starfield">
        <StarfieldBackground />
        <div className="relative z-10 text-center">
          <p className="text-foreground font-body text-lg mb-4">World not found</p>
          <button onClick={() => navigate("/hub")} className="text-neon-cyan underline cursor-pointer font-body">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAnswer(world.id as WorldId, answer)) {
      setSolved(true);
      markSolved(world.id);
    } else {
      setShowHint(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-b ${world.bgGradient}`}>
      <StarfieldBackground />

      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        <motion.button
          onClick={() => navigate("/hub")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-body cursor-pointer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Multiverse
        </motion.button>

        <motion.h1
          className="text-3xl sm:text-5xl font-display font-bold text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            color: "hsl(var(--foreground))",
            textShadow: `0 0 30px hsl(${world.glowColor} / 0.5)`,
          }}
        >
          {world.name}
        </motion.h1>

        <AnimatePresence mode="wait">
          {isSolvedState ? (
            <motion.div
              key="solved"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center
                  bg-gradient-to-br from-neon-cyan to-cosmic-purple portal-glow-solved"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "easeOut" }}
              >
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl font-display font-bold text-neon-cyan glow-text">
                Portal Restored!
              </h2>

              <p className="text-muted-foreground font-body">
                This world has been saved. Continue your journey.
              </p>

              <motion.button
                onClick={() => navigate("/hub")}
                className="px-8 py-3 rounded-full font-body font-semibold
                  bg-gradient-to-r from-cosmic-purple to-neon-pink
                  text-primary-foreground portal-glow cursor-pointer
                  hover:scale-105 transition-transform"
                whileTap={{ scale: 0.95 }}
              >
                Return to Multiverse
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="puzzle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="p-6 sm:p-8 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm text-center">
                <p className="text-foreground font-body text-lg leading-relaxed italic">
                  "{world.riddle}"
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full px-6 py-4 rounded-xl border border-border bg-muted/50 
                      text-foreground placeholder:text-muted-foreground font-body text-lg
                      focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50
                      transition-all duration-200"
                  />
                </motion.div>

                <motion.button
                  type="submit"
                  className="w-full py-4 rounded-xl font-body font-semibold text-lg
                    bg-gradient-to-r from-cosmic-purple to-neon-pink
                    text-primary-foreground cursor-pointer
                    hover:scale-[1.02] transition-transform"
                  whileTap={{ scale: 0.98 }}
                >
                  Submit Answer
                </motion.button>
              </form>

              <AnimatePresence>
                {showHint && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-neon-pink font-body text-sm"
                  >
                    💡 Hint: {getHint(world.id)}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

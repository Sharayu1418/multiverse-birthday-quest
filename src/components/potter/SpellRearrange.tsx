import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SpellRearrangeProps {
  discoveredLetters: string[];
  onComplete: () => void;
}

export default function SpellRearrange({ discoveredLetters, onComplete }: SpellRearrangeProps) {
  const [phase, setPhase] = useState<"jumbled" | "rearranging" | "done">("jumbled");
  const TARGET = ["L", "U", "M", "O", "S"];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("rearranging"), 1000);
    const t2 = setTimeout(() => setPhase("done"), 3000);
    const t3 = setTimeout(onComplete, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const letters = phase === "done" ? TARGET : discoveredLetters;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 20 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center space-y-8">
        <div className="flex gap-4 justify-center">
          {letters.map((char, i) => (
            <motion.span
              key={`${phase}-${i}`}
              className="font-display text-5xl sm:text-7xl font-bold"
              style={{
                color: "hsl(42 85% 65%)",
                textShadow: "0 0 20px hsl(42 80% 50%), 0 0 40px hsl(42 70% 40%), 0 0 80px hsl(42 60% 35%)",
              }}
              initial={phase === "rearranging" ? { y: -20, opacity: 0 } : {}}
              animate={{
                y: phase === "rearranging" ? [0, -30, 0] : 0,
                opacity: 1,
                rotate: phase === "rearranging" ? [0, 10, -10, 0] : 0,
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                type: "spring",
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Flash */}
        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              className="fixed inset-0"
              style={{ zIndex: 19 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 1.5 }}
            >
              <div className="w-full h-full" style={{
                background: "radial-gradient(circle at center, hsl(42 90% 85%) 0%, hsl(42 80% 60% / 0.6) 30%, transparent 70%)",
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

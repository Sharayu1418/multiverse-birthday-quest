import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StarfieldBackground from "@/components/StarfieldBackground";
import { useGameProgress } from "@/hooks/useGameProgress";
import { Sparkles } from "lucide-react";

function ConfettiParticle({ index }: { index: number }) {
  const colors = [
    "hsl(var(--neon-cyan))",
    "hsl(var(--neon-pink))",
    "hsl(var(--cosmic-purple))",
    "hsl(var(--gold))",
    "hsl(var(--foreground))",
  ];
  const color = colors[index % colors.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const size = Math.random() * 8 + 4;

  return (
    <motion.div
      className="absolute top-0 rounded-sm"
      style={{
        left: `${left}%`,
        width: size,
        height: size,
        backgroundColor: color,
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ y: "100vh", opacity: 0, rotate: 720 }}
      transition={{ duration: 3 + Math.random() * 2, delay, ease: "easeIn", repeat: Infinity }}
    />
  );
}

export default function FinalePage() {
  const navigate = useNavigate();
  const { allSolved, resetProgress } = useGameProgress();
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowMessage(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!allSolved) {
    navigate("/hub");
    return null;
  }

  return (
    <div className="relative min-h-screen starfield overflow-hidden">
      <StarfieldBackground />

      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <ConfettiParticle key={i} index={i} />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center min-h-screen text-center">
        {/* Portal opening */}
        <motion.div
          className="w-40 h-40 sm:w-56 sm:h-56 rounded-full flex items-center justify-center
            bg-gradient-to-br from-neon-cyan via-cosmic-purple to-neon-pink mb-8"
          initial={{ scale: 0, rotate: 0, opacity: 0 }}
          animate={{ scale: 1, rotate: 360, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            boxShadow:
              "0 0 60px hsl(var(--neon-cyan) / 0.5), 0 0 120px hsl(var(--cosmic-purple) / 0.3)",
          }}
        >
          <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 text-primary-foreground" />
        </motion.div>

        <motion.p
          className="text-lg sm:text-xl text-muted-foreground font-body mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          Congratulations.
          <br />
          You restored the multiverse.
        </motion.p>

        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1
              className="text-5xl sm:text-7xl lg:text-8xl font-display font-bold"
              style={{
                color: "hsl(var(--foreground))",
                textShadow:
                  "0 0 40px hsl(var(--neon-pink) / 0.6), 0 0 80px hsl(var(--cosmic-purple) / 0.4)",
              }}
            >
              Happy Birthday
            </h1>

            <p className="text-muted-foreground font-body text-lg max-w-md mx-auto">
              🎂 Your birthday message goes here. You are truly the hero of
              every universe. 🌟
            </p>

            <motion.button
              onClick={resetProgress}
              className="mt-8 px-8 py-3 rounded-full font-body text-sm
                border border-border text-muted-foreground
                hover:text-foreground hover:border-foreground/30
                transition-colors cursor-pointer"
              whileTap={{ scale: 0.95 }}
            >
              Play Again
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

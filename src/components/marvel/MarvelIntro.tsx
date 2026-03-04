import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  onStart: () => void;
}

export default function MarvelIntro({ onStart }: Props) {
  const [phase, setPhase] = useState(0);
  const [portalActive, setPortalActive] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 3500);
    const t3 = setTimeout(() => setPhase(3), 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleClick = () => {
    setPortalActive(true);
    setTimeout(onStart, 1200);
  };

  return (
    <motion.div
      className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center"
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: 0.6 }}
    >
      {/* Portal animation overlay */}
      {portalActive && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="rounded-full border-4 border-marvel-gold"
            initial={{ width: 0, height: 0, rotate: 0, opacity: 0 }}
            animate={{ width: "200vmax", height: "200vmax", rotate: 720, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{
              boxShadow: "0 0 80px hsl(var(--marvel-gold) / 0.8), inset 0 0 80px hsl(var(--marvel-gold) / 0.4)",
            }}
          />
        </motion.div>
      )}

      {/* Mystic orb */}
      <motion.div
        className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full flex items-center justify-center mb-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          background: "radial-gradient(circle, hsl(40 90% 55% / 0.3), hsl(25 80% 40% / 0.1), transparent)",
          boxShadow: "0 0 60px hsl(var(--marvel-gold) / 0.4), 0 0 120px hsl(var(--marvel-gold) / 0.2)",
        }}
      >
        {/* Spinning ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-marvel-gold/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-6 rounded-full border border-marvel-gold/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        <motion.span
          className="font-display text-2xl sm:text-3xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            color: "hsl(var(--marvel-gold))",
            textShadow: "0 0 20px hsl(var(--marvel-gold) / 0.8)",
          }}
        >
          14,000,605
        </motion.span>
      </motion.div>

      {/* Text reveals */}
      {phase >= 1 && (
        <motion.p
          className="text-base sm:text-lg font-body text-muted-foreground max-w-md mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          "I looked into the future and saw 14,000,605 outcomes."
        </motion.p>
      )}

      {phase >= 2 && (
        <motion.p
          className="text-base sm:text-lg font-body text-foreground max-w-md mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          "In all those futures… only one path leads to victory."
        </motion.p>
      )}

      {phase >= 3 && (
        <motion.button
          onClick={handleClick}
          className="relative px-10 py-4 rounded-full font-body font-semibold text-lg cursor-pointer
            transition-all duration-300 hover:scale-105"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(25 80% 45%))",
            color: "hsl(var(--background))",
            boxShadow: "0 0 40px hsl(var(--marvel-gold) / 0.5), 0 0 80px hsl(var(--marvel-gold) / 0.2)",
          }}
        >
          <span className="relative z-10">Reveal the Path</span>
          <motion.div
            className="absolute inset-0 rounded-full opacity-50 blur-md"
            style={{ background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(25 80% 45%))" }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      )}
    </motion.div>
  );
}

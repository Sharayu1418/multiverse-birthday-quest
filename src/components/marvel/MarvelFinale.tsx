import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface Props {
  onReturn: () => void;
}

function MagicParticle({ index }: { index: number }) {
  const colors = [
    "hsl(var(--marvel-gold))",
    "hsl(var(--marvel-red))",
    "hsl(var(--cosmic-purple))",
    "hsl(var(--neon-cyan))",
  ];
  const color = colors[index % colors.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 3;
  const size = Math.random() * 6 + 3;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${left}%`,
        width: size,
        height: size,
        backgroundColor: color,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -30, 0],
        opacity: [0, 1, 0],
        scale: [0.5, 1, 0.5],
      }}
      transition={{ duration: 3 + Math.random() * 2, delay, repeat: Infinity }}
    />
  );
}

export default function MarvelFinale({ onReturn }: Props) {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowMessage(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <MagicParticle key={i} index={i} />
        ))}
      </div>

      {/* Portal orb */}
      <motion.div
        className="w-32 h-32 sm:w-44 sm:h-44 rounded-full flex items-center justify-center mb-8"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(var(--marvel-red)), hsl(var(--cosmic-purple)))",
          boxShadow: "0 0 60px hsl(var(--marvel-gold) / 0.5), 0 0 120px hsl(var(--cosmic-purple) / 0.3)",
        }}
      >
        <Sparkles className="w-14 h-14 sm:w-18 sm:h-18 text-primary-foreground" />
      </motion.div>

      <motion.h2
        className="text-2xl sm:text-4xl font-display font-bold mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        style={{
          color: "hsl(var(--marvel-gold))",
          textShadow: "0 0 30px hsl(var(--marvel-gold) / 0.6)",
        }}
      >
        Marvel Timeline Restored
      </motion.h2>

      <motion.p
        className="text-muted-foreground font-body text-base mb-8 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        The Marvel timeline is stable again.
      </motion.p>

      {showMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Birthday message area */}
          <div
            className="px-8 py-6 rounded-2xl max-w-md mx-auto mb-4"
            style={{
              background: "hsl(var(--marvel-gold) / 0.05)",
              border: "1px solid hsl(var(--marvel-gold) / 0.2)",
            }}
          >
            <p className="text-muted-foreground font-body text-base italic">
              🎂 Your birthday message goes here. 🌟
            </p>
          </div>

          <motion.button
            onClick={onReturn}
            className="px-10 py-4 rounded-full font-body font-semibold text-lg cursor-pointer
              transition-all duration-300 hover:scale-105"
            whileTap={{ scale: 0.95 }}
            style={{
              background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(var(--marvel-red)))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "0 0 30px hsl(var(--marvel-gold) / 0.4)",
            }}
          >
            Return to Multiverse
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

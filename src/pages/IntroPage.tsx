import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StarfieldBackground from "@/components/StarfieldBackground";
import { worlds } from "@/lib/worldsData";
import type { WorldId } from "@/lib/worldsData";

const HIDDEN_HUB_WORLDS: WorldId[] = ["nyc", "sheeran"];
const PREVIEW_WORLDS = worlds.filter((w) => !HIDDEN_HUB_WORLDS.includes(w.id));

const FLOATING_ORBS = PREVIEW_WORLDS.map((w, i) => ({
  id: w.id,
  colorClass: w.colorClass,
  left: 8 + i * 22 + (i % 2) * 5,
  top: 15 + (i % 3) * 25,
  size: 24 + (i % 2) * 8,
  delay: i * 0.4,
  duration: 4 + i * 0.5,
}));

export default function IntroPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && document.activeElement?.tagName !== "INPUT") {
        navigate("/hub");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center starfield overflow-hidden">
      <StarfieldBackground />

      {/* Floating world preview orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FLOATING_ORBS.map((orb) => (
          <motion.div
            key={orb.id}
            className={`absolute rounded-full bg-gradient-to-br ${orb.colorClass} opacity-[0.12]`}
            style={{
              left: `${orb.left}%`,
              top: `${orb.top}%`,
              width: orb.size,
              height: orb.size,
            }}
            animate={{
              y: [0, -12, 0],
              opacity: [0.08, 0.18, 0.08],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: orb.delay,
            }}
          />
        ))}
      </div>

      {/* Portal glow behind content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full bg-cosmic-purple/10 blur-[80px] sm:blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 text-center px-5 sm:px-8 max-w-2xl w-full"
      >
        <motion.h1
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-4 sm:mb-6 glow-text-purple"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ color: "hsl(var(--foreground))" }}
        >
          SHIVANI'S BIRTHDAY MULTIVERSE
        </motion.h1>

        <motion.p
          className="text-sm sm:text-base md:text-lg leading-relaxed mb-8 sm:mb-10 text-muted-foreground max-w-md sm:max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          The multiverse has opened.
          <br />
          <br />
          To restore balance, you must travel through the worlds you love and
          solve their riddles.
        </motion.p>

        <motion.button
          onClick={() => navigate("/hub")}
          className="relative px-8 sm:px-10 py-3 sm:py-4 rounded-full font-body font-semibold text-base sm:text-lg
            bg-gradient-to-r from-cosmic-purple to-neon-pink
            text-primary-foreground
            portal-glow cursor-pointer
            transition-all duration-300 hover:scale-105"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          whileHover={{ boxShadow: "0 0 50px hsl(270 80% 65% / 0.6)" }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10">Begin the Adventure</span>
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-cosmic-purple to-neon-pink opacity-50 blur-md"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>

        <motion.p
          className="mt-6 text-xs text-muted-foreground/70 font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          Press Enter to begin
        </motion.p>
      </motion.div>
    </div>
  );
}

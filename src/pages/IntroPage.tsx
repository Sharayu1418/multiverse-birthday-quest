import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StarfieldBackground from "@/components/StarfieldBackground";

export default function IntroPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center starfield overflow-hidden">
      <StarfieldBackground />

      {/* Portal glow behind content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[500px] h-[500px] rounded-full bg-cosmic-purple/10 blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 text-center px-6 max-w-2xl"
      >
        <motion.h1
          className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 glow-text-purple"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ color: "hsl(var(--foreground))" }}
        >
          The Birthday Multiverse
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg leading-relaxed mb-10 text-muted-foreground max-w-lg mx-auto"
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
          className="relative px-10 py-4 rounded-full font-body font-semibold text-lg
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
      </motion.div>
    </div>
  );
}

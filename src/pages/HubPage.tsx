import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StarfieldBackground from "@/components/StarfieldBackground";
import PortalCard from "@/components/PortalCard";
import { worlds } from "@/lib/worldsData";
import { useGameProgress } from "@/hooks/useGameProgress";

export default function HubPage() {
  const navigate = useNavigate();
  const { solvedWorlds, isSolved, allSolved } = useGameProgress();

  return (
    <div className="relative min-h-screen starfield overflow-hidden">
      <StarfieldBackground />

      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-5xl font-display font-bold mb-4 glow-text-purple" style={{ color: "hsl(var(--foreground))" }}>
            Multiverse Portal Hub
          </h1>

          {/* Progress */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-muted-foreground font-body text-sm sm:text-base">
              Worlds Restored:
            </span>
            <span className="text-neon-cyan font-body font-bold text-lg glow-text">
              {solvedWorlds.length} / 7
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-64 mx-auto h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cosmic-purple to-neon-cyan"
              initial={{ width: 0 }}
              animate={{ width: `${(solvedWorlds.length / 7) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Portal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {worlds.map((world, i) => (
            <PortalCard
              key={world.id}
              world={world}
              solved={isSolved(world.id)}
              index={i}
            />
          ))}
        </div>

        {/* All solved CTA */}
        {allSolved && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.button
              onClick={() => navigate("/finale")}
              className="px-10 py-4 rounded-full font-body font-semibold text-lg
                bg-gradient-to-r from-neon-cyan to-neon-pink
                text-accent-foreground portal-glow cursor-pointer
                transition-all duration-300 hover:scale-105"
              whileHover={{ boxShadow: "0 0 60px hsl(180 85% 55% / 0.5)" }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Enter the Final Portal ✨
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

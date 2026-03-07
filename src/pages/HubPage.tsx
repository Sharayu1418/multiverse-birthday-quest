import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StarfieldBackground from "@/components/StarfieldBackground";
import PortalCard from "@/components/PortalCard";
import { worlds } from "@/lib/worldsData";
import { useGameProgress } from "@/hooks/useGameProgress";
import type { WorldId } from "@/lib/worldsData";

const HIDDEN_HUB_WORLDS: WorldId[] = ["nyc", "sheeran"];

export default function HubPage() {
  const navigate = useNavigate();
  const { isSolved } = useGameProgress();
  const visibleWorlds = worlds.filter((world) => !HIDDEN_HUB_WORLDS.includes(world.id));
  const visibleSolvedCount = visibleWorlds.filter((world) => isSolved(world.id)).length;
  const visibleAllSolved = visibleSolvedCount === visibleWorlds.length;

  return (
    <div className="relative min-h-[100dvh] starfield overflow-hidden">
      <StarfieldBackground />

      <div className="relative z-10 mx-auto px-4 sm:px-6 py-6 sm:py-10 lg:py-12 max-w-5xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold mb-3 sm:mb-4 glow-text-purple" style={{ color: "hsl(var(--foreground))" }}>
            Multiverse Portal Hub
          </h1>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="text-muted-foreground font-body text-xs sm:text-sm md:text-base">
              Worlds Restored:
            </span>
            <span className="text-neon-cyan font-body font-bold text-base sm:text-lg glow-text">
              {visibleSolvedCount}/{visibleWorlds.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-48 sm:w-64 mx-auto h-1.5 sm:h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cosmic-purple to-neon-cyan"
              initial={{ width: 0 }}
              animate={{ width: `${(visibleSolvedCount / visibleWorlds.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Portal Grid — flex for centering incomplete rows */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-5">
          {visibleWorlds.map((world, i) => (
            <div key={world.id} className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(20%-1rem)]">
              <PortalCard
                world={world}
                solved={isSolved(world.id)}
                index={i}
              />
            </div>
          ))}
        </div>

        {/* All solved CTA */}
        {visibleAllSolved && (
          <motion.div
            className="text-center mt-8 sm:mt-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.button
              onClick={() => navigate("/finale")}
              className="px-8 sm:px-10 py-3 sm:py-4 rounded-full font-body font-semibold text-base sm:text-lg
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

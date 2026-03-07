import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

  return (
    <div className="relative min-h-[100dvh] starfield overflow-hidden">
      <StarfieldBackground />

      {/* Back to intro */}
      <motion.button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground bg-card/50 hover:bg-card/70 backdrop-blur-sm transition-colors font-body cursor-pointer z-30 border border-border/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <ArrowLeft className="w-4 h-4" /> Start over
      </motion.button>

      <div className="relative z-10 mx-auto px-4 sm:px-6 py-6 sm:py-10 lg:py-12 max-w-5xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold mb-2 sm:mb-3 glow-text-purple" style={{ color: "hsl(var(--foreground))" }}>
            Multiverse Portal Hub
          </h1>
          <p className="text-muted-foreground font-body text-sm sm:text-base mb-3 sm:mb-4">
            Choose a world to restore
          </p>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="text-muted-foreground font-body text-xs sm:text-sm md:text-base">
              Worlds Restored:
            </span>
            <span className="font-body font-bold text-base sm:text-lg text-amber-400">
              {visibleSolvedCount}/{visibleWorlds.length}
            </span>
          </div>

          {/* Progress bar — warm gold to match cosmic portal theme */}
          <div className="w-48 sm:w-64 mx-auto h-1.5 sm:h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
            <motion.div
              className="h-full rounded-full bg-amber-400/80"
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
      </div>
    </div>
  );
}


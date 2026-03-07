import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { WorldData, WorldId } from "@/lib/worldsData";
import { Check } from "lucide-react";

import marvelImg from "@/assets/hub/marvel-Picsart-BackgroundRemover.png";
import potterImg from "@/assets/hub/harry potter-Picsart-BackgroundRemover.png";
import percyImg from "@/assets/hub/percy jackson-Picsart-BackgroundRemover.webp";
import friendsImg from "@/assets/hub/friend-Picsart-BackgroundRemover.png";
import strangerImg from "@/assets/hub/stranger things-Picsart-BackgroundRemover.png";

const worldImages: Partial<Record<WorldId, string>> = {
  marvel: marvelImg,
  potter: potterImg,
  percy: percyImg,
  friends: friendsImg,
  stranger: strangerImg,
};

interface PortalCardProps {
  world: WorldData;
  solved: boolean;
  index: number;
}

type FullscreenCapableRoot = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

export default function PortalCard({ world, solved, index }: PortalCardProps) {
  const navigate = useNavigate();
  const worldImage = worldImages[world.id];

  const navigateToWorld = async () => {
    const route = world.id === "stranger" ? "/world/stranger-things" : `/world/${world.id}`;

    if (world.id === "potter") {
      const root = document.documentElement as FullscreenCapableRoot;
      try {
        if (!document.fullscreenElement) {
          if (root.requestFullscreen) {
            await root.requestFullscreen();
          } else if (root.webkitRequestFullscreen) {
            root.webkitRequestFullscreen();
          } else if (root.msRequestFullscreen) {
            root.msRequestFullscreen();
          }
        }
      } catch {
        // Ignore fullscreen failures and still navigate.
      }
    }

    navigate(route);
  };

  return (
    <motion.button
      onClick={navigateToWorld}
      className="group relative flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl
        border border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer
        transition-colors duration-300 w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.97 }}
      style={
        solved
          ? {
              boxShadow: `0 0 30px hsl(${world.glowColor} / 0.4), 0 0 60px hsl(${world.glowColor} / 0.2)`,
              borderColor: `hsl(${world.glowColor} / 0.5)`,
            }
          : undefined
      }
    >
      {/* Glow on hover */}
      <motion.div
        className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${world.colorClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      />

      {/* World image */}
      <div
        className={`relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center overflow-hidden
          bg-gradient-to-br ${world.colorClass} ${solved ? "animate-pulse-glow" : ""}`}
      >
        {solved && (
          <div className="absolute inset-0 bg-black/30 z-10 flex items-center justify-center">
            <Check className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground drop-shadow-lg" />
          </div>
        )}
        {worldImage ? (
          <img
            src={worldImage}
            alt={world.name}
            className="w-full h-full object-cover scale-110"
          />
        ) : (
          <span className="text-2xl text-primary-foreground font-display font-bold">
            {world.name[0]}
          </span>
        )}
      </div>

      <span className="font-body font-medium text-xs sm:text-sm text-foreground text-center leading-tight">
        {world.name}
      </span>

      {solved && (
        <span className="text-[10px] sm:text-xs font-body text-neon-cyan glow-text">
          ✓ Restored
        </span>
      )}
    </motion.button>
  );
}

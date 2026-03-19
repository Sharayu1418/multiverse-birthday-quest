import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { WorldData, WorldId } from "@/lib/worldsData";
import { playWorldTheme, stopWorldTheme } from "@/utils/worldThemeMusic";

import marvelImg from "@/assets/hub/marvel.png";
import potterImg from "@/assets/hub/harry-potter.png";
import percyImg from "@/assets/hub/percy-jackson.webp";
import friendsImg from "@/assets/hub/friends.png";
import strangerImg from "@/assets/hub/stranger-things.png";

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
    stopWorldTheme();
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

  const isStranger = world.id === "stranger";

  return (
    <motion.button
      onClick={navigateToWorld}
      onMouseEnter={() => playWorldTheme(world.id)}
      onMouseLeave={stopWorldTheme}
      className="group relative flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl
        border border-border/50 backdrop-blur-sm cursor-pointer transition-colors duration-300 w-full bg-card/50"
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
        className={`relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center overflow-hidden
          ${isStranger ? "bg-white" : `bg-gradient-to-br ${world.colorClass}`} ${solved ? "animate-pulse-glow" : ""}`}
      >
        {worldImage ? (
          <img
            src={worldImage}
            alt={world.name}
            className="w-[85%] h-[85%] object-contain drop-shadow-md"
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
        <span
          className="text-[10px] sm:text-xs font-body font-medium"
          style={{ color: `hsl(${world.glowColor})`, textShadow: `0 0 12px hsl(${world.glowColor} / 0.6)` }}
        >
          ✓ Restored
        </span>
      )}
    </motion.button>
  );
}

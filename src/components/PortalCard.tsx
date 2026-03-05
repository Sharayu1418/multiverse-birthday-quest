import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { WorldData } from "@/lib/worldsData";
import {
  Shield,
  Wand2,
  Coffee,
  Building2,
  Guitar,
  Lightbulb,
  Waves,
  Check,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Shield,
  Wand2,
  Trident: Waves,
  Coffee,
  Building2,
  Guitar,
  Lightbulb,
};

interface PortalCardProps {
  world: WorldData;
  solved: boolean;
  index: number;
}

export default function PortalCard({ world, solved, index }: PortalCardProps) {
  const navigate = useNavigate();
  const Icon = iconMap[world.icon] || Shield;

  return (
    <motion.button
      onClick={() => {
        const route = world.id === "stranger" ? "/world/stranger-things" : `/world/${world.id}`;
        navigate(route);
      }}
      className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl
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
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${world.colorClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      />

      {/* Icon circle */}
      <div
        className={`relative w-16 h-16 rounded-full flex items-center justify-center
          bg-gradient-to-br ${world.colorClass} ${solved ? "animate-pulse-glow" : ""}`}
      >
        {solved ? (
          <Check className="w-7 h-7 text-primary-foreground" />
        ) : (
          <Icon className="w-7 h-7 text-primary-foreground" />
        )}
      </div>

      <span className="font-body font-medium text-sm text-foreground text-center">
        {world.name}
      </span>

      {solved && (
        <span className="text-xs font-body text-neon-cyan glow-text">
          ✓ Restored
        </span>
      )}
    </motion.button>
  );
}

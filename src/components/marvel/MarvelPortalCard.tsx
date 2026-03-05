import { motion } from "framer-motion";

interface HeroData {
  id: number;
  name: string;
  emoji: string;
  image?: string;
  isCorrect: boolean;
  failMessage: string;
}

const heroColors: Record<string, string> = {
  "Thor": "#5B9BD5",
  "Captain America": "#3B82F6",
  "Hulk": "#22C55E",
  "Spider-Man": "#EF4444",
  "Black Widow": "#A78BFA",
  "Doctor Strange": "#F59E0B",
  "Ant-Man": "#F97316",
  "Scarlet Witch": "#EC4899",
  "Iron Man": "hsl(var(--marvel-gold))",
};

interface Props {
  hero: HeroData;
  isOpened: boolean;
  isCorrect: boolean;
  foundIronMan: boolean;
  index: number;
  onOpen: () => void;
}

export default function MarvelPortalCard({ hero, isOpened, isCorrect, foundIronMan, index, onOpen }: Props) {
  const isIronManRevealed = isOpened && isCorrect;

  return (
    <motion.button
      onClick={onOpen}
      disabled={isOpened || foundIronMan}
      className="relative aspect-square rounded-full flex flex-col items-center justify-center cursor-pointer
        disabled:cursor-default transition-all duration-300 group"
      initial={{ opacity: 1, scale: 1 }}
      whileHover={!isOpened && !foundIronMan ? { scale: 1.08 } : {}}
      whileTap={!isOpened && !foundIronMan ? { scale: 0.95 } : {}}
      style={{
        background: isIronManRevealed
          ? "radial-gradient(circle, hsl(40 90% 55% / 0.3), hsl(0 80% 50% / 0.15), hsl(var(--card) / 0.8))"
          : isOpened
          ? "hsl(var(--card) / 0.4)"
          : "radial-gradient(circle, hsl(var(--marvel-gold) / 0.1), hsl(var(--card) / 0.6))",
        boxShadow: isIronManRevealed
          ? "0 0 40px hsl(var(--marvel-gold) / 0.6), 0 0 80px hsl(var(--marvel-gold) / 0.3)"
          : isOpened
          ? "none"
          : "0 0 20px hsl(var(--marvel-gold) / 0.15)",
        border: isIronManRevealed
          ? "2px solid hsl(var(--marvel-gold) / 0.8)"
          : isOpened
          ? "1px solid hsl(var(--border) / 0.3)"
          : "2px solid hsl(var(--marvel-gold) / 0.3)",
      }}
    >
      {/* Spinning ring for unopened */}
      {!isOpened && (
        <>
          <motion.div
            className="absolute inset-1 rounded-full border border-marvel-gold/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-3 rounded-full border border-marvel-gold/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}

      {/* Content */}
      {isOpened ? (
        <motion.div
          className="flex flex-col items-center gap-0.5 px-3 overflow-hidden w-full"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring" }}
        >
          {hero.image ? (
            <img src={hero.image} alt={hero.name} className="w-10 h-10 sm:w-14 sm:h-14 object-contain" />
          ) : (
            <span className="text-2xl sm:text-3xl">{hero.emoji}</span>
          )}
          <span
            className="font-body text-[11px] sm:text-xs font-bold px-1 text-center leading-tight text-foreground"
          >
            {hero.name}
          </span>
          {!isCorrect && (
            <span
              className="font-body text-[8px] sm:text-[10px] font-semibold italic px-1 text-center leading-tight"
              style={{ color: heroColors[hero.name] || "hsl(var(--marvel-red))" }}
            >
              {hero.failMessage}
            </span>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-2xl opacity-30">❓</span>
          <span className="font-body text-xs text-muted-foreground">
            Future {hero.id}
          </span>
        </motion.div>
      )}

      {/* Iron Man pulse */}
      {isIronManRevealed && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ boxShadow: [
            "0 0 20px hsl(var(--marvel-gold) / 0.3)",
            "0 0 50px hsl(var(--marvel-gold) / 0.6)",
            "0 0 20px hsl(var(--marvel-gold) / 0.3)",
          ]}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

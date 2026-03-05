import { motion } from "framer-motion";

interface HeroData {
  id: number;
  name: string;
  emoji: string;
  image?: string;
  isCorrect: boolean;
  failMessage: string;
}

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
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring" }}
        >
          {hero.image ? (
            <img src={hero.image} alt={hero.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mix-blend-screen" />
          ) : (
            <span className="text-3xl sm:text-4xl">{hero.emoji}</span>
          )}
          <span
            className="font-body text-xs sm:text-sm font-medium px-2 text-center"
            style={{
              color: isCorrect ? "hsl(var(--marvel-gold))" : "hsl(var(--muted-foreground))",
            }}
          >
            {hero.name}
          </span>
          {!isCorrect && (
            <span className="font-body text-[10px] sm:text-xs italic text-marvel-red/80 px-2 text-center">
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

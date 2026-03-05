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
          className="absolute inset-0 rounded-full flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring" }}
        >
          {/* Background image fills circle */}
          {hero.image ? (
            <img
              src={hero.image}
              alt={hero.name}
              className="absolute inset-0 w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-4xl sm:text-5xl mb-1">{hero.emoji}</span>
          )}

          {/* Overlay gradient for text readability */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Text on top */}
          <div className="relative z-10 flex flex-col items-center mt-auto pb-3 sm:pb-4 px-2">
            <span
              className="font-body text-xs sm:text-sm font-bold text-center drop-shadow-lg"
              style={{ color: isCorrect ? "hsl(var(--marvel-gold))" : "#fff" }}
            >
              {hero.name}
            </span>
            {!isCorrect && (
              <span className="font-body text-[9px] sm:text-[11px] italic text-center leading-tight mt-0.5 drop-shadow-lg"
                style={{ color: "hsl(var(--marvel-gold) / 0.9)" }}
              >
                {hero.failMessage}
              </span>
            )}
          </div>
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

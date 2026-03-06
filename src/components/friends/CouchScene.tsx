import { motion, AnimatePresence } from "framer-motion";
import orangeCouch from "@/assets/friends/orange_couch.png";
import type { FriendCharacter } from "./FriendsTriviaGame";

const CHARACTER_POSITIONS: Record<FriendCharacter, { left: string; bottom: string }> = {
  Ross:     { left: "5%",  bottom: "55%" },
  Monica:   { left: "18%", bottom: "58%" },
  Chandler: { left: "33%", bottom: "55%" },
  Rachel:   { left: "50%", bottom: "58%" },
  Joey:     { left: "65%", bottom: "55%" },
  Phoebe:   { left: "80%", bottom: "58%" },
};

const CHARACTER_COLORS: Record<FriendCharacter, string> = {
  Ross: "200 60% 50%",
  Joey: "25 80% 55%",
  Phoebe: "50 70% 55%",
  Monica: "280 50% 55%",
  Chandler: "160 50% 45%",
  Rachel: "340 60% 55%",
};

const CHARACTER_EMOJI: Record<FriendCharacter, string> = {
  Ross: "🦕",
  Joey: "🍕",
  Phoebe: "🎸",
  Monica: "👩‍🍳",
  Chandler: "😏",
  Rachel: "👗",
};

interface Props {
  revealedCharacters: FriendCharacter[];
  showReveal: boolean;
  latestChar?: FriendCharacter;
}

export default function CouchScene({ revealedCharacters, showReveal, latestChar }: Props) {
  return (
    <div className="relative w-full max-w-lg mx-auto" style={{ height: 220 }}>
      {/* Couch */}
      <img
        src={orangeCouch}
        alt="Orange Couch"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] opacity-80"
      />

      {/* Characters */}
      <AnimatePresence>
        {revealedCharacters.map((char) => {
          const pos = CHARACTER_POSITIONS[char];
          const color = CHARACTER_COLORS[char];
          const isLatest = showReveal && char === latestChar;

          return (
            <motion.div
              key={char}
              className="absolute flex flex-col items-center"
              style={{ left: pos.left, bottom: pos.bottom }}
              initial={{ opacity: 0, scale: 0, y: -30 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
            >
              {/* Sparkle particles on reveal */}
              {isLatest && (
                <>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={`sparkle-${i}`}
                      className="absolute rounded-full"
                      style={{
                        width: 4,
                        height: 4,
                        background: `hsl(${color})`,
                      }}
                      initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                      animate={{
                        opacity: 0,
                        scale: 0,
                        x: (Math.random() - 0.5) * 60,
                        y: (Math.random() - 0.5) * 60,
                      }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                    />
                  ))}
                </>
              )}

              {/* Character circle */}
              <motion.div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl"
                style={{
                  background: `radial-gradient(circle, hsl(${color}), hsl(${color} / 0.6))`,
                  boxShadow: isLatest
                    ? `0 0 20px hsl(${color} / 0.6), 0 0 40px hsl(${color} / 0.3)`
                    : `0 0 10px hsl(${color} / 0.3)`,
                }}
                animate={isLatest ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                {CHARACTER_EMOJI[char]}
              </motion.div>
              <span
                className="text-[10px] sm:text-xs font-body font-medium mt-1"
                style={{ color: `hsl(${color})` }}
              >
                {char}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* "X HAS JOINED THE COUCH!" text */}
      <AnimatePresence>
        {showReveal && latestChar && (
          <motion.div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span
              className="text-sm sm:text-base font-display font-bold tracking-wider uppercase"
              style={{
                color: "hsl(var(--friends-orange))",
                textShadow: "0 0 20px hsl(var(--friends-orange) / 0.5)",
              }}
            >
              {latestChar} has joined the couch! 🎉
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

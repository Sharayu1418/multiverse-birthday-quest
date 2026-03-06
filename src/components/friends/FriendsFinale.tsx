import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import orangeCouch from "@/assets/friends/orange_couch.png";

const ALL_CHARS = ["Ross", "Monica", "Chandler", "Rachel", "Joey", "Phoebe"];
const EMOJIS: Record<string, string> = {
  Ross: "🦕", Joey: "🍕", Phoebe: "🎸", Monica: "👩‍🍳", Chandler: "😏", Rachel: "👗",
};

interface Props {
  onReturn: () => void;
}

export default function FriendsFinale({ onReturn }: Props) {
  const [showClap, setShowClap] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showPortal, setShowPortal] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowClap(true), 1500);
    const t2 = setTimeout(() => setShowText(true), 3000);
    const t3 = setTimeout(() => setShowPortal(true), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <motion.div
      className="text-center space-y-8 max-w-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Fountain effect */}
      <div className="relative w-full h-20 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              background: "hsl(200 70% 70% / 0.5)",
              left: `${30 + Math.random() * 40}%`,
              bottom: 0,
            }}
            animate={{
              y: [0, -60 - Math.random() * 40],
              x: [(Math.random() - 0.5) * 40],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 1.5 + Math.random(),
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Couch with all characters */}
      <div className="relative w-full mx-auto" style={{ height: 200 }}>
        <img
          src={orangeCouch}
          alt="Couch"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] opacity-90"
        />

        {ALL_CHARS.map((char, i) => (
          <motion.div
            key={char}
            className="absolute flex flex-col items-center"
            style={{
              left: `${8 + i * 15}%`,
              bottom: i % 2 === 0 ? "55%" : "58%",
            }}
            animate={showClap ? { y: [0, -8, 0] } : {}}
            transition={{
              duration: 0.4,
              delay: i * 0.08,
              repeat: showClap ? 4 : 0,
            }}
          >
            <div
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl"
              style={{
                background: `hsl(var(--friends-orange) / 0.7)`,
                boxShadow: "0 0 15px hsl(var(--friends-orange) / 0.4)",
              }}
            >
              {EMOJIS[char]}
            </div>
            <span className="text-[10px] font-body mt-1" style={{ color: "hsl(var(--friends-orange))" }}>
              {char}
            </span>
          </motion.div>
        ))}

        {/* Clap hands emoji */}
        {showClap && (
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 text-3xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.8] }}
            transition={{ duration: 2 }}
          >
            👏👏👏👏
          </motion.div>
        )}
      </div>

      {/* Quote */}
      {showText && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <h2
            className="text-xl sm:text-3xl font-display font-bold"
            style={{
              color: "hsl(var(--friends-orange))",
              textShadow: "0 0 30px hsl(var(--friends-orange) / 0.5), 0 0 60px hsl(var(--friends-orange) / 0.2)",
            }}
          >
            "I'll be there for you."
          </h2>
          <motion.p
            className="text-lg sm:text-2xl font-display font-bold"
            style={{
              color: "hsl(var(--foreground))",
              textShadow: "0 0 20px hsl(var(--friends-orange) / 0.3)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            ✨ The One Where Shivani Has The Best Birthday! ✨
          </motion.p>
        </motion.div>
      )}

      {/* Portal */}
      {showPortal && (
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.button
            onClick={onReturn}
            className="px-8 py-3 rounded-full font-body font-semibold cursor-pointer"
            style={{
              background: "linear-gradient(135deg, hsl(var(--friends-orange)), hsl(var(--cosmic-purple)))",
              color: "hsl(0 0% 100%)",
              boxShadow: "0 0 30px hsl(var(--friends-orange) / 0.4), 0 0 60px hsl(var(--cosmic-purple) / 0.2)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Return to the Multiverse ✨
          </motion.button>
          <p className="text-xs font-body" style={{ color: "hsl(var(--foreground) / 0.4)" }}>
            The gang will always be here for you
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

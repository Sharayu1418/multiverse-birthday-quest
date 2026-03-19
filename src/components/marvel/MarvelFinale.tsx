import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onReturn: () => void;
}

function FloatingEmber({ index }: { index: number }) {
  const gold = "hsl(40 90% 55%)";
  const red = "hsl(0 70% 50%)";
  const color = index % 3 === 0 ? red : gold;
  const left = Math.random() * 100;
  const size = 1.5 + Math.random() * 2.5;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${left}%`,
        bottom: "-5%",
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
      animate={{
        y: [0, -(200 + Math.random() * 400)],
        x: [0, (Math.random() - 0.5) * 80],
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 5,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

export default function MarvelFinale({ onReturn }: Props) {
  const [showContent, setShowContent] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 800);
    const t2 = setTimeout(() => setShowMessage(true), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div
      className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, hsl(0 0% 0% / 0.6) 100%)",
        }}
      />

      {/* Rising embers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 20 }, (_, i) => (
          <FloatingEmber key={i} index={i} />
        ))}
      </div>

      {/* Central warm glow */}
      <motion.div
        className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(40 90% 55% / 0.08) 0%, hsl(0 70% 50% / 0.04) 50%, transparent 80%)",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      <motion.div className="relative z-10 flex flex-col items-center max-w-md">
        {/* Snap ring animation */}
        <motion.div
          className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1.5px solid hsl(40 70% 50% / 0.4)",
              boxShadow: "0 0 30px hsl(40 70% 50% / 0.15)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner pulse */}
          <motion.div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(40 80% 55% / 0.3), transparent 70%)",
            }}
            animate={{
              boxShadow: [
                "0 0 20px hsl(40 80% 55% / 0.2)",
                "0 0 40px hsl(40 80% 55% / 0.4)",
                "0 0 20px hsl(40 80% 55% / 0.2)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {/* Six infinity stone dots in a circle */}
          {[
            { color: "hsl(0 70% 50%)", angle: 0 },
            { color: "hsl(270 60% 55%)", angle: 60 },
            { color: "hsl(210 70% 55%)", angle: 120 },
            { color: "hsl(40 80% 55%)", angle: 180 },
            { color: "hsl(140 50% 50%)", angle: 240 },
            { color: "hsl(30 80% 55%)", angle: 300 },
          ].map((stone, i) => {
            const r = 32;
            const rad = (stone.angle * Math.PI) / 180;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 4,
                  height: 4,
                  background: stone.color,
                  boxShadow: `0 0 8px ${stone.color}`,
                  left: `calc(50% + ${Math.cos(rad) * r}px - 2px)`,
                  top: `calc(50% + ${Math.sin(rad) * r}px - 2px)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0.4, 1, 0.4], scale: 1 }}
                transition={{
                  opacity: { delay: 0.5 + i * 0.1, duration: 2.5, repeat: Infinity },
                  scale: { delay: 0.5 + i * 0.1, duration: 0.4 },
                }}
              />
            );
          })}
        </motion.div>

        {/* Title */}
        <AnimatePresence>
          {showContent && (
            <>
              <motion.h2
                className="text-xl sm:text-3xl font-display font-bold mb-2 tracking-wide"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  color: "hsl(var(--marvel-gold))",
                  textShadow: "0 0 20px hsl(var(--marvel-gold) / 0.3)",
                }}
              >
                Marvel Timeline Restored
              </motion.h2>

              <motion.div
                className="w-20 h-px mb-6"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, hsl(var(--marvel-gold) / 0.5), transparent)",
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />

              <motion.p
                className="font-body text-sm sm:text-base mb-10 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                style={{ color: "hsl(var(--foreground) / 0.5)" }}
              >
                The timeline is stable once more.
              </motion.p>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center space-y-8"
            >
              <p
                className="font-body text-sm sm:text-base italic max-w-sm leading-relaxed"
                style={{ color: "hsl(var(--foreground) / 0.7)" }}
              >
                "Part of the journey is the end."
              </p>

              <motion.button
                onClick={onReturn}
                className="px-8 py-2.5 rounded-md font-body font-medium text-sm tracking-wider uppercase cursor-pointer
                  transition-all duration-300"
                whileHover={{
                  boxShadow: "0 0 25px hsl(var(--marvel-gold) / 0.3)",
                }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: "transparent",
                  border: "1px solid hsl(var(--marvel-gold) / 0.5)",
                  color: "hsl(var(--marvel-gold))",
                  letterSpacing: "0.12em",
                }}
              >
                Return to Multiverse
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

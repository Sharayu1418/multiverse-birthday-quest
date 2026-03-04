import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSolved: () => void;
}

// Particle component for the orange magic burst
function MagicParticles({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * Math.PI * 2;
    const distance = 80 + Math.random() * 120;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 3 + Math.random() * 5,
      delay: Math.random() * 0.3,
    };
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: `hsl(var(--marvel-gold))`,
            boxShadow: `0 0 8px hsl(var(--marvel-gold) / 0.8)`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
          transition={{ duration: 1.2, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// Floating rune particles in background
function CosmicRunes() {
  const runes = ["᛭", "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ"];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {runes.map((rune, i) => (
        <motion.span
          key={i}
          className="absolute font-display select-none"
          style={{
            left: `${(i / runes.length) * 100}%`,
            top: `${15 + Math.random() * 70}%`,
            fontSize: 12 + Math.random() * 10,
            color: `hsl(var(--marvel-gold) / 0.12)`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.08, 0.2, 0.08],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          {rune}
        </motion.span>
      ))}
    </div>
  );
}

// Sling-ring portal animation
function SlingRingPortal({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Outer ring */}
      <motion.div
        className="absolute rounded-full border-2"
        style={{
          borderColor: "hsl(var(--marvel-gold))",
          boxShadow: "0 0 40px hsl(var(--marvel-gold) / 0.6), inset 0 0 40px hsl(var(--marvel-gold) / 0.3)",
        }}
        initial={{ width: 0, height: 0, opacity: 0, rotate: 0 }}
        animate={{ width: 300, height: 300, opacity: 1, rotate: 360 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      {/* Inner ring */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          borderColor: "hsl(var(--marvel-gold) / 0.6)",
          boxShadow: "0 0 25px hsl(var(--marvel-gold) / 0.4)",
        }}
        initial={{ width: 0, height: 0, opacity: 0, rotate: 0 }}
        animate={{ width: 220, height: 220, opacity: 1, rotate: -360 }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
      />
      {/* Center glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--marvel-gold) / 0.4), transparent 70%)",
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: 200, height: 200, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      {/* Text */}
      <motion.p
        className="absolute font-display text-lg sm:text-xl font-bold text-center"
        style={{
          color: "hsl(var(--marvel-gold))",
          textShadow: "0 0 20px hsl(var(--marvel-gold) / 0.6)",
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        Portal Unlocked
      </motion.p>
    </motion.div>
  );
}

export default function DoctorStrangeVisionRiddle({ onSolved }: Props) {
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [shake, setShake] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);
  const [phase, setPhase] = useState<"riddle" | "burst" | "message" | "portal">("riddle");

  // Delayed reveal of the final instruction
  useEffect(() => {
    const timer = setTimeout(() => setShowInstruction(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (answer.trim() === "1") {
      setPhase("burst");
      setTimeout(() => setPhase("message"), 1400);
      setTimeout(() => setPhase("portal"), 4000);
    } else {
      setShowHint(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handlePortalComplete = useCallback(() => {
    onSolved();
  }, [onSolved]);

  return (
    <motion.div
      className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <CosmicRunes />

      {/* Orange circular aura */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, hsl(var(--marvel-gold) / 0.12) 0%, hsl(var(--marvel-gold) / 0.04) 40%, transparent 70%)",
        }}
      />

      <AnimatePresence mode="wait">
        {(phase === "riddle" || phase === "burst") && (
          <motion.div
            key="riddle-content"
            className="relative z-10 flex flex-col items-center max-w-lg"
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            {/* Glowing icon */}
            <motion.div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(var(--marvel-red)))",
                boxShadow: "0 0 60px hsl(var(--marvel-gold) / 0.5), 0 0 120px hsl(var(--marvel-gold) / 0.2)",
              }}
            >
              <span className="text-3xl">👁️</span>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-2xl sm:text-4xl font-display font-bold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                color: "hsl(var(--marvel-gold))",
                textShadow: "0 0 30px hsl(var(--marvel-gold) / 0.5)",
              }}
            >
              Vision of the Sorcerer
            </motion.h2>

            {/* Riddle text */}
            <motion.div
              className="space-y-3 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="font-body text-sm sm:text-base leading-relaxed" style={{ color: "hsl(var(--foreground) / 0.85)" }}>
                The sorcerer beside you searched through millions of futures.
              </p>
              <p className="font-body text-sm sm:text-base leading-relaxed" style={{ color: "hsl(var(--foreground) / 0.85)" }}>
                In nearly every path… the universe falls.
              </p>
              <p className="font-body text-sm sm:text-base leading-relaxed" style={{ color: "hsl(var(--foreground) / 0.85)" }}>
                But one future remained.
              </p>
              <p className="font-body text-sm sm:text-base italic text-muted-foreground">
                Read what survives when all other futures collapse.
              </p>
            </motion.div>

            {/* Delayed instruction */}
            <AnimatePresence>
              {showInstruction && (
                <motion.p
                  className="font-display text-base sm:text-lg font-semibold mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    color: "hsl(var(--marvel-gold))",
                    textShadow: "0 0 15px hsl(var(--marvel-gold) / 0.4)",
                  }}
                >
                  "Type the number that remained."
                </motion.p>
              )}
            </AnimatePresence>

            {/* Input */}
            {showInstruction && (
              <motion.div
                className="w-full max-w-xs space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.input
                  type="text"
                  inputMode="numeric"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Enter the number..."
                  className="w-full px-4 py-3 rounded-lg font-body text-center text-base
                    border bg-background/50 backdrop-blur-sm
                    focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: "hsl(var(--marvel-gold) / 0.3)",
                    color: "hsl(var(--foreground))",
                  }}
                  animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                  transition={{ duration: 0.4 }}
                />

                {showHint && (
                  <motion.p
                    className="text-sm font-body"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ color: "hsl(var(--marvel-red))" }}
                  >
                    Hint: Only one future leads to victory.
                  </motion.p>
                )}

                <motion.button
                  onClick={handleSubmit}
                  className="w-full px-8 py-3 rounded-full font-body font-semibold text-lg cursor-pointer
                    transition-all duration-300 hover:scale-105"
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(var(--marvel-red)))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 0 30px hsl(var(--marvel-gold) / 0.4)",
                  }}
                >
                  Reveal the Timeline
                </motion.button>
              </motion.div>
            )}

            {/* Particle burst on correct answer */}
            <MagicParticles active={phase === "burst"} />
          </motion.div>
        )}

        {phase === "message" && (
          <motion.div
            key="message-content"
            className="relative z-10 flex flex-col items-center max-w-lg space-y-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(var(--marvel-red)))",
                boxShadow: "0 0 60px hsl(var(--marvel-gold) / 0.6)",
              }}
              animate={{ boxShadow: ["0 0 60px hsl(40 90% 55% / 0.6)", "0 0 100px hsl(40 90% 55% / 0.8)", "0 0 60px hsl(40 90% 55% / 0.6)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-2xl">✨</span>
            </motion.div>

            <motion.h3
              className="text-xl sm:text-3xl font-display font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                color: "hsl(var(--marvel-gold))",
                textShadow: "0 0 30px hsl(var(--marvel-gold) / 0.5)",
              }}
            >
              Correct timeline located.
            </motion.h3>

            <motion.p
              className="font-body text-base sm:text-lg italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              style={{ color: "hsl(var(--foreground) / 0.9)" }}
            >
              "This is the future where we win."
            </motion.p>
          </motion.div>
        )}

        {phase === "portal" && (
          <SlingRingPortal key="portal" onComplete={handlePortalComplete} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

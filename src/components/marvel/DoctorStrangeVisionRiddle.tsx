import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSolved: () => void;
}

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

function TimeStoneAura() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * 360;
        const r = 160 + Math.random() * 60;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              left: "50%",
              top: "38%",
              background: "hsl(140 60% 55% / 0.6)",
              boxShadow: "0 0 6px hsl(140 60% 55% / 0.4)",
            }}
            animate={{
              x: [Math.cos((angle * Math.PI) / 180) * r, Math.cos(((angle + 360) * Math.PI) / 180) * r],
              y: [Math.sin((angle * Math.PI) / 180) * r, Math.sin(((angle + 360) * Math.PI) / 180) * r],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.3,
            }}
          />
        );
      })}
    </div>
  );
}

function EyeOfAgamotto() {
  return (
    <motion.div
      className="relative flex items-center justify-center mb-10"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Outer ornate ring */}
      <motion.div
        className="absolute w-28 h-28 rounded-full"
        style={{
          border: "2px solid hsl(40 70% 45% / 0.6)",
          boxShadow:
            "0 0 30px hsl(40 70% 45% / 0.2), inset 0 0 20px hsl(40 70% 45% / 0.1)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      {/* Middle ring with notches */}
      <div
        className="absolute w-24 h-24 rounded-full"
        style={{
          border: "1.5px solid hsl(40 60% 40% / 0.4)",
        }}
      />
      {/* Inner green glow (time stone) */}
      <motion.div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background:
            "radial-gradient(circle, hsl(140 50% 50% / 0.35) 0%, hsl(140 50% 40% / 0.1) 60%, transparent 100%)",
          boxShadow: "0 0 40px hsl(140 50% 50% / 0.25), 0 0 80px hsl(140 50% 50% / 0.1)",
        }}
        animate={{
          boxShadow: [
            "0 0 40px hsl(140 50% 50% / 0.25), 0 0 80px hsl(140 50% 50% / 0.1)",
            "0 0 60px hsl(140 50% 50% / 0.4), 0 0 100px hsl(140 50% 50% / 0.2)",
            "0 0 40px hsl(140 50% 50% / 0.25), 0 0 80px hsl(140 50% 50% / 0.1)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {/* Stylized eye shape */}
        <svg width="32" height="18" viewBox="0 0 32 18" fill="none">
          <path
            d="M16 2C9 2 3 9 1 9s8 7 15 7 14-7 15-7S23 2 16 2z"
            stroke="hsl(40 70% 50%)"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="16" cy="9" r="4" fill="hsl(140 50% 50% / 0.6)" stroke="hsl(40 70% 50%)" strokeWidth="1" />
          <circle cx="16" cy="9" r="1.5" fill="hsl(40 80% 55%)" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

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
      <motion.div
        className="absolute rounded-full border-2"
        style={{
          borderColor: "hsl(var(--marvel-gold))",
          boxShadow:
            "0 0 40px hsl(var(--marvel-gold) / 0.6), inset 0 0 40px hsl(var(--marvel-gold) / 0.3)",
        }}
        initial={{ width: 0, height: 0, opacity: 0, rotate: 0 }}
        animate={{ width: 300, height: 300, opacity: 1, rotate: 360 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
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
      <motion.div
        className="absolute rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--marvel-gold) / 0.4), transparent 70%)",
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: 200, height: 200, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
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
  const [phase, setPhase] = useState<
    "riddle" | "burst" | "message" | "portal"
  >("riddle");

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
      <TimeStoneAura />

      {/* Subtle vignette overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, hsl(0 0% 0% / 0.5) 100%)",
        }}
      />

      {/* Central ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, hsl(140 40% 45% / 0.06) 0%, hsl(var(--marvel-gold) / 0.04) 50%, transparent 80%)",
        }}
      />

      <AnimatePresence mode="wait">
        {(phase === "riddle" || phase === "burst") && (
          <motion.div
            key="riddle-content"
            className="relative z-10 flex flex-col items-center max-w-md"
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <EyeOfAgamotto />

            {/* Title */}
            <motion.h2
              className="text-xl sm:text-3xl font-display font-bold mb-2 tracking-wide"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                color: "hsl(var(--marvel-gold))",
                textShadow: "0 0 20px hsl(var(--marvel-gold) / 0.3)",
              }}
            >
              Vision of the Sorcerer
            </motion.h2>

            {/* Thin decorative line */}
            <motion.div
              className="w-24 h-px mb-8"
              style={{ background: "linear-gradient(90deg, transparent, hsl(var(--marvel-gold) / 0.5), transparent)" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />

            {/* Riddle text */}
            <motion.div
              className="space-y-4 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p
                className="font-body text-sm sm:text-base leading-relaxed"
                style={{ color: "hsl(var(--foreground) / 0.7)" }}
              >
                The sorcerer beside you searched through
                <br />
                millions of futures.
              </p>
              <p
                className="font-body text-xs sm:text-sm italic"
                style={{ color: "hsl(140 30% 60% / 0.8)" }}
              >
                What survives when all other futures collapse?
              </p>
            </motion.div>

            {/* Delayed instruction */}
            <AnimatePresence>
              {showInstruction && (
                <motion.p
                  className="font-display text-sm sm:text-base font-medium tracking-wider uppercase mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    color: "hsl(var(--marvel-gold) / 0.85)",
                    letterSpacing: "0.15em",
                  }}
                >
                  Type the number that remained
                </motion.p>
              )}
            </AnimatePresence>

            {/* Input area */}
            {showInstruction && (
              <motion.div
                className="w-full max-w-[260px] space-y-5"
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
                  placeholder="..."
                  className="w-full px-4 py-3 rounded-md font-body text-center text-lg tracking-widest
                    focus:outline-none transition-all"
                  style={{
                    background: "hsl(0 0% 100% / 0.04)",
                    border: "1px solid hsl(var(--marvel-gold) / 0.15)",
                    color: "hsl(var(--marvel-gold))",
                    boxShadow: "inset 0 0 20px hsl(var(--marvel-gold) / 0.04)",
                  }}
                  animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                  transition={{ duration: 0.4 }}
                />

                {showHint && (
                  <motion.p
                    className="text-xs font-body"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ color: "hsl(var(--marvel-red) / 0.8)" }}
                  >
                    Only one future leads to victory.
                  </motion.p>
                )}

                <motion.button
                  onClick={handleSubmit}
                  className="w-full px-6 py-2.5 rounded-md font-body font-medium text-sm tracking-wider uppercase cursor-pointer
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
                  Reveal the Timeline
                </motion.button>
              </motion.div>
            )}

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
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle, hsl(140 50% 50% / 0.3), transparent 70%)",
                boxShadow: "0 0 50px hsl(140 50% 50% / 0.3)",
              }}
              animate={{
                boxShadow: [
                  "0 0 50px hsl(140 50% 50% / 0.3)",
                  "0 0 80px hsl(140 50% 50% / 0.5)",
                  "0 0 50px hsl(140 50% 50% / 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-xl" style={{ color: "hsl(140 50% 60%)" }}>
                ✦
              </span>
            </motion.div>

            <motion.h3
              className="text-lg sm:text-2xl font-display font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                color: "hsl(var(--marvel-gold))",
                textShadow: "0 0 20px hsl(var(--marvel-gold) / 0.3)",
              }}
            >
              Correct timeline located.
            </motion.h3>

            <motion.div
              className="w-16 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, hsl(var(--marvel-gold) / 0.4), transparent)",
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            />

            <motion.p
              className="font-body text-sm sm:text-base italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              style={{ color: "hsl(var(--foreground) / 0.7)" }}
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

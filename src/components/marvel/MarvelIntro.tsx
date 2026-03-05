import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onStart: () => void;
}

export default function MarvelIntro({ onStart }: Props) {
  const [showButton, setShowButton] = useState(false);
  const [portalActive, setPortalActive] = useState(false);

  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    // Show skip option after 10s for replays
    const skipTimer = setTimeout(() => setCanSkip(true), 10000);
    // Show button after full video duration (~32s)
    const t = setTimeout(() => setShowButton(true), 32000);
    return () => { clearTimeout(t); clearTimeout(skipTimer); };
  }, []);

  const handleClick = () => {
    setPortalActive(true);
    setTimeout(onStart, 1200);
  };

  return (
    <motion.div
      className="relative z-10 flex flex-col items-center justify-center min-h-screen"
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: 0.6 }}
    >
      {/* Portal animation overlay */}
      {portalActive && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="rounded-full border-4 border-marvel-gold"
            initial={{ width: 0, height: 0, rotate: 0, opacity: 0 }}
            animate={{ width: "200vmax", height: "200vmax", rotate: 720, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{
              boxShadow: "0 0 80px hsl(var(--marvel-gold) / 0.8), inset 0 0 80px hsl(var(--marvel-gold) / 0.4)",
            }}
          />
        </motion.div>
      )}

      {/* Fullscreen video */}
      <motion.div
        className="fixed inset-0 z-0"
        animate={{ opacity: showButton ? 0.3 : 1 }}
        transition={{ duration: 1.5 }}
      >
        <iframe
          className="w-full h-full"
          src="https://streamable.com/e/6ft5jh?autoplay=1&muted=0&loop=0"
          title="Marvel Intro"
          frameBorder="0"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          style={{ position: "absolute", inset: 0, border: "none" }}
        />
      </motion.div>

      {/* Dark overlay when button appears */}
      {showButton && (
        <motion.div
          className="fixed inset-0 z-10 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
      )}

      {/* Skip button for replays */}
      {!showButton && canSkip && (
        <motion.button
          onClick={() => setShowButton(true)}
          className="fixed bottom-6 z-20 font-body text-sm cursor-pointer hover:opacity-100 transition-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          whileHover={{ opacity: 1 }}
          style={{ color: "hsl(var(--marvel-gold))" }}
        >
          Skip to end →
        </motion.button>
      )}

      {/* Reveal the Path button */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            onClick={handleClick}
            className="fixed bottom-16 z-20 px-10 py-4 rounded-full font-body font-semibold text-lg cursor-pointer
              transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(25 80% 45%))",
              color: "hsl(var(--background))",
              boxShadow: "0 0 40px hsl(var(--marvel-gold) / 0.5), 0 0 80px hsl(var(--marvel-gold) / 0.2)",
            }}
          >
            <span className="relative z-10">Reveal the Path</span>
            <motion.div
              className="absolute inset-0 rounded-full opacity-50 blur-md"
              style={{ background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(25 80% 45%))" }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
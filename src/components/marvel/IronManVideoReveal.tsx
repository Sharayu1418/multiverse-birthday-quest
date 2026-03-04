import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onContinue: () => void;
}

export default function IronManVideoReveal({ onContinue }: Props) {
  const [phase, setPhase] = useState<"flare" | "text" | "video">("flare");
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 800);
    const t2 = setTimeout(() => setPhase("video"), 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Show button after video duration (~2:30 = 150s, adding buffer for intro transitions)
  useEffect(() => {
    if (phase !== "video") return;
    const timer = setTimeout(() => setShowButton(true), 150000);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <motion.div
      className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Portal flare */}
      <AnimatePresence>
        {phase === "flare" && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-40 h-40 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 3, 0.5], opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                background: "radial-gradient(circle, hsl(var(--marvel-gold)), hsl(var(--marvel-red) / 0.5), transparent)",
                boxShadow: "0 0 100px hsl(var(--marvel-gold) / 0.8)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal text */}
      {(phase === "text" || phase === "video") && (
        <motion.p
          className="font-display text-xl sm:text-3xl font-bold mb-8 max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "video" ? 0.6 : 1 }}
          transition={{ duration: 0.8 }}
          style={{
            color: "hsl(var(--marvel-gold))",
            textShadow: "0 0 30px hsl(var(--marvel-gold) / 0.6)",
          }}
        >
          "The future Strange saw… has arrived."
        </motion.p>
      )}

      {/* Video */}
      {phase === "video" && (
        <motion.div
          className="w-full max-w-2xl space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{
              aspectRatio: "16/9",
              boxShadow: "0 0 60px hsl(var(--marvel-gold) / 0.3)",
            }}
          >
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://drive.google.com/file/d/1ew7zJDPdOyK86J5HvDRuoM1-UeGRsKPt/preview"
              title="Marvel Video"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>

          <motion.p
            className="font-body text-lg text-muted-foreground italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            "In one future… we win."
          </motion.p>

          <motion.button
            onClick={showButton ? onContinue : undefined}
            disabled={!showButton}
            className="px-10 py-4 rounded-full font-body font-semibold text-lg
              transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            whileTap={showButton ? { scale: 0.95 } : {}}
            style={{
              background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(var(--marvel-red)))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "0 0 40px hsl(var(--marvel-gold) / 0.5)",
              opacity: showButton ? 1 : 0.4,
              cursor: showButton ? "pointer" : "not-allowed",
            }}
          >
            Restore the Multiverse
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

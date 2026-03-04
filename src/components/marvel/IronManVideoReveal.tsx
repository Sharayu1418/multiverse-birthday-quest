import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onContinue: () => void;
}

export default function IronManVideoReveal({ onContinue }: Props) {
  const [phase, setPhase] = useState<"text" | "video" | "button">("text");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Show text for 3s, then go fullscreen video
    const t = setTimeout(() => setPhase("video"), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "video") return;
    // Streamable video is ~2:30. Show button after 155s
    const t = setTimeout(() => setPhase("button"), 155000);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {phase === "text" && (
          <motion.p
            key="text"
            className="font-display text-2xl sm:text-4xl font-bold text-center max-w-lg px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              color: "hsl(var(--marvel-gold))",
              textShadow: "0 0 40px hsl(var(--marvel-gold) / 0.6)",
            }}
          >
            "The future Strange saw… has arrived."
          </motion.p>
        )}

        {(phase === "video" || phase === "button") && (
          <motion.div
            key="video"
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <iframe
              ref={iframeRef}
              className="w-full h-full"
              src="https://streamable.com/e/c19pp1?autoplay=1"
              title="Marvel Video"
              frameBorder="0"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              style={{ position: "absolute", inset: 0 }}
            />

            {phase === "button" && (
              <motion.button
                onClick={onContinue}
                className="absolute bottom-12 px-10 py-4 rounded-full font-body font-semibold text-lg
                  cursor-pointer z-10 hover:scale-105 transition-transform"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(var(--marvel-red)))",
                  color: "hsl(var(--primary-foreground))",
                  boxShadow: "0 0 40px hsl(var(--marvel-gold) / 0.5)",
                }}
              >
                Restore the Multiverse
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

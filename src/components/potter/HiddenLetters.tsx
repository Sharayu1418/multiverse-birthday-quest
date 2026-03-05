import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LetterData {
  char: string;
  x: number; // percent
  y: number; // percent
  found: boolean;
}

interface HiddenLettersProps {
  wandEnabled: boolean;
  wandX: number;
  wandY: number;
  onAllFound: () => void;
}

const LETTER_POSITIONS = [
  { char: "L", x: 25, y: 40 },
  { char: "U", x: 65, y: 30 },
  { char: "M", x: 40, y: 55 },
  { char: "O", x: 75, y: 50 },
  { char: "S", x: 50, y: 38 },
];

export default function HiddenLetters({ wandEnabled, wandX, wandY, onAllFound }: HiddenLettersProps) {
  const [letters, setLetters] = useState<LetterData[]>(
    LETTER_POSITIONS.map((l) => ({ ...l, found: false }))
  );
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [burst, setBurst] = useState<{ x: number; y: number; id: number } | null>(null);
  const burstId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const allFoundTriggered = useRef(false);

  useEffect(() => {
    if (!wandEnabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const DETECTION_RADIUS = 60;

    setLetters((prev) => {
      let changed = false;
      const next = prev.map((letter) => {
        if (letter.found) return letter;
        const lx = rect.left + (letter.x / 100) * rect.width;
        const ly = rect.top + (letter.y / 100) * rect.height;
        const dist = Math.hypot(wandX - lx, wandY - ly);
        if (dist < DETECTION_RADIUS) {
          changed = true;
          setBurst({ x: lx, y: ly, id: burstId.current++ });
          setDiscovered((d) => [...d, letter.char]);
          return { ...letter, found: true };
        }
        return letter;
      });
      return changed ? next : prev;
    });
  }, [wandX, wandY, wandEnabled]);

  useEffect(() => {
    if (discovered.length === 5 && !allFoundTriggered.current) {
      allFoundTriggered.current = true;
      // Delay to let the last letter animate to the bar
      setTimeout(onAllFound, 1500);
    }
  }, [discovered.length, onAllFound]);

  return (
    <>
      <div ref={containerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 8 }}>
        {letters.map((letter, i) => {
          // Calculate distance to wand to show proximity glow
          if (letter.found) return null;
          return (
            <div
              key={letter.char}
              className="absolute font-display text-3xl sm:text-4xl select-none"
              style={{
                left: `${letter.x}%`,
                top: `${letter.y}%`,
                transform: "translate(-50%, -50%)",
                color: "hsl(42 80% 70%)",
                textShadow: "0 0 15px hsl(42 80% 60%), 0 0 30px hsl(42 70% 50%)",
                opacity: 0.9,
              }}
            >
              {letter.char}
            </div>
          );
        })}
      </div>

      {/* Burst particles */}
      <AnimatePresence>
        {burst && (
          <div key={burst.id} className="fixed pointer-events-none" style={{ zIndex: 12 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: burst.x,
                  top: burst.y,
                  width: 4,
                  height: 4,
                  background: "hsl(42 90% 75%)",
                  boxShadow: "0 0 6px hsl(42 90% 70%)",
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 80,
                  y: (Math.random() - 0.5) * 80,
                  scale: [0, 1, 0],
                  opacity: [1, 0.8, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Spell bar at bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-3 items-center" style={{ zIndex: 15 }}>
        <div className="flex gap-2 px-6 py-3 rounded-2xl border border-potter-gold/30 bg-card/80 backdrop-blur-sm">
          {discovered.length === 0 ? (
            <span className="text-muted-foreground font-body text-sm italic">
              Move your wand to discover letters...
            </span>
          ) : (
            discovered.map((char, i) => (
              <motion.span
                key={`${char}-${i}`}
                className="font-display text-2xl sm:text-3xl font-bold"
                style={{
                  color: "hsl(42 80% 65%)",
                  textShadow: "0 0 10px hsl(42 70% 50%)",
                }}
                initial={{ y: -40, opacity: 0, scale: 1.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {char}
              </motion.span>
            ))
          )}
        </div>
      </div>
    </>
  );
}

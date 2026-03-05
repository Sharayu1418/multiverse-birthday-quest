import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LetterData {
  char: string;
  x: number; // percent
  y: number; // percent
  found: boolean;
  label: string; // environmental context
}

interface HiddenLettersProps {
  wandEnabled: boolean;
  wandX: number;
  wandY: number;
  onLetterFound: (letter: string) => void;
  onAllFound: () => void;
}

// Letters spread far apart across the forest with environmental context
const LETTER_POSITIONS: Omit<LetterData, "found">[] = [
  { char: "L", x: 15, y: 65, label: "tree trunk" },
  { char: "U", x: 72, y: 28, label: "floating rune" },
  { char: "M", x: 38, y: 78, label: "rock" },
  { char: "O", x: 82, y: 60, label: "mushrooms" },
  { char: "S", x: 50, y: 45, label: "forest path" },
];

const DETECTION_RADIUS = 55;

export default function HiddenLetters({
  wandEnabled,
  wandX,
  wandY,
  onLetterFound,
  onAllFound,
}: HiddenLettersProps) {
  const [letters, setLetters] = useState<LetterData[]>(
    LETTER_POSITIONS.map((l) => ({ ...l, found: false }))
  );
  const [burst, setBurst] = useState<{ x: number; y: number; id: number } | null>(null);
  const burstId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const allFoundTriggered = useRef(false);
  const foundCount = useRef(0);

  useEffect(() => {
    if (!wandEnabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

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
          foundCount.current += 1;
          // Defer callback to avoid setState-in-render
          setTimeout(() => onLetterFound(letter.char), 0);
          return { ...letter, found: true };
        }
        return letter;
      });
      return changed ? next : prev;
    });
  }, [wandX, wandY, wandEnabled, onLetterFound]);

  // Check completion separately
  useEffect(() => {
    const allFound = letters.every((l) => l.found);
    if (allFound && !allFoundTriggered.current && letters.length === 5) {
      allFoundTriggered.current = true;
      setTimeout(onAllFound, 1200);
    }
  }, [letters, onAllFound]);

  // Calculate proximity glow for unfound letters
  const getProximityOpacity = (letter: LetterData) => {
    if (!containerRef.current || letter.found) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const lx = rect.left + (letter.x / 100) * rect.width;
    const ly = rect.top + (letter.y / 100) * rect.height;
    const dist = Math.hypot(wandX - lx, wandY - ly);
    // Visible within wand light radius (~120px), faint glow up to 200px
    if (dist < 80) return 1;
    if (dist < 150) return 0.6;
    if (dist < 250) return 0.15;
    return 0;
  };

  return (
    <>
      <div ref={containerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 8 }}>
        {letters.map((letter) => {
          if (letter.found) return null;
          const opacity = getProximityOpacity(letter);
          if (opacity === 0) return null;

          return (
            <div
              key={letter.char}
              className="absolute"
              style={{
                left: `${letter.x}%`,
                top: `${letter.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Environmental context glow */}
              <div
                className="absolute -inset-4 rounded-full"
                style={{
                  background: "radial-gradient(circle, hsl(42 80% 50% / 0.15) 0%, transparent 70%)",
                  opacity: opacity * 0.5,
                }}
              />
              {/* The letter itself */}
              <span
                className="font-display text-3xl sm:text-4xl font-bold select-none block text-center"
                style={{
                  color: `hsl(42 80% 70% / ${opacity})`,
                  textShadow: opacity > 0.5
                    ? "0 0 15px hsl(42 80% 60%), 0 0 30px hsl(42 70% 50%), 0 0 50px hsl(42 60% 40%)"
                    : "0 0 8px hsl(42 70% 50% / 0.3)",
                  transition: "opacity 0.3s, text-shadow 0.3s",
                }}
              >
                {letter.char}
              </span>
              {/* Environmental label */}
              {opacity > 0.5 && (
                <span
                  className="block text-center text-xs font-body mt-1 whitespace-nowrap"
                  style={{
                    color: `hsl(42 50% 55% / ${opacity * 0.6})`,
                  }}
                >
                  {letter.label === "tree trunk" && "⸻ carved into bark ⸻"}
                  {letter.label === "floating rune" && "✦ floating rune ✦"}
                  {letter.label === "rock" && "⸻ etched in stone ⸻"}
                  {letter.label === "mushrooms" && "🍄 glowing mushrooms 🍄"}
                  {letter.label === "forest path" && "⸻ scratched in dirt ⸻"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Burst particles on discovery */}
      <AnimatePresence>
        {burst && (
          <div key={burst.id} className="fixed pointer-events-none" style={{ zIndex: 12 }}>
            {Array.from({ length: 12 }).map((_, i) => (
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
                  x: (Math.random() - 0.5) * 100,
                  y: (Math.random() - 0.5) * 100,
                  scale: [0, 1.5, 0],
                  opacity: [1, 0.8, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

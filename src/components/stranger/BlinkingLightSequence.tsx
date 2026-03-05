import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  sequence: number[];
  onSequenceComplete: () => void;
  onCurrentLetter: (letter: string | null) => void;
}

export default function BlinkingLightSequence({ sequence, onSequenceComplete, onCurrentLetter }: Props) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [displayedNumbers, setDisplayedNumbers] = useState<number[]>([]);
  const [started, setStarted] = useState(false);

  const numberToLetter = useCallback((n: number) => {
    return String.fromCharCode(64 + n); // 1=A, 2=B...
  }, []);

  // Start sequence after a delay
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Blink through the sequence
  useEffect(() => {
    if (!started) return;

    const blinkNext = (idx: number) => {
      if (idx >= sequence.length) {
        onCurrentLetter(null);
        onSequenceComplete();
        return;
      }

      setCurrentIndex(idx);
      const letter = numberToLetter(sequence[idx]);
      onCurrentLetter(letter);
      setDisplayedNumbers((prev) => [...prev, sequence[idx]]);

      // Hold the light for 1.2s, then pause 0.6s
      setTimeout(() => {
        onCurrentLetter(null);
        setTimeout(() => blinkNext(idx + 1), 600);
      }, 1200);
    };

    blinkNext(0);
  }, [started, sequence, onCurrentLetter, onSequenceComplete, numberToLetter]);

  return (
    <div className="text-center space-y-4">
      <motion.p
        className="text-sm font-mono"
        style={{ color: "hsl(0 70% 60%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.5 }}
      >
        A message is trapped in the Upside Down.
      </motion.p>
      <motion.p
        className="text-xs font-mono"
        style={{ color: "hsl(0 50% 50%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1 }}
      >
        Decode the lights.
      </motion.p>

      {/* Number display */}
      <div className="flex items-center justify-center gap-3 min-h-[3rem]">
        <AnimatePresence>
          {displayedNumbers.map((num, i) => (
            <motion.span
              key={`${num}-${i}`}
              className="text-2xl sm:text-3xl font-mono font-bold"
              style={{
                color: i === currentIndex ? "hsl(0 85% 60%)" : "hsl(0 40% 45%)",
                textShadow: i === currentIndex ? "0 0 15px hsl(0 85% 50%)" : "none",
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {num}
              {i < displayedNumbers.length - 1 && (
                <span className="mx-1" style={{ color: "hsl(0 30% 35%)" }}>-</span>
              )}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

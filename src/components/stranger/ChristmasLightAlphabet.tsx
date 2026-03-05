import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

const ROWS = [
  "ABCDEFG",
  "HIJKLMN",
  "OPQRSTU",
  "VWXYZ",
];

const LIGHT_COLORS = [
  "hsl(0 85% 55%)",
  "hsl(45 90% 55%)",
  "hsl(120 70% 45%)",
  "hsl(210 80% 55%)",
  "hsl(280 70% 55%)",
  "hsl(30 90% 55%)",
];

interface Props {
  highlightedLetters: string[];
  blinkingLetter: string | null;
  flipped: boolean;
}

export default function ChristmasLightAlphabet({ highlightedLetters, blinkingLetter, flipped }: Props) {
  const [flickerMap, setFlickerMap] = useState<Record<string, number>>({});

  // Random flicker for all lights
  useEffect(() => {
    const interval = setInterval(() => {
      const map: Record<string, number> = {};
      ROWS.flat().join("").split("").forEach((char) => {
        map[char] = 0.4 + Math.random() * 0.6;
      });
      setFlickerMap(map);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const colorMap = useMemo(() => {
    const m: Record<string, string> = {};
    let i = 0;
    ROWS.forEach((row) => {
      row.split("").forEach((char) => {
        m[char] = LIGHT_COLORS[i % LIGHT_COLORS.length];
        i++;
      });
    });
    return m;
  }, []);

  return (
    <div
      className="relative mx-auto max-w-lg px-4"
      style={{ transform: flipped ? "rotate(180deg)" : "none" }}
    >
      {/* Wire across the top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-green-900/60" />

      <div className="space-y-1 sm:space-y-2">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1 sm:gap-2">
            {row.split("").map((char) => {
              const isHighlighted = highlightedLetters.includes(char);
              const isBlinking = blinkingLetter === char;
              const color = colorMap[char];
              const flicker = flickerMap[char] ?? 0.5;
              const brightness = isBlinking ? 1 : isHighlighted ? 0.9 : flicker * 0.3;

              return (
                <motion.div
                  key={char}
                  className="flex flex-col items-center"
                  animate={isBlinking ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3, repeat: isBlinking ? Infinity : 0, repeatType: "reverse" }}
                >
                  {/* Bulb */}
                  <div
                    className="w-3 h-4 sm:w-4 sm:h-5 rounded-full relative"
                    style={{
                      background: color,
                      opacity: brightness,
                      boxShadow: isBlinking
                        ? `0 0 15px 5px ${color}, 0 0 30px 10px ${color}`
                        : isHighlighted
                        ? `0 0 10px 3px ${color}`
                        : `0 0 ${flicker * 4}px 1px ${color}`,
                      transition: "box-shadow 0.15s, opacity 0.15s",
                    }}
                  />
                  {/* Wire */}
                  <div className="w-px h-1 sm:h-2 bg-green-900/50" />
                  {/* Letter */}
                  <span
                    className="text-xs sm:text-sm font-mono font-bold select-none"
                    style={{
                      color: isBlinking ? color : isHighlighted ? color : "hsl(0 0% 40%)",
                      textShadow: isBlinking ? `0 0 8px ${color}` : "none",
                    }}
                  >
                    {char}
                  </span>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

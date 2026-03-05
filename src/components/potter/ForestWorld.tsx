import { useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import forestBg from "@/assets/potter/forbidden_forest_bg.jpg";

interface LetterPlacement {
  char: string;
  worldX: number; // px position in the world
  worldY: number; // percent of viewport height
  label: string;
  icon: string;
}

interface ForestWorldProps {
  scrollX: number;
  worldWidth: number;
  illuminated: boolean;
  wandX: number;
  wandY: number;
  discoveredLetters: string[];
  onLetterFound: (letter: string) => void;
  onAllFound: () => void;
}

// Letters spread across the 5000px wide world
const LETTER_PLACEMENTS: LetterPlacement[] = [
  { char: "L", worldX: 600, worldY: 55, label: "carved into bark", icon: "🌳" },
  { char: "U", worldX: 1500, worldY: 35, label: "floating rune", icon: "✦" },
  { char: "M", worldX: 2400, worldY: 70, label: "etched in stone", icon: "🪨" },
  { char: "O", worldX: 3300, worldY: 50, label: "glowing mushrooms", icon: "🍄" },
  { char: "S", worldX: 4200, worldY: 65, label: "scratched in dirt", icon: "〰" },
];

const DETECTION_RADIUS = 70;

// Generate stable random values for environmental elements
function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export default function ForestWorld({
  scrollX,
  worldWidth,
  illuminated,
  wandX,
  wandY,
  discoveredLetters,
  onLetterFound,
  onAllFound,
}: ForestWorldProps) {
  const allFoundTriggered = useRef(false);

  // Generate trees, fog patches, fireflies with stable positions
  const trees = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      x: i * (worldWidth / 40) + seededRandom(i * 3) * 120 - 60,
      height: 300 + seededRandom(i * 7) * 400,
      width: 80 + seededRandom(i * 11) * 120,
      layer: Math.floor(seededRandom(i * 13) * 3), // 0=far, 1=mid, 2=near
      variant: Math.floor(seededRandom(i * 17) * 3),
    })), [worldWidth]
  );

  const fireflies = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      x: seededRandom(i * 31) * worldWidth,
      y: 15 + seededRandom(i * 37) * 70,
      size: 2 + seededRandom(i * 41) * 5,
      speed: 4 + seededRandom(i * 43) * 8,
      delay: seededRandom(i * 47) * 6,
    })), [worldWidth]
  );

  const fogPatches = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      x: i * (worldWidth / 12) + seededRandom(i * 53) * 200,
      y: 40 + seededRandom(i * 59) * 40,
      width: 300 + seededRandom(i * 61) * 400,
      speed: 15 + seededRandom(i * 67) * 20,
    })), [worldWidth]
  );

  // Check letter discovery
  useEffect(() => {
    LETTER_PLACEMENTS.forEach((letter) => {
      if (discoveredLetters.includes(letter.char)) return;
      // Convert world position to screen position
      const screenX = letter.worldX - scrollX;
      const screenY = (letter.worldY / 100) * window.innerHeight;
      const dist = Math.hypot(wandX - screenX, wandY - screenY);
      if (dist < DETECTION_RADIUS) {
        onLetterFound(letter.char);
      }
    });
  }, [wandX, wandY, scrollX, discoveredLetters, onLetterFound]);

  // Check all found
  useEffect(() => {
    if (discoveredLetters.length === 5 && !allFoundTriggered.current) {
      allFoundTriggered.current = true;
      setTimeout(onAllFound, 1200);
    }
  }, [discoveredLetters.length, onAllFound]);

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Sky / base color */}
      <div
        className="absolute inset-0 transition-all duration-[3000ms]"
        style={{
          background: illuminated
            ? "linear-gradient(180deg, hsl(220 30% 20%) 0%, hsl(200 25% 15%) 50%, hsl(150 20% 12%) 100%)"
            : "linear-gradient(180deg, hsl(220 40% 4%) 0%, hsl(210 35% 6%) 50%, hsl(220 30% 3%) 100%)",
        }}
      />

      {/* Scrollable world container */}
      <div
        className="absolute top-0 h-full"
        style={{
          width: worldWidth,
          transform: `translateX(${-scrollX}px)`,
          transition: "transform 0.05s linear",
        }}
      >
        {/* Tiled forest background */}
        {Array.from({ length: Math.ceil(worldWidth / viewportW) + 1 }, (_, i) => (
          <div
            key={`bg-${i}`}
            className="absolute top-0 h-full bg-cover bg-center transition-all duration-[3000ms]"
            style={{
              left: i * viewportW,
              width: viewportW,
              backgroundImage: `url(${forestBg})`,
              filter: illuminated ? "brightness(1.3) saturate(1.2)" : "brightness(0.2) saturate(0.6)",
              transform: i % 2 === 1 ? "scaleX(-1)" : "none",
            }}
          />
        ))}

        {/* Ground / forest path */}
        <div
          className="absolute bottom-0 w-full transition-all duration-[3000ms]"
          style={{
            height: "25%",
            background: illuminated
              ? "linear-gradient(to top, hsl(30 25% 18%) 0%, hsl(30 20% 12% / 0.6) 60%, transparent 100%)"
              : "linear-gradient(to top, hsl(220 15% 5%) 0%, hsl(220 10% 4% / 0.6) 60%, transparent 100%)",
          }}
        />

        {/* Center path */}
        <div
          className="absolute bottom-0 left-0 w-full transition-opacity duration-[3000ms]"
          style={{
            height: "20%",
            opacity: illuminated ? 0.3 : 0.08,
          }}
        >
          <div className="h-full w-full" style={{
            background: illuminated
              ? "linear-gradient(to top, hsl(35 30% 25% / 0.3) 0%, transparent 100%)"
              : "linear-gradient(to top, hsl(220 10% 10% / 0.2) 0%, transparent 100%)",
          }} />
        </div>

        {/* Tree silhouettes */}
        {trees.map((tree, i) => {
          const parallaxFactor = [0.85, 0.95, 1.05][tree.layer];
          const opacity = illuminated ? [0.15, 0.2, 0.35][tree.layer] : [0.2, 0.35, 0.55][tree.layer];
          const color = illuminated
            ? `hsl(120 ${10 + tree.layer * 5}% ${8 + tree.layer * 3}%)`
            : `hsl(220 ${10 + tree.layer * 3}% ${3 + tree.layer * 2}%)`;
          
          return (
            <div
              key={`tree-${i}`}
              className="absolute bottom-0"
              style={{
                left: tree.x * parallaxFactor,
                opacity,
                zIndex: tree.layer,
                filter: tree.layer === 0 ? "blur(2px)" : tree.layer === 1 ? "blur(1px)" : "none",
              }}
            >
              <svg width={tree.width} height={tree.height} viewBox={`0 0 ${tree.width} ${tree.height}`}>
                {tree.variant === 0 && (
                  // Twisted tree
                  <>
                    <path d={`M${tree.width * 0.45},${tree.height} L${tree.width * 0.42},${tree.height * 0.4} Q${tree.width * 0.3},${tree.height * 0.3} ${tree.width * 0.2},${tree.height * 0.15} Q${tree.width * 0.4},${tree.height * 0.25} ${tree.width * 0.45},${tree.height * 0.12} Q${tree.width * 0.5},${tree.height * 0.25} ${tree.width * 0.7},${tree.height * 0.18} Q${tree.width * 0.55},${tree.height * 0.3} ${tree.width * 0.5},${tree.height * 0.4} L${tree.width * 0.55},${tree.height}`} fill={color} />
                    <path d={`M${tree.width * 0.3},${tree.height * 0.5} Q${tree.width * 0.1},${tree.height * 0.4} ${tree.width * 0.05},${tree.height * 0.3}`} stroke={color} strokeWidth="4" fill="none" />
                    <path d={`M${tree.width * 0.6},${tree.height * 0.45} Q${tree.width * 0.8},${tree.height * 0.35} ${tree.width * 0.9},${tree.height * 0.25}`} stroke={color} strokeWidth="3" fill="none" />
                  </>
                )}
                {tree.variant === 1 && (
                  // Tall pine-like
                  <path d={`M${tree.width * 0.5},0 L${tree.width * 0.15},${tree.height * 0.6} L${tree.width * 0.35},${tree.height * 0.55} L${tree.width * 0.1},${tree.height * 0.85} L${tree.width * 0.4},${tree.height} L${tree.width * 0.6},${tree.height} L${tree.width * 0.9},${tree.height * 0.85} L${tree.width * 0.65},${tree.height * 0.55} L${tree.width * 0.85},${tree.height * 0.6} Z`} fill={color} />
                )}
                {tree.variant === 2 && (
                  // Dead/bare tree
                  <>
                    <path d={`M${tree.width * 0.43},${tree.height} L${tree.width * 0.4},${tree.height * 0.25} L${tree.width * 0.42},${tree.height * 0.1} M${tree.width * 0.4},${tree.height * 0.25} L${tree.width * 0.5},${tree.height * 0.35} L${tree.width * 0.57},${tree.height}`} fill={color} />
                    <path d={`M${tree.width * 0.4},${tree.height * 0.35} Q${tree.width * 0.15},${tree.height * 0.2} ${tree.width * 0.05},${tree.height * 0.15}`} stroke={color} strokeWidth="3" fill="none" />
                    <path d={`M${tree.width * 0.48},${tree.height * 0.28} Q${tree.width * 0.75},${tree.height * 0.15} ${tree.width * 0.85},${tree.height * 0.08}`} stroke={color} strokeWidth="3" fill="none" />
                  </>
                )}
              </svg>
            </div>
          );
        })}

        {/* Fog patches */}
        {fogPatches.map((fog, i) => (
          <motion.div
            key={`fog-${i}`}
            className="absolute transition-opacity duration-[3000ms]"
            style={{
              left: fog.x,
              top: `${fog.y}%`,
              width: fog.width,
              height: 80,
              opacity: illuminated ? 0.1 : 0.25,
              background: `radial-gradient(ellipse, hsl(200 30% ${illuminated ? 30 : 15}% / 0.5) 0%, transparent 70%)`,
              filter: "blur(12px)",
            }}
            animate={{ x: [-30, 30, -30] }}
            transition={{ duration: fog.speed, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Fireflies */}
        {fireflies.map((ff, i) => (
          <motion.div
            key={`ff-${i}`}
            className="absolute rounded-full"
            style={{
              left: ff.x,
              top: `${ff.y}%`,
              width: ff.size,
              height: ff.size,
              background: illuminated ? "hsl(55 100% 75%)" : "hsl(80 90% 55%)",
              boxShadow: illuminated
                ? `0 0 ${ff.size * 3}px hsl(55 100% 75%)`
                : `0 0 ${ff.size * 3}px hsl(80 90% 55%)`,
            }}
            animate={{
              x: [(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 50],
              y: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 30],
              opacity: [0.2, 0.9, 0.3, 1, 0.2],
              scale: [0.8, 1.3, 0.9, 1.1, 0.8],
            }}
            transition={{ duration: ff.speed, repeat: Infinity, delay: ff.delay, ease: "easeInOut" }}
          />
        ))}

        {/* HIDDEN LETTERS in the world */}
        {LETTER_PLACEMENTS.map((letter) => {
          const found = discoveredLetters.includes(letter.char);
          if (found) return null;

          // Check proximity to wand
          const screenX = letter.worldX - scrollX;
          const screenY = (letter.worldY / 100) * viewportH;
          const dist = Math.hypot(wandX - screenX, wandY - screenY);
          const visible = dist < 140;
          const bright = dist < 80;

          if (!visible) return null;

          return (
            <div
              key={letter.char}
              className="absolute"
              style={{
                left: letter.worldX,
                top: `${letter.worldY}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 6,
              }}
            >
              {/* Ambient glow */}
              <div
                className="absolute -inset-8 rounded-full"
                style={{
                  background: "radial-gradient(circle, hsl(42 80% 50% / 0.2) 0%, transparent 70%)",
                  opacity: bright ? 0.8 : 0.3,
                  transition: "opacity 0.3s",
                }}
              />
              {/* Letter */}
              <span
                className="font-display text-4xl sm:text-5xl font-bold select-none block text-center"
                style={{
                  color: `hsl(42 80% 70% / ${bright ? 1 : 0.4})`,
                  textShadow: bright
                    ? "0 0 20px hsl(42 80% 60%), 0 0 40px hsl(42 70% 50%), 0 0 60px hsl(42 60% 40%)"
                    : "0 0 8px hsl(42 70% 50% / 0.3)",
                  transition: "all 0.3s",
                }}
              >
                {letter.char}
              </span>
              {/* Label */}
              {bright && (
                <span
                  className="block text-center text-xs font-body mt-1 whitespace-nowrap"
                  style={{ color: "hsl(42 50% 55% / 0.6)" }}
                >
                  {letter.icon} {letter.label} {letter.icon}
                </span>
              )}
            </div>
          );
        })}

        {/* Discovery burst particles */}
        {LETTER_PLACEMENTS.map((letter) => {
          const justFound = discoveredLetters.includes(letter.char);
          if (!justFound) return null;

          return (
            <AnimatePresence key={`burst-${letter.char}`}>
              <div className="absolute pointer-events-none" style={{ left: letter.worldX, top: `${letter.worldY}%`, zIndex: 12 }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: 4,
                      height: 4,
                      background: "hsl(42 90% 75%)",
                      boxShadow: "0 0 6px hsl(42 90% 70%)",
                    }}
                    initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                    animate={{
                      x: (Math.random() - 0.5) * 120,
                      y: (Math.random() - 0.5) * 120,
                      scale: [0, 1.5, 0],
                      opacity: [1, 0.7, 0],
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                ))}
              </div>
            </AnimatePresence>
          );
        })}

        {/* Dementors */}
        {[0, 1].map((i) => (
          <motion.div
            key={`dementor-${i}`}
            className="absolute transition-opacity duration-[3000ms]"
            style={{ top: `${18 + i * 15}%`, opacity: illuminated ? 0 : 0.1, zIndex: 1 }}
            animate={{
              x: [i === 0 ? worldWidth * 0.8 : 200, i === 0 ? 200 : worldWidth * 0.8],
              y: [0, -25, 12, -18, 0],
            }}
            transition={{ duration: 30 + i * 12, repeat: Infinity, ease: "linear", delay: i * 15 }}
          >
            <svg width="50" height="80" viewBox="0 0 50 80">
              <ellipse cx="25" cy="18" rx="10" ry="15" fill="hsl(220 20% 6%)" />
              <path d="M15,30 Q25,75 35,30" fill="hsl(220 20% 6%)" opacity="0.8" />
              <path d="M10,25 Q5,35 12,40" fill="hsl(220 20% 6%)" opacity="0.5" />
              <path d="M40,25 Q45,35 38,40" fill="hsl(220 20% 6%)" opacity="0.5" />
            </svg>
          </motion.div>
        ))}

        {/* Owls */}
        {[0, 1].map((i) => (
          <motion.div
            key={`owl-${i}`}
            className="absolute"
            style={{ top: `${10 + i * 12}%`, opacity: illuminated ? 0.4 : 0.12, zIndex: 1 }}
            animate={{
              x: [0, worldWidth],
              y: [0, -20, 15, -25, 0],
            }}
            transition={{ duration: 20 + i * 8, repeat: Infinity, delay: i * 10, ease: "linear" }}
          >
            <svg width="24" height="14" viewBox="0 0 24 14">
              <motion.path
                d="M0,7 Q6,0 12,7 Q18,0 24,7"
                stroke="hsl(220 10% 25%)"
                strokeWidth="2"
                fill="none"
                animate={{ d: ["M0,7 Q6,0 12,7 Q18,0 24,7", "M0,7 Q6,12 12,7 Q18,12 24,7", "M0,7 Q6,0 12,7 Q18,0 24,7"] }}
                transition={{ duration: 0.4, repeat: Infinity }}
              />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Vignette overlay (fixed to viewport) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-[3000ms]"
        style={{
          background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.95) 100%)",
          opacity: illuminated ? 0.3 : 1,
          zIndex: 3,
        }}
      />

      {/* Golden illumination overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-[3000ms]"
        style={{
          background: "radial-gradient(ellipse at center, hsl(42 60% 40% / 0.2) 0%, transparent 60%)",
          opacity: illuminated ? 1 : 0,
          zIndex: 3,
        }}
      />
    </div>
  );
}

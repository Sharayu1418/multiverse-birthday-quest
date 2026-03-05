import { motion } from "framer-motion";

interface ClockFaceProps {
  cracked?: boolean;
  stoppedAt1111?: boolean;
  spinning?: boolean;
  size?: "large" | "small";
}

const NUMERALS = [
  { label: "XII", angle: -90 },
  { label: "I", angle: -60 },
  { label: "II", angle: -30 },
  { label: "III", angle: 0 },
  { label: "IV", angle: 30 },
  { label: "V", angle: 60 },
  { label: "VI", angle: 90 },
  { label: "VII", angle: 120 },
  { label: "VIII", angle: 150 },
  { label: "IX", angle: 180 },
  { label: "X", angle: 210 },
  { label: "XI", angle: 240 },
];

const CRACKS = Array.from({ length: 10 }).map((_, i) => ({
  angle: (i / 10) * 360 + Math.random() * 20,
  len: 25 + Math.random() * 55,
  width: 1 + Math.random() * 2.5,
}));

export default function ClockFace({ cracked, stoppedAt1111, spinning, size = "large" }: ClockFaceProps) {
  const isLarge = size === "large";
  const outerClass = isLarge
    ? "w-32 h-32 sm:w-44 sm:h-44"
    : "w-12 h-12";
  const r = isLarge ? 42 : 0;

  // 11:11 → hour hand at ~335°, minute hand at ~66°
  const hourAngle = stoppedAt1111 ? 335 : undefined;
  const minuteAngle = stoppedAt1111 ? 66 : undefined;

  return (
    <motion.div
      className={`relative ${outerClass} rounded-full flex items-center justify-center`}
      style={{
        background: "radial-gradient(circle, hsl(40 20% 82%), hsl(30 15% 65%))",
        border: "3px solid hsl(30 28% 22%)",
        boxShadow: cracked
          ? "0 0 50px hsl(0 70% 30% / 0.7), 0 0 100px hsl(0 60% 20% / 0.3)"
          : "0 0 25px hsl(0 40% 15% / 0.5)",
      }}
      animate={cracked && !stoppedAt1111 ? { scale: [1, 1.08, 0.94, 1], rotate: [0, -4, 4, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Roman numerals (large only) */}
      {isLarge &&
        NUMERALS.map((n) => {
          const rad = (n.angle * Math.PI) / 180;
          return (
            <span
              key={n.label}
              className="absolute font-serif text-[7px] sm:text-[9px] font-bold select-none"
              style={{
                color: "hsl(0 18% 22%)",
                left: `calc(50% + ${Math.cos(rad) * r}px - 7px)`,
                top: `calc(50% + ${Math.sin(rad) * r}px - 6px)`,
              }}
            >
              {n.label}
            </span>
          );
        })}

      {/* Crack lines */}
      {cracked &&
        CRACKS.map((c, i) => (
          <motion.div
            key={i}
            className="absolute origin-center pointer-events-none"
            style={{
              width: c.width,
              height: c.len,
              background: "hsl(0 55% 28%)",
              transform: `rotate(${c.angle}deg)`,
              top: "50%",
              left: "50%",
              transformOrigin: "0 0",
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          />
        ))}

      {/* Hour hand */}
      <motion.div
        className={`absolute origin-bottom rounded-full ${isLarge ? "w-1 h-7 sm:h-9" : "w-0.5 h-3"}`}
        style={{
          background: "hsl(0 22% 15%)",
          bottom: "50%",
          left: `calc(50% - ${isLarge ? 2 : 1}px)`,
          transform: hourAngle != null ? `rotate(${hourAngle}deg)` : undefined,
        }}
        animate={
          spinning
            ? { rotate: [0, 3600] }
            : hourAngle != null
            ? { rotate: hourAngle }
            : { rotate: [0, 360] }
        }
        transition={
          spinning
            ? { duration: 2, ease: "easeInOut" }
            : hourAngle != null
            ? { duration: 0.5 }
            : { duration: 12, repeat: Infinity, ease: "linear" }
        }
      />

      {/* Minute hand */}
      {isLarge && (
        <motion.div
          className="absolute w-0.5 h-10 sm:h-12 origin-bottom rounded-full"
          style={{
            background: "hsl(0 18% 18%)",
            bottom: "50%",
            left: "calc(50% - 1px)",
            transform: minuteAngle != null ? `rotate(${minuteAngle}deg)` : undefined,
          }}
          animate={
            spinning
              ? { rotate: [0, 7200] }
              : minuteAngle != null
              ? { rotate: minuteAngle }
              : { rotate: [0, 360] }
          }
          transition={
            spinning
              ? { duration: 2, ease: "easeInOut" }
              : minuteAngle != null
              ? { duration: 0.5 }
              : { duration: 4, repeat: Infinity, ease: "linear" }
          }
        />
      )}

      {/* Center dot */}
      <div
        className={`absolute rounded-full ${isLarge ? "w-2.5 h-2.5" : "w-1.5 h-1.5"}`}
        style={{ background: "hsl(0 20% 15%)" }}
      />
    </motion.div>
  );
}

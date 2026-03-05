import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface PortalRiftProps {
  collapse?: number; // 0 = full, 1 = gone
  active?: boolean;
}

export default function PortalRift({ collapse = 0, active = true }: PortalRiftProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 80,
        size: 1 + Math.random() * 3,
        dur: 2 + Math.random() * 4,
        delay: Math.random() * 3,
      })),
    []
  );

  const scale = 1 - collapse;

  return (
    <motion.div
      className="absolute top-[6%] left-1/2 -translate-x-1/2 z-[5]"
      style={{ width: 300 * scale, height: 140 * scale }}
      animate={active && scale > 0 ? { opacity: [0.5, 0.9, 0.5] } : { opacity: 0 }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      {/* Core glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(ellipse, hsl(0 80% 28% / ${0.5 * scale}), hsl(0 60% 15% / ${0.2 * scale}) 50%, transparent 75%)`,
          filter: `blur(${22 * scale}px)`,
        }}
      />
      {/* Inner bright core */}
      <div
        className="absolute top-1/3 left-1/3 w-1/3 h-1/3 rounded-full"
        style={{
          background: `radial-gradient(circle, hsl(0 90% 40% / ${0.4 * scale}), transparent 70%)`,
          filter: `blur(${10 * scale}px)`,
        }}
      />
      {/* Particles */}
      <AnimatePresence>
        {scale > 0.1 &&
          particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: "50%",
                top: "50%",
                background: "hsl(0 70% 50% / 0.6)",
              }}
              animate={{
                x: [0, p.x],
                y: [0, p.y],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: p.dur,
                repeat: Infinity,
                delay: p.delay,
              }}
            />
          ))}
      </AnimatePresence>
    </motion.div>
  );
}

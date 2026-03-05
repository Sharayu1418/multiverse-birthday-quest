import { motion } from "framer-motion";
import forestBg from "@/assets/potter/forbidden_forest_bg.jpg";

export default function ForbiddenForestBackground({ illuminated }: { illuminated: boolean }) {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base forest image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[3000ms]"
        style={{
          backgroundImage: `url(${forestBg})`,
          filter: illuminated ? "brightness(1.3) saturate(1.2)" : "brightness(0.25) saturate(0.7)",
        }}
      />

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-[3000ms]"
        style={{
          background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.95) 100%)",
          opacity: illuminated ? 0.3 : 1,
        }}
      />

      {/* Blue atmospheric overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-[3000ms]"
        style={{
          background: "linear-gradient(180deg, hsl(210 60% 8% / 0.6) 0%, hsl(200 50% 12% / 0.4) 50%, hsl(220 40% 5% / 0.8) 100%)",
          opacity: illuminated ? 0.2 : 0.7,
        }}
      />

      {/* Dementors */}
      {[0, 1].map((i) => (
        <motion.div
          key={`dementor-${i}`}
          className="absolute transition-opacity duration-[3000ms]"
          style={{
            top: `${15 + i * 12}%`,
            opacity: illuminated ? 0 : 0.12,
          }}
          animate={{
            x: [i === 0 ? "90vw" : "-10vw", i === 0 ? "-10vw" : "90vw"],
            y: [0, -20, 10, -15, 0],
          }}
          transition={{ duration: 25 + i * 10, repeat: Infinity, ease: "linear", delay: i * 12 }}
        >
          <svg width="50" height="80" viewBox="0 0 50 80">
            <ellipse cx="25" cy="18" rx="10" ry="15" fill="hsl(220 20% 6%)" />
            <path d="M15,30 Q25,75 35,30" fill="hsl(220 20% 6%)" opacity="0.8" />
            <path d="M10,25 Q5,35 12,40" fill="hsl(220 20% 6%)" opacity="0.5" />
            <path d="M40,25 Q45,35 38,40" fill="hsl(220 20% 6%)" opacity="0.5" />
          </svg>
        </motion.div>
      ))}

      {/* Owls flying */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`owl-${i}`}
          className="absolute"
          style={{ top: `${8 + i * 12}%`, opacity: illuminated ? 0.5 : 0.15 }}
          animate={{
            x: ["-5vw", "105vw"],
            y: [0, -25, 15, -20, 0],
          }}
          transition={{ duration: 14 + i * 5, repeat: Infinity, delay: i * 9 + 4, ease: "linear" }}
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

      {/* Fireflies - yellow-green like reference */}
      {Array.from({ length: 25 }).map((_, i) => {
        const size = 3 + Math.random() * 5;
        return (
          <motion.div
            key={`firefly-${i}`}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${5 + Math.random() * 90}%`,
              top: `${15 + Math.random() * 70}%`,
              background: illuminated
                ? "hsl(55 100% 75%)"
                : "hsl(80 90% 55%)",
              boxShadow: illuminated
                ? `0 0 ${size * 3}px hsl(55 100% 75%), 0 0 ${size * 6}px hsl(55 90% 60%)`
                : `0 0 ${size * 3}px hsl(80 90% 55%), 0 0 ${size * 6}px hsl(80 80% 40%)`,
            }}
            animate={{
              x: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 40],
              y: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30],
              opacity: [0.3, 0.9, 0.4, 1, 0.3],
              scale: [0.8, 1.2, 0.9, 1.1, 0.8],
            }}
            transition={{
              duration: 5 + Math.random() * 7,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Rolling fog layers */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={`fog-${i}`}
          className="absolute w-[200%] transition-opacity duration-[3000ms]"
          style={{
            height: `${12 + i * 6}%`,
            bottom: `${i * 8}%`,
            opacity: illuminated ? 0.08 : 0.2 + i * 0.05,
            background: `linear-gradient(90deg, transparent 0%, hsl(200 40% ${illuminated ? 35 : 18}% / 0.4) 20%, hsl(200 35% ${illuminated ? 30 : 15}% / 0.6) 50%, hsl(200 40% ${illuminated ? 35 : 18}% / 0.4) 80%, transparent 100%)`,
            filter: "blur(8px)",
          }}
          animate={{ x: [i % 2 === 0 ? "-50%" : "0%", i % 2 === 0 ? "0%" : "-50%"] }}
          transition={{ duration: 18 + i * 8, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Magical dust particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`dust-${i}`}
          className="absolute rounded-full"
          style={{
            width: 1.5 + Math.random() * 2,
            height: 1.5 + Math.random() * 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: "hsl(42 80% 70%)",
          }}
          animate={{
            y: [0, -80 - Math.random() * 120],
            x: [(Math.random() - 0.5) * 40],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Illumination golden overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-[3000ms]"
        style={{
          background: "radial-gradient(ellipse at center, hsl(42 60% 40% / 0.15) 0%, transparent 60%)",
          opacity: illuminated ? 1 : 0,
        }}
      />
    </div>
  );
}

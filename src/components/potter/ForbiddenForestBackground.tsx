import { motion } from "framer-motion";
import forestBg from "@/assets/potter/forbidden_forest_bg.jpg";

export default function ForbiddenForestBackground({ illuminated }: { illuminated: boolean }) {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Slow camera bob to simulate walking */}
      <motion.div
        className="absolute inset-[-40px]"
        animate={{
          y: [0, -8, 2, -5, 0],
          x: [0, 3, -2, 4, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Base forest image - slow drift forward */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[3000ms]"
          style={{
            backgroundImage: `url(${forestBg})`,
            filter: illuminated ? "brightness(1.3) saturate(1.2)" : "brightness(0.25) saturate(0.7)",
          }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

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

      {/* PARALLAX TREE SILHOUETTES - foreground trees drifting past slowly */}
      {/* Left side trees */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`tree-left-${i}`}
          className="absolute transition-opacity duration-[3000ms]"
          style={{
            left: `-${8 + i * 3}%`,
            bottom: 0,
            opacity: illuminated ? 0.08 : 0.25 - i * 0.05,
            zIndex: 3 - i,
          }}
          animate={{
            x: [0, 15 + i * 5, 0],
            y: [0, -3, 0],
          }}
          transition={{ duration: 8 + i * 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="200" height="600" viewBox="0 0 200 600" style={{ filter: "blur(1px)" }}>
            <path
              d={`M100,600 L100,200 Q80,180 60,120 Q90,150 100,100 Q110,150 140,120 Q120,180 100,200`}
              fill={illuminated ? "hsl(120 15% 12%)" : "hsl(220 15% 5%)"}
            />
            <path d="M70,250 Q40,220 30,180 Q60,200 70,250" fill={illuminated ? "hsl(120 15% 10%)" : "hsl(220 15% 4%)"} />
            <path d="M130,230 Q160,200 170,160 Q140,190 130,230" fill={illuminated ? "hsl(120 15% 10%)" : "hsl(220 15% 4%)"} />
            <path d="M85,320 Q50,280 35,240 Q65,270 85,320" fill={illuminated ? "hsl(120 15% 10%)" : "hsl(220 15% 4%)"} />
          </svg>
        </motion.div>
      ))}

      {/* Right side trees */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`tree-right-${i}`}
          className="absolute transition-opacity duration-[3000ms]"
          style={{
            right: `-${8 + i * 3}%`,
            bottom: 0,
            opacity: illuminated ? 0.08 : 0.25 - i * 0.05,
            zIndex: 3 - i,
          }}
          animate={{
            x: [0, -(15 + i * 5), 0],
            y: [0, -3, 0],
          }}
          transition={{ duration: 9 + i * 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="200" height="600" viewBox="0 0 200 600" style={{ filter: "blur(1px)", transform: "scaleX(-1)" }}>
            <path
              d={`M100,600 L100,180 Q75,160 55,100 Q85,130 100,80 Q115,130 145,100 Q125,160 100,180`}
              fill={illuminated ? "hsl(120 15% 12%)" : "hsl(220 15% 5%)"}
            />
            <path d="M70,270 Q35,240 25,190 Q55,220 70,270" fill={illuminated ? "hsl(120 15% 10%)" : "hsl(220 15% 4%)"} />
            <path d="M130,250 Q165,220 175,170 Q145,200 130,250" fill={illuminated ? "hsl(120 15% 10%)" : "hsl(220 15% 4%)"} />
          </svg>
        </motion.div>
      ))}

      {/* Close foreground branches - very close, dark, parallax fast */}
      <motion.div
        className="absolute top-0 left-0 w-full transition-opacity duration-[3000ms]"
        style={{ opacity: illuminated ? 0.05 : 0.3, zIndex: 4 }}
        animate={{ x: [0, 20, -5, 15, 0], y: [0, -5, 2, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="100%" height="120" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 Q200,80 400,30 Q500,60 600,20 Q800,70 1000,10 Q1100,50 1200,0 L1200,0 L0,0 Z" fill="hsl(220 20% 3%)" />
          <path d="M-50,0 L100,60 L80,55 L150,80 L130,70 L200,90 L180,85 L50,30 Z" fill="hsl(220 20% 4%)" />
          <path d="M1000,0 L1100,50 L1080,45 L1150,70 L1130,60 L1200,80 L1200,0 Z" fill="hsl(220 20% 4%)" />
        </svg>
      </motion.div>

      {/* Forest path - faint center glow to suggest a trail */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 transition-opacity duration-[3000ms]"
        style={{
          width: "30%",
          height: "50%",
          background: illuminated
            ? "linear-gradient(to top, hsl(42 40% 30% / 0.15) 0%, transparent 100%)"
            : "linear-gradient(to top, hsl(220 20% 10% / 0.1) 0%, transparent 100%)",
          opacity: illuminated ? 0.8 : 0.3,
          clipPath: "polygon(30% 100%, 70% 100%, 55% 0%, 45% 0%)",
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

      {/* Fireflies */}
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
              background: illuminated ? "hsl(55 100% 75%)" : "hsl(80 90% 55%)",
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

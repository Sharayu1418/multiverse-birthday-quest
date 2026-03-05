import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function ForbiddenForestBackground({ illuminated }: { illuminated: boolean }) {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base dark forest gradient */}
      <div
        className="absolute inset-0 transition-all duration-[3000ms]"
        style={{
          background: illuminated
            ? "radial-gradient(ellipse at center, hsl(42 40% 15%) 0%, hsl(160 30% 8%) 40%, hsl(220 30% 6%) 100%)"
            : "radial-gradient(ellipse at center, hsl(220 30% 4%) 0%, hsl(220 20% 2%) 50%, hsl(0 0% 0%) 100%)",
        }}
      />

      {/* Tree silhouettes */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        {/* Left trees */}
        <path d="M0,800 L0,200 Q30,180 40,250 Q60,150 80,220 Q100,100 120,200 Q140,160 150,300 L150,800 Z" fill="hsl(220 30% 3%)" opacity={illuminated ? 0.4 : 0.95} className="transition-opacity duration-[3000ms]" />
        <path d="M80,800 L80,280 Q110,200 130,300 Q150,180 170,260 Q190,220 200,350 L200,800 Z" fill="hsl(220 25% 4%)" opacity={illuminated ? 0.35 : 0.9} className="transition-opacity duration-[3000ms]" />
        
        {/* Right trees */}
        <path d="M1200,800 L1200,180 Q1170,150 1160,230 Q1140,120 1120,210 Q1100,90 1080,200 Q1060,170 1050,300 L1050,800 Z" fill="hsl(220 30% 3%)" opacity={illuminated ? 0.4 : 0.95} className="transition-opacity duration-[3000ms]" />
        <path d="M1120,800 L1120,260 Q1090,190 1070,280 Q1050,170 1030,250 Q1010,210 1000,340 L1000,800 Z" fill="hsl(220 25% 4%)" opacity={illuminated ? 0.35 : 0.9} className="transition-opacity duration-[3000ms]" />

        {/* Center distant trees */}
        <path d="M400,800 L400,350 Q420,300 430,370 Q440,320 450,380 L450,800 Z" fill="hsl(220 20% 5%)" opacity={illuminated ? 0.2 : 0.7} className="transition-opacity duration-[3000ms]" />
        <path d="M700,800 L700,320 Q720,280 740,350 Q760,300 770,370 L770,800 Z" fill="hsl(220 20% 5%)" opacity={illuminated ? 0.2 : 0.7} className="transition-opacity duration-[3000ms]" />
      </svg>

      {/* Forest path */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[60%]">
        <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
          <path
            d="M160,0 Q170,80 150,150 Q140,200 120,260 Q110,280 80,300 L320,300 Q290,280 280,260 Q260,200 250,150 Q230,80 240,0 Z"
            fill={illuminated ? "hsl(42 20% 12%)" : "hsl(220 15% 5%)"}
            className="transition-all duration-[3000ms]"
            opacity={0.6}
          />
        </svg>
      </div>

      {/* Whomping Willow */}
      <motion.div
        className="absolute left-[8%] bottom-[15%] transition-opacity duration-[3000ms]"
        style={{ opacity: illuminated ? 0.5 : 0.15 }}
        animate={{ rotate: [0, 2, -1, 3, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="120" height="180" viewBox="0 0 120 180">
          <path d="M55,180 L58,100 Q60,80 55,60 L40,20" stroke="hsl(220 15% 15%)" strokeWidth="4" fill="none" />
          <motion.path
            d="M55,60 Q30,40 10,50" stroke="hsl(220 15% 15%)" strokeWidth="3" fill="none"
            animate={{ d: ["M55,60 Q30,40 10,50", "M55,60 Q35,30 15,55", "M55,60 Q30,40 10,50"] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.path
            d="M50,80 Q20,70 5,85" stroke="hsl(220 15% 15%)" strokeWidth="2" fill="none"
            animate={{ d: ["M50,80 Q20,70 5,85", "M50,80 Q25,60 10,80", "M50,80 Q20,70 5,85"] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
          <motion.path
            d="M58,50 Q80,30 100,35" stroke="hsl(220 15% 15%)" strokeWidth="3" fill="none"
            animate={{ d: ["M58,50 Q80,30 100,35", "M58,50 Q75,20 95,40", "M58,50 Q80,30 100,35"] }}
            transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
          />
        </svg>
      </motion.div>

      {/* Dementors */}
      {[0, 1].map((i) => (
        <motion.div
          key={`dementor-${i}`}
          className="absolute transition-opacity duration-[3000ms]"
          style={{
            top: `${15 + i * 12}%`,
            opacity: illuminated ? 0 : 0.08,
          }}
          animate={{
            x: [i === 0 ? "90vw" : "-10vw", i === 0 ? "-10vw" : "90vw"],
            y: [0, -20, 10, -15, 0],
          }}
          transition={{ duration: 25 + i * 10, repeat: Infinity, ease: "linear", delay: i * 12 }}
        >
          <svg width="40" height="60" viewBox="0 0 40 60">
            <ellipse cx="20" cy="15" rx="8" ry="12" fill="hsl(220 20% 8%)" />
            <path d="M12,25 Q20,55 28,25" fill="hsl(220 20% 8%)" opacity="0.7" />
          </svg>
        </motion.div>
      ))}

      {/* Owls */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`owl-${i}`}
          className="absolute"
          style={{ top: `${10 + i * 15}%`, opacity: illuminated ? 0.4 : 0.1 }}
          animate={{
            x: ["-5vw", "105vw"],
            y: [0, -30, 10, -20, 0],
          }}
          transition={{ duration: 15 + i * 5, repeat: Infinity, delay: i * 8 + 5, ease: "linear" }}
        >
          <svg width="20" height="12" viewBox="0 0 20 12">
            <motion.path
              d="M0,6 Q5,0 10,6 Q15,0 20,6"
              stroke="hsl(220 15% 20%)"
              strokeWidth="1.5"
              fill="none"
              animate={{ d: ["M0,6 Q5,0 10,6 Q15,0 20,6", "M0,6 Q5,10 10,6 Q15,10 20,6", "M0,6 Q5,0 10,6 Q15,0 20,6"] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </svg>
        </motion.div>
      ))}

      {/* Fireflies */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`firefly-${i}`}
          className="absolute rounded-full"
          style={{
            width: 3 + Math.random() * 3,
            height: 3 + Math.random() * 3,
            left: `${10 + Math.random() * 80}%`,
            top: `${20 + Math.random() * 60}%`,
            background: illuminated ? "hsl(42 90% 70%)" : "hsl(200 80% 60%)",
            boxShadow: illuminated
              ? "0 0 8px hsl(42 90% 70%), 0 0 20px hsl(42 80% 60%)"
              : "0 0 8px hsl(200 80% 60%), 0 0 20px hsl(200 70% 50%)",
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, 0],
            y: [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60, 0],
            opacity: [0.2, 0.8, 0.3, 0.9, 0.2],
          }}
          transition={{
            duration: 6 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Fog layers */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`fog-${i}`}
          className="absolute w-[200%] transition-opacity duration-[3000ms]"
          style={{
            height: `${15 + i * 5}%`,
            bottom: `${i * 12}%`,
            opacity: illuminated ? 0.05 : 0.15 + i * 0.05,
            background: `linear-gradient(90deg, transparent 0%, hsl(200 20% ${illuminated ? 30 : 15}% / 0.3) 25%, hsl(200 20% ${illuminated ? 30 : 15}% / 0.5) 50%, hsl(200 20% ${illuminated ? 30 : 15}% / 0.3) 75%, transparent 100%)`,
          }}
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 20 + i * 10, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Magical particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: 1 + Math.random() * 2,
            height: 1 + Math.random() * 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: "hsl(42 80% 70%)",
          }}
          animate={{
            y: [0, -100 - Math.random() * 100],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

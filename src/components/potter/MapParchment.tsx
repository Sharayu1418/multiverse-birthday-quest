import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MapParchmentProps {
  children: ReactNode;
  isRevealed: boolean;
}

export default function MapParchment({ children, isRevealed }: MapParchmentProps) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#e8cd9c] text-[#3e2723]">
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Parchment edge burns / vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 100px rgba(62, 39, 35, 0.4), inset 0 0 40px rgba(62, 39, 35, 0.2)",
        }}
      />

      {/* Fold lines (subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex outline-none">
        <div className="flex-1 border-r border-[#3e2723]" />
        <div className="flex-1 border-r border-[#3e2723]" />
        <div className="flex-1" />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col outline-none">
        <div className="flex-1 border-b border-[#3e2723]" />
        <div className="flex-1" />
      </div>

      {/* Main Content Area */}
      <motion.div 
        className="relative z-10 w-full h-full max-w-6xl mx-auto flex flex-col items-center justify-center p-4 lg:p-8"
        animate={{ 
          opacity: isRevealed ? 1 : 0.9,
          filter: isRevealed ? "brightness(1) contrast(1.1)" : "brightness(0.9) contrast(1)"
        }}
        transition={{ duration: 1.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

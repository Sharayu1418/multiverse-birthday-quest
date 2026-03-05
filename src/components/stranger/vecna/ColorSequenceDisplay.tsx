import { motion } from "framer-motion";

export type ToneColor = "green" | "blue" | "red" | "yellow";

export const COLOR_MAP: Record<ToneColor, { bg: string; glow: string; freq: number }> = {
  green: { bg: "hsl(140 70% 45%)", glow: "hsl(140 80% 35%)", freq: 261.63 },
  blue: { bg: "hsl(220 80% 55%)", glow: "hsl(220 90% 45%)", freq: 329.63 },
  red: { bg: "hsl(0 80% 50%)", glow: "hsl(0 90% 40%)", freq: 392.0 },
  yellow: { bg: "hsl(50 90% 55%)", glow: "hsl(50 95% 45%)", freq: 440.0 },
};

const DISPLAY_ORDER: ToneColor[] = ["green", "blue", "red", "yellow"];

interface Props {
  activeLight: ToneColor | null;
}

export default function ColorSequenceDisplay({ activeLight }: Props) {
  return (
    <div className="flex items-center gap-4 sm:gap-6">
      {DISPLAY_ORDER.map((color) => {
        const lit = activeLight === color;
        const cfg = COLOR_MAP[color];
        return (
          <motion.div
            key={color}
            className="w-9 h-9 sm:w-12 sm:h-12 rounded-full"
            style={{
              background: lit ? cfg.bg : cfg.bg.replace(/[\d.]+%\)$/, "15%)"),
              boxShadow: lit
                ? `0 0 30px ${cfg.glow}, 0 0 60px ${cfg.glow}`
                : `0 0 5px ${cfg.glow.replace(/[\d.]+%\)$/, "10%)")}`,
              border: `2px solid ${cfg.bg.replace(/[\d.]+%\)$/, "30%)")}`,
              transition: "all 0.15s",
            }}
            animate={lit ? { scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
        );
      })}
    </div>
  );
}

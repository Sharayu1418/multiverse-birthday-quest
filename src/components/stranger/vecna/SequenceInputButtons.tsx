import { motion } from "framer-motion";
import { type ToneColor, COLOR_MAP } from "./ColorSequenceDisplay";

const BUTTON_ORDER: ToneColor[] = ["green", "blue", "red", "yellow"];

interface Props {
  disabled: boolean;
  pressedButton: ToneColor | null;
  onPress: (color: ToneColor) => void;
}

export default function SequenceInputButtons({ disabled, pressedButton, onPress }: Props) {
  return (
    <div className="flex items-center gap-3 sm:gap-5">
      {BUTTON_ORDER.map((color) => {
        const cfg = COLOR_MAP[color];
        const isPressed = pressedButton === color;
        return (
          <motion.button
            key={color}
            onClick={() => onPress(color)}
            disabled={disabled}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl cursor-pointer disabled:cursor-not-allowed font-mono text-xs font-bold uppercase tracking-wider select-none"
            style={{
              background: `linear-gradient(135deg, ${cfg.bg}, ${cfg.bg.replace(/[\d.]+%\)$/, "35%)")})`,
              border: `2px solid ${cfg.bg.replace(/[\d.]+%\)$/, "50%)")}`,
              color: "hsl(0 0% 95%)",
              boxShadow: isPressed
                ? `0 0 30px ${cfg.glow}, inset 0 0 18px ${cfg.glow}`
                : `0 0 8px ${cfg.glow.replace(/[\d.]+%\)$/, "15%)")}`,
              opacity: disabled ? 0.45 : 1,
            }}
            whileHover={!disabled ? { scale: 1.08 } : {}}
            whileTap={!disabled ? { scale: 0.92 } : {}}
          >
            {color}
          </motion.button>
        );
      })}
    </div>
  );
}

import { motion } from "framer-motion";

interface SpellBarProps {
  discovered: string[];
  total: number;
}

export default function SpellBar({ discovered, total }: SpellBarProps) {
  const slots = Array.from({ length: total }, (_, i) => discovered[i] || null);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-3 items-center" style={{ zIndex: 15 }}>
      <div className="flex gap-2 px-6 py-3 rounded-2xl border border-potter-gold/30 bg-card/80 backdrop-blur-sm">
        {discovered.length === 0 ? (
          <div className="flex gap-3">
            {slots.map((_, i) => (
              <span
                key={i}
                className="font-display text-2xl sm:text-3xl font-bold w-8 text-center"
                style={{ color: "hsl(42 30% 30% / 0.3)" }}
              >
                _
              </span>
            ))}
          </div>
        ) : (
          <div className="flex gap-3">
            {slots.map((char, i) => (
              <div key={i} className="w-8 text-center">
                {char ? (
                  <motion.span
                    className="font-display text-2xl sm:text-3xl font-bold inline-block"
                    style={{
                      color: "hsl(42 80% 65%)",
                      textShadow: "0 0 10px hsl(42 70% 50%)",
                    }}
                    initial={{ y: -40, opacity: 0, scale: 1.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {char}
                  </motion.span>
                ) : (
                  <span
                    className="font-display text-2xl sm:text-3xl font-bold"
                    style={{ color: "hsl(42 30% 30% / 0.3)" }}
                  >
                    _
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <span className="text-xs font-body" style={{ color: "hsl(42 40% 50% / 0.6)" }}>
        {discovered.length}/{total}
      </span>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onCorrect: () => void;
  flipped: boolean;
}

const CORRECT_ANSWER = "HELP";

export default function PuzzleInput({ onCorrect, flipped }: Props) {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);
  const [hint, setHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().toUpperCase() === CORRECT_ANSWER) {
      onCorrect();
    } else {
      setShake(true);
      setHint(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-3 max-w-xs mx-auto"
      style={{ transform: flipped ? "rotate(180deg)" : "none" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <motion.div animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type the decoded word..."
          className="w-full px-4 py-3 rounded-lg border font-mono text-center text-lg tracking-widest uppercase focus:outline-none focus:ring-2 transition-all"
          style={{
            background: "hsl(0 10% 8%)",
            borderColor: "hsl(0 40% 25%)",
            color: "hsl(0 70% 65%)",
          }}
          autoComplete="off"
        />
      </motion.div>

      <motion.button
        type="submit"
        className="w-full py-3 rounded-lg font-mono font-bold text-sm uppercase tracking-wider cursor-pointer hover:scale-[1.02] transition-transform"
        style={{
          background: "linear-gradient(135deg, hsl(0 60% 30%), hsl(0 70% 20%))",
          color: "hsl(0 70% 70%)",
          boxShadow: "0 0 15px hsl(0 60% 20% / 0.5)",
        }}
        whileTap={{ scale: 0.98 }}
      >
        Decode
      </motion.button>

      {hint && (
        <motion.p
          className="text-xs font-mono text-center"
          style={{ color: "hsl(0 50% 45%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Each number = a letter position in the alphabet (1=A, 2=B...)
        </motion.p>
      )}
    </motion.form>
  );
}

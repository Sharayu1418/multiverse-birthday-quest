import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onSolved: () => void;
}

export default function FinalRiddlePanel({ onSolved }: Props) {
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (answer.trim().toLowerCase() === "i am iron man") {
      onSolved();
    } else {
      setShowHint(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <motion.div
      className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(var(--marvel-red)))",
          boxShadow: "0 0 50px hsl(var(--marvel-gold) / 0.5)",
        }}
      >
        <span className="text-3xl">🔮</span>
      </motion.div>

      <motion.h2
        className="text-2xl sm:text-4xl font-display font-bold mb-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          color: "hsl(var(--marvel-gold))",
          textShadow: "0 0 30px hsl(var(--marvel-gold) / 0.5)",
        }}
      >
        The Final Spell
      </motion.h2>

      <motion.p
        className="text-muted-foreground font-body text-sm sm:text-base mb-6 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Doctor Strange saw only one future where victory was possible.
      </motion.p>

      <motion.p
        className="font-body text-base sm:text-lg mb-8 max-w-md italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{ color: "hsl(var(--foreground))" }}
      >
        "To restore the multiverse, speak the sentence that ended the war.
        <br />
        <span className="text-muted-foreground text-sm">(Type it exactly.)</span>"
      </motion.p>

      <motion.div
        className="w-full max-w-sm space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <motion.input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Enter the sentence..."
          className="w-full px-4 py-3 rounded-lg font-body text-center text-base
            border bg-background/50 backdrop-blur-sm
            focus:outline-none focus:ring-2 transition-all"
          style={{
            borderColor: "hsl(var(--marvel-gold) / 0.3)",
            color: "hsl(var(--foreground))",
          }}
          animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
        />

        {showHint && (
          <motion.p
            className="text-sm font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: "hsl(var(--marvel-red))" }}
          >
            Hint: It is the line Tony Stark says before the snap.
          </motion.p>
        )}

        <motion.button
          onClick={handleSubmit}
          className="w-full px-8 py-3 rounded-full font-body font-semibold text-lg cursor-pointer
            transition-all duration-300 hover:scale-105"
          whileTap={{ scale: 0.95 }}
          style={{
            background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(var(--marvel-red)))",
            color: "hsl(var(--primary-foreground))",
            boxShadow: "0 0 30px hsl(var(--marvel-gold) / 0.4)",
          }}
        >
          Cast the Spell
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

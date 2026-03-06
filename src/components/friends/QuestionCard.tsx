import { useState } from "react";
import { motion } from "framer-motion";
import type { TriviaQuestion } from "./FriendsTriviaGame";

interface Props {
  question: TriviaQuestion;
  questionNumber: number;
  onCorrect: () => void;
}

export default function QuestionCard({ question, questionNumber, onCorrect }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [wrong, setWrong] = useState(false);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);

    if (idx === question.correctIndex) {
      setTimeout(onCorrect, 600);
    } else {
      setWrong(true);
      setTimeout(() => {
        setSelected(null);
        setWrong(false);
      }, 800);
    }
  };

  return (
    <motion.div
      className="rounded-2xl p-6 sm:p-8 backdrop-blur-md"
      style={{
        background: "hsl(25 20% 10% / 0.8)",
        border: "1px solid hsl(var(--friends-orange) / 0.2)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <p className="text-xs font-body mb-2" style={{ color: "hsl(var(--friends-orange) / 0.6)" }}>
        Question {questionNumber} of 6
      </p>
      <h2
        className="text-lg sm:text-xl font-display font-bold mb-6"
        style={{ color: "hsl(var(--foreground))" }}
      >
        {question.question}
      </h2>

      <div className="space-y-3">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctIndex;
          const isSelected = i === selected;

          let bg = "hsl(25 15% 15% / 0.6)";
          let border = "hsl(var(--friends-orange) / 0.15)";
          let textColor = "hsl(var(--foreground) / 0.9)";

          if (isSelected && isCorrect) {
            bg = "hsl(120 50% 20% / 0.6)";
            border = "hsl(120 60% 40% / 0.5)";
            textColor = "hsl(120 60% 75%)";
          } else if (isSelected && !isCorrect) {
            bg = "hsl(0 50% 20% / 0.6)";
            border = "hsl(0 60% 40% / 0.5)";
            textColor = "hsl(0 60% 75%)";
          }

          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              className="w-full text-left px-5 py-3 rounded-xl font-body text-sm sm:text-base cursor-pointer transition-colors"
              style={{ background: bg, border: `1px solid ${border}`, color: textColor }}
              whileHover={selected === null ? { scale: 1.02, x: 4 } : {}}
              whileTap={selected === null ? { scale: 0.98 } : {}}
              animate={isSelected && wrong ? { x: [-6, 6, -6, 6, 0] } : {}}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>

      {wrong && (
        <motion.p
          className="text-xs font-body mt-3 text-center"
          style={{ color: "hsl(0 60% 60%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Not quite! Try again...
        </motion.p>
      )}
    </motion.div>
  );
}

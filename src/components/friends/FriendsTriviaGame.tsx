import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameProgress } from "@/hooks/useGameProgress";
import centralPerkBg from "@/assets/friends/central_perk_bg.jpg";
import orangeCouch from "@/assets/friends/orange_couch.png";
import QuestionCard from "./QuestionCard";
import CouchScene from "./CouchScene";
import FriendsFinale from "./FriendsFinale";

type Phase = "intro" | "trivia" | "finale";

const CHARACTERS = ["Ross", "Joey", "Phoebe", "Monica", "Chandler", "Rachel"] as const;
export type FriendCharacter = (typeof CHARACTERS)[number];

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  revealCharacter: FriendCharacter;
  revealNote?: string;
}

const QUESTIONS: TriviaQuestion[] = [
  {
    question: "What is the name of the café where the friends hang out?",
    options: ["Central Park", "Central Perk", "Coffee Central"],
    correctIndex: 1,
    revealCharacter: "Ross",
    revealNote: "Gunther watches from behind the counter...",
  },
  {
    question: "What phrase does Joey famously say?",
    options: ["How you doin?", "What's up?", "Nice to meet you"],
    correctIndex: 0,
    revealCharacter: "Joey",
  },
  {
    question: "What instrument does Phoebe play?",
    options: ["Guitar", "Piano", "Violin"],
    correctIndex: 0,
    revealCharacter: "Phoebe",
  },
  {
    question: "Who was Monica's brother?",
    options: ["Ross", "Chandler", "Joey"],
    correctIndex: 0,
    revealCharacter: "Monica",
  },
  {
    question: "What was Chandler's most mysterious job?",
    options: [
      "Data analyst",
      "Statistical analysis and data reconfiguration",
      "IT manager",
    ],
    correctIndex: 1,
    revealCharacter: "Chandler",
  },
  {
    question: "Who leaves Barry at the altar in the first episode?",
    options: ["Rachel", "Monica", "Phoebe"],
    correctIndex: 0,
    revealCharacter: "Rachel",
  },
];

export default function FriendsTriviaGame() {
  const navigate = useNavigate();
  const { markSolved } = useGameProgress();
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [revealedChars, setRevealedChars] = useState<FriendCharacter[]>([]);
  const [showReveal, setShowReveal] = useState(false);

  const handleCorrectAnswer = () => {
    const char = QUESTIONS[currentQ].revealCharacter;
    setRevealedChars((prev) => [...prev, char]);
    setShowReveal(true);

    setTimeout(() => {
      setShowReveal(false);
      if (currentQ + 1 >= QUESTIONS.length) {
        markSolved("friends");
        setPhase("finale");
      } else {
        setCurrentQ((p) => p + 1);
      }
    }, 2000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0">
        <img
          src={centralPerkBg}
          alt="Central Perk"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, hsl(25 40% 8% / 0.6), hsl(25 30% 5% / 0.75))",
          }}
        />
      </div>

      {/* Warm ambient particles */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + Math.random() * 4,
              height: 2 + Math.random() * 4,
              background: `hsl(var(--friends-orange) / ${0.15 + Math.random() * 0.2})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30 - Math.random() * 50],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <AnimatePresence mode="wait">
          {/* INTRO */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              className="text-center space-y-6 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.h1
                className="text-3xl sm:text-5xl font-display font-bold"
                style={{
                  color: "hsl(var(--friends-orange))",
                  textShadow:
                    "0 0 30px hsl(var(--friends-orange) / 0.5), 0 0 60px hsl(var(--friends-orange) / 0.2)",
                }}
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                Welcome to the Friends Universe
              </motion.h1>

              <motion.p
                className="text-lg font-body"
                style={{ color: "hsl(var(--foreground) / 0.8)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Only true friends know the answers
              </motion.p>

              <motion.p
                className="text-sm font-body"
                style={{ color: "hsl(var(--friends-orange) / 0.7)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Answer the questions to gather the gang
              </motion.p>

              {/* Couch preview */}
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
              >
                <img
                  src={orangeCouch}
                  alt="Orange Couch"
                  className="w-48 sm:w-64 mx-auto opacity-60"
                />
              </motion.div>

              <motion.button
                className="mt-8 px-8 py-3 rounded-full font-body font-semibold cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--friends-orange)), hsl(25 80% 45%))",
                  color: "hsl(0 0% 100%)",
                  boxShadow:
                    "0 0 20px hsl(var(--friends-orange) / 0.4)",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                onClick={() => setPhase("trivia")}
              >
                Start Trivia ☕
              </motion.button>
            </motion.div>
          )}

          {/* TRIVIA */}
          {phase === "trivia" && (
            <motion.div
              key="trivia"
              className="w-full max-w-2xl space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Progress */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full transition-all duration-300"
                    style={{
                      background:
                        i < revealedChars.length
                          ? "hsl(var(--friends-orange))"
                          : i === currentQ
                            ? "hsl(var(--friends-orange) / 0.5)"
                            : "hsl(var(--muted))",
                      boxShadow:
                        i < revealedChars.length
                          ? "0 0 8px hsl(var(--friends-orange) / 0.6)"
                          : "none",
                    }}
                  />
                ))}
              </div>

              {/* Couch with characters */}
              <CouchScene revealedCharacters={revealedChars} showReveal={showReveal} latestChar={QUESTIONS[currentQ]?.revealCharacter} />

              {/* Question */}
              <AnimatePresence mode="wait">
                {!showReveal && (
                  <QuestionCard
                    key={currentQ}
                    question={QUESTIONS[currentQ]}
                    questionNumber={currentQ + 1}
                    onCorrect={handleCorrectAnswer}
                  />
                )}

                {showReveal && (
                  <motion.div
                    key="reveal"
                    className="text-center py-8"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p
                      className="text-2xl font-display font-bold"
                      style={{
                        color: "hsl(var(--friends-orange))",
                        textShadow:
                          "0 0 20px hsl(var(--friends-orange) / 0.5)",
                      }}
                    >
                      {QUESTIONS[currentQ].revealCharacter} has joined! 🎉
                    </p>
                    {QUESTIONS[currentQ].revealNote && (
                      <p
                        className="text-sm font-body mt-2"
                        style={{ color: "hsl(var(--foreground) / 0.6)" }}
                      >
                        {QUESTIONS[currentQ].revealNote}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* FINALE */}
          {phase === "finale" && (
            <FriendsFinale
              key="finale"
              onReturn={() => navigate("/hub")}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

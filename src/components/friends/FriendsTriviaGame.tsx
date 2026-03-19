import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameProgress } from "@/hooks/useGameProgress";
import centralPerkBg from "@/assets/friends/central_perk_bg.jpg";
import QuestionCard from "./QuestionCard";
import CouchScene from "./CouchScene";
import FriendsFinale from "./FriendsFinale";

type Phase = "intro" | "trivia" | "reveal" | "finale";

export type FriendCharacter = "Ross" | "Joey" | "Phoebe" | "Monica" | "Chandler" | "Rachel";

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
];

export default function FriendsTriviaGame() {
  const navigate = useNavigate();
  const { markSolved } = useGameProgress();
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showRevealText, setShowRevealText] = useState(false);
  const tuneRef = useRef<HTMLAudioElement | null>(null);
  const restoreAudioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (tuneRef.current) {
        tuneRef.current.pause();
        tuneRef.current = null;
      }

      if (restoreAudioRef.current) {
        void restoreAudioRef.current.close().catch(() => undefined);
        restoreAudioRef.current = null;
      }
    };
  }, []);

  const primeRestoreAudio = () => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;

    if (!restoreAudioRef.current) {
      restoreAudioRef.current = new Ctx();
    }

    if (restoreAudioRef.current.state === "suspended") {
      void restoreAudioRef.current.resume();
    }
  };

  const playRestoreTone = (step: number) => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;

    if (!restoreAudioRef.current) {
      restoreAudioRef.current = new Ctx();
    }

    const audio = restoreAudioRef.current;
    if (audio.state === "suspended") {
      void audio.resume();
    }

    const now = audio.currentTime;
    const basePitch = 430 + step * 38;

    const lead = audio.createOscillator();
    const shimmer = audio.createOscillator();
    const gain = audio.createGain();
    const shimmerGain = audio.createGain();
    const filter = audio.createBiquadFilter();

    lead.type = "triangle";
    lead.frequency.setValueAtTime(basePitch, now);
    lead.frequency.exponentialRampToValueAtTime(basePitch * 1.18, now + 0.16);

    shimmer.type = "sine";
    shimmer.frequency.setValueAtTime(basePitch * 1.5, now);
    shimmer.frequency.exponentialRampToValueAtTime(basePitch * 1.75, now + 0.18);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2200, now);

    lead.connect(filter);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.055, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    shimmerGain.gain.setValueAtTime(0.0001, now);
    shimmerGain.gain.exponentialRampToValueAtTime(0.03, now + 0.03);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    lead.start(now);
    shimmer.start(now);
    lead.stop(now + 0.32);
    shimmer.stop(now + 0.26);
  };

  const handleCorrectAnswer = () => {
    setRevealedCount((c) => {
      const next = c + 1;
      playRestoreTone(next);
      return next;
    });
    setShowRevealText(true);

    setTimeout(() => {
      setShowRevealText(false);
      if (currentQ + 1 >= QUESTIONS.length) {
        setPhase("reveal");
      } else {
        setCurrentQ((p) => p + 1);
      }
    }, 1800);
  };

  useEffect(() => {
    if (phase !== "reveal") return;
    const audio = new Audio("/audio/Friends Tune.mp3");
    audio.volume = 0.5;
    tuneRef.current = audio;
    audio.play().catch(() => {});

    const timer = setTimeout(() => {
      markSolved("friends");
      setPhase("finale");
    }, 5000);

    return () => {
      clearTimeout(timer);
      audio.pause();
    };
  }, [phase, markSolved]);

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

      <div
        className={`relative z-10 min-h-screen flex flex-col items-center justify-center px-4 ${
          phase === "finale" ? "py-3 overflow-hidden" : "py-8"
        }`}
      >
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
                Only true friends know the answers.
              </motion.p>

              <motion.p
                className="text-sm font-body"
                style={{ color: "hsl(var(--friends-orange) / 0.6)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Answer 6 questions to bring the gang back together.
              </motion.p>

              <motion.button
                className="mt-8 px-8 py-2.5 rounded-md font-body font-medium text-sm tracking-wider uppercase cursor-pointer transition-all"
                style={{
                  background: "transparent",
                  border: "1px solid hsl(var(--friends-orange) / 0.5)",
                  color: "hsl(var(--friends-orange))",
                  letterSpacing: "0.12em",
                }}
                whileHover={{
                  boxShadow: "0 0 25px hsl(var(--friends-orange) / 0.3)",
                }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                onClick={() => {
                  primeRestoreAudio();
                  setPhase("trivia");
                }}
              >
                Start Trivia
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
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full transition-all duration-300"
                    style={{
                      background:
                        i < revealedCount
                          ? "hsl(var(--friends-orange))"
                          : i === currentQ
                            ? "hsl(var(--friends-orange) / 0.5)"
                            : "hsl(var(--muted))",
                      boxShadow:
                        i < revealedCount
                          ? "0 0 8px hsl(var(--friends-orange) / 0.6)"
                          : "none",
                    }}
                  />
                ))}
              </div>

              {/* Progressive image reveal */}
              <CouchScene
                revealedCount={revealedCount}
                totalTiles={QUESTIONS.length}
              />

              {/* Question or reveal text */}
              <AnimatePresence mode="wait">
                {!showRevealText && (
                  <QuestionCard
                    key={currentQ}
                    question={QUESTIONS[currentQ]}
                    questionNumber={currentQ + 1}
                    onCorrect={handleCorrectAnswer}
                  />
                )}

              </AnimatePresence>
            </motion.div>
          )}

          {/* FULL REVEAL */}
          {phase === "reveal" && (
            <motion.div
              key="reveal"
              className="w-full max-w-lg text-center space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "16 / 10" }}>
                <img
                  src="/images/friends_sketch.jpg"
                  alt="The Gang"
                  className="w-full h-full object-cover"
                />
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    boxShadow: "inset 0 0 40px hsl(var(--friends-orange) / 0.3)",
                    border: "2px solid hsl(var(--friends-orange) / 0.4)",
                  }}
                  animate={{
                    boxShadow: [
                      "inset 0 0 40px hsl(25 80% 55% / 0.3)",
                      "inset 0 0 60px hsl(25 80% 55% / 0.5)",
                      "inset 0 0 40px hsl(25 80% 55% / 0.3)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              <motion.p
                className="text-lg sm:text-2xl font-display font-bold"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                style={{
                  color: "hsl(var(--friends-orange))",
                  textShadow: "0 0 20px hsl(var(--friends-orange) / 0.4)",
                }}
              >
                The gang will always be there for you!
              </motion.p>
            </motion.div>
          )}

          {/* FINALE */}
          {phase === "finale" && (
            <FriendsFinale
              key="finale"
              onReturn={() => {
                if (tuneRef.current) {
                  tuneRef.current.pause();
                  tuneRef.current = null;
                }
                navigate("/hub");
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSolved: () => void;
}

type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList;
  resultIndex: number;
};

type SpeechRecognitionErrorEvent = Event & { error: string };

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionInstance)
    | null;
}

function InfinityStones() {
  const stones = [
    { color: "hsl(0 70% 50%)", x: -36, y: -8 },
    { color: "hsl(270 60% 55%)", x: -22, y: -30 },
    { color: "hsl(210 70% 55%)", x: 0, y: -38 },
    { color: "hsl(40 80% 55%)", x: 22, y: -30 },
    { color: "hsl(140 50% 50%)", x: 36, y: -8 },
    { color: "hsl(30 80% 55%)", x: 0, y: 6 },
  ];

  return (
    <motion.div
      className="relative w-24 h-24 flex items-center justify-center mb-10"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <svg width="40" height="52" viewBox="0 0 40 52" fill="none" className="absolute">
        <path
          d="M12 50 L12 28 Q12 18 20 12 Q28 18 28 28 L28 50"
          stroke="hsl(40 60% 45% / 0.4)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M8 30 Q8 22 14 16 M26 16 Q32 22 32 30"
          stroke="hsl(40 60% 45% / 0.25)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
      {stones.map((stone, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 6,
            height: 6,
            background: stone.color,
            boxShadow: `0 0 10px ${stone.color}, 0 0 20px ${stone.color}`,
            left: "50%",
            top: "50%",
          }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: stone.x, y: stone.y, opacity: [0.5, 1, 0.5] }}
          transition={{
            x: { delay: 0.3 + i * 0.1, duration: 0.6, ease: "easeOut" },
            y: { delay: 0.3 + i * 0.1, duration: 0.6, ease: "easeOut" },
            opacity: { delay: 0.3 + i * 0.1, duration: 2, repeat: Infinity },
          }}
        />
      ))}
    </motion.div>
  );
}

function MicIcon({ listening }: { listening: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={listening ? "hsl(0 70% 55%)" : "hsl(var(--marvel-gold))"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="1" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <line x1="8" y1="21" x2="16" y2="21" />
    </svg>
  );
}

function PulsingRing() {
  return (
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ border: "1.5px solid hsl(0 70% 55% / 0.5)" }}
      animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

export default function FinalRiddlePanel({ onSolved }: Props) {
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [shake, setShake] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (!getSpeechRecognition()) setSpeechSupported(false);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    setAnswer("");
    setListening(true);
    recognition.start();
  }, []);

  const handleSubmit = () => {
    stopListening();
    if (answer.trim().toLowerCase() === "i am iron man") {
      onSolved();
    } else {
      setShowHint(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
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
      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, hsl(0 0% 0% / 0.5) 100%)",
        }}
      />

      <motion.div className="relative z-10 flex flex-col items-center max-w-md">
        <InfinityStones />

        <motion.h2
          className="text-xl sm:text-3xl font-display font-bold mb-2 tracking-wide"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            color: "hsl(var(--marvel-gold))",
            textShadow: "0 0 20px hsl(var(--marvel-gold) / 0.3)",
          }}
        >
          The Final Spell
        </motion.h2>

        <motion.div
          className="w-24 h-px mb-8"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(var(--marvel-gold) / 0.5), transparent)",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />

        <motion.p
          className="font-body text-sm sm:text-base mb-6 max-w-sm leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ color: "hsl(var(--foreground) / 0.6)" }}
        >
          Doctor Strange saw only one future where victory was possible.
        </motion.p>

        <motion.p
          className="font-body text-sm sm:text-base italic mb-10 max-w-sm leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ color: "hsl(var(--foreground) / 0.8)" }}
        >
          To restore the multiverse, speak the sentence that ended the war.
        </motion.p>

        <motion.div
          className="w-full max-w-[320px] flex flex-col items-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          {/* Transcript display area */}
          <div className="w-full min-h-[56px] flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              {answer ? (
                <motion.p
                  key="transcript"
                  className="font-display text-lg sm:text-2xl tracking-wide"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    color: "hsl(var(--marvel-gold))",
                    textShadow: "0 0 15px hsl(var(--marvel-gold) / 0.3)",
                  }}
                >
                  {answer}
                  {listening && (
                    <motion.span
                      className="inline-block ml-0.5"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      style={{ color: "hsl(var(--marvel-gold) / 0.5)" }}
                    >
                      |
                    </motion.span>
                  )}
                </motion.p>
              ) : (
                <motion.p
                  key="placeholder"
                  className="font-body text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ color: "hsl(var(--foreground) / 0.25)" }}
                >
                  {listening ? "Listening..." : "Tap the mic and speak"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Microphone button */}
          {speechSupported && (
            <motion.button
              onClick={toggleListening}
              className="relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: listening
                  ? "hsl(0 70% 55% / 0.15)"
                  : "hsl(0 0% 100% / 0.04)",
                border: `1.5px solid ${listening ? "hsl(0 70% 55% / 0.5)" : "hsl(var(--marvel-gold) / 0.3)"}`,
              }}
            >
              {listening && <PulsingRing />}
              <MicIcon listening={listening} />
            </motion.button>
          )}

          {/* Fallback text input for browsers without speech recognition */}
          {!speechSupported && (
            <motion.input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="type it here..."
              className="w-full px-4 py-3 rounded-md font-body text-center text-base tracking-wide
                focus:outline-none transition-all"
              style={{
                background: "hsl(0 0% 100% / 0.04)",
                border: "1px solid hsl(var(--marvel-gold) / 0.15)",
                color: "hsl(var(--marvel-gold))",
                boxShadow: "inset 0 0 20px hsl(var(--marvel-gold) / 0.04)",
              }}
              animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
            />
          )}

          {showHint && (
            <motion.p
              className="text-xs font-body"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: "hsl(var(--marvel-red) / 0.8)" }}
            >
              It's the line Tony Stark says before the snap.
            </motion.p>
          )}

          <motion.button
            onClick={handleSubmit}
            className="w-full max-w-[260px] px-6 py-2.5 rounded-md font-body font-medium text-sm tracking-wider uppercase cursor-pointer
              transition-all duration-300"
            whileHover={{
              boxShadow: "0 0 25px hsl(var(--marvel-gold) / 0.3)",
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: "transparent",
              border: "1px solid hsl(var(--marvel-gold) / 0.5)",
              color: "hsl(var(--marvel-gold))",
              letterSpacing: "0.12em",
            }}
          >
            Cast the Spell
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StarfieldBackground from "@/components/StarfieldBackground";
import { useGameProgress } from "@/hooks/useGameProgress";
import MarvelIntro from "@/components/marvel/MarvelIntro";
import DoctorStrangeVisionRiddle from "@/components/marvel/DoctorStrangeVisionRiddle";
import MarvelPortalGrid from "@/components/marvel/MarvelPortalGrid";
import FinalRiddlePanel from "@/components/marvel/FinalRiddlePanel";
import IronManVideoReveal from "@/components/marvel/IronManVideoReveal";
import MarvelFinale from "@/components/marvel/MarvelFinale";

type MarvelScreen = "intro" | "vision" | "puzzle" | "riddle" | "video" | "finale";

export default function MarvelPuzzlePage() {
  const navigate = useNavigate();
  const { markSolved, isSolved } = useGameProgress();
  const alreadySolved = isSolved("marvel");
  const [screen, setScreen] = useState<MarvelScreen>(alreadySolved ? "puzzle" : "intro");

  const handleIronManFound = () => {
    setScreen("riddle");
  };

  const handleRiddleSolved = () => {
    setScreen("video");
  };

  const handleVideoComplete = () => {
    markSolved("marvel");
    setScreen("finale");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-950/60 via-background to-orange-950/20">
      <StarfieldBackground />
      <FloatingRunes />

      <AnimatePresence mode="wait">
        {screen === "intro" && (
          <MarvelIntro key="intro" onStart={() => setScreen("vision")} />
        )}
        {screen === "vision" && (
          <DoctorStrangeVisionRiddle key="vision" onSolved={() => setScreen("puzzle")} />
        )}
        {screen === "puzzle" && (
          <MarvelPortalGrid
            key="puzzle"
            onSolved={handleIronManFound}
            alreadySolved={alreadySolved}
            onBack={() => navigate("/hub")}
          />
        )}
        {screen === "riddle" && (
          <FinalRiddlePanel key="riddle" onSolved={handleRiddleSolved} />
        )}
        {screen === "video" && (
          <IronManVideoReveal key="video" onContinue={handleVideoComplete} />
        )}
        {screen === "finale" && (
          <MarvelFinale key="finale" onReturn={() => navigate("/hub")} />
        )}
      </AnimatePresence>
    </div>
  );
}

function FloatingRunes() {
  const runes = ["᛭", "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᛊ", "ᛏ", "ᛒ", "ᛗ"];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {runes.map((rune, i) => {
        const left = (i / runes.length) * 100;
        const delay = i * 0.7;
        const duration = 12 + Math.random() * 8;
        const size = 14 + Math.random() * 12;

        return (
          <span
            key={i}
            className="absolute animate-float text-marvel-gold/20 font-display select-none"
            style={{
              left: `${left}%`,
              top: `${10 + Math.random() * 80}%`,
              fontSize: size,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          >
            {rune}
          </span>
        );
      })}
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import MarvelPortalCard from "./MarvelPortalCard";
import spidermanImg from "@/assets/heroes/spiderman.png";
import captainAmericaImg from "@/assets/heroes/captain_america.png";

interface HeroData {
  id: number;
  name: string;
  emoji: string;
  image?: string;
  isCorrect: boolean;
  failMessage: string;
}

const HEROES: HeroData[] = [
  { id: 1, name: "Thor", emoji: "⚡", isCorrect: false, failMessage: "Even the thunder cannot save this future." },
  { id: 2, name: "Captain America", emoji: "🛡️", image: captainAmericaImg, isCorrect: false, failMessage: "We gave it everything… but this isn't the one." },
  { id: 3, name: "Hulk", emoji: "💚", isCorrect: false, failMessage: "Hulk tried. Hulk still lose." },
  { id: 4, name: "Spider-Man", emoji: "🕷️", image: spidermanImg, isCorrect: false, failMessage: "Ms. Shivani… I don't think this timeline works." },
  { id: 5, name: "Black Widow", emoji: "🖤", isCorrect: false, failMessage: "This mission fails. Try another timeline." },
  { id: 6, name: "Doctor Strange", emoji: "🔮", isCorrect: false, failMessage: "I've seen this future… and it ends in defeat." },
  { id: 7, name: "Ant-Man", emoji: "🐜", isCorrect: false, failMessage: "Okay… that timeline got really weird really fast." },
  { id: 8, name: "Scarlet Witch", emoji: "❤️‍🔥", isCorrect: false, failMessage: "This reality breaks… and everyone loses." },
  { id: 9, name: "Iron Man", emoji: "🦾", isCorrect: true, failMessage: "" },
];

interface Props {
  onSolved: () => void;
  alreadySolved: boolean;
  onBack: () => void;
}

export default function MarvelPortalGrid({ onSolved, alreadySolved, onBack }: Props) {
  const [opened, setOpened] = useState<Set<number>>(new Set(alreadySolved ? HEROES.map(h => h.id) : []));
  const [foundIronMan, setFoundIronMan] = useState(alreadySolved);
  const [showSnapText, setShowSnapText] = useState(false);

  const handleOpen = (hero: HeroData) => {
    if (opened.has(hero.id) || foundIronMan) return;
    setOpened((prev) => new Set(prev).add(hero.id));

    if (hero.isCorrect) {
      setFoundIronMan(true);
      setTimeout(() => {
        onSolved();
      }, 2000);
    }
  };

  return (
    <motion.div
      className="relative z-10 container mx-auto px-4 py-6 sm:py-10 max-w-2xl min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back button */}
      <motion.button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 font-body cursor-pointer"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Multiverse
      </motion.button>

      {/* Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1
          className="text-2xl sm:text-4xl font-display font-bold mb-3"
          style={{
            color: "hsl(var(--foreground))",
            textShadow: "0 0 30px hsl(var(--marvel-gold) / 0.5)",
          }}
        >
          Find the Future Where We Win
        </h1>
        <p className="text-muted-foreground font-body text-sm sm:text-base">
          Explore the timelines until you find the hero who saves the universe.
        </p>
      </motion.div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-muted-foreground font-body text-sm">Futures Explored:</span>
        <span
          className="font-body font-bold text-lg"
          style={{ color: "hsl(var(--marvel-gold))", textShadow: "0 0 10px hsl(var(--marvel-gold) / 0.5)" }}
        >
          {opened.size} / 9
        </span>
      </div>

      {/* Portal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
        {HEROES.map((hero, i) => (
          <MarvelPortalCard
            key={hero.id}
            hero={hero}
            isOpened={opened.has(hero.id)}
            isCorrect={hero.isCorrect}
            foundIronMan={foundIronMan}
            index={i}
            onOpen={() => handleOpen(hero)}
          />
        ))}
      </div>

    </motion.div>
  );
}

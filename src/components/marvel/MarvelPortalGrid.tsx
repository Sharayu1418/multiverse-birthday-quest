import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import MarvelPortalCard from "./MarvelPortalCard";
import spidermanImg from "@/assets/heroes/spiderman.png";
import captainAmericaImg from "@/assets/heroes/captain_america.png";
import thorImg from "@/assets/heroes/thor.jpg";
import blackWidowImg from "@/assets/heroes/black_widow.png";
import scarletWitchImg from "@/assets/heroes/scarlet_witch.png";

interface HeroData {
  id: number;
  name: string;
  emoji: string;
  image?: string;
  isCorrect: boolean;
  failMessage: string;
}

const WRONG_HEROES: HeroData[] = [
  { id: 1, name: "Thor", emoji: "⚡", image: thorImg, isCorrect: false, failMessage: "Even the thunder cannot save this future." },
  { id: 2, name: "Captain America", emoji: "🛡️", image: captainAmericaImg, isCorrect: false, failMessage: "We gave it everything… but this isn't the one." },
  { id: 3, name: "Hulk", emoji: "💚", isCorrect: false, failMessage: "Hulk tried. Hulk still lose." },
  { id: 4, name: "Spider-Man", emoji: "🕷️", image: spidermanImg, isCorrect: false, failMessage: "Ms. Shivani… I don't think this timeline works." },
  { id: 5, name: "Black Widow", emoji: "🖤", image: blackWidowImg, isCorrect: false, failMessage: "This mission fails. Try another timeline." },
  { id: 6, name: "Doctor Strange", emoji: "🔮", isCorrect: false, failMessage: "I've seen this future… and it ends in defeat." },
  { id: 7, name: "Ant-Man", emoji: "🐜", isCorrect: false, failMessage: "Okay… that timeline got really weird really fast." },
  { id: 8, name: "Scarlet Witch", emoji: "❤️‍🔥", image: scarletWitchImg, isCorrect: false, failMessage: "This reality breaks… and everyone loses." },
];

const IRON_MAN: HeroData = { id: 9, name: "Iron Man", emoji: "🦾", isCorrect: true, failMessage: "" };

const ALL_HEROES = [...WRONG_HEROES, IRON_MAN];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface Props {
  onSolved: () => void;
  alreadySolved: boolean;
  onBack: () => void;
}

export default function MarvelPortalGrid({ onSolved, alreadySolved, onBack }: Props) {
  // Each grid slot has a heroId assigned. We shuffle which hero is behind which slot.
  // Opened slots are locked. Unopened slots get reshuffled periodically.
  // Iron Man is always placed in an unopened slot, ensuring he's the last one found.

  const [openedSlots, setOpenedSlots] = useState<Set<number>>(new Set(alreadySolved ? [0,1,2,3,4,5,6,7,8] : []));
  const [foundIronMan, setFoundIronMan] = useState(alreadySolved);
  
  // slotAssignment[slotIndex] = heroData
  const [slotAssignment, setSlotAssignment] = useState<HeroData[]>(() => {
    if (alreadySolved) return shuffleArray(ALL_HEROES);
    return shuffleArray(ALL_HEROES);
  });

  // Track which heroes have been revealed (by hero id)
  const [revealedHeroes, setRevealedHeroes] = useState<Map<number, HeroData>>(new Map());
  
  const shuffleUnopenedSlots = useCallback(() => {
    setSlotAssignment(prev => {
      const newAssignment = [...prev];
      // Collect unopened slot indices
      const unopenedIndices: number[] = [];
      for (let i = 0; i < 9; i++) {
        if (!openedSlots.has(i)) {
          unopenedIndices.push(i);
        }
      }
      if (unopenedIndices.length <= 1) return prev;
      
      // Collect heroes in unopened slots and shuffle them
      const unopenedHeroes = unopenedIndices.map(i => newAssignment[i]);
      const shuffled = shuffleArray(unopenedHeroes);
      
      // Reassign
      unopenedIndices.forEach((slotIdx, i) => {
        newAssignment[slotIdx] = shuffled[i];
      });
      
      return newAssignment;
    });
  }, [openedSlots]);

  // Periodic shuffle of unopened cards
  useEffect(() => {
    if (foundIronMan || alreadySolved) return;
    const interval = setInterval(() => {
      shuffleUnopenedSlots();
    }, 2000);
    return () => clearInterval(interval);
  }, [shuffleUnopenedSlots, foundIronMan, alreadySolved]);

  const handleOpen = (slotIndex: number) => {
    if (openedSlots.has(slotIndex) || foundIronMan) return;
    
    const hero = slotAssignment[slotIndex];
    
    // Count how many slots are currently unopened (including this one)
    const unopenedCount = 9 - openedSlots.size;
    
    if (unopenedCount <= 1) {
      // This is the last card — force Iron Man
      const newOpened = new Set(openedSlots);
      newOpened.add(slotIndex);
      setOpenedSlots(newOpened);
      
      // Override this slot with Iron Man
      setSlotAssignment(prev => {
        const copy = [...prev];
        copy[slotIndex] = IRON_MAN;
        return copy;
      });
      
      setFoundIronMan(true);
      setTimeout(() => onSolved(), 2000);
      return;
    }
    
    // If they randomly clicked on Iron Man but it's not the last card, swap him elsewhere
    let actualHero = hero;
    if (hero.isCorrect && unopenedCount > 1) {
      // Find another wrong hero to show instead, and move Iron Man to a different unopened slot
      setSlotAssignment(prev => {
        const copy = [...prev];
        // Find an unopened slot that isn't this one and has a wrong hero
        const otherUnopened = Array.from({ length: 9 }, (_, i) => i)
          .filter(i => i !== slotIndex && !openedSlots.has(i) && !copy[i].isCorrect);
        
        if (otherUnopened.length > 0) {
          const swapIdx = otherUnopened[Math.floor(Math.random() * otherUnopened.length)];
          // Swap Iron Man with the wrong hero
          [copy[slotIndex], copy[swapIdx]] = [copy[swapIdx], copy[slotIndex]];
          actualHero = copy[slotIndex];
        }
        return copy;
      });
      // We need to use the swapped hero - get a wrong hero that hasn't been revealed
      const revealedIds = new Set(revealedHeroes.keys());
      const availableWrong = WRONG_HEROES.filter(h => !revealedIds.has(h.id));
      if (availableWrong.length > 0) {
        actualHero = availableWrong[Math.floor(Math.random() * availableWrong.length)];
      }
    }
    
    const newOpened = new Set(openedSlots);
    newOpened.add(slotIndex);
    setOpenedSlots(newOpened);
    setRevealedHeroes(prev => new Map(prev).set(actualHero.id, actualHero));
  };

  const totalOpened = openedSlots.size;

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
          The timelines are shifting… find the one hero who saves the universe.
        </p>
      </motion.div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-muted-foreground font-body text-sm">Futures Explored:</span>
        <span
          className="font-body font-bold text-lg"
          style={{ color: "hsl(var(--marvel-gold))", textShadow: "0 0 10px hsl(var(--marvel-gold) / 0.5)" }}
        >
          {totalOpened} / 9
        </span>
      </div>

      {/* Portal Grid */}
      <LayoutGroup>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {slotAssignment.map((hero, slotIndex) => (
            <motion.div
              key={slotIndex}
              layout
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <MarvelPortalCard
                hero={hero}
                isOpened={openedSlots.has(slotIndex)}
                isCorrect={hero.isCorrect}
                foundIronMan={foundIronMan}
                index={slotIndex}
                onOpen={() => handleOpen(slotIndex)}
              />
            </motion.div>
          ))}
        </div>
      </LayoutGroup>
    </motion.div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import MarvelPortalCard from "./MarvelPortalCard";
import spidermanImg from "@/assets/heroes/spiderman.png";
import captainAmericaImg from "@/assets/heroes/captain_america.png";
import thorImg from "@/assets/heroes/thor.png";
import ironManImg from "@/assets/heroes/iron_man.png";
import blackWidowImg from "@/assets/heroes/black_widow.png";
import scarletWitchImg from "@/assets/heroes/scarlet_witch.png";
import hulkImg from "@/assets/heroes/hulk.png";
import doctorStrangeImg from "@/assets/heroes/doctor_strange.jpg";
import antManImg from "@/assets/heroes/ant_man.jpg";

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
  { id: 3, name: "Hulk", emoji: "💚", image: hulkImg, isCorrect: false, failMessage: "Hulk tried. Hulk still lose." },
  { id: 4, name: "Spider-Man", emoji: "🕷️", image: spidermanImg, isCorrect: false, failMessage: "Ms. Shivani… I don't think this timeline works." },
  { id: 5, name: "Black Widow", emoji: "🖤", image: blackWidowImg, isCorrect: false, failMessage: "This mission fails. Try another timeline." },
  { id: 6, name: "Doctor Strange", emoji: "🔮", image: doctorStrangeImg, isCorrect: false, failMessage: "I've seen this future… and it ends in defeat." },
  { id: 7, name: "Ant-Man", emoji: "🐜", image: antManImg, isCorrect: false, failMessage: "Okay… that timeline got really weird really fast." },
  { id: 8, name: "Scarlet Witch", emoji: "❤️‍🔥", image: scarletWitchImg, isCorrect: false, failMessage: "This reality breaks… and everyone loses." },
];

const IRON_MAN: HeroData = { id: 9, name: "Iron Man", emoji: "🦾", image: ironManImg, isCorrect: true, failMessage: "" };

const ALL_HEROES = [...WRONG_HEROES, IRON_MAN];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface CardSlot {
  cardId: number; // unique card identifier (matches hero id)
  hero: HeroData;
  isOpened: boolean;
}

interface Props {
  onSolved: () => void;
  alreadySolved: boolean;
  onBack: () => void;
}

export default function MarvelPortalGrid({ onSolved, alreadySolved, onBack }: Props) {
  const [cards, setCards] = useState<CardSlot[]>(() => {
    const shuffled = shuffleArray(ALL_HEROES);
    return shuffled.map(hero => ({
      cardId: hero.id,
      hero,
      isOpened: alreadySolved,
    }));
  });

  const [foundIronMan, setFoundIronMan] = useState(alreadySolved);
  const [showCenterReveal, setShowCenterReveal] = useState(false);

  // Shuffle only unopened cards' positions every 1.8s
  const shuffleUnopened = useCallback(() => {
    setCards(prev => {
      const openedCards: { index: number; card: CardSlot }[] = [];
      const unopenedCards: CardSlot[] = [];
      const unopenedIndices: number[] = [];

      prev.forEach((card, i) => {
        if (card.isOpened) {
          openedCards.push({ index: i, card });
        } else {
          unopenedCards.push(card);
          unopenedIndices.push(i);
        }
      });

      if (unopenedCards.length <= 1) return prev;

      const shuffled = shuffleArray(unopenedCards);
      const newCards = [...prev];
      unopenedIndices.forEach((originalIdx, i) => {
        newCards[originalIdx] = shuffled[i];
      });

      return newCards;
    });
  }, []);

  useEffect(() => {
    if (foundIronMan || alreadySolved) return;
    const interval = setInterval(shuffleUnopened, 1800);
    return () => clearInterval(interval);
  }, [shuffleUnopened, foundIronMan, alreadySolved]);

  const handleOpen = (index: number) => {
    const card = cards[index];
    if (card.isOpened || foundIronMan) return;

    const unopenedCount = cards.filter(c => !c.isOpened).length;

    setCards(prev => {
      const newCards = [...prev];

      if (unopenedCount <= 1) {
        // Last card — force Iron Man
        newCards[index] = { ...newCards[index], hero: IRON_MAN, cardId: IRON_MAN.id, isOpened: true };
        return newCards;
      }

      // If this happens to be Iron Man but it's not the last, swap him with a random unopened wrong hero
      if (newCards[index].hero.isCorrect) {
        const otherUnopened = newCards
          .map((c, i) => ({ c, i }))
          .filter(({ c, i }) => i !== index && !c.isOpened && !c.hero.isCorrect);

        if (otherUnopened.length > 0) {
          const swap = otherUnopened[Math.floor(Math.random() * otherUnopened.length)];
          const temp = newCards[index];
          newCards[index] = { ...swap.c };
          newCards[swap.i] = { ...temp };
        }
      }

      newCards[index] = { ...newCards[index], isOpened: true };
      return newCards;
    });

    if (unopenedCount <= 1) {
      setFoundIronMan(true);
      // 3s delay for reading the card, then show center reveal
      setTimeout(() => setShowCenterReveal(true), 3000);
      setTimeout(() => onSolved(), 7000);
    }
  };

  const totalOpened = cards.filter(c => c.isOpened).length;
  const ironManIndex = foundIronMan ? cards.findIndex(c => c.hero.isCorrect) : -1;

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
        animate={{ opacity: foundIronMan ? 0 : 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Multiverse
      </motion.button>

      {/* Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: foundIronMan ? 0 : 1, y: foundIronMan ? -30 : 0 }}
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
          The timelines are shifting… catch the right one before it slips away.
        </p>
      </motion.div>

      {/* Progress */}
      <motion.div
        className="flex items-center justify-center gap-2 mb-6"
        animate={{ opacity: foundIronMan ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-muted-foreground font-body text-sm">Futures Explored:</span>
        <span
          className="font-body font-bold text-lg"
          style={{ color: "hsl(var(--marvel-gold))", textShadow: "0 0 10px hsl(var(--marvel-gold) / 0.5)" }}
        >
          {totalOpened} / 9
        </span>
      </motion.div>

      {/* Portal Grid */}
      <LayoutGroup>
        <div className={`grid grid-cols-3 gap-3 sm:gap-5 mb-8 ${foundIronMan ? "relative" : ""}`}>
          {cards.map((card, index) => {
            const isTheIronMan = index === ironManIndex;

            // Hide Iron Man from grid once center reveal starts
            if (isTheIronMan && showCenterReveal) {
              return (
                <motion.div
                  key={`iron-hidden-${index}`}
                  animate={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5 }}
                />
              );
            }

            if (foundIronMan && !isTheIronMan) {
              return (
                <motion.div
                  key={`fading-${index}`}
                  animate={{ opacity: 0, scale: 0.3 }}
                  transition={{ duration: 0.8, delay: showCenterReveal ? 0 : 0.2 }}
                  className="pointer-events-none"
                >
                  <MarvelPortalCard
                    hero={card.hero}
                    isOpened={card.isOpened}
                    isCorrect={card.hero.isCorrect}
                    foundIronMan={foundIronMan}
                    index={index}
                    onOpen={() => {}}
                  />
                </motion.div>
              );
            }

            return (
              <motion.div
                key={card.isOpened ? `opened-${index}` : `card-${card.cardId}`}
                layoutId={card.isOpened ? undefined : `portal-${card.cardId}`}
                layout
                transition={{ type: "spring", stiffness: 200, damping: 22, mass: 0.8 }}
              >
                <MarvelPortalCard
                  hero={card.hero}
                  isOpened={card.isOpened}
                  isCorrect={card.hero.isCorrect}
                  foundIronMan={foundIronMan}
                  index={index}
                  onOpen={() => handleOpen(index)}
                />
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>

      {/* Iron Man center reveal overlay */}
      {showCenterReveal && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Glow backdrop */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            style={{
              background: "radial-gradient(circle, hsl(var(--marvel-gold) / 0.15) 0%, transparent 70%)",
            }}
          />

          {/* Iron Man card */}
          <motion.div
            className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full flex flex-col items-center justify-center overflow-hidden"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 150, damping: 15 }}
            style={{
              background: "radial-gradient(circle, hsl(40 90% 55% / 0.3), hsl(0 80% 50% / 0.15), hsl(var(--card) / 0.9))",
              border: "3px solid hsl(var(--marvel-gold) / 0.8)",
              boxShadow: "0 0 60px hsl(var(--marvel-gold) / 0.5), 0 0 120px hsl(var(--marvel-gold) / 0.3)",
            }}
          >
            <motion.div
              className="absolute -inset-2 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 30px hsl(var(--marvel-gold) / 0.4)",
                  "0 0 80px hsl(var(--marvel-gold) / 0.7)",
                  "0 0 30px hsl(var(--marvel-gold) / 0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ border: "2px solid hsl(var(--marvel-gold) / 0.5)" }}
            />
            {IRON_MAN.image && (
              <img src={IRON_MAN.image} alt="Iron Man" className="w-20 h-20 sm:w-28 sm:h-28 object-contain" />
            )}
            <span
              className="font-body text-sm sm:text-base font-bold mt-1"
              style={{ color: "hsl(var(--marvel-gold))", textShadow: "0 0 15px hsl(var(--marvel-gold) / 0.6)" }}
            >
              Iron Man
            </span>
            <span
              className="font-body text-[10px] sm:text-sm italic font-semibold px-3 text-center leading-tight"
              style={{ color: "hsl(var(--marvel-gold))", textShadow: "0 0 10px hsl(var(--marvel-gold) / 0.5)" }}
            >
              "Sometimes you gotta run before you can walk."
            </span>
          </motion.div>

          {/* Victory text */}
          <motion.p
            className="font-display text-lg sm:text-2xl font-bold mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            style={{ color: "hsl(var(--marvel-gold))", textShadow: "0 0 20px hsl(var(--marvel-gold) / 0.5)" }}
          >
            This is the one future where we win.
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}

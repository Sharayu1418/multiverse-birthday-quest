import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, RotateCcw } from "lucide-react";
import { useGameProgress } from "@/hooks/useGameProgress";
import MapParchment from "./MapParchment";
import { useToast } from "@/hooks/use-toast";

const TARGET_PHRASE = "i solemnly swear that i am up to no good";
const PASSWORD = "PORTRAIT";

const MAZE = [
  "11111111111111111111111111111",
  "1S001111100000000011111111111",
  "10101111101110111111111111111",
  "10100010001110111111111111111",
  "10101010101110111111111111111",
  "11101000101110000011111111111",
  "11100101101110101111111111111",
  "11100101101110100010001111111",
  "11111111111110111010101111111",
  "11111111111110111000101111111",
  "11111111111111111010101111111",
  "11111111111111111010100000111",
  "11111111111111111010101011111",
  "111111111111111110100010000E1",
  "11111111111111111111111111111",
];

const START_POS = { x: 1, y: 1 };
const END_POS = { x: 27, y: 13 };
const ROWS = MAZE.length;
const COLS = MAZE[0].length;

type Position = { x: number; y: number };
type Enemy = { id: string; name: string; path: Position[]; speed: number };

// Letters scattered on valid path cells along/near the solution path
const LETTER_POSITIONS: { letter: string; x: number; y: number }[] = [
  { letter: "P", x: 1, y: 3 },
  { letter: "O", x: 12, y: 1 },
  { letter: "R", x: 7, y: 5 },
  { letter: "T", x: 5, y: 3 },
  { letter: "R", x: 15, y: 7 },
  { letter: "A", x: 19, y: 9 },
  { letter: "I", x: 24, y: 11 },
  { letter: "T", x: 17, y: 13 },
];

const INITIAL_ENEMIES: Enemy[] = [
  {
    id: "norris", name: "Mrs. Norris",
    path: [{x:10,y:1},{x:11,y:1},{x:12,y:1},{x:13,y:1},{x:14,y:1},{x:15,y:1},{x:16,y:1}],
    speed: 300
  },
  {
    id: "filch", name: "Argus Filch",
    path: [{x:13,y:5},{x:14,y:5},{x:15,y:5},{x:16,y:5},{x:17,y:5}],
    speed: 400
  },
  {
    id: "snape", name: "Severus Snape",
    path: [{x:19,y:13},{x:20,y:13},{x:21,y:13}],
    speed: 350
  }
];

export default function MaraudersMapMaze() {
  const navigate = useNavigate();
  const { markSolved, isSolved } = useGameProgress();
  const alreadySolved = isSolved("potter");
  const { toast } = useToast();

  const [phase, setPhase] = useState<"video" | "locked" | "playing" | "unscramble" | "caught" | "won">(alreadySolved ? "won" : "video");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [typedPhrase, setTypedPhrase] = useState("");
  const [playerPos, setPlayerPos] = useState<Position>(START_POS);
  const [collectedLetters, setCollectedLetters] = useState<string[]>([]);
  const [remainingLetters, setRemainingLetters] = useState(LETTER_POSITIONS.map(l => l.letter));
  const [collectedPositions, setCollectedPositions] = useState<Set<string>>(new Set());

  // Unscramble state
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [availablePool, setAvailablePool] = useState<string[]>([]);

  const [enemyStates, setEnemyStates] = useState(INITIAL_ENEMIES.map(e => ({
    ...e, currentIdx: 0, direction: 1
  })));

  // Check letter collection when player moves
  useEffect(() => {
    if (phase !== "playing") return;
    const key = `${playerPos.x},${playerPos.y}`;
    if (collectedPositions.has(key)) return;

    const letterHere = LETTER_POSITIONS.find(l => l.x === playerPos.x && l.y === playerPos.y);
    if (letterHere) {
      setCollectedLetters(prev => [...prev, letterHere.letter]);
      setCollectedPositions(prev => new Set(prev).add(key));
      setRemainingLetters(prev => {
        const idx = prev.indexOf(letterHere.letter);
        if (idx >= 0) { const n = [...prev]; n.splice(idx, 1); return n; }
        return prev;
      });
      toast({
        title: `✨ Mystery letter collected!`,
        description: `${collectedLetters.length + 1} of ${LETTER_POSITIONS.length} found — the password will be revealed at the door`,
        duration: 2000,
      });
    }
  }, [playerPos, phase, collectedPositions, collectedLetters.length, toast]);

  // Handle typing to unlock
  useEffect(() => {
    if (phase !== "locked") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName.toLowerCase() === "input") return;
      if (e.key.length > 1 && e.key !== "Backspace") return;
      setTypedPhrase((prev) => {
        let next = e.key === "Backspace" ? prev.slice(0, -1) : (prev + e.key).toLowerCase();
        if (next.length > 200) next = next.slice(-200);
        if (next.includes(TARGET_PHRASE)) {
          setTimeout(() => setPhase("playing"), 1000);
          toast({ title: "The map reveals itself...", description: "Collect the scattered letters and reach the Gryffindor Common Room!", duration: 4000 });
        }
        return next;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, toast]);

  // Player movement
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (phase !== "playing") return;
    setPlayerPos(prev => {
      const nx = prev.x + dx, ny = prev.y + dy;
      if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && MAZE[ny][nx] !== "1") return { x: nx, y: ny };
      return prev;
    });
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp": case "w": case "W": movePlayer(0, -1); break;
        case "ArrowDown": case "s": case "S": movePlayer(0, 1); break;
        case "ArrowLeft": case "a": case "A": movePlayer(-1, 0); break;
        case "ArrowRight": case "d": case "D": movePlayer(1, 0); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, movePlayer]);

  // Enemy movement
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      setEnemyStates(current =>
        current.map(enemy => {
          let nextIdx = enemy.currentIdx + enemy.direction;
          let nextDir = enemy.direction;
          if (nextIdx >= enemy.path.length) { nextDir = -1; nextIdx = enemy.path.length - 2; }
          else if (nextIdx < 0) { nextDir = 1; nextIdx = 1; }
          if (enemy.path.length <= 1) nextIdx = 0;
          return { ...enemy, currentIdx: Math.max(0, nextIdx), direction: nextDir };
        })
      );
    }, 800);
    return () => clearInterval(interval);
  }, [phase]);

  // Collision & reaching E
  useEffect(() => {
    if (phase !== "playing") return;
    if (playerPos.x === END_POS.x && playerPos.y === END_POS.y) {
      if (collectedLetters.length < LETTER_POSITIONS.length) {
        toast({ title: "🔒 Door is locked!", description: `Collect all ${LETTER_POSITIONS.length} letters first! (${collectedLetters.length}/${LETTER_POSITIONS.length})`, duration: 3000 });
        setPlayerPos({ x: END_POS.x - 1, y: END_POS.y }); // push back
      } else {
        // Shuffle letters for unscramble
        const shuffled = [...collectedLetters].sort(() => Math.random() - 0.5);
        setAvailablePool(shuffled);
        setSelectedOrder([]);
        setPhase("unscramble");
      }
      return;
    }
    const isCaught = enemyStates.some(enemy => {
      const pos = enemy.path[enemy.currentIdx];
      return pos.x === playerPos.x && pos.y === playerPos.y;
    });
    if (isCaught) setPhase("caught");
  }, [playerPos, enemyStates, phase, collectedLetters, toast]);

  const resetMaze = () => {
    setPlayerPos(START_POS);
    setCollectedLetters([]);
    setCollectedPositions(new Set());
    setRemainingLetters(LETTER_POSITIONS.map(l => l.letter));
    setPhase("playing");
  };

  // Unscramble handlers
  const handleSelectLetter = (letter: string, idx: number) => {
    setSelectedOrder(prev => [...prev, letter]);
    setAvailablePool(prev => { const n = [...prev]; n.splice(idx, 1); return n; });
  };

  const handleUndoLetter = () => {
    if (selectedOrder.length === 0) return;
    const last = selectedOrder[selectedOrder.length - 1];
    setSelectedOrder(prev => prev.slice(0, -1));
    setAvailablePool(prev => [...prev, last]);
  };

  const handleSubmitPassword = () => {
    if (selectedOrder.join("") === PASSWORD) {
      setPhase("won");
      markSolved("potter");
    } else {
      toast({ title: "Wrong password!", description: "Try again — rearrange the letters to form the correct word.", duration: 3000 });
      setAvailablePool([...selectedOrder, ...availablePool].sort(() => Math.random() - 0.5));
      setSelectedOrder([]);
    }
  };

  return (
    <MapParchment isRevealed={phase !== "locked"}>
      {/* Back button */}
      <motion.button
        onClick={() => navigate("/hub")}
        className="fixed top-6 left-6 flex items-center gap-2 text-[#3e2723] hover:text-[#2a1714] transition-colors font-body cursor-pointer z-30"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </motion.button>

      <AnimatePresence mode="wait">
        {/* Intro Video Phase */}
        {phase === "video" && (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center"
          >
            <iframe
              ref={iframeRef}
              src="https://streamable.com/e/01zydq?autoplay=1"
              frameBorder="0"
              allowFullScreen
              allow="autoplay"
              className="absolute inset-0 w-full h-full"
            />
            <motion.button
              onClick={() => setPhase("locked")}
              className="absolute bottom-8 right-8 px-6 py-3 bg-[#d4af37]/80 text-[#3e2723] rounded-full font-display text-sm hover:bg-[#d4af37] transition-colors cursor-pointer border border-[#b8860b] z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
            >
              Skip to Map →
            </motion.button>
          </motion.div>
        )}

        {phase === "locked" && (
          <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center space-y-8">
            <h2 className="text-3xl lg:text-5xl font-display uppercase tracking-widest text-[#3e2723] text-center border-b-2 border-[#3e2723] pb-4">
              Moony, Wormtail, Padfoot, and Prongs
            </h2>
            <p className="text-xl lg:text-2xl font-display italic text-[#5c3e37] text-center mb-8">
              Purveyors of Aids to Magical Mischief-Makers<br/>are proud to present
            </p>
            <div className="w-full max-w-2xl bg-[#3e2723]/10 p-6 rounded text-center border border-[#3e2723]/30 min-h-[140px] flex items-center justify-center">
              {typedPhrase === "" ? (
                <span className="text-xl text-[#3e2723]/50 animate-pulse font-serif">Speak the words (type) to reveal our secrets...</span>
              ) : (
                <span className="text-2xl lg:text-4xl font-serif text-[#3e2723] tracking-wide" style={{ fontFamily: "'Brush Script MT', cursive, serif" }}>
                  {typedPhrase}<span className="animate-pulse">_</span>
                </span>
              )}
            </div>
            <input type="text" className="opacity-0 absolute top-0 w-1 h-1" value={typedPhrase}
              onChange={(e) => {
                const val = e.target.value.toLowerCase();
                setTypedPhrase(val);
                if (val.includes(TARGET_PHRASE)) {
                  setTimeout(() => setPhase("playing"), 1000);
                  toast({ title: "The map reveals itself...", description: "Collect the scattered letters!", duration: 3000 });
                }
              }}
              autoFocus placeholder="Type here"
            />
          </motion.div>
        )}

        {(phase === "playing" || phase === "caught") && (
          <motion.div key="maze" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex flex-col items-center justify-center w-full">
            <div className="text-center mb-4">
              <p className="text-sm font-display italic text-[#5c3e37] tracking-wide mb-1" style={{ fontFamily: "'Cinzel Decorative', serif" }}>Messrs Moony, Wormtail, Padfoot & Prongs present</p>
              <h3 className="text-4xl lg:text-5xl font-display text-[#3e2723] mb-1" style={{ fontFamily: "'Cinzel Decorative', serif", letterSpacing: '0.15em', textShadow: '1px 1px 2px rgba(62, 39, 35, 0.3)' }}>Shivani</h3>
              <p className="text-xs font-display text-[#5c3e37]/60 tracking-[0.3em] uppercase">The Marauder's Map</p>
            </div>

            {/* Letter Collection Bar */}
            <div className="flex items-center gap-2 mb-4 bg-[#3e2723]/10 px-4 py-2 rounded-lg border border-[#3e2723]/30">
              <span className="text-sm font-display text-[#3e2723]/70">Letters:</span>
              {LETTER_POSITIONS.map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded flex items-center justify-center font-display font-bold text-lg border-2 transition-all ${
                  i < collectedLetters.length
                    ? "bg-[#d4af37] text-[#3e2723] border-[#b8860b] shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                    : "bg-[#3e2723]/20 text-[#3e2723]/30 border-[#3e2723]/20"
                }`}>
                  {i < collectedLetters.length ? "✦" : "?"}
                </div>
              ))}
              <span className="text-xs font-display text-[#3e2723]/50 ml-2">({collectedLetters.length}/{LETTER_POSITIONS.length})</span>
            </div>

            {/* Maze Grid */}
            <div className="relative bg-[#2a1b18] border-4 border-[#3e2723] p-3 rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
              style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, width: "min(100%, 800px)", aspectRatio: `${COLS} / ${ROWS}` }}>
              {MAZE.map((row, y) => row.split("").map((cell, x) => (
                <div key={`${x}-${y}`} className={`w-full h-full ${
                  cell === "1" ? "bg-[#3e2723]/80"
                  : cell === "E" ? "bg-red-900/40 border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                  : "bg-[#e8cd9c]/90 rounded-sm"
                }`} />
              )))}

              {/* Uncollected Letters on the Map */}
              {LETTER_POSITIONS.map((lp) => {
                const key = `${lp.x},${lp.y}`;
                if (collectedPositions.has(key)) return null;
                return (
                  <motion.div key={key}
                    className="absolute flex items-center justify-center z-15 pointer-events-none"
                    style={{ width: `${100/COLS}%`, height: `${100/ROWS}%`, left: `${(lp.x / COLS) * 100}%`, top: `${(lp.y / ROWS) * 100}%` }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                  <span className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #d4af37, #f3e5ab)", color: "#3e2723", boxShadow: "0 0 8px rgba(212, 175, 55, 0.7)", fontSize: "12px" }}>
                      ✦
                    </span>
                  </motion.div>
                );
              })}

              {/* Player Avatar */}
              <motion.div className="absolute text-2xl flex flex-col items-center justify-center z-20 drop-shadow-md"
                style={{ width: `${100/COLS}%`, height: `${100/ROWS}%`, left: `${(playerPos.x / COLS) * 100}%`, top: `${(playerPos.y / ROWS) * 100}%` }}
                animate={{ left: `${(playerPos.x / COLS) * 100}%`, top: `${(playerPos.y / ROWS) * 100}%` }}
              >👩🏻‍🎓</motion.div>

              {/* Enemies */}
              {enemyStates.map(enemy => {
                const pos = enemy.path[enemy.currentIdx];
                return (
                  <motion.div key={enemy.id} className="absolute text-2xl flex items-center justify-center z-10 drop-shadow-md bg-transparent"
                    style={{ width: `${100/COLS}%`, height: `${100/ROWS}%`, left: `${(pos.x / COLS) * 100}%`, top: `${(pos.y / ROWS) * 100}%` }}
                    animate={{ left: `${(pos.x / COLS) * 100}%`, top: `${(pos.y / ROWS) * 100}%` }}
                    transition={{ type: "tween", ease: "linear", duration: 0.8 }}
                  >{enemy.id === "norris" ? "🐈‍⬛" : "🕴️"}</motion.div>
                );
              })}
            </div>

            {/* Mobile Controls */}
            <div className="mt-6 grid grid-cols-3 gap-2 lg:hidden">
              <div />
              <button className="bg-[#3e2723]/20 p-3 rounded-lg active:bg-[#3e2723]/40 border border-[#3e2723]" onClick={() => movePlayer(0, -1)}><ArrowUp className="w-5 h-5 text-[#3e2723]" /></button>
              <div />
              <button className="bg-[#3e2723]/20 p-3 rounded-lg active:bg-[#3e2723]/40 border border-[#3e2723]" onClick={() => movePlayer(-1, 0)}><ArrowLeft className="w-5 h-5 text-[#3e2723]" /></button>
              <button className="bg-[#3e2723]/20 p-3 rounded-lg active:bg-[#3e2723]/40 border border-[#3e2723]" onClick={() => movePlayer(0, 1)}><ArrowDown className="w-5 h-5 text-[#3e2723]" /></button>
              <button className="bg-[#3e2723]/20 p-3 rounded-lg active:bg-[#3e2723]/40 border border-[#3e2723]" onClick={() => movePlayer(1, 0)}><ArrowRight className="w-5 h-5 text-[#3e2723]" /></button>
            </div>

            <p className="mt-3 text-[#3e2723]/70 font-display text-sm text-center">
              Collect all <b>golden letters</b> ✨ then reach the Gryffindor Common Room 🏰<br/>
              Use Arrow Keys, WASD, or On-Screen buttons
            </p>
          </motion.div>
        )}

        {/* Unscramble Phase */}
        {phase === "unscramble" && (
          <motion.div key="unscramble" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center space-y-6 p-4">
            <h2 className="text-3xl lg:text-4xl font-display text-[#3e2723] text-center" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
              The Fat Lady asks...
            </h2>
            <p className="text-lg font-display italic text-[#5c3e37] text-center">
              "Unscramble the letters to speak the password!"
            </p>

            {/* Selected letters (answer) */}
            <div className="flex gap-2 min-h-[60px] items-center justify-center bg-[#3e2723]/10 px-6 py-3 rounded-xl border-2 border-[#3e2723]/30 min-w-[300px]">
              {PASSWORD.split("").map((_, i) => (
                <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-xl border-2 transition-all ${
                  i < selectedOrder.length
                    ? "bg-[#d4af37] text-[#3e2723] border-[#b8860b] shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                    : "bg-[#3e2723]/10 text-[#3e2723]/20 border-dashed border-[#3e2723]/30"
                }`}>
                  {i < selectedOrder.length ? selectedOrder[i] : "_"}
                </div>
              ))}
            </div>

            {/* Available letters pool */}
            <div className="flex gap-3 flex-wrap justify-center">
              {availablePool.map((letter, idx) => (
                <motion.button key={`${letter}-${idx}`}
                  onClick={() => handleSelectLetter(letter, idx)}
                  className="w-12 h-12 rounded-lg font-display font-bold text-xl border-2 border-[#3e2723] bg-[#e8cd9c] text-[#3e2723] hover:bg-[#d4af37] hover:scale-110 transition-all cursor-pointer shadow-md"
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                >{letter}</motion.button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button onClick={handleUndoLetter}
                className="flex items-center gap-2 bg-[#3e2723]/20 text-[#3e2723] px-6 py-3 rounded-full font-display hover:bg-[#3e2723]/30 transition-colors border border-[#3e2723]/30">
                <RotateCcw className="w-4 h-4" /> Undo
              </button>
              {selectedOrder.length === PASSWORD.length && (
                <motion.button onClick={handleSubmitPassword}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="bg-[#740001] text-[#d4af37] px-8 py-3 rounded-full font-display font-bold text-lg hover:bg-[#8B0000] transition-colors shadow-xl border-2 border-[#d4af37]">
                  Speak Password ✨
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Caught Overlay */}
      <AnimatePresence>
        {phase === "caught" && (
          <motion.div initial={{ opacity: 0, backgroundColor: "rgba(139, 0, 0, 0)" }} animate={{ opacity: 1, backgroundColor: "rgba(139, 0, 0, 0.4)" }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
            <motion.h2 initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="text-4xl lg:text-6xl font-display font-bold text-red-900 mb-6 drop-shadow-lg bg-red-100/80 px-8 py-4 rounded-xl border-4 border-red-900">CAUGHT!</motion.h2>
            <button onClick={resetMaze} className="flex items-center gap-2 bg-[#3e2723] text-[#e8cd9c] px-8 py-4 rounded-full font-display text-xl hover:bg-[#2a1714] transition-colors shadow-xl">
              <RotateCcw className="w-6 h-6" /> Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Won Overlay */}
      <AnimatePresence>
        {phase === "won" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#e8cd9c]/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="text-center space-y-6 bg-white/50 p-12 rounded-2xl border-2 border-[#3e2723] shadow-2xl">
              <h2 className="text-4xl lg:text-6xl font-display font-bold text-[#3e2723] mb-2" style={{ fontFamily: "'Brush Script MT', cursive, serif" }}>Mischief Managed!</h2>
              <p className="text-xl text-[#3e2723]/80 font-display">The Fat Lady swings open. Welcome to the Gryffindor Common Room!</p>
              <motion.div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center my-8"
                style={{ background: "linear-gradient(135deg, #d4af37, #f3e5ab)", boxShadow: "0 0 30px rgba(212, 175, 55, 0.6)" }}
                initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", delay: 0.5 }}>
                <span className="text-4xl">⚡</span>
              </motion.div>
              <button onClick={() => navigate("/hub")} className="bg-[#3e2723] text-[#e8cd9c] px-8 py-4 rounded-full font-display text-xl hover:bg-[#2a1714] transition-colors shadow-xl">Return to Hub</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MapParchment>
  );
}

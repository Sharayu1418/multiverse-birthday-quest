import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Droplets, ShieldCheck, Waves, Zap } from "lucide-react";
import { useGameProgress } from "@/hooks/useGameProgress";
import percyHero from "@/assets/hub/percy-jackson.webp";

type PercyPhase = "intro" | "puzzle" | "won";
type Dir = "N" | "E" | "S" | "W";

type CellType =
  | "rock"
  | "source"
  | "seal"
  | "gate_straight"
  | "gate_corner"
  | "gate_tee"
  | "gate_cross"
  | "oneway"
  | "whirlpool_in"
  | "whirlpool_out";

interface Cell {
  type: CellType;
  orientation: number;
  rotatable: boolean;
  sealId?: "A" | "B" | "C";
  teleportTo?: { x: number; y: number };
}

interface FlowState {
  activeCells: Set<string>;
  poweredSeals: Set<"A" | "B" | "C">;
}

interface GateGuide {
  key: string;
  x: number;
  y: number;
  target: number;
}

const BOARD_ROWS = 6;
const BOARD_COLS = 8;
const MAX_MOVES = 28;
const TOTAL_SEALS = 3;

const DIR_ORDER: Dir[] = ["N", "E", "S", "W"];
const DELTA: Record<Dir, { x: number; y: number }> = {
  N: { x: 0, y: -1 },
  E: { x: 1, y: 0 },
  S: { x: 0, y: 1 },
  W: { x: -1, y: 0 },
};
const OPPOSITE: Record<Dir, Dir> = { N: "S", E: "W", S: "N", W: "E" };

const SEA_PARTICLES = [
  { left: 7, top: 18, delay: 0.1, duration: 5.8 },
  { left: 15, top: 63, delay: 1.4, duration: 6.3 },
  { left: 26, top: 44, delay: 0.8, duration: 5.4 },
  { left: 39, top: 21, delay: 1.9, duration: 6.9 },
  { left: 51, top: 57, delay: 1.1, duration: 6.2 },
  { left: 64, top: 33, delay: 2.6, duration: 5.7 },
  { left: 76, top: 72, delay: 0.7, duration: 6.4 },
  { left: 88, top: 39, delay: 2.2, duration: 6.1 },
];

const LIGHTNING_STREAKS = [
  { left: 11, top: 8, delay: 0.3, duration: 4.6 },
  { left: 36, top: 12, delay: 2.4, duration: 5.2 },
  { left: 67, top: 7, delay: 1.1, duration: 4.9 },
  { left: 88, top: 16, delay: 3.1, duration: 5.4 },
];

const TARGET_ORIENTATIONS: Record<string, number> = {
  "1,2": 0,
  "2,1": 1,
  "6,0": 0,
  "3,2": 0,
  "5,2": 0,
  "6,2": 0,
  "2,3": 1,
  "2,4": 0,
  "3,4": 0,
  "4,4": 2,
  "4,5": 0,
  "5,5": 0,
  "6,5": 0,
};

const GATE_HINT_ORDER = [
  "1,2",
  "2,1",
  "3,2",
  "6,2",
  "2,3",
  "2,4",
  "4,4",
  "4,5",
  "6,5",
  "6,0",
  "5,2",
  "3,4",
  "5,5",
];

const cellKey = (x: number, y: number) => `${x},${y}`;

function parseCellKey(key: string) {
  const [xStr, yStr] = key.split(",");
  return { x: Number(xStr), y: Number(yStr) };
}

function inBounds(x: number, y: number) {
  return x >= 0 && x < BOARD_COLS && y >= 0 && y < BOARD_ROWS;
}

function createRockCell(): Cell {
  return { type: "rock", orientation: 0, rotatable: false };
}

function createInitialBoard(): Cell[][] {
  const board = Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLS }, () => createRockCell())
  );

  const place = (x: number, y: number, cell: Cell) => {
    board[y][x] = cell;
  };

  place(0, 2, { type: "source", orientation: 1, rotatable: false });

  place(7, 0, { type: "seal", orientation: 3, rotatable: false, sealId: "A" });
  place(7, 2, { type: "seal", orientation: 3, rotatable: false, sealId: "B" });
  place(7, 5, { type: "seal", orientation: 3, rotatable: false, sealId: "C" });

  // Core split at the center: upper, mid, and lower channels
  place(1, 2, { type: "gate_straight", orientation: 1, rotatable: true });
  place(2, 2, { type: "gate_cross", orientation: 0, rotatable: false });

  // Upper route (includes a whirlpool relay and one one-way current)
  place(2, 1, { type: "gate_corner", orientation: 0, rotatable: true });
  place(3, 1, { type: "oneway", orientation: 1, rotatable: false });
  place(4, 1, { type: "whirlpool_in", orientation: 0, rotatable: false, teleportTo: { x: 5, y: 0 } });
  place(5, 0, { type: "whirlpool_out", orientation: 0, rotatable: false });
  place(6, 0, { type: "gate_straight", orientation: 1, rotatable: true });

  // Mid route
  place(3, 2, { type: "gate_straight", orientation: 1, rotatable: true });
  place(4, 2, { type: "oneway", orientation: 1, rotatable: false });
  place(5, 2, { type: "gate_straight", orientation: 0, rotatable: true });
  place(6, 2, { type: "gate_straight", orientation: 1, rotatable: true });

  // Lower route
  place(2, 3, { type: "gate_straight", orientation: 0, rotatable: true });
  place(2, 4, { type: "gate_corner", orientation: 1, rotatable: true });
  place(3, 4, { type: "gate_straight", orientation: 0, rotatable: true });
  place(4, 4, { type: "gate_corner", orientation: 1, rotatable: true });
  place(4, 5, { type: "gate_corner", orientation: 3, rotatable: true });
  place(5, 5, { type: "gate_straight", orientation: 0, rotatable: true });
  place(6, 5, { type: "gate_straight", orientation: 1, rotatable: true });

  return board;
}

function connectorsForCell(cell: Cell): Dir[] {
  switch (cell.type) {
    case "gate_straight":
      return cell.orientation % 2 === 0 ? ["E", "W"] : ["N", "S"];
    case "gate_corner":
      return [
        ["N", "E"],
        ["E", "S"],
        ["S", "W"],
        ["W", "N"],
      ][cell.orientation % 4] as Dir[];
    case "gate_tee":
      return [
        ["N", "E", "W"],
        ["N", "E", "S"],
        ["E", "S", "W"],
        ["N", "S", "W"],
      ][cell.orientation % 4] as Dir[];
    case "gate_cross":
      return ["N", "E", "S", "W"];
    case "source":
      return [DIR_ORDER[cell.orientation % 4]];
    case "seal":
      return [DIR_ORDER[cell.orientation % 4]];
    case "whirlpool_out":
      return ["E", "W"];
    default:
      return [];
  }
}

function simulateFlow(board: Cell[][]): FlowState {
  const activeCells = new Set<string>();
  const poweredSeals = new Set<"A" | "B" | "C">();

  const queue: Array<{ x: number; y: number; from: Dir }> = [];
  const visited = new Set<string>();

  const pushNeighbor = (x: number, y: number, through: Dir) => {
    const dx = DELTA[through].x;
    const dy = DELTA[through].y;
    const nx = x + dx;
    const ny = y + dy;
    if (!inBounds(nx, ny)) return;
    queue.push({ x: nx, y: ny, from: OPPOSITE[through] });
  };

  for (let y = 0; y < BOARD_ROWS; y++) {
    for (let x = 0; x < BOARD_COLS; x++) {
      const cell = board[y][x];
      if (cell.type !== "source") continue;
      activeCells.add(cellKey(x, y));
      const outputs = connectorsForCell(cell);
      outputs.forEach((dir) => pushNeighbor(x, y, dir));
    }
  }

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const { x, y, from } = current;
    const stateKey = `${x},${y},${from}`;
    if (visited.has(stateKey)) continue;
    visited.add(stateKey);

    const cell = board[y][x];
    if (cell.type === "rock") continue;

    activeCells.add(cellKey(x, y));

    if (cell.type === "seal") {
      const requiredEntry = DIR_ORDER[cell.orientation % 4];
      if (from === requiredEntry && cell.sealId) poweredSeals.add(cell.sealId);
      continue;
    }

    if (cell.type === "oneway") {
      const outDir = DIR_ORDER[cell.orientation % 4];
      if (from !== OPPOSITE[outDir]) continue;
      pushNeighbor(x, y, outDir);
      continue;
    }

    if (cell.type === "whirlpool_in") {
      if (!cell.teleportTo) continue;
      const tx = cell.teleportTo.x;
      const ty = cell.teleportTo.y;
      if (!inBounds(tx, ty)) continue;
      activeCells.add(cellKey(tx, ty));
      queue.push({ x: tx, y: ty, from });
      continue;
    }

    const connectors = connectorsForCell(cell);
    if (!connectors.includes(from)) continue;

    connectors
      .filter((dir) => dir !== from)
      .forEach((dir) => pushNeighbor(x, y, dir));
  }

  return { activeCells, poweredSeals };
}

function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function getNextMisalignedGate(board: Cell[][]): GateGuide | null {
  for (const key of GATE_HINT_ORDER) {
    const target = TARGET_ORIENTATIONS[key];
    if (target === undefined) continue;

    const { x, y } = parseCellKey(key);
    if (!inBounds(x, y)) continue;

    const cell = board[y][x];
    if (!cell.rotatable) continue;
    if (cell.orientation === target) continue;

    return { key, x, y, target };
  }
  return null;
}

function createTonePlayer(audioRef: { current: AudioContext | null }) {
  return (kind: "correct" | "incorrect" | "seal") => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;

    if (!audioRef.current) {
      audioRef.current = new Ctx();
    }

    const audio = audioRef.current;
    if (audio.state === "suspended") {
      void audio.resume();
    }

    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const filter = audio.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    filter.type = "lowpass";

    if (kind === "correct") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.12);
      filter.frequency.setValueAtTime(1600, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.2);
      return;
    }

    if (kind === "seal") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.linearRampToValueAtTime(710, now + 0.18);
      filter.frequency.setValueAtTime(1800, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.065, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      osc.start(now);
      osc.stop(now + 0.26);
      return;
    }

    osc.type = "square";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
    filter.frequency.setValueAtTime(780, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.03, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    osc.start(now);
    osc.stop(now + 0.18);
  };
}

export default function PercyPuzzlePage() {
  const navigate = useNavigate();
  const { markSolved, isSolved } = useGameProgress();
  const alreadySolved = isSolved("percy");

  const [phase, setPhase] = useState<PercyPhase>(alreadySolved ? "won" : "intro");
  const [board, setBoard] = useState<Cell[][]>(() => createInitialBoard());
  const [movesUsed, setMovesUsed] = useState(0);
  const [history, setHistory] = useState<Cell[][][]>([]);
  const [focusedGateKey, setFocusedGateKey] = useState<string | null>(null);
  const [hintText, setHintText] = useState("Rotate gates to connect Poseidon's fountain to all three seals.");
  const winTriggeredRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);
  const playTone = useMemo(() => createTonePlayer(audioRef), []);

  const flow = useMemo(() => simulateFlow(board), [board]);
  const poweredCount = flow.poweredSeals.size;
  const movesLeft = MAX_MOVES - movesUsed;
  const outOfMoves = movesLeft <= 0 && poweredCount < TOTAL_SEALS;
  const totalTargetGates = Object.keys(TARGET_ORIENTATIONS).length;
  const alignedGateCount = useMemo(
    () =>
      Object.entries(TARGET_ORIENTATIONS).reduce((count, [key, target]) => {
        const { x, y } = parseCellKey(key);
        if (!inBounds(x, y)) return count;
        return board[y][x].orientation === target ? count + 1 : count;
      }, 0),
    [board]
  );

  const startPuzzle = () => {
    winTriggeredRef.current = false;
    setBoard(createInitialBoard());
    setMovesUsed(0);
    setHistory([]);
    setFocusedGateKey(null);
    setHintText("Route water to Seal A, Seal B, and Seal C before moves run out.");
    setPhase("puzzle");
  };

  const rotateCell = (x: number, y: number) => {
    if (phase !== "puzzle" || outOfMoves) return;

    const currentCell = board[y][x];
    if (!currentCell.rotatable) return;
    const key = cellKey(x, y);
    const prevPoweredCount = flow.poweredSeals.size;
    const prevActiveCount = flow.activeCells.size;

    const snapshot = cloneBoard(board);
    const nextBoard = cloneBoard(board);
    nextBoard[y][x].orientation = (nextBoard[y][x].orientation + 1) % 4;
    const nextFlow = simulateFlow(nextBoard);
    const nextPoweredCount = nextFlow.poweredSeals.size;
    const nextActiveCount = nextFlow.activeCells.size;
    const target = TARGET_ORIENTATIONS[key];
    const alignedNow = typeof target === "number" && nextBoard[y][x].orientation === target;
    const improvedFlow = nextActiveCount > prevActiveCount;

    setHistory((prev) => [...prev, snapshot]);
    setBoard(nextBoard);
    setMovesUsed((prev) => prev + 1);
    setFocusedGateKey(null);
    setHintText("Water updates in real time. Keep refining the channels.");

    if (nextPoweredCount > prevPoweredCount) {
      playTone("seal");
    } else if (alignedNow || improvedFlow) {
      playTone("correct");
    } else {
      playTone("incorrect");
    }
  };

  const undoMove = () => {
    if (history.length === 0 || phase !== "puzzle") return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setBoard(previous);
    setMovesUsed((prev) => Math.max(0, prev - 1));
    setFocusedGateKey(null);
    setHintText("Last move undone.");
  };

  const resetBoard = () => {
    if (phase !== "puzzle") return;
    setBoard(createInitialBoard());
    setMovesUsed(0);
    setHistory([]);
    setFocusedGateKey(null);
    setHintText("Board reset. Find the three-channel route again.");
  };

  const showHint = () => {
    if (phase !== "puzzle") return;
    const nextGate = getNextMisalignedGate(board);

    if (!nextGate) {
      setHintText("All major gates are aligned. Follow the live water flow to finish.");
      return;
    }

    setFocusedGateKey(nextGate.key);
    setHintText(`Hint: adjust gate at row ${nextGate.y + 1}, column ${nextGate.x + 1}.`);
    window.setTimeout(() => setFocusedGateKey(null), 2600);
  };

  useEffect(() => {
    return () => {
      if (!audioRef.current) return;
      void audioRef.current.close().catch(() => undefined);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (phase !== "puzzle") return;
    if (poweredCount < TOTAL_SEALS) return;
    if (movesUsed > MAX_MOVES) return;
    if (winTriggeredRef.current) return;

    winTriggeredRef.current = true;
    markSolved("percy");
    setHintText("All temple seals are powered. The tide stabilizes.");

    const timer = window.setTimeout(() => setPhase("won"), 650);
    return () => window.clearTimeout(timer);
  }, [phase, poweredCount, movesUsed, markSolved]);

  useEffect(() => {
    if (phase !== "puzzle" || outOfMoves) return;
    if (movesUsed !== 10 && movesUsed !== 18) return;

    if (poweredCount === 0) {
      setHintText("Focus near the fountain first, then build upper and mid routes from the center split.");
      return;
    }

    if (poweredCount === 1) {
      setHintText("One seal is active. Build the lower branch through row 5 to unlock the third seal.");
      return;
    }

    if (poweredCount === 2) {
      setHintText("You are one step away. Use Hint and line up the final channel.");
    }
  }, [phase, movesUsed, poweredCount, outOfMoves]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#031322] text-slate-100">
      <PercySeaBackdrop phase={phase} />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-7 sm:py-10">
        <div className="pointer-events-none absolute right-0 top-6 hidden lg:block">
          <img
            src={percyHero}
            alt="Percy silhouette"
            className="h-64 w-auto object-contain opacity-20 drop-shadow-[0_0_40px_rgba(34,211,238,0.45)]"
          />
        </div>

        <motion.button
          onClick={() => navigate("/hub")}
          className="mb-6 flex items-center gap-2 text-slate-300 hover:text-cyan-100 transition-colors cursor-pointer"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Hub
        </motion.button>

        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.section
              key="intro"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="mx-auto max-w-4xl rounded-3xl border border-cyan-300/25 bg-slate-950/55 p-6 sm:p-10 text-center backdrop-blur-md"
            >
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-500/12">
                <Waves className="h-10 w-10 text-cyan-100" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-wide text-cyan-100">
                Tidal Gate Engineer
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-200/90 leading-relaxed">
                Poseidon's fountain is active, but the temple channels collapsed. Rotate the stone gates to route
                water into all three seals within a limited number of moves.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1.5 text-cyan-100">
                  <Droplets className="h-4 w-4" />
                  Poseidon Current
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-blue-300/30 bg-blue-500/10 px-3 py-1.5 text-blue-100">
                  <Zap className="h-4 w-4" />
                  Storm Relay
                </div>
              </div>
              <div className="mx-auto mt-6 w-full max-w-2xl overflow-hidden rounded-2xl border border-cyan-300/25 bg-slate-900/60">
                <div className="relative h-44 sm:h-52">
                  <img
                    src={percyHero}
                    alt="Percy Jackson world artwork"
                    className="absolute inset-0 h-full w-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(3,19,34,0.72)_0%,rgba(3,19,34,0.38)_45%,rgba(8,47,73,0.66)_100%)]" />
                  <div className="absolute bottom-3 left-4 right-4 text-left">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/85">Camp Half-Blood Engineering Trial</p>
                    <p className="mt-1 text-sm text-slate-100/90">Channel the tide, power the seals, and stabilize Poseidon's temple.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm text-slate-200">
                <div className="rounded-xl border border-cyan-300/20 bg-cyan-500/10 p-3">
                  3 Temple Seals
                </div>
                <div className="rounded-xl border border-cyan-300/20 bg-cyan-500/10 p-3">
                  {MAX_MOVES} Move Limit
                </div>
                <div className="rounded-xl border border-cyan-300/20 bg-cyan-500/10 p-3">
                  Medium Difficulty
                </div>
              </div>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button
                  onClick={startPuzzle}
                  className="rounded-full border border-cyan-200/60 bg-cyan-500/20 px-7 py-3 font-semibold text-cyan-100 hover:bg-cyan-500/30 transition-colors cursor-pointer"
                >
                  Enter Engineering Chamber
                </button>
                {alreadySolved && (
                  <button
                    onClick={() => setPhase("won")}
                    className="rounded-full border border-slate-300/35 bg-slate-900/55 px-7 py-3 font-semibold text-slate-200 hover:bg-slate-800/75 transition-colors cursor-pointer"
                  >
                    View Restored Ending
                  </button>
                )}
              </div>
            </motion.section>
          )}

          {phase === "puzzle" && (
            <motion.section
              key="puzzle"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="mx-auto max-w-6xl rounded-3xl border border-cyan-300/20 bg-slate-950/55 p-4 sm:p-6 backdrop-blur-md"
            >
              <div className="mb-4 overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-900/55">
                <div className="relative h-20 sm:h-24">
                  <img
                    src={percyHero}
                    alt="Percy temple chamber"
                    className="absolute inset-0 h-full w-full object-cover opacity-45"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,10,20,0.9)_0%,rgba(2,10,20,0.35)_52%,rgba(8,47,73,0.88)_100%)]" />
                  <div className="relative z-10 flex h-full flex-wrap items-center justify-between gap-2 px-4 sm:px-5">
                    <div className="text-left">
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/85">Temple Pressure</p>
                      <p className="text-sm sm:text-base text-slate-100">Route all channels before the tide collapses.</p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/35 bg-cyan-500/12 px-2.5 py-1 text-cyan-100">
                        <Droplets className="h-3.5 w-3.5" />
                        Tide Flow
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-300/35 bg-blue-500/12 px-2.5 py-1 text-blue-100">
                        <Zap className="h-3.5 w-3.5" />
                        Storm Arc
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display text-cyan-100">Temple Channel Grid</h2>
                  <p className="text-sm sm:text-base text-slate-300">{hintText}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <InfoChip label="Powered" value={`${poweredCount}/${TOTAL_SEALS}`} accent="cyan" />
                  <InfoChip label="Moves Used" value={`${movesUsed}/${MAX_MOVES}`} accent={outOfMoves ? "red" : "cyan"} />
                  <InfoChip label="Aligned Gates" value={`${alignedGateCount}/${totalTargetGates}`} accent="cyan" />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="relative rounded-2xl border border-cyan-300/18 bg-slate-900/45 p-3 sm:p-4 overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 opacity-20">
                    <img src={percyHero} alt="Percy background art" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,10,20,0.9)_0%,rgba(2,10,20,0.55)_45%,rgba(2,10,20,0.92)_100%)]" />
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(148,163,184,0.12)_0,rgba(148,163,184,0.12)_1px,transparent_1px,transparent_64px)]" />
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(148,163,184,0.09)_0,rgba(148,163,184,0.09)_1px,transparent_1px,transparent_64px)]" />
                  </div>
                  <div
                    className="relative mx-auto grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${BOARD_COLS}, minmax(0, 1fr))`,
                      maxWidth: "760px",
                    }}
                  >
                    {board.map((row, y) =>
                      row.map((cell, x) => {
                        const key = cellKey(x, y);
                        const isActive = flow.activeCells.has(key);
                        const isSealPowered = cell.type === "seal" && cell.sealId ? flow.poweredSeals.has(cell.sealId) : false;
                        const isFocused = focusedGateKey === key;

                        return (
                          <button
                            key={key}
                            onClick={() => rotateCell(x, y)}
                            disabled={!cell.rotatable || outOfMoves}
                            className={`relative aspect-square rounded-xl border transition-all ${
                              cell.rotatable ? "cursor-pointer" : "cursor-default"
                            } ${
                              isActive
                                ? "border-cyan-200/75 bg-cyan-500/18"
                                : "border-slate-700/80 bg-slate-900/80"
                            } ${
                              !cell.rotatable ? "opacity-95" : "hover:border-cyan-300/80 hover:bg-cyan-500/16"
                            } ${
                              isFocused ? "ring-2 ring-amber-300 ring-offset-1 ring-offset-slate-900" : ""
                            }`}
                            aria-label={`Cell ${x + 1},${y + 1}`}
                          >
                            <CellGlyph cell={cell} active={isActive} sealPowered={isSealPowered} />
                            {cell.rotatable && (
                              <span className="pointer-events-none absolute bottom-1 right-1 text-[10px] font-semibold text-cyan-100/60">
                                rotate
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <aside className="space-y-3 rounded-2xl border border-cyan-300/18 bg-slate-900/45 p-4">
                  <h3 className="text-lg font-display text-cyan-100">Controls</h3>
                  <button
                    onClick={showHint}
                    className="w-full rounded-xl border border-amber-300/45 bg-amber-500/14 px-4 py-2.5 text-sm font-medium text-amber-100 hover:bg-amber-500/24 transition-colors cursor-pointer"
                  >
                    Show Hint
                  </button>
                  <button
                    onClick={undoMove}
                    disabled={history.length === 0}
                    className="w-full rounded-xl border border-slate-300/35 bg-slate-900/65 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800/70 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Undo Last Move
                  </button>
                  <button
                    onClick={resetBoard}
                    className="w-full rounded-xl border border-cyan-200/45 bg-cyan-500/18 px-4 py-2.5 text-sm font-medium text-cyan-100 hover:bg-cyan-500/30 transition-colors cursor-pointer"
                  >
                    Reset Board
                  </button>
                  <button
                    onClick={() => setPhase("intro")}
                    className="w-full rounded-xl border border-slate-300/30 bg-slate-900/50 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800/70 transition-colors cursor-pointer"
                  >
                    Exit Puzzle
                  </button>

                  <div className="pt-2 border-t border-slate-600/40">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300 mb-2">Legend</p>
                    <LegendRow label="Fountain Source" glyph="source" />
                    <LegendRow label="Temple Seal" glyph="seal" />
                    <LegendRow label="One-way Current" glyph="oneway" />
                    <LegendRow label="Whirlpool Relay" glyph="whirlpool" />
                  </div>
                  <div className="overflow-hidden rounded-xl border border-cyan-300/20 bg-slate-950/45">
                    <div className="relative h-24">
                      <img src={percyHero} alt="Percy chamber art" className="absolute inset-0 h-full w-full object-cover opacity-55" />
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,10,20,0.92)_0%,rgba(2,10,20,0.38)_100%)]" />
                      <div className="relative z-10 p-2.5">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/80">Camp Half-Blood</p>
                        <p className="mt-1 text-xs text-slate-100/90">Keep the center split active, then branch upper, mid, and lower channels.</p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              {outOfMoves && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 rounded-xl border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-100"
                >
                  Move limit reached. Use <b>Undo</b> or <b>Reset Board</b> to continue.
                </motion.div>
              )}
            </motion.section>
          )}

          {phase === "won" && (
            <motion.section
              key="won"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-4xl rounded-3xl border border-cyan-300/25 bg-slate-950/55 p-6 sm:p-10 text-center backdrop-blur-md"
            >
              <div className="mx-auto mb-5 w-full max-w-xl overflow-hidden rounded-2xl border border-cyan-300/25">
                <img src={percyHero} alt="Percy victory art" className="h-40 sm:h-52 w-full object-cover opacity-80" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-bold text-cyan-100">Poseidon's Seal Restored</h2>
              <p className="mt-4 text-base sm:text-lg text-slate-200/90 leading-relaxed">
                All three temple seals are powered. The sea currents stabilize, the storm breaks, and Camp Half-Blood
                is safe again.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigate("/hub")}
                  className="rounded-full border border-cyan-200/60 bg-cyan-500/20 px-7 py-3 font-semibold text-cyan-100 hover:bg-cyan-500/33 transition-colors cursor-pointer"
                >
                  Return to Hub
                </button>
                <button
                  onClick={startPuzzle}
                  className="rounded-full border border-slate-300/35 bg-slate-900/55 px-7 py-3 font-semibold text-slate-200 hover:bg-slate-800/75 transition-colors cursor-pointer"
                >
                  Replay Challenge
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CellGlyph({ cell, active, sealPowered }: { cell: Cell; active: boolean; sealPowered: boolean }) {
  const lineColor = active ? "rgba(125, 211, 252, 0.98)" : "rgba(148, 163, 184, 0.72)";
  const glow = active ? "drop-shadow(0 0 7px rgba(34, 211, 238, 0.82))" : "none";

  const connectors = connectorsForCell(cell);
  const center = 50;

  if (cell.type === "rock") return null;

  if (cell.type === "source") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Waves className={`h-5 w-5 ${active ? "text-cyan-100" : "text-slate-300/80"}`} />
      </div>
    );
  }

  if (cell.type === "seal") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`h-5 w-5 rounded-full border-2 ${sealPowered ? "border-cyan-100 bg-cyan-300/70" : "border-slate-300/70 bg-slate-800/40"}`}
          style={{ boxShadow: sealPowered ? "0 0 10px rgba(125, 211, 252, 0.8)" : "none" }}
        />
      </div>
    );
  }

  if (cell.type === "oneway") {
    const out = DIR_ORDER[cell.orientation % 4];
    return (
      <svg viewBox="0 0 100 100" className="absolute inset-2">
        <line x1="50" y1="50" x2={out === "E" ? 88 : out === "W" ? 12 : 50} y2={out === "N" ? 12 : out === "S" ? 88 : 50} stroke={lineColor} strokeWidth="10" strokeLinecap="round" />
        <polygon
          points={
            out === "E"
              ? "90,50 76,42 76,58"
              : out === "W"
              ? "10,50 24,42 24,58"
              : out === "N"
              ? "50,10 42,24 58,24"
              : "50,90 42,76 58,76"
          }
          fill={lineColor}
          style={{ filter: glow }}
        />
      </svg>
    );
  }

  if (cell.type === "whirlpool_in" || cell.type === "whirlpool_out") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className={`h-7 w-7 rounded-full border-2 ${active ? "border-cyan-100" : "border-slate-300/70"}`}
          style={{
            background: active
              ? "radial-gradient(circle, rgba(125,211,252,0.8) 0%, rgba(14,116,144,0.45) 55%, transparent 85%)"
              : "radial-gradient(circle, rgba(148,163,184,0.55) 0%, rgba(51,65,85,0.3) 60%, transparent 85%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-2">
      <circle cx={center} cy={center} r="8" fill={lineColor} style={{ filter: glow }} />
      {connectors.includes("N") && <line x1={center} y1={center} x2={center} y2="8" stroke={lineColor} strokeWidth="11" strokeLinecap="round" style={{ filter: glow }} />}
      {connectors.includes("E") && <line x1={center} y1={center} x2="92" y2={center} stroke={lineColor} strokeWidth="11" strokeLinecap="round" style={{ filter: glow }} />}
      {connectors.includes("S") && <line x1={center} y1={center} x2={center} y2="92" stroke={lineColor} strokeWidth="11" strokeLinecap="round" style={{ filter: glow }} />}
      {connectors.includes("W") && <line x1={center} y1={center} x2="8" y2={center} stroke={lineColor} strokeWidth="11" strokeLinecap="round" style={{ filter: glow }} />}
    </svg>
  );
}

function InfoChip({ label, value, accent }: { label: string; value: string; accent: "cyan" | "red" }) {
  const className =
    accent === "cyan"
      ? "border-cyan-300/35 bg-cyan-500/12 text-cyan-100"
      : "border-red-300/45 bg-red-500/18 text-red-100";

  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${className}`}>
      <span className="text-xs uppercase tracking-[0.14em] opacity-85 mr-2">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function LegendRow({ label, glyph }: { label: string; glyph: "source" | "seal" | "oneway" | "whirlpool" }) {
  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-slate-200">
      <div className="h-6 w-6 rounded-md border border-slate-300/25 bg-slate-900/70 flex items-center justify-center">
        {glyph === "source" && <Waves className="h-4 w-4 text-cyan-100" />}
        {glyph === "seal" && <ShieldCheck className="h-4 w-4 text-cyan-100" />}
        {glyph === "oneway" && <span className="text-cyan-100 text-[11px] font-semibold">-&gt;</span>}
        {glyph === "whirlpool" && <span className="text-cyan-100 text-[11px] font-semibold">OO</span>}
      </div>
      <span>{label}</span>
    </div>
  );
}

function PercySeaBackdrop({ phase }: { phase: PercyPhase }) {
  const stormy = phase === "intro" || phase === "puzzle";

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.2),transparent_42%),radial-gradient(circle_at_84%_22%,rgba(59,130,246,0.16),transparent_40%),linear-gradient(180deg,#031322_0%,#06223f_45%,#031523_100%)]" />

      {[0, 1, 2].map((layer) => (
        <motion.div
          key={`wave-layer-${layer}`}
          className="absolute left-[-24%] w-[148%] rounded-[48%]"
          style={{
            height: `${270 + layer * 54}px`,
            bottom: `${-140 + layer * 60}px`,
            background: `linear-gradient(180deg, rgba(56,189,248,${0.1 - layer * 0.02}), rgba(8,47,73,${0.62 - layer * 0.09}))`,
            filter: "blur(7px)",
          }}
          animate={{ x: layer % 2 === 0 ? [-30, 30, -30] : [32, -32, 32] }}
          transition={{ duration: 10 + layer * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {SEA_PARTICLES.map((particle, idx) => (
        <motion.span
          key={`sea-particle-${idx}`}
          className="absolute rounded-full bg-cyan-200/70"
          style={{ left: `${particle.left}%`, top: `${particle.top}%`, width: 4, height: 4 }}
          animate={{ y: [0, -28, 0], x: [0, 9, 0], opacity: [0.2, 0.92, 0.2], scale: [0.8, 1.25, 0.8] }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {LIGHTNING_STREAKS.map((streak, idx) => (
        <motion.div
          key={`lightning-streak-${idx}`}
          className="absolute h-12 w-[2px] rounded-full bg-cyan-100/75"
          style={{ left: `${streak.left}%`, top: `${streak.top}%` }}
          animate={stormy ? { opacity: [0, 0.95, 0], scaleY: [0.7, 1.2, 0.8] } : { opacity: [0, 0.35, 0] }}
          transition={{ duration: streak.duration, repeat: Infinity, delay: streak.delay, ease: "easeInOut" }}
        />
      ))}

      <motion.div
        className="absolute inset-0 bg-cyan-100"
        animate={stormy ? { opacity: [0, 0.07, 0, 0.14, 0] } : { opacity: [0, 0.03, 0] }}
        transition={{ duration: stormy ? 7 : 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#020d17]/82 via-transparent to-[#04192c]/68" />
    </div>
  );
}

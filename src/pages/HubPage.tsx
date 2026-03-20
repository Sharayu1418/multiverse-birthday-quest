import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Copy } from "lucide-react";
import StarfieldBackground from "@/components/StarfieldBackground";
import PortalCard from "@/components/PortalCard";
import { worlds } from "@/lib/worldsData";
import { useGameProgress } from "@/hooks/useGameProgress";
import type { WorldId } from "@/lib/worldsData";

const HIDDEN_HUB_WORLDS: WorldId[] = ["nyc", "sheeran"];
const FINAL_REWARD_URL = "https://youtu.be/VpjuTVg9Mno";
const FINAL_MESSAGE_DELAY_MS = 6500;

function getRevealText(fullText: string, totalVisibleWorlds: number, solvedVisibleWorlds: number) {
  if (solvedVisibleWorlds <= 0) {
    return "*".repeat(fullText.length);
  }

  const revealCount = Math.ceil((solvedVisibleWorlds / totalVisibleWorlds) * fullText.length);
  return `${fullText.slice(0, revealCount)}${"*".repeat(Math.max(0, fullText.length - revealCount))}`;
}

export default function HubPage() {
  const navigate = useNavigate();
  const { isSolved } = useGameProgress();
  const [copied, setCopied] = useState(false);
  const [finalLinkUnlocked, setFinalLinkUnlocked] = useState(false);
  const visibleWorlds = worlds.filter((world) => !HIDDEN_HUB_WORLDS.includes(world.id));
  const visibleSolvedCount = visibleWorlds.filter((world) => isSolved(world.id)).length;
  const allVisibleWorldsSolved = visibleSolvedCount === visibleWorlds.length;
  const revealedUrl = useMemo(
    () => getRevealText(FINAL_REWARD_URL, visibleWorlds.length, visibleSolvedCount),
    [visibleWorlds.length, visibleSolvedCount]
  );

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (!allVisibleWorldsSolved) {
      setFinalLinkUnlocked(false);
      return;
    }

    setFinalLinkUnlocked(false);
    const timer = window.setTimeout(() => setFinalLinkUnlocked(true), FINAL_MESSAGE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [allVisibleWorldsSolved]);

  const handleCopyUrl = async () => {
    if (!allVisibleWorldsSolved || !finalLinkUnlocked) return;

    try {
      await navigator.clipboard.writeText(FINAL_REWARD_URL);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] starfield overflow-hidden">
      <StarfieldBackground />

      <AnimatePresence>
        {allVisibleWorldsSolved && !finalLinkUnlocked && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.22),_rgba(6,10,25,0.88)_45%,_rgba(2,6,23,0.97)_100%)] backdrop-blur-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/14 blur-3xl"
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.95, scale: 1.08 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />

            <motion.div
              className="relative w-full max-w-3xl rounded-[2rem] bg-gradient-to-br from-fuchsia-400/28 via-cyan-300/16 to-amber-300/28 p-[1px] shadow-[0_30px_120px_rgba(0,0,0,0.52)]"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.45 }}
            >
              <div className="relative overflow-hidden rounded-[calc(2rem-1px)] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.24),_rgba(8,12,28,0.96)_62%)] px-6 py-8 text-center sm:px-12 sm:py-12">
                <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />
                <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
                <div className="absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

                <motion.div
                  className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-cyan-300/28 bg-slate-950/45 shadow-[0_0_45px_rgba(56,189,248,0.2)] sm:h-28 sm:w-28"
                  animate={{ boxShadow: ["0 0 35px rgba(56,189,248,0.18)", "0 0 60px rgba(168,85,247,0.28)", "0 0 35px rgba(56,189,248,0.18)"] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="absolute h-[74%] w-[74%] rounded-full border border-fuchsia-300/30" />
                  <div className="absolute h-[52%] w-[52%] rounded-full border border-cyan-200/35" />
                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-cyan-200 via-fuchsia-300 to-amber-300 shadow-[0_0_22px_rgba(244,114,182,0.45)]" />
                </motion.div>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-cyan-100/78">
                  Final Portal Stabilized
                </div>

                <h2 className="glow-text-purple mt-6 font-display text-3xl font-bold tracking-wide text-slate-50 sm:text-5xl">
                  Balance Of The Multiverse Restored
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-100/88 sm:text-xl">
                  Wow, Shivani, that was amazing. You deserve a treat. Go take a peek at what your
                  gang does best.
                </p>

                <div className="mx-auto mt-8 h-px w-28 bg-gradient-to-r from-transparent via-fuchsia-200/70 to-transparent" />

                <div className="mt-5 flex items-center justify-center gap-3 text-sm text-cyan-100/72">
                  <motion.span
                    className="h-2.5 w-2.5 rounded-full bg-cyan-300"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.45, 1, 0.45] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span>Your final surprise is appearing...</span>
                  <motion.span
                    className="h-2.5 w-2.5 rounded-full bg-fuchsia-300"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.45, 1, 0.45] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground bg-card/50 hover:bg-card/70 backdrop-blur-sm transition-colors font-body cursor-pointer z-30 border border-border/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <ArrowLeft className="w-4 h-4" /> Start over
      </motion.button>

      <div className="relative z-10 mx-auto px-4 sm:px-6 py-6 sm:py-10 lg:py-12 max-w-5xl">
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="text-2xl sm:text-4xl md:text-5xl font-display font-bold mb-2 sm:mb-3 glow-text-purple"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Multiverse Portal Hub
          </h1>
          <p className="text-muted-foreground font-body text-sm sm:text-base mb-3 sm:mb-4">
            Choose a world to restore
          </p>

          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="text-muted-foreground font-body text-xs sm:text-sm md:text-base">
              Worlds Restored:
            </span>
            <span className="font-body font-bold text-base sm:text-lg text-amber-400">
              {visibleSolvedCount}/{visibleWorlds.length}
            </span>
          </div>

          <div className="w-48 sm:w-64 mx-auto h-1.5 sm:h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
            <motion.div
              className="h-full rounded-full bg-amber-400/80"
              initial={{ width: 0 }}
              animate={{ width: `${(visibleSolvedCount / visibleWorlds.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-5">
          {visibleWorlds.map((world, i) => (
            <div key={world.id} className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(20%-1rem)]">
              <PortalCard world={world} solved={isSolved(world.id)} index={i} />
            </div>
          ))}
        </div>

        {(!allVisibleWorldsSolved || finalLinkUnlocked) && (
          <motion.section
            className="mt-10 sm:mt-12 mx-auto max-w-3xl rounded-2xl border border-border/40 bg-card/45 px-4 py-5 sm:px-6 sm:py-6 backdrop-blur-md"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            {!allVisibleWorldsSolved && (
              <>
                <div className="rounded-xl border border-amber-300/20 bg-black/20 px-4 py-4 sm:px-5">
                  <p className="break-all text-center font-mono text-sm sm:text-base tracking-[0.04em] text-amber-100/92">
                    {revealedUrl}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-center">
                  <button
                    onClick={handleCopyUrl}
                    disabled
                    className="inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-400/12 px-4 py-2 text-sm font-medium text-amber-100 transition-colors disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </button>
                </div>
              </>
            )}

            {allVisibleWorldsSolved && finalLinkUnlocked && (
              <motion.div
                className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-fuchsia-400/24 via-cyan-300/14 to-amber-300/24 p-[1px]"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <div className="relative rounded-[calc(1.75rem-1px)] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_rgba(10,13,28,0.94)_72%)] px-5 py-6 text-center sm:px-8 sm:py-7">
                  <div className="absolute -left-10 top-4 h-28 w-28 rounded-full bg-fuchsia-500/10 blur-3xl" />
                  <div className="absolute -right-6 bottom-0 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />

                  <a
                    href={FINAL_REWARD_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block rounded-2xl border border-cyan-300/18 bg-black/24 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/32 hover:bg-white/[0.06] sm:px-5"
                  >
                    <span className="block text-[10px] uppercase tracking-[0.28em] text-fuchsia-200/68">
                      Click To Open
                    </span>
                    <span className="mt-2 block break-all font-mono text-sm tracking-[0.04em] text-cyan-50/92 sm:text-base">
                      {FINAL_REWARD_URL}
                    </span>
                  </a>

                  <div className="mt-5 flex items-center justify-center">
                    <button
                      onClick={handleCopyUrl}
                      className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/28 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10 cursor-pointer"
                    >
                      {copied ? <Check className="h-4 w-4 text-cyan-300" /> : <Copy className="h-4 w-4 text-cyan-300" />}
                      {copied ? "Copied" : "Copy Link"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.section>
        )}
      </div>
    </div>
  );
}

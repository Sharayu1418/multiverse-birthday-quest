import { useState, useCallback } from "react";
import { WorldId } from "@/lib/worldsData";

const STORAGE_KEY = "multiverse-progress";

export function useGameProgress() {
  const [solvedWorlds, setSolvedWorlds] = useState<WorldId[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const markSolved = useCallback((worldId: WorldId) => {
    setSolvedWorlds((prev) => {
      if (prev.includes(worldId)) return prev;
      const next = [...prev, worldId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isSolved = useCallback(
    (worldId: WorldId) => solvedWorlds.includes(worldId),
    [solvedWorlds]
  );

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSolvedWorlds([]);
  }, []);

  const allSolved = solvedWorlds.length >= 7;

  return { solvedWorlds, markSolved, isSolved, allSolved, resetProgress };
}

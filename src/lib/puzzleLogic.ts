import { WorldId } from "./worldsData";

// Placeholder answers - all lowercase
const ANSWERS: Record<WorldId, string> = {
  marvel: "placeholder",
  potter: "placeholder",
  percy: "placeholder",
  friends: "placeholder",
  nyc: "placeholder",
  sheeran: "placeholder",
  stranger: "placeholder",
};

export const checkAnswer = (worldId: WorldId, answer: string): boolean => {
  return answer.trim().toLowerCase() === ANSWERS[worldId];
};

export const getHint = (worldId: WorldId): string => {
  const hints: Record<WorldId, string> = {
    marvel: "Think about what makes a hero super...",
    potter: "The answer lies within the wizarding world...",
    percy: "Look to the ancient Greek gods for guidance...",
    friends: "Could this BE any more obvious?",
    nyc: "The city that never sleeps holds the answer...",
    sheeran: "Listen closely to the lyrics...",
    stranger: "The Upside Down has the answer...",
  };
  return hints[worldId];
};

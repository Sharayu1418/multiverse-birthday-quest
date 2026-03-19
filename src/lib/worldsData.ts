export type WorldId = "marvel" | "potter" | "percy" | "friends" | "nyc" | "sheeran" | "stranger";

export interface WorldData {
  id: WorldId;
  name: string;
  theme: string;
  icon: string;
  colorClass: string;
  glowColor: string;
  riddle: string;
  bgGradient: string;
}

export const worlds: WorldData[] = [
  {
    id: "marvel",
    name: "Marvel Universe",
    theme: "red and gold",
    icon: "Shield",
    colorClass: "from-marvel-red to-marvel-gold",
    glowColor: "0 80% 50%",
    riddle: "A riddle awaits you in the Marvel Universe... (placeholder)",
    bgGradient: "from-red-950/40 via-background to-yellow-950/30",
  },
  {
    id: "potter",
    name: "Harry Potter World",
    theme: "warm gold",
    icon: "Wand2",
    colorClass: "from-potter-gold to-amber-300",
    glowColor: "42 80% 50%",
    riddle: "A riddle awaits you in the Wizarding World... (placeholder)",
    bgGradient: "from-amber-950/40 via-background to-yellow-950/30",
  },
  {
    id: "stranger",
    name: "Stranger Things",
    theme: "eerie red",
    icon: "Lightbulb",
    colorClass: "from-stranger-red to-red-600",
    glowColor: "0 85% 40%",
    riddle: "A riddle awaits you in Hawkins... (placeholder)",
    bgGradient: "from-red-950/50 via-background to-red-950/30",
  },
  {
    id: "friends",
    name: "Friends",
    theme: "coffee shop",
    icon: "Coffee",
    colorClass: "from-friends-orange to-amber-400",
    glowColor: "25 90% 55%",
    riddle: "A riddle awaits you at Central Perk... (placeholder)",
    bgGradient: "from-orange-950/40 via-background to-amber-950/30",
  },
  {
    id: "nyc",
    name: "New York City",
    theme: "skyline",
    icon: "Building2",
    colorClass: "from-nyc-amber to-yellow-300",
    glowColor: "35 85% 55%",
    riddle: "A riddle awaits you in the city that never sleeps... (placeholder)",
    bgGradient: "from-amber-950/40 via-background to-slate-950/30",
  },
  {
    id: "sheeran",
    name: "Ed Sheeran World",
    theme: "acoustic",
    icon: "Guitar",
    colorClass: "from-sheeran-warm to-orange-400",
    glowColor: "20 60% 50%",
    riddle: "A riddle awaits you in the world of music... (placeholder)",
    bgGradient: "from-orange-950/40 via-background to-red-950/20",
  },
  {
    id: "percy",
    name: "Percy Jackson",
    theme: "ocean blue",
    icon: "Trident",
    colorClass: "from-percy-blue to-cyan-400",
    glowColor: "200 80% 50%",
    riddle: "A riddle awaits you from Mount Olympus... (placeholder)",
    bgGradient: "from-blue-950/40 via-background to-cyan-950/30",
  },
];

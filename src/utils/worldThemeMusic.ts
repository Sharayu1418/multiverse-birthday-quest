import type { WorldId } from "@/lib/worldsData";

const THEME_FILES: Partial<Record<WorldId, string>> = {
  marvel: "/audio/Marvel Tune.mp3",
  potter: "/audio/Harry Potter Tune.mp3",
  percy: "/audio/Percy Jackson Tune.mp3",
  friends: "/audio/Friends Tune.mp3",
  stranger: "/audio/Stranger Things Tune.mp3",
};

let currentAudio: HTMLAudioElement | null = null;

function stop() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.removeAttribute("src");
    currentAudio.load();
    currentAudio = null;
  }
}

export function playWorldTheme(worldId: WorldId) {
  stop();
  const src = THEME_FILES[worldId];
  if (!src) return;

  const audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0.4;
  currentAudio = audio;
  audio.play().catch(() => {});
}

export function stopWorldTheme() {
  stop();
}

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onStart: () => void;
}

interface StreamableVideoFile {
  url?: string;
}

interface StreamableVideoResponse {
  files?: {
    mp4?: StreamableVideoFile;
    "mp4-mobile"?: StreamableVideoFile;
  };
}

const MARVEL_INTRO_VIDEO_CODE = "6ft5jh";

export default function MarvelIntro({ onStart }: Props) {
  const [showButton, setShowButton] = useState(false);
  const [portalActive, setPortalActive] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [requiresPlaybackStart, setRequiresPlaybackStart] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const loadIntroVideo = useCallback(async () => {
    if (videoUrl) {
      setIsLoadingVideo(false);
      return;
    }

    setIsLoadingVideo(true);
    setVideoError(null);

    try {
      const response = await fetch(`https://api.streamable.com/videos/${MARVEL_INTRO_VIDEO_CODE}`);
      if (!response.ok) {
        throw new Error("Unable to load video");
      }

      const data = (await response.json()) as StreamableVideoResponse;
      const resolvedUrl = data.files?.mp4?.url ?? data.files?.["mp4-mobile"]?.url;

      if (!resolvedUrl) {
        throw new Error("Missing video source");
      }

      setVideoUrl(resolvedUrl.startsWith("//") ? `https:${resolvedUrl}` : resolvedUrl);
    } catch {
      setVideoError("The Marvel intro could not load right now.");
    } finally {
      setIsLoadingVideo(false);
    }
  }, [videoUrl]);

  useEffect(() => {
    void loadIntroVideo();
  }, [loadIntroVideo]);

  useEffect(() => {
    if (!videoUrl) return;

    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      void video.play()
        .then(() => setRequiresPlaybackStart(false))
        .catch(() => setRequiresPlaybackStart(true));
    };

    if (video.readyState >= 2) {
      tryPlay();
    }

    video.addEventListener("loadedmetadata", tryPlay);
    video.addEventListener("canplay", tryPlay);

    return () => {
      video.removeEventListener("loadedmetadata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
    };
  }, [videoUrl]);

  const handleClick = () => {
    setPortalActive(true);
    setTimeout(onStart, 1200);
  };

  return (
    <motion.div
      className="relative z-10 flex min-h-screen flex-col items-center justify-center"
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: 0.6 }}
    >
      {portalActive && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="rounded-full border-4 border-marvel-gold"
            initial={{ width: 0, height: 0, rotate: 0, opacity: 0 }}
            animate={{ width: "200vmax", height: "200vmax", rotate: 720, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{
              boxShadow: "0 0 80px hsl(var(--marvel-gold) / 0.8), inset 0 0 80px hsl(var(--marvel-gold) / 0.4)",
            }}
          />
        </motion.div>
      )}

      <motion.div
        className="fixed inset-0 z-0 bg-black"
        animate={{ opacity: showButton ? 0.3 : 1 }}
        transition={{ duration: 1.5 }}
      >
        {isLoadingVideo && (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-sm uppercase tracking-[0.24em] text-marvel-gold/80">Opening the multiverse...</p>
          </div>
        )}

        {!isLoadingVideo && videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
            onEnded={() => setShowButton(true)}
          />
        )}

        {!isLoadingVideo && videoError && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center">
            <p className="text-base text-white/85">{videoError}</p>
            <button
              onClick={loadIntroVideo}
              className="rounded-full border border-marvel-gold/60 bg-marvel-gold/10 px-6 py-3 font-semibold text-marvel-gold transition-colors hover:bg-marvel-gold/20 cursor-pointer"
            >
              Retry Intro
            </button>
          </div>
        )}
      </motion.div>

      {showButton && (
        <motion.div
          className="fixed inset-0 z-10 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
      )}

      {!showButton && !isLoadingVideo && videoUrl && requiresPlaybackStart && (
        <motion.button
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            void video.play()
              .then(() => setRequiresPlaybackStart(false))
              .catch(() => undefined);
          }}
          className="fixed bottom-16 z-20 rounded-full border border-marvel-gold/55 bg-black/60 px-8 py-3 font-body font-semibold text-marvel-gold backdrop-blur-sm transition-colors hover:bg-black/75 cursor-pointer"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Play Intro
        </motion.button>
      )}

      <AnimatePresence>
        {showButton && (
          <motion.button
            onClick={handleClick}
            className="fixed bottom-16 z-20 px-10 py-4 rounded-full font-body font-semibold text-lg cursor-pointer transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(25 80% 45%))",
              color: "hsl(var(--background))",
              boxShadow: "0 0 40px hsl(var(--marvel-gold) / 0.5), 0 0 80px hsl(var(--marvel-gold) / 0.2)",
            }}
          >
            <span className="relative z-10">Reveal the Path</span>
            <motion.div
              className="absolute inset-0 rounded-full opacity-50 blur-md"
              style={{ background: "linear-gradient(135deg, hsl(var(--marvel-gold)), hsl(25 80% 45%))" }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

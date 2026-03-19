import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
  onReturn: () => void;
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

const GANG_VIDEO_CODE = "50rhx0";

export default function FriendsFinale({ onReturn }: Props) {
  const [showText, setShowText] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [hasFinishedVideo, setHasFinishedVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 1000);
    const t2 = setTimeout(() => setShowActions(true), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const loadGangVideo = useCallback(async (showFailure = true) => {
    if (videoUrl || isLoadingVideo) return;

    setIsLoadingVideo(true);

    try {
      const response = await fetch(`https://api.streamable.com/videos/${GANG_VIDEO_CODE}`);
      if (!response.ok) {
        throw new Error("Unable to load video");
      }

      const data = (await response.json()) as StreamableVideoResponse;
      const resolvedUrl = data.files?.mp4?.url ?? data.files?.["mp4-mobile"]?.url;

      if (!resolvedUrl) {
        throw new Error("Missing video source");
      }

      setVideoUrl(resolvedUrl.startsWith("//") ? `https:${resolvedUrl}` : resolvedUrl);
      setVideoError(null);
    } catch {
      if (showFailure) {
        setVideoError("The video could not load inside the app right now. Try again in a moment.");
      }
    } finally {
      setIsLoadingVideo(false);
    }
  }, [isLoadingVideo, videoUrl]);

  const openGangVideo = async () => {
    setShowVideoPlayer(true);
    setVideoError(null);
    setHasFinishedVideo(false);

    if (videoUrl && videoRef.current) {
      videoRef.current.currentTime = 0;
      void videoRef.current.play().catch(() => undefined);
      return;
    }

    await loadGangVideo(true);
  };

  useEffect(() => {
    if (!showActions) return;
    void loadGangVideo(false);
  }, [loadGangVideo, showActions]);

  useEffect(() => {
    if (!showVideoPlayer || !videoUrl) return;

    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      void video.play().catch(() => undefined);
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
  }, [showVideoPlayer, videoUrl]);

  return (
    <motion.div
      className={`w-full text-center flex flex-col items-center justify-center ${
        showVideoPlayer
          ? "max-w-4xl min-h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] gap-4 overflow-hidden"
          : "max-w-3xl space-y-8"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {showText && (
        <motion.p
          className="text-lg sm:text-2xl font-display font-bold"
          style={{
            color: "hsl(var(--foreground))",
            textShadow: "0 0 20px hsl(var(--friends-orange) / 0.3)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          The One Where Shivani Has The Best Birthday!
        </motion.p>
      )}

      {showVideoPlayer && (
        <motion.div
          className="w-full max-w-[min(92vw,760px)] space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="overflow-hidden rounded-2xl border backdrop-blur-md"
            style={{
              borderColor: "hsl(var(--friends-orange) / 0.35)",
              background: "hsl(25 20% 10% / 0.78)",
              boxShadow: "0 18px 60px hsl(25 60% 8% / 0.45)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 text-left border-b" style={{ borderColor: "hsl(var(--friends-orange) / 0.18)" }}>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "hsl(var(--friends-orange) / 0.7)" }}>
                  Special Clip
                </p>
                <p className="text-sm sm:text-base font-medium" style={{ color: "hsl(var(--foreground))" }}>
                  The one where your gang steals the spotlight
                </p>
              </div>
              {hasFinishedVideo && (
                <span className="text-xs uppercase tracking-[0.14em]" style={{ color: "hsl(var(--friends-orange))" }}>
                  Watched
                </span>
              )}
            </div>

            <div className="p-3 sm:p-4">
              {isLoadingVideo && (
                <div className="flex items-center justify-center rounded-xl min-h-[240px] max-h-[min(54dvh,560px)]" style={{ background: "hsl(25 18% 12% / 0.75)" }}>
                  <p className="text-sm font-body" style={{ color: "hsl(var(--foreground) / 0.82)" }}>
                    Loading your gang's video...
                  </p>
                </div>
              )}

              {!isLoadingVideo && videoUrl && (
                <video
                  key={videoUrl}
                  ref={videoRef}
                  src={videoUrl}
                  autoPlay
                  controls
                  preload="auto"
                  playsInline
                  className="w-full rounded-xl object-contain max-h-[min(54dvh,560px)]"
                  style={{ background: "hsl(25 20% 6%)" }}
                  onEnded={() => setHasFinishedVideo(true)}
                />
              )}

              {!isLoadingVideo && videoError && (
                <div className="space-y-4 rounded-xl p-5" style={{ background: "hsl(25 18% 12% / 0.75)" }}>
                  <p className="text-sm font-body" style={{ color: "hsl(var(--foreground) / 0.82)" }}>
                    {videoError}
                  </p>
                  <motion.button
                    onClick={openGangVideo}
                    className="inline-flex px-6 py-2.5 rounded-md font-body font-medium text-sm tracking-wider uppercase cursor-pointer transition-all"
                    style={{
                      background: "hsl(var(--friends-orange) / 0.12)",
                      border: "1px solid hsl(var(--friends-orange) / 0.55)",
                      color: "hsl(var(--foreground))",
                      letterSpacing: "0.1em",
                    }}
                    whileHover={{
                      boxShadow: "0 0 30px hsl(var(--friends-orange) / 0.28)",
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Retry Video
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {!hasFinishedVideo && videoUrl && (
            <p className="text-xs font-body" style={{ color: "hsl(var(--friends-orange) / 0.68)" }}>
              Return to Multiverse unlocks after the clip finishes.
            </p>
          )}
        </motion.div>
      )}

      {showActions && (
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.button
            onClick={openGangVideo}
            className="px-8 py-2.5 rounded-md font-body font-medium text-sm tracking-wider uppercase cursor-pointer transition-all"
            style={{
              background: "hsl(var(--friends-orange) / 0.12)",
              border: "1px solid hsl(var(--friends-orange) / 0.55)",
              color: "hsl(var(--foreground))",
              letterSpacing: "0.1em",
            }}
            whileHover={{
              boxShadow: "0 0 30px hsl(var(--friends-orange) / 0.28)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            {showVideoPlayer ? "Watch Your Gang Again" : "Go Take a Look at Your Gang"}
          </motion.button>

          {hasFinishedVideo && (
            <motion.button
              onClick={onReturn}
              className="px-8 py-2.5 rounded-md font-body font-medium text-sm tracking-wider uppercase cursor-pointer transition-all"
              style={{
                background: "transparent",
                border: "1px solid hsl(var(--friends-orange) / 0.5)",
                color: "hsl(var(--friends-orange))",
                letterSpacing: "0.12em",
              }}
              whileHover={{
                boxShadow: "0 0 25px hsl(var(--friends-orange) / 0.3)",
              }}
              whileTap={{ scale: 0.97 }}
            >
              Return to Multiverse
            </motion.button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import skylineImg from "@/assets/new_york_skyline.jpg";

export default function CinematicSuccessScene() {
  const navigate = useNavigate();
  const [showSecondText, setShowSecondText] = useState(false);
  const [portalOpen, setPortalOpen] = useState(0);
  const [lightningFlash, setLightningFlash] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  // Animate portal opening over time
  useEffect(() => {
    const start = Date.now();
    const duration = 8000;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      setPortalOpen(p);
      if (p < 1) rafId = requestAnimationFrame(tick);
    };
    let rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Show second text after delay
  useEffect(() => {
    const t = setTimeout(() => setShowSecondText(true), 4000);
    return () => clearTimeout(t);
  }, []);

  // Random lightning
  useEffect(() => {
    const fire = () => {
      setLightningFlash(true);
      setTimeout(() => setLightningFlash(false), 150);
      timeout = setTimeout(fire, 3000 + Math.random() * 6000);
    };
    let timeout = setTimeout(fire, 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Eerie ambient drone
  useEffect(() => {
    try {
      const ctx = new AudioContext();
      audioRef.current = ctx;

      const makeOsc = (freq: number, vol: number, type: OscillatorType = "sine") => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = type;
        osc.frequency.value = freq;
        filter.type = "lowpass";
        filter.frequency.value = 300;
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 4);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        return { osc, gain };
      };

      const d1 = makeOsc(65, 0.05, "sawtooth");
      const d2 = makeOsc(98, 0.03, "sine");
      const d3 = makeOsc(44, 0.04, "triangle");

      return () => {
        try {
          d1.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
          d2.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
          d3.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
          setTimeout(() => {
            try { d1.osc.stop(); d2.osc.stop(); d3.osc.stop(); ctx.close(); } catch {}
          }, 600);
        } catch {}
      };
    } catch {}
  }, []);

  // Spores
  const spores = useMemo(() => Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 5,
    duration: 4 + Math.random() * 8,
    delay: Math.random() * 6,
    drift: (Math.random() - 0.5) * 80,
    glow: Math.random() > 0.5,
  })), []);

  // Fog layers
  const fogLayers = useMemo(() => Array.from({ length: 4 }).map((_, i) => ({
    id: i,
    y: 55 + i * 8 + Math.random() * 5,
    height: 8 + Math.random() * 6,
    duration: 15 + i * 5 + Math.random() * 10,
    opacity: 0.12 + Math.random() * 0.1,
    direction: i % 2 === 0 ? 1 : -1,
  })), []);

  // Smoke particles around portal
  const smokeParticles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    angle: (i / 20) * Math.PI * 2,
    distance: 60 + Math.random() * 80,
    size: 10 + Math.random() * 30,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 3,
  })), []);

  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      style={{ background: "hsl(0 0% 2%)" }}
    >
      {/* NY Skyline background with cinematic treatment */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 6, ease: "easeOut" }}
      >
        {/* Base image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${skylineImg})`,
            filter: "brightness(0.35) contrast(1.3) saturate(0.3)",
          }}
        />
        {/* Red/dark cinematic overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, hsl(0 30% 5% / 0.7) 0%, hsl(0 20% 3% / 0.4) 40%, hsl(0 40% 8% / 0.6) 100%)",
          }}
        />
        {/* Subtle pan animation - makes the photo feel alive */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${skylineImg})`,
            filter: "brightness(0.35) contrast(1.3) saturate(0.3)",
            mixBlendMode: "lighten",
            opacity: 0.3,
          }}
          animate={{
            backgroundPosition: ["50% 50%", "52% 48%", "48% 52%", "50% 50%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Water reflection shimmer */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "25%",
          background: "linear-gradient(180deg, transparent, hsl(0 10% 3% / 0.6))",
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, hsl(0 20% 20% / 0.05) 3px, hsl(0 20% 20% / 0.05) 4px)",
          }}
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Fog over water and city */}
      {fogLayers.map((fog) => (
        <motion.div
          key={fog.id}
          className="absolute left-0 w-[250%]"
          style={{
            top: `${fog.y}%`,
            height: `${fog.height}%`,
            background: `linear-gradient(90deg, transparent 0%, hsl(0 10% 20% / ${fog.opacity}) 20%, hsl(0 15% 15% / ${fog.opacity * 1.2}) 50%, hsl(0 10% 20% / ${fog.opacity}) 80%, transparent 100%)`,
            filter: "blur(8px)",
          }}
          animate={{
            x: fog.direction > 0 ? ["-60%", "0%"] : ["0%", "-60%"],
          }}
          transition={{ duration: fog.duration, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Lightning flash */}
      <AnimatePresence>
        {lightningFlash && (
          <motion.div
            className="absolute inset-0 z-[6] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.1, 0.4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ background: "hsl(220 30% 70% / 0.15)" }}
          />
        )}
      </AnimatePresence>

      {/* Dimensional portal tear in the sky */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 z-10">
        {/* Outer glow */}
        <motion.div
          className="relative"
          style={{
            width: 80 + portalOpen * 200,
            height: 30 + portalOpen * 120,
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Red glow halo */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(ellipse, hsl(0 80% 30% / ${0.3 + portalOpen * 0.4}), hsl(0 60% 15% / ${portalOpen * 0.3}), transparent 70%)`,
              filter: `blur(${10 + portalOpen * 20}px)`,
              transform: `scale(${1.5 + portalOpen * 0.5})`,
            }}
          />

          {/* Tear shape */}
          <motion.div
            className="absolute inset-0"
            style={{
              clipPath: `polygon(${50 - portalOpen * 20}% 0%, ${50 + portalOpen * 20}% 0%, ${50 + portalOpen * 25}% 50%, ${50 + portalOpen * 20}% 100%, ${50 - portalOpen * 20}% 100%, ${50 - portalOpen * 25}% 50%)`,
              background: `linear-gradient(180deg, hsl(0 70% 15%), hsl(0 90% 8%), hsl(0 70% 15%))`,
              boxShadow: `inset 0 0 ${20 + portalOpen * 40}px hsl(0 80% 25% / 0.6)`,
            }}
          />

          {/* Inner void */}
          <motion.div
            className="absolute inset-[15%]"
            style={{
              clipPath: `polygon(${50 - portalOpen * 15}% 5%, ${50 + portalOpen * 15}% 5%, ${50 + portalOpen * 18}% 50%, ${50 + portalOpen * 15}% 95%, ${50 - portalOpen * 15}% 95%, ${50 - portalOpen * 18}% 50%)`,
              background: `radial-gradient(ellipse, hsl(0 100% 5%), hsl(0 50% 2%))`,
            }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Energy tendrils from portal */}
          {portalOpen > 0.3 && Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const len = 20 + portalOpen * 60 + Math.random() * 30;
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: 2,
                  height: len,
                  left: "50%",
                  top: "50%",
                  transformOrigin: "top center",
                  transform: `rotate(${angle}rad)`,
                  background: `linear-gradient(to bottom, hsl(0 70% 40% / ${0.5 * portalOpen}), transparent)`,
                  filter: "blur(1px)",
                }}
                animate={{ opacity: [0.2, 0.7, 0.2], height: [len * 0.8, len, len * 0.8] }}
                transition={{ duration: 1 + Math.random(), repeat: Infinity, delay: i * 0.15 }}
              />
            );
          })}
        </motion.div>

        {/* Dark smoke around portal */}
        {portalOpen > 0.2 && smokeParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size * portalOpen,
              height: p.size * portalOpen,
              left: `calc(50% + ${Math.cos(p.angle) * p.distance * portalOpen}px)`,
              top: `calc(50% + ${Math.sin(p.angle) * p.distance * portalOpen}px)`,
              background: `radial-gradient(circle, hsl(0 30% 10% / ${0.4 * portalOpen}), transparent)`,
              filter: "blur(4px)",
            }}
            animate={{
              x: [0, Math.cos(p.angle) * 20, 0],
              y: [0, Math.sin(p.angle) * 20 - 10, 0],
              opacity: [0.2, 0.5 * portalOpen, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
          />
        ))}
      </div>

      {/* Floating spores */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        {spores.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full"
            style={{
              width: s.size,
              height: s.size,
              left: `${s.x}%`,
              top: `${s.y}%`,
              background: s.glow
                ? "radial-gradient(circle, hsl(0 40% 60% / 0.5), hsl(0 20% 40% / 0.1))"
                : "hsl(0 15% 50% / 0.2)",
              boxShadow: s.glow ? "0 0 8px hsl(0 50% 50% / 0.3)" : "none",
            }}
            animate={{
              y: [0, -60 - Math.random() * 100],
              x: [0, s.drift],
              opacity: [0, s.glow ? 0.7 : 0.3, 0],
            }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Scanlines */}
      <div
        className="absolute inset-0 z-[7] pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 0% 0% / 0.06) 2px, hsl(0 0% 0% / 0.06) 4px)",
        }}
      />

      {/* Red vignette */}
      <div
        className="absolute inset-0 z-[8] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, hsl(0 40% 5% / 0.7) 100%)",
        }}
      />

      {/* Text overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
        <motion.h1
          className="font-mono text-2xl sm:text-5xl font-black tracking-[0.15em] uppercase text-center"
          style={{
            color: "hsl(0 80% 55%)",
            textShadow: "0 0 30px hsl(0 90% 40%), 0 0 60px hsl(0 80% 30%), 0 0 100px hsl(0 70% 20%)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 2, ease: "easeOut" }}
        >
          THE GATE IS OPEN
        </motion.h1>

        <AnimatePresence>
          {showSecondText && (
            <motion.p
              className="font-mono text-lg sm:text-3xl font-bold tracking-[0.2em] uppercase mt-4 text-center"
              style={{
                color: "hsl(0 60% 45%)",
                textShadow: "0 0 20px hsl(0 70% 35%), 0 0 40px hsl(0 60% 25%)",
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: [0, 1, 0.8, 1] }}
              transition={{ duration: 3, ease: "easeOut" }}
            >
              NEW YORK IS NEXT
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Continue button */}
      <motion.div
        className="absolute bottom-10 left-0 right-0 z-30 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 7, duration: 2 }}
      >
        <motion.button
          onClick={() => navigate("/hub")}
          className="font-mono text-xs sm:text-sm uppercase tracking-[0.3em] px-8 py-3 rounded-sm cursor-pointer border"
          style={{
            color: "hsl(0 60% 55%)",
            borderColor: "hsl(0 40% 25%)",
            background: "hsl(0 20% 8% / 0.8)",
            boxShadow: "0 0 20px hsl(0 50% 20% / 0.4)",
          }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsl(0 60% 30% / 0.6)" }}
          whileTap={{ scale: 0.97 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Return to Hub
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

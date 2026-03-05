import { useEffect, useRef, useState } from "react";

interface WandLightProps {
  enabled: boolean;
  onPositionChange: (x: number, y: number) => void;
}

export default function WandLight({ enabled, onPositionChange }: WandLightProps) {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const sparkles = useRef<{ id: number; x: number; y: number; life: number }[]>([]);
  const [, forceRender] = useState(0);
  const nextId = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleMove = (x: number, y: number) => {
      setPos({ x, y });
      onPositionChange(x, y);

      // Add sparkle
      sparkles.current.push({
        id: nextId.current++,
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        life: 1,
      });
      if (sparkles.current.length > 20) sparkles.current.shift();
    };

    const onMouse = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY);
    };

    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: false });

    const interval = setInterval(() => {
      sparkles.current = sparkles.current
        .map((s) => ({ ...s, life: s.life - 0.05 }))
        .filter((s) => s.life > 0);
      forceRender((v) => v + 1);
    }, 50);

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      clearInterval(interval);
    };
  }, [enabled, onPositionChange]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      {/* Dark overlay with radial cutout */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle 120px at ${pos.x}px ${pos.y}px, transparent 0%, transparent 40%, rgba(0,0,0,0.85) 100%)`,
        }}
      />

      {/* Wand glow */}
      <div
        className="absolute rounded-full"
        style={{
          left: pos.x - 60,
          top: pos.y - 60,
          width: 120,
          height: 120,
          background: "radial-gradient(circle, hsl(42 90% 80% / 0.4) 0%, hsl(42 80% 60% / 0.15) 40%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />

      {/* Center bright point */}
      <div
        className="absolute rounded-full"
        style={{
          left: pos.x - 6,
          top: pos.y - 6,
          width: 12,
          height: 12,
          background: "hsl(42 95% 90%)",
          boxShadow: "0 0 15px hsl(42 90% 80%), 0 0 40px hsl(42 80% 60%), 0 0 80px hsl(42 70% 50% / 0.5)",
        }}
      />

      {/* Sparkle particles */}
      {sparkles.current.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: s.x - 1.5,
            top: s.y - 1.5,
            width: 3,
            height: 3,
            background: "hsl(42 90% 85%)",
            opacity: s.life,
            boxShadow: "0 0 4px hsl(42 90% 80%)",
            transform: `scale(${s.life})`,
            transition: "opacity 0.1s, transform 0.1s",
          }}
        />
      ))}
    </div>
  );
}

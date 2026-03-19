import { motion } from "framer-motion";

interface Props {
  revealedCount: number;
  totalTiles: number;
}

export default function CouchScene({ revealedCount, totalTiles }: Props) {
  const cols = 3;
  const rows = 2;

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div
        className="relative w-full overflow-hidden rounded-lg"
        style={{ aspectRatio: "16 / 10" }}
      >
        <img
          src="/images/friends_sketch.jpg"
          alt="The Gang"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {Array.from({ length: totalTiles }, (_, i) => (
            <motion.div
              key={i}
              className="w-full h-full"
              initial={false}
              animate={{ opacity: i < revealedCount ? 0 : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                background: "hsl(25 30% 10%)",
                borderRight: "1px solid hsl(25 30% 20% / 0.3)",
                borderBottom: "1px solid hsl(25 30% 20% / 0.3)",
                pointerEvents: i < revealedCount ? "none" : "auto",
              }}
            />
          ))}
        </div>

        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ border: "1px solid hsl(var(--friends-orange) / 0.2)" }}
        />
      </div>
    </div>
  );
}

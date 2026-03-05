import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function PortalRift() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "hsl(0 20% 3% / 0.8)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <div className="relative z-10 text-center space-y-8">
        <motion.p
          className="font-mono text-xl sm:text-3xl font-bold"
          style={{
            color: "hsl(0 75% 60%)",
            textShadow: "0 0 30px hsl(0 80% 40%), 0 0 60px hsl(0 70% 30%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          The gate is open.
        </motion.p>

        {/* Portal rift */}
        <motion.div
          className="relative w-40 h-56 sm:w-52 sm:h-72 mx-auto cursor-pointer"
          onClick={() => navigate("/hub")}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Rift glow layers */}
          <div
            className="absolute inset-0 rounded-sm"
            style={{
              background: "linear-gradient(180deg, hsl(0 60% 15%), hsl(0 80% 8%), hsl(0 60% 15%))",
              boxShadow:
                "0 0 40px hsl(0 80% 30% / 0.6), 0 0 80px hsl(0 70% 20% / 0.4), inset 0 0 30px hsl(0 80% 20% / 0.5)",
              clipPath: "polygon(35% 0%, 65% 0%, 70% 50%, 65% 100%, 35% 100%, 30% 50%)",
            }}
          />

          {/* Inner rift */}
          <motion.div
            className="absolute inset-4"
            style={{
              background: "radial-gradient(ellipse, hsl(0 90% 10%), hsl(0 50% 3%))",
              clipPath: "polygon(38% 0%, 62% 0%, 66% 50%, 62% 100%, 38% 100%, 34% 50%)",
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Mist particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 3 + Math.random() * 6,
                height: 3 + Math.random() * 6,
                background: "hsl(0 60% 40% / 0.4)",
                left: `${30 + Math.random() * 40}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30 - Math.random() * 40],
                x: [0, (Math.random() - 0.5) * 30],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>

        <motion.p
          className="text-xs font-mono"
          style={{ color: "hsl(0 40% 45%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ delay: 2, duration: 2, repeat: Infinity }}
        >
          Click the rift to return
        </motion.p>
      </div>
    </motion.div>
  );
}

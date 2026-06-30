import { motion } from "framer-motion";
import { Coffee } from "lucide-react";

export default function Loader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="loader-overlay"
    >
      <div className="loader-inner">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
          className="loader-ring"
        />

        <div className="loader-icon">
          <motion.div animate={{ scale: [1, 1.18, 1] }} transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }}>
            <Coffee size={42} />
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="loader-title"
        >
          Palette
        </motion.h1>

        <div className="loading-dots loader-dots">
          <span /><span /><span />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="loader-subtitle"
        >
          Computing your flavor space…
        </motion.p>
      </div>
    </motion.div>
  );
}

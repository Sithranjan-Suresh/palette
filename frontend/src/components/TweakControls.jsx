import { motion } from "framer-motion";

const TWEAKS = ["less sweet", "more sweet", "more body", "less bitter", "lighter"];

export default function TweakControls({ onTweak, disabled }) {
  return (
    <motion.div
      className="console-panel console-panel--compact"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <p className="panel-eyebrow">Tweak — 02</p>
      <div className="tweak-buttons">
        {TWEAKS.map((tweak) => (
          <motion.button
            key={tweak}
            type="button"
            disabled={disabled}
            onClick={() => onTweak(tweak)}
            whileHover={!disabled ? { scale: 1.06, rotate: -2 } : undefined}
            whileTap={!disabled ? { scale: 0.92 } : undefined}
          >
            {tweak}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

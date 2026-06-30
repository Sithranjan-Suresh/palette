import { AnimatePresence, motion } from "framer-motion";
import { Flame } from "lucide-react";

export default function KeptMenuPanel({ keptMenu, onRemove }) {
  if (!keptMenu || keptMenu.length === 0) return null;

  return (
    <motion.div
      className="console-panel console-panel--compact kept-menu-panel"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <p className="panel-eyebrow">
        <Flame size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
        Your menu — streak {keptMenu.length}
      </p>
      <p className="panel-note">
        Kept drinks count as real menu coverage in every future gap computation —
        saved on this device, survives a reload.
      </p>
      <ul className="kept-menu-list">
        <AnimatePresence>
          {keptMenu.map((item) => (
            <motion.li
              key={item.name}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <span>{item.name}</span>
              <button
                type="button"
                onClick={() => onRemove(item.name)}
                aria-label={`Remove ${item.name} from your menu`}
              >
                ×
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  );
}

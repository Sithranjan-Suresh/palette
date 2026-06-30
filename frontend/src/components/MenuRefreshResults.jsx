import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const DRINK_COLORS = ["#ff7a1a", "#5ab8f0", "#ff6fa8", "#6bd66f", "#ffd23f", "#ff5a5a"];

function truncate(text, max) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
};

export default function MenuRefreshResults({ items, failedCount, onKeep, keptNames }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="refresh-results">
      <div className="refresh-results-header">
        <p className="panel-eyebrow panel-eyebrow--paper">Proposed menu — {items.length} drinks</p>
        {failedCount > 0 && (
          <p className="refresh-partial-note">
            {failedCount} item{failedCount > 1 ? "s" : ""} couldn't be generated this round — showing the rest.
          </p>
        )}
      </div>

      <motion.div className="refresh-grid" variants={gridVariants} initial="hidden" animate="visible">
        {items.map((item, i) => {
          const drink = item.drink;
          const color = DRINK_COLORS[i % DRINK_COLORS.length];
          const isKept = keptNames ? keptNames.has(drink.name) : false;
          return (
            <motion.div
              className="refresh-card"
              key={drink.name + i}
              style={{ borderTopColor: color }}
              variants={cardVariants}
              whileHover={{ y: -4, x: -2 }}
            >
              <div className="refresh-card-header">
                <h3>{truncate(drink.name, 42)}</h3>
                <span className={`temp-badge temp-badge--${drink.flavor.temperature}`}>
                  {drink.flavor.temperature === "iced" ? "Iced" : "Hot"}
                </span>
              </div>
              <p className="refresh-tasting-note">{truncate(drink.tasting_note, 110)}</p>

              {drink.constraint_warnings && drink.constraint_warnings.length > 0 && (
                <p className="constraint-warning constraint-warning--compact">
                  ⚠ {drink.constraint_warnings[0]}
                </p>
              )}

              <ul className="refresh-ratios">
                {drink.ratios.map((r, j) => (
                  <li key={j}>
                    <span className="ratio-amount">{r.amount}</span> {r.ingredient}
                  </li>
                ))}
              </ul>
              <div className="refresh-card-footer">
                <p className="refresh-cost">
                  ${drink.estimated_cost.toFixed(2)}
                  <span className={`cost-badge cost-badge--${drink.cost_source}`}>
                    {drink.cost_source === "computed"
                      ? drink.priced_with_reference_data ? "ref. priced" : "computed"
                      : "estimated"}
                  </span>
                </p>
                {onKeep && (
                  <motion.button
                    type="button"
                    className="keep-btn keep-btn--small"
                    disabled={isKept}
                    onClick={() => onKeep(drink)}
                    whileHover={!isKept ? { scale: 1.06 } : undefined}
                    whileTap={!isKept ? { scale: 0.92 } : undefined}
                  >
                    {isKept ? <Check size={12} /> : <Sparkles size={12} />}
                    {isKept ? "Kept" : "Keep"}
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Printer, Sparkles, Check } from "lucide-react";

function truncate(text, max) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

function costBadgeLabel(drink) {
  if (drink.cost_source !== "computed") return "no prices entered";
  return drink.priced_with_reference_data ? "incl. reference prices" : "from your prices";
}

export default function RecipeCard({ drink, onKeep, isKept }) {
  if (!drink) {
    return (
      <div className="recipe-ticket recipe-ticket--empty">
        <p className="panel-eyebrow panel-eyebrow--paper">Recipe — 03</p>
        <p>Compute a drink to print the ticket here.</p>
      </div>
    );
  }

  const radarData = [
    { axis: "Sweet", value: drink.flavor.sweetness },
    { axis: "Acid", value: drink.flavor.acidity },
    { axis: "Body", value: drink.flavor.body },
    { axis: "Bitter", value: drink.flavor.bitterness },
  ];

  return (
    <motion.div
      key={drink.name}
      className="recipe-ticket"
      initial={{ opacity: 0, y: 24, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
    >
      <div className="recipe-ticket-header">
        <p className="panel-eyebrow panel-eyebrow--paper">Recipe — 03</p>
        <div className="recipe-ticket-actions">
          {onKeep && (
            <motion.button
              type="button"
              className="keep-btn"
              disabled={isKept}
              onClick={() => onKeep(drink)}
              whileHover={!isKept ? { scale: 1.04 } : undefined}
              whileTap={!isKept ? { scale: 0.94 } : undefined}
            >
              {isKept ? <Check size={14} /> : <Sparkles size={14} />}
              {isKept ? "On your menu" : "Add to menu"}
            </motion.button>
          )}
          <button type="button" className="print-btn" onClick={() => window.print()}>
            <Printer size={13} /> Print ticket
          </button>
        </div>
      </div>

      <div className="recipe-title-row">
        <h2>{truncate(drink.name, 60)}</h2>
        <span className={`temp-badge temp-badge--${drink.flavor.temperature}`}>
          {drink.flavor.temperature === "iced" ? "Iced" : "Hot"}
        </span>
      </div>

      <p className="tasting-note">{truncate(drink.tasting_note, 220)}</p>

      {drink.constraint_warnings && drink.constraint_warnings.length > 0 && (
        <div className="constraint-warning">
          {drink.constraint_warnings.map((w, i) => (
            <p key={i}>⚠ {w}</p>
          ))}
        </div>
      )}

      <div className="recipe-ticket-body">
        <div className="recipe-ratios">
          <h3>Build</h3>
          <ul>
            {drink.ratios.map((r, i) => (
              <li key={i}>
                <span className="ratio-amount">{r.amount}</span> {r.ingredient}
              </li>
            ))}
          </ul>

          <h3>Steps</h3>
          <ol>
            {drink.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          <p className="cost-estimate">
            {drink.cost_source === "computed" ? "Computed cost" : "Estimated cost"}{" "}
            <strong>${drink.estimated_cost.toFixed(2)}</strong>
            <span className={`cost-badge cost-badge--${drink.cost_source}`}>
              {costBadgeLabel(drink)}
            </span>
          </p>
        </div>

        <div className="recipe-radar">
          <ResponsiveContainer width="100%" height={190}>
            <RadarChart data={radarData} outerRadius={68}>
              <PolarGrid stroke="var(--neo-black)" strokeOpacity={0.25} />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontSize: 10, fill: "var(--ink)", fontFamily: "var(--font-display)", fontWeight: 700 }}
              />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="var(--neo-orange)" fill="var(--neo-orange)" fillOpacity={0.45} strokeWidth={2.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

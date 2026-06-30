const DRINK_COLORS = ["#e0651c", "#d4972b", "#c2483b", "#9b6b3c", "#b8862e", "#a14a3e"];

function truncate(text, max) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

export default function MenuRefreshResults({ items, failedCount }) {
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

      <div className="refresh-grid">
        {items.map((item, i) => {
          const drink = item.drink;
          const color = DRINK_COLORS[i % DRINK_COLORS.length];
          return (
            <div className="refresh-card" key={drink.name + i} style={{ borderTopColor: color }}>
              <div className="refresh-card-header">
                <h3>{truncate(drink.name, 42)}</h3>
                <span className={`temp-badge temp-badge--${drink.flavor.temperature}`}>
                  {drink.flavor.temperature === "iced" ? "Iced" : "Hot"}
                </span>
              </div>
              <p className="refresh-tasting-note">{truncate(drink.tasting_note, 110)}</p>
              <ul className="refresh-ratios">
                {drink.ratios.map((r, j) => (
                  <li key={j}>
                    <span className="ratio-amount">{r.amount}</span> {r.ingredient}
                  </li>
                ))}
              </ul>
              <p className="refresh-cost">${drink.estimated_cost.toFixed(2)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

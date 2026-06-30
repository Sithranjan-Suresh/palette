const DRINK_COLORS = ["#e0651c", "#d4972b", "#c2483b", "#9b6b3c", "#b8862e", "#a14a3e"];

function truncate(text, max) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

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

      <div className="refresh-grid">
        {items.map((item, i) => {
          const drink = item.drink;
          const color = DRINK_COLORS[i % DRINK_COLORS.length];
          const isKept = keptNames ? keptNames.has(drink.name) : false;
          return (
            <div className="refresh-card" key={drink.name + i} style={{ borderTopColor: color }}>
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
                  <button
                    type="button"
                    className="keep-btn keep-btn--small"
                    disabled={isKept}
                    onClick={() => onKeep(drink)}
                  >
                    {isKept ? "Kept" : "+ Keep"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

function truncate(text, max) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

export default function RecipeCard({ drink }) {
  if (!drink) {
    return (
      <div className="recipe-card recipe-card--empty">
        <p>Generate a drink to see the recipe card here.</p>
      </div>
    );
  }

  const radarData = [
    { axis: "Sweetness", value: drink.flavor.sweetness },
    { axis: "Acidity", value: drink.flavor.acidity },
    { axis: "Body", value: drink.flavor.body },
    { axis: "Bitterness", value: drink.flavor.bitterness },
  ];

  return (
    <div className="recipe-card">
      <div className="recipe-card-header">
        <h2>{truncate(drink.name, 60)}</h2>
        <span className={`temp-badge temp-badge--${drink.flavor.temperature}`}>
          {drink.flavor.temperature === "iced" ? "Iced" : "Hot"}
        </span>
        <button type="button" className="print-btn" onClick={() => window.print()}>
          Print
        </button>
      </div>

      <p className="tasting-note">{truncate(drink.tasting_note, 220)}</p>

      <div className="recipe-card-body">
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
            Estimated cost: <strong>${drink.estimated_cost.toFixed(2)}</strong>
          </p>
        </div>

        <div className="recipe-radar">
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} outerRadius={70}>
              <PolarGrid />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="#e8590c" fill="#e8590c" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

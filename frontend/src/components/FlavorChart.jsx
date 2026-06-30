import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  ReferenceArea,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DRINK_COLORS = ["#e0651c", "#d4972b", "#c2483b", "#9b6b3c", "#b8862e", "#a14a3e"];

function makeGeneratedDot(color) {
  return function GeneratedDot(props) {
    const { cx, cy } = props;
    if (cx == null || cy == null) return null;
    return (
      <g>
        <circle cx={cx} cy={cy} r={11} fill={color} opacity={0.18} className="generated-halo" />
        <circle cx={cx} cy={cy} r={4.5} fill={color} stroke="var(--paper)" strokeWidth={1.5} />
      </g>
    );
  };
}

function BaselineDot(props) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={4} fill="var(--ink-dim)" />;
}

function KeptDot(props) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="none" stroke="var(--accent-acid)" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={1.5} fill="var(--accent-acid)" />
    </g>
  );
}

export default function FlavorChart({
  baselineMenu,
  keptMenu,
  generatedDrink,
  gapTarget,
  generatedDrinks,
  gapTargets,
}) {
  const drinks = generatedDrinks && generatedDrinks.length > 0
    ? generatedDrinks
    : generatedDrink
      ? [generatedDrink]
      : [];

  const targets = gapTargets && gapTargets.length > 0
    ? gapTargets
    : gapTarget
      ? [gapTarget]
      : [];

  const multiMode = drinks.length > 1;

  const baselinePoints = baselineMenu.map((item) => ({
    name: item.name,
    sweetness: item.flavor.sweetness,
    body: item.flavor.body,
  }));

  const keptPoints = (keptMenu || []).map((item) => ({
    name: item.name,
    sweetness: item.flavor.sweetness,
    body: item.flavor.body,
  }));

  return (
    <div className="instrument-panel">
      <div className="instrument-header">
        <p className="panel-eyebrow">Flavor map — sweetness × body</p>
        <h2>{multiMode ? "Live readout — menu refresh" : "Live readout"}</h2>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <ScatterChart margin={{ top: 16, right: 24, bottom: 28, left: 8 }}>
          <XAxis
            type="number"
            dataKey="sweetness"
            name="Sweetness"
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: "var(--ink-faint)", fontFamily: "var(--font-mono)", fontSize: 11 }}
            axisLine={{ stroke: "var(--line)" }}
            tickLine={{ stroke: "var(--line)" }}
            label={{
              value: "SWEETNESS →",
              position: "insideBottom",
              offset: -16,
              fill: "var(--ink-faint)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
            }}
          />
          <YAxis
            type="number"
            dataKey="body"
            name="Body"
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: "var(--ink-faint)", fontFamily: "var(--font-mono)", fontSize: 11 }}
            axisLine={{ stroke: "var(--line)" }}
            tickLine={{ stroke: "var(--line)" }}
            label={{
              value: "BODY →",
              angle: -90,
              position: "insideLeft",
              fill: "var(--ink-faint)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
            }}
          />
          <ZAxis range={[100, 100]} />

          {targets.map((t, i) => (
            <ReferenceArea
              key={i}
              x1={t.sweetness_range[0]}
              x2={t.sweetness_range[1]}
              y1={t.body_range[0]}
              y2={t.body_range[1]}
              stroke="var(--accent-acid)"
              strokeDasharray="4 3"
              fill="var(--accent-acid)"
              fillOpacity={drinks.length > 0 ? 0.05 : 0.1}
              ifOverflow="extendDomain"
            />
          ))}

          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "var(--line)" }}
            content={({ payload }) =>
              payload && payload.length ? (
                <div className="chart-tooltip">
                  <strong>{payload[0].payload.name}</strong>
                  <div>sweetness {payload[0].payload.sweetness}</div>
                  <div>body {payload[0].payload.body}</div>
                </div>
              ) : null
            }
          />

          <Scatter name="Existing menu" data={baselinePoints} shape={<BaselineDot />} />
          {keptPoints.length > 0 && (
            <Scatter name="Your menu" data={keptPoints} shape={<KeptDot />} />
          )}
          {drinks.map((d, i) => (
            <Scatter
              key={d.name + i}
              name={d.name}
              data={[{ name: d.name, sweetness: d.flavor.sweetness, body: d.flavor.body }]}
              shape={makeGeneratedDot(DRINK_COLORS[i % DRINK_COLORS.length])}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      <div className="instrument-legend">
        <span><i className="legend-dot legend-dot--baseline" /> existing menu</span>
        {keptPoints.length > 0 && (
          <span><i className="legend-dot legend-dot--kept" /> your menu</span>
        )}
        {multiMode ? (
          drinks.map((d, i) => (
            <span key={d.name + i}>
              <i className="legend-dot" style={{ background: DRINK_COLORS[i % DRINK_COLORS.length] }} />
              {d.name}
            </span>
          ))
        ) : (
          <span><i className="legend-dot legend-dot--generated" /> invented drink</span>
        )}
        {targets.length > 0 && (
          <span><i className="legend-dot legend-dot--target" /> computed gap{targets.length > 1 ? "s" : ""}</span>
        )}
      </div>
    </div>
  );
}

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  ReferenceArea,
  Label,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DRINK_COLORS = ["#ff7a1a", "#5ab8f0", "#ff6fa8", "#6bd66f", "#ffd23f", "#ff5a5a"];

function makeGeneratedDot(color) {
  return function GeneratedDot(props) {
    const { cx, cy } = props;
    if (cx == null || cy == null) return null;
    return (
      <g style={{ animation: "pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        <circle cx={cx} cy={cy} r={14} fill={color} opacity={0.28} className="generated-halo" />
        <circle cx={cx} cy={cy} r={7} fill={color} stroke="var(--neo-black)" strokeWidth={2} />
      </g>
    );
  };
}

function BaselineDot(props) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={6} fill="var(--ink-dim)" stroke="var(--neo-black)" strokeWidth={1.5} />;
}

function KeptDot(props) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="var(--neo-green-soft)" stroke="var(--neo-green)" strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={2.5} fill="var(--neo-black)" />
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
            tick={{ fill: "var(--ink-dim)", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600 }}
            axisLine={{ stroke: "var(--neo-black)", strokeWidth: 2 }}
            tickLine={{ stroke: "var(--neo-black)" }}
            label={{
              value: "SWEETNESS →",
              position: "insideBottom",
              offset: -16,
              fill: "var(--ink-dim)",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 10,
            }}
          />
          <YAxis
            type="number"
            dataKey="body"
            name="Body"
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: "var(--ink-dim)", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600 }}
            axisLine={{ stroke: "var(--neo-black)", strokeWidth: 2 }}
            tickLine={{ stroke: "var(--neo-black)" }}
            label={{
              value: "BODY →",
              angle: -90,
              position: "insideLeft",
              fill: "var(--ink-dim)",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
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
              stroke="var(--neo-green)"
              strokeWidth={2}
              strokeDasharray="6 4"
              fill="var(--neo-green)"
              fillOpacity={drinks.length > 0 ? 0.08 : 0.16}
              ifOverflow="extendDomain"
            >
              {targets.length <= 1 && (
                <Label
                  value="computed gap"
                  position="insideTopLeft"
                  fill="#2c6e30"
                  fontFamily="var(--font-display)"
                  fontWeight={700}
                  fontSize={10}
                />
              )}
            </ReferenceArea>
          ))}

          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "var(--neo-black)" }}
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
              <i className="legend-dot" style={{ background: DRINK_COLORS[i % DRINK_COLORS.length], border: "1.5px solid var(--neo-black)" }} />
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

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

function GeneratedDot(props) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={11} fill="var(--accent-brew-soft)" className="generated-halo" />
      <circle cx={cx} cy={cy} r={4.5} fill="var(--accent-brew)" stroke="var(--paper)" strokeWidth={1.5} />
    </g>
  );
}

function BaselineDot(props) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={4} fill="var(--ink-dim)" />;
}

export default function FlavorChart({ baselineMenu, generatedDrink, gapTarget }) {
  const baselinePoints = baselineMenu.map((item) => ({
    name: item.name,
    sweetness: item.flavor.sweetness,
    body: item.flavor.body,
  }));

  const generatedPoint = generatedDrink
    ? [
        {
          name: generatedDrink.name,
          sweetness: generatedDrink.flavor.sweetness,
          body: generatedDrink.flavor.body,
        },
      ]
    : [];

  return (
    <div className="instrument-panel">
      <div className="instrument-header">
        <p className="panel-eyebrow">Flavor map — sweetness × body</p>
        <h2>Live readout</h2>
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

          {gapTarget && (
            <ReferenceArea
              x1={gapTarget.sweetness_range[0]}
              x2={gapTarget.sweetness_range[1]}
              y1={gapTarget.body_range[0]}
              y2={gapTarget.body_range[1]}
              stroke="var(--accent-acid)"
              strokeDasharray="4 3"
              fill="var(--accent-acid)"
              fillOpacity={generatedDrink ? 0.05 : 0.1}
              ifOverflow="extendDomain"
            />
          )}

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
          {generatedPoint.length > 0 && (
            <Scatter name="Invented drink" data={generatedPoint} shape={<GeneratedDot />} />
          )}
        </ScatterChart>
      </ResponsiveContainer>

      <div className="instrument-legend">
        <span><i className="legend-dot legend-dot--baseline" /> existing menu</span>
        <span><i className="legend-dot legend-dot--generated" /> invented drink</span>
        {gapTarget && (
          <span><i className="legend-dot legend-dot--target" /> computed gap</span>
        )}
      </div>
    </div>
  );
}

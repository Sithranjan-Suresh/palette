import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function FlavorChart({ baselineMenu, generatedDrink }) {
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
    <div className="flavor-chart">
      <h2>Flavor map</h2>
      <p className="chart-subtitle">Sweetness vs. body — existing menu vs. invented drink</p>
      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="sweetness"
            name="Sweetness"
            domain={[0, 10]}
            label={{ value: "Sweetness →", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            type="number"
            dataKey="body"
            name="Body"
            domain={[0, 10]}
            label={{ value: "Body →", angle: -90, position: "insideLeft" }}
          />
          <ZAxis range={[120, 120]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value) => value}
            labelFormatter={() => ""}
            content={({ payload }) =>
              payload && payload.length ? (
                <div className="chart-tooltip">
                  <strong>{payload[0].payload.name}</strong>
                  <div>Sweetness: {payload[0].payload.sweetness}</div>
                  <div>Body: {payload[0].payload.body}</div>
                </div>
              ) : null
            }
          />
          <Legend />
          <Scatter name="Existing menu" data={baselinePoints} fill="#8884d8" />
          {generatedPoint.length > 0 && (
            <Scatter name="Invented drink" data={generatedPoint} fill="#e8590c" shape="star" />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

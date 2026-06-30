const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function fetchBaselineMenu() {
  const res = await fetch(`${API_BASE_URL}/api/baseline-menu`);
  if (!res.ok) throw new Error("Failed to load baseline menu");
  return res.json();
}

export async function fetchGapTarget(styleConstraint) {
  const res = await fetch(`${API_BASE_URL}/api/gap-target`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ style_constraint: styleConstraint || null }),
  });
  if (!res.ok) throw new Error("Failed to compute gap target");
  return res.json();
}

export async function generateDrink(generationRequest) {
  const res = await fetch(`${API_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(generationRequest),
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data?.detail || data?.error || "Couldn't generate a drink, please try again.";
    throw new Error(message);
  }
  return data.drink;
}

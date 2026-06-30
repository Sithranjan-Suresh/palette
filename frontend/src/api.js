const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const FRIENDLY_NETWORK_ERROR =
  "Can't reach the server — it may be waking up (Render free tier sleeps). " +
  "Wait 30–60 seconds and try again. If it keeps failing, check the backend URL in Vercel settings.";

function handleNetworkError(err) {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    throw new Error(FRIENDLY_NETWORK_ERROR);
  }
  throw err;
}

/** Fire-and-forget ping to wake the Render free-tier backend before the user hits generate. */
export function pingBackend() {
  fetch(`${API_BASE_URL}/`).catch(() => {});
}

export async function fetchBaselineMenu() {
  const res = await fetch(`${API_BASE_URL}/api/baseline-menu`).catch(handleNetworkError);
  if (!res.ok) throw new Error("Failed to load baseline menu");
  return res.json();
}

export async function fetchGapTarget(styleConstraint, extraMenu = []) {
  const res = await fetch(`${API_BASE_URL}/api/gap-target`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ style_constraint: styleConstraint || null, extra_menu: extraMenu }),
  }).catch(handleNetworkError);
  if (!res.ok) throw new Error("Failed to compute gap target");
  return res.json();
}

export async function generateDrink(generationRequest) {
  const res = await fetch(`${API_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(generationRequest),
  }).catch(handleNetworkError);
  const data = await res.json();
  if (!res.ok) {
    const message = data?.detail || data?.error || "Couldn't generate a drink, please try again.";
    throw new Error(message);
  }
  return data.drink;
}

export async function refreshMenu(menuRefreshRequest) {
  const res = await fetch(`${API_BASE_URL}/api/menu-refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(menuRefreshRequest),
  }).catch(handleNetworkError);
  const data = await res.json();
  if (!res.ok) {
    const message = data?.detail || data?.error || "Couldn't refresh the menu, please try again.";
    throw new Error(message);
  }
  return data;
}

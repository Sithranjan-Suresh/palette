import { useEffect, useRef, useState } from "react";
import "./App.css";
import IngredientForm from "./components/IngredientForm";
import FlavorChart from "./components/FlavorChart";
import RecipeCard from "./components/RecipeCard";
import TweakControls from "./components/TweakControls";
import { fetchBaselineMenu, fetchGapTarget, generateDrink } from "./api";

const DEBOUNCE_MS = 400;
const GAP_DEBOUNCE_MS = 350;

function App() {
  const [baselineMenu, setBaselineMenu] = useState([]);
  const [generationRequest, setGenerationRequest] = useState(null);
  const [generatedDrink, setGeneratedDrink] = useState(null);
  const [gapTarget, setGapTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);
  const gapDebounceRef = useRef(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    fetchBaselineMenu()
      .then(setBaselineMenu)
      .catch(() => setError("Couldn't load the baseline menu."));
    fetchGapTarget(null).then(setGapTarget).catch(() => {});
  }, []);

  function handleStyleConstraintChange(value) {
    if (gapDebounceRef.current) clearTimeout(gapDebounceRef.current);
    gapDebounceRef.current = setTimeout(() => {
      fetchGapTarget(value).then(setGapTarget).catch(() => {});
    }, GAP_DEBOUNCE_MS);
  }

  function runGeneration(request) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setIsLoading(true);
      setError(null);
      try {
        const drink = await generateDrink(request);
        setGeneratedDrink(drink);
        setGenerationRequest(request);
      } catch (err) {
        setError(err.message || "Couldn't generate, try again.");
      } finally {
        setIsLoading(false);
        inFlightRef.current = false;
      }
    }, DEBOUNCE_MS);
  }

  function handleSubmit(request) {
    runGeneration(request);
  }

  function handleTweak(tweak) {
    if (!generationRequest || !generatedDrink) return;
    runGeneration({
      ...generationRequest,
      tweak,
      previous_drink: generatedDrink,
    });
  }

  return (
    <div className="app">
      <header className="app-header">
        <p className="header-eyebrow">Flavor-space engine for cafés</p>
        <h1>Palette</h1>
        <p className="tagline">It doesn't look up a recipe. It computes one.</p>
      </header>

      <main>
        <section className="input-section">
          <IngredientForm
            onSubmit={handleSubmit}
            onStyleConstraintChange={handleStyleConstraintChange}
            isLoading={isLoading}
          />
          {generatedDrink && (
            <TweakControls onTweak={handleTweak} disabled={isLoading} />
          )}
        </section>

        <section className="results-section">
          <FlavorChart
            baselineMenu={baselineMenu}
            generatedDrink={generatedDrink}
            gapTarget={gapTarget}
          />
          {isLoading && <p className="loading-indicator">Computing the flavor gap…</p>}
          {error && <p className="generation-error">{error}</p>}
          <RecipeCard drink={generatedDrink} />
        </section>
      </main>
    </div>
  );
}

export default App;

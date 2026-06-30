import { useState } from "react";

export default function IngredientForm({ onSubmit, isLoading }) {
  const [ingredients, setIngredients] = useState([{ name: "", cost: "" }]);
  const [outOfStock, setOutOfStock] = useState("");
  const [mustUse, setMustUse] = useState("");
  const [styleConstraint, setStyleConstraint] = useState("");
  const [error, setError] = useState("");

  function updateIngredient(idx, field, value) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing))
    );
  }

  function addIngredientRow() {
    setIngredients((prev) => [...prev, { name: "", cost: "" }]);
  }

  function removeIngredientRow(idx) {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const cleaned = ingredients
      .map((i) => ({ name: i.name.trim(), cost: i.cost }))
      .filter((i) => i.name.length > 0);

    if (cleaned.length < 2) {
      setError("Please enter at least 2 ingredients.");
      return;
    }
    setError("");

    onSubmit({
      available_ingredients: cleaned.map((i) => ({
        name: i.name,
        cost_per_unit: i.cost ? parseFloat(i.cost) : null,
      })),
      out_of_stock: outOfStock
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      must_use: mustUse
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      style_constraint: styleConstraint.trim() || null,
    });
  }

  return (
    <form className="ingredient-form" onSubmit={handleSubmit}>
      <h2>What's in the building today?</h2>

      <div className="ingredient-rows">
        {ingredients.map((ing, idx) => (
          <div className="ingredient-row" key={idx}>
            <input
              type="text"
              placeholder="Ingredient name"
              value={ing.name}
              maxLength={40}
              onChange={(e) => updateIngredient(idx, "name", e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Cost/unit ($)"
              value={ing.cost}
              onChange={(e) => updateIngredient(idx, "cost", e.target.value)}
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeIngredientRow(idx)}
                aria-label="Remove ingredient"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="add-btn" onClick={addIngredientRow}>
        + Add ingredient
      </button>

      <label>
        Out of stock (comma separated)
        <input
          type="text"
          placeholder="e.g. oat milk, vanilla syrup"
          maxLength={200}
          value={outOfStock}
          onChange={(e) => setOutOfStock(e.target.value)}
        />
      </label>

      <label>
        Must use (comma separated)
        <input
          type="text"
          placeholder="e.g. brown sugar syrup"
          maxLength={200}
          value={mustUse}
          onChange={(e) => setMustUse(e.target.value)}
        />
      </label>

      <label>
        Style constraint
        <input
          type="text"
          placeholder="e.g. no dairy, iced only"
          maxLength={120}
          value={styleConstraint}
          onChange={(e) => setStyleConstraint(e.target.value)}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="generate-btn" disabled={isLoading}>
        {isLoading ? "Computing…" : "Generate drink"}
      </button>
    </form>
  );
}

import { useState } from "react";
import TagInput from "./TagInput";

export default function IngredientForm({
  onSubmit,
  onRefresh,
  onStyleConstraintChange,
  isLoading,
  isRefreshing,
  refreshCount,
  onRefreshCountChange,
}) {
  const [ingredients, setIngredients] = useState([{ name: "", cost: "" }]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [mustUse, setMustUse] = useState([]);
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

  function handleStyleChange(value) {
    setStyleConstraint(value);
    onStyleConstraintChange?.(value);
  }

  function buildPayload() {
    const cleaned = ingredients
      .map((i) => ({ name: i.name.trim(), cost: i.cost }))
      .filter((i) => i.name.length > 0);

    if (cleaned.length < 2) {
      setError("Enter at least 2 ingredients to compute a drink.");
      return null;
    }
    setError("");

    return {
      available_ingredients: cleaned.map((i) => ({
        name: i.name,
        cost_per_unit: i.cost ? parseFloat(i.cost) : null,
      })),
      out_of_stock: outOfStock,
      must_use: mustUse,
      style_constraint: styleConstraint.trim() || null,
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = buildPayload();
    if (payload) onSubmit(payload);
  }

  function handleRefreshClick() {
    const payload = buildPayload();
    if (payload) onRefresh(payload);
  }

  return (
    <form className="console-panel" onSubmit={handleSubmit}>
      <p className="panel-eyebrow">Inputs — 01</p>
      <h2>What's in the building today?</h2>

      <div className="ingredient-rows">
        {ingredients.map((ing, idx) => (
          <div className="ingredient-row" key={idx}>
            <input
              type="text"
              placeholder="Ingredient"
              value={ing.name}
              maxLength={40}
              onChange={(e) => updateIngredient(idx, "name", e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              placeholder="$/unit"
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

      <TagInput
        label="Out of stock"
        placeholder="type and press Enter"
        tags={outOfStock}
        onChange={setOutOfStock}
        tone="danger"
      />

      <TagInput
        label="Must use"
        placeholder="type and press Enter"
        tags={mustUse}
        onChange={setMustUse}
        tone="accent"
      />

      <label className="field-label">
        Style constraint
        <input
          type="text"
          placeholder="e.g. no dairy, iced only"
          maxLength={120}
          value={styleConstraint}
          onChange={(e) => handleStyleChange(e.target.value)}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="compute-btn" disabled={isLoading || isRefreshing}>
        {isLoading ? "Computing…" : "Compute drink"}
      </button>

      <div className="refresh-divider">
        <span>or</span>
      </div>

      <div className="refresh-row">
        <label className="count-label">
          Refresh
          <select
            value={refreshCount}
            disabled={isRefreshing || isLoading}
            onChange={(e) => onRefreshCountChange(Number(e.target.value))}
          >
            {[2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n} drinks</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="refresh-btn"
          disabled={isLoading || isRefreshing}
          onClick={handleRefreshClick}
        >
          {isRefreshing ? "Computing batch…" : "Refresh whole menu"}
        </button>
      </div>
    </form>
  );
}

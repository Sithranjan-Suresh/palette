import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Coffee, Shuffle, Zap } from "lucide-react";
import TagInput from "./TagInput";

// Task 6: 7am single-drink demo scenario (exactly from demo_script.md)
const SINGLE_DEMO = {
  ingredients: [
    { name: "espresso", cost: "0.60" },
    { name: "oat milk", cost: "0.15" },
    { name: "brown sugar syrup", cost: "0.25" },
    { name: "cinnamon", cost: "0.05" },
  ],
  outOfStock: ["whole milk"],
  mustUse: ["brown sugar syrup"],
  styleConstraint: "no dairy, iced only",
};

// Task 1: Rich batch demo preset — diverse enough to prevent name convergence
const BATCH_DEMO = {
  ingredients: [
    { name: "espresso", cost: "0.60" },
    { name: "oat milk", cost: "0.15" },
    { name: "brown sugar syrup", cost: "0.25" },
    { name: "matcha", cost: "0.45" },
    { name: "cold brew concentrate", cost: "0.40" },
    { name: "vanilla syrup", cost: "0.20" },
    { name: "lemon", cost: "0.25" },
    { name: "honey", cost: "0.20" },
    { name: "mint", cost: "0.15" },
    { name: "cinnamon", cost: "0.05" },
  ],
  outOfStock: ["whole milk"],
  mustUse: [],
  styleConstraint: "mix of hot and iced",
};

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

  function loadPreset(preset) {
    setIngredients(preset.ingredients);
    setOutOfStock(preset.outOfStock);
    setMustUse(preset.mustUse);
    setStyleConstraint(preset.styleConstraint);
    onStyleConstraintChange?.(preset.styleConstraint);
    setError("");
  }

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

  const isEmpty = ingredients.every((i) => !i.name.trim());

  return (
    <form className="console-panel" onSubmit={handleSubmit}>
      <p className="panel-eyebrow">Inputs — 01</p>
      <h2>What's in the building today?</h2>

      {/* Demo preset strip */}
      <AnimatePresence>
        {isEmpty && (
          <motion.div
            className="demo-presets"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <span className="demo-presets-label">Try a scenario:</span>
            <button type="button" className="demo-preset-btn" onClick={() => loadPreset(SINGLE_DEMO)}>
              <Coffee size={13} /> 7am oat milk crisis
            </button>
            <button type="button" className="demo-preset-btn demo-preset-btn--blue" onClick={() => loadPreset(BATCH_DEMO)}>
              <Shuffle size={13} /> Full menu refresh
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
      <motion.button
        type="button"
        className="add-btn"
        onClick={addIngredientRow}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
      >
        <Plus size={14} /> Add ingredient
      </motion.button>

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

      <motion.button
        type="submit"
        className="compute-btn"
        disabled={isLoading || isRefreshing}
        whileHover={!(isLoading || isRefreshing) ? { scale: 1.02 } : undefined}
        whileTap={!(isLoading || isRefreshing) ? { scale: 0.97 } : undefined}
      >
        <Coffee size={17} /> {isLoading ? "Computing…" : "Compute drink"}
      </motion.button>

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
        <motion.button
          type="button"
          className="refresh-btn"
          disabled={isLoading || isRefreshing}
          onClick={handleRefreshClick}
          whileHover={!(isLoading || isRefreshing) ? { scale: 1.02 } : undefined}
          whileTap={!(isLoading || isRefreshing) ? { scale: 0.97 } : undefined}
        >
          <Shuffle size={15} /> {isRefreshing ? "Computing batch…" : "Refresh whole menu"}
        </motion.button>
      </div>
    </form>
  );
}

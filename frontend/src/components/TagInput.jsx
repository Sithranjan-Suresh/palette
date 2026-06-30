import { useState } from "react";

export default function TagInput({ label, placeholder, tags, onChange, tone = "accent" }) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const value = draft.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setDraft("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && !draft && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(idx) {
    onChange(tags.filter((_, i) => i !== idx));
  }

  return (
    <label className="field-label">
      {label}
      <div className={`tag-input tag-input--${tone}`}>
        {tags.map((tag, idx) => (
          <span className="tag-chip" key={tag}>
            {tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          placeholder={tags.length === 0 ? placeholder : ""}
          maxLength={40}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
        />
      </div>
    </label>
  );
}

const TWEAKS = ["less sweet", "more sweet", "more body", "less bitter", "lighter"];

export default function TweakControls({ onTweak, disabled }) {
  return (
    <div className="console-panel console-panel--compact">
      <p className="panel-eyebrow">Tweak — 02</p>
      <div className="tweak-buttons">
        {TWEAKS.map((tweak) => (
          <button
            key={tweak}
            type="button"
            disabled={disabled}
            onClick={() => onTweak(tweak)}
          >
            {tweak}
          </button>
        ))}
      </div>
    </div>
  );
}

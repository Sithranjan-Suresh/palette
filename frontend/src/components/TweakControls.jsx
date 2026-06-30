const TWEAKS = ["less sweet", "more sweet", "more body", "less bitter", "lighter"];

export default function TweakControls({ onTweak, disabled }) {
  return (
    <div className="tweak-controls">
      <h3>Tweak live</h3>
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

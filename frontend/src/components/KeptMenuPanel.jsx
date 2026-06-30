export default function KeptMenuPanel({ keptMenu, onRemove }) {
  if (!keptMenu || keptMenu.length === 0) return null;

  return (
    <div className="console-panel console-panel--compact kept-menu-panel">
      <p className="panel-eyebrow">Your menu — 05</p>
      <p className="panel-note">
        Kept drinks count as real menu coverage in every future gap computation —
        saved on this device, survives a reload.
      </p>
      <ul className="kept-menu-list">
        {keptMenu.map((item) => (
          <li key={item.name}>
            <span>{item.name}</span>
            <button
              type="button"
              onClick={() => onRemove(item.name)}
              aria-label={`Remove ${item.name} from your menu`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

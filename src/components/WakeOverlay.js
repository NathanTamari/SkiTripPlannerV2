// src/components/WakeOverlay.jsx
import "./WakeOverlay.css";

export default function WakeOverlay({ visible, msLeft, percent }) {
  if (!visible) return null;

  const secs = Math.ceil(msLeft / 1000);

  return (
    <div className="wake-overlay">
      <div className="wake-card">
        <div className="wake-spinner" aria-hidden />
        <div className="wake-title">Waking up server…</div>
        <div className="wake-sub">Render free tier may sleep when idle.</div>
        <div className="wake-progress">
          <div className="wake-bar" style={{ width: `${percent}%` }} />
        </div>
        <div className="wake-timer">~{secs}s</div>
      </div>
    </div>
  );
}

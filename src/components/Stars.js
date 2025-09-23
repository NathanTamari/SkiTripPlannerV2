function Stars({ value }) {
  const v = Math.max(0, Math.min(10, Number(value || 0)));
  const full = Math.round(v / 2); // 0–5
  return (
    <div className="stars" aria-label={`${v}/10`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? 'star full' : 'star'}>★</span>
      ))}
      <span className="score">{v.toFixed(1)}/10</span>
    </div>
  );
}

export default Stars;
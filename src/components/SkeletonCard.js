// Lightweight skeleton that matches the PossibleTrip card footprint
import './Skeleton.css';

export default function SkeletonCard() {
  return (
    <article className="skeleton-card">
      <div className="sk-row">
        <div className="sk-badge skeleton-shine" />
        <div className="sk-title skeleton-shine" />
      </div>

      <div className="sk-chips">
        <div className="sk-chip skeleton-shine" />
        <div className="sk-chip skeleton-shine" />
      </div>

      <div className="sk-stars skeleton-shine" />

      <div className="sk-price skeleton-shine" />
    </article>
  );
}

import './PossibleTrip.css';

// ======= Tunables for gas estimate (can be overridden via props) =======
const DEFAULT_AVG_GAS_PRICE = 3.75; // $/gal
const DEFAULT_CAR_MPG = 28;         // miles per gallon
const DEFAULT_AVG_SPEED = 55;       // mph (used when distance is unknown)
// ======================================================================

// Epic baseline multipliers (relative to 1-day price of 125)
const EPIC_MULTIPLIERS = {
  1: 1.0,
  2: 240 / 125,  // 1.92
  3: 350 / 125,  // 2.8
  4: 453 / 125,  // 3.624
  5: 550 / 125,  // 4.4
  6: 640 / 125,  // 5.12
  7: 723 / 125,  // 5.784
};

// Calculate multi-day lift ticket total from a base 1-day price
function getMultiDayTicketCost(basePrice, days) {
  if (!basePrice || !isFinite(basePrice) || !days || days < 1) return null;

  // Cap at 7 with Epic curve; for >7, extend using per-day average of day-7
  if (days <= 7) {
    return basePrice * (EPIC_MULTIPLIERS[days] ?? EPIC_MULTIPLIERS[7]);
  }

  const day7Factor = EPIC_MULTIPLIERS[7];
  const avgPerDayAt7 = day7Factor / 7; // ~0.8263 of 1-day price per day
  const extraDays = days - 7;
  const factor = day7Factor + extraDays * avgPerDayAt7;
  return basePrice * factor;
}

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

// Parse strings like "3 hr 20 min", "2h", "4 hours 5 minutes" → hours as Number
function parseDrivingHours(str) {
  if (typeof str === 'number') return str;
  if (!str || typeof str !== 'string') return 0;
  const s = str.toLowerCase();
  const hrMatch = s.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
  const minMatch = s.match(/(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)/);

  let hours = 0;
  if (hrMatch) hours += parseFloat(hrMatch[1]);
  if (minMatch) hours += parseFloat(minMatch[1]) / 60;

  // fallback "3:30" => 3.5
  if (!hrMatch && !minMatch) {
    const colon = s.match(/(\d+):(\d{1,2})/);
    if (colon) {
      hours = parseInt(colon[1], 10) + parseInt(colon[2], 10) / 60;
    }
  }

  return isNaN(hours) ? 0 : hours;
}

// Estimate round-trip gas cost from driving time (or distance if provided)
function estimateRoundTripGasCost({
  drivingTime,
  avgSpeed = DEFAULT_AVG_SPEED,
  mpg = DEFAULT_CAR_MPG,
  gasPrice = DEFAULT_AVG_GAS_PRICE,
  distanceMiles,
}) {
  let oneWayMiles = 0;

  if (typeof distanceMiles === 'number' && distanceMiles > 0) {
    oneWayMiles = distanceMiles;
  } else {
    const hours = parseDrivingHours(drivingTime);
    oneWayMiles = hours * avgSpeed;
  }

  const roundTripMiles = oneWayMiles * 2;
  const gallons = roundTripMiles / mpg;
  const cost = gallons * gasPrice;

  return isNaN(cost) ? 0 : cost;
}

function currency(n) {
  return `$${Number(n).toFixed(2)}`;
}

export default function PossibleTrip({
  name,
  drivingTime,
  ticket_cost,   // base 1-day lift ticket price
  score,
  housing_cost,  // total housing for the stay
  nights,        // number of nights (used also as number of ski days)
  distance_miles,
  gasPrice = DEFAULT_AVG_GAS_PRICE,
  mpg = DEFAULT_CAR_MPG,
  avgSpeed = DEFAULT_AVG_SPEED,
}) {
  const housingKnown = typeof housing_cost === 'number' && isFinite(housing_cost);
  const ticketTotal = getMultiDayTicketCost(ticket_cost, nights || 1);
  const ticketKnown = typeof ticketTotal === 'number' && isFinite(ticketTotal);

  const gas = estimateRoundTripGasCost({
    drivingTime,
    avgSpeed,
    mpg,
    gasPrice,
    distanceMiles: typeof distance_miles === 'number' ? distance_miles : undefined,
  });

  const totalKnown = housingKnown && ticketKnown;
  const totalCost = totalKnown ? (housing_cost + ticketTotal + gas) : null;

  return (
    <article className="trip-card">
      <div className="card-top">
        <div className="badge">🏔️</div>
        <h3 className="title">{name}</h3>
      </div>

      <div className="chips">
        <span className="chip">🚗 {drivingTime} drive</span>
        <span className="chip">
          🎫 {ticketKnown ? currency(ticketTotal) : '—'} lift
          {nights ? ` (${nights} day${nights > 1 ? 's' : ''})` : ''}
        </span>
        <span className="chip">
          🏨 {housingKnown ? currency(housing_cost) : 'Loading…'} housing
          {nights ? ` (${nights} night${nights > 1 ? 's' : ''})` : ''}
        </span>
        <span className="chip">⛽ {currency(gas)} gas</span>
      </div>

      <Stars value={score} />

      <div className="price">
        <div className="housing">
          <span className="label">Total Est.</span>
          <span className="value">
            {totalKnown ? currency(totalCost) : 'Waiting on prices…'}
          </span>
        </div>
      </div>
    </article>
  );
}

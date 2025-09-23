import './PossibleTrip.css';
import estimateRoundTripGasCost from '../scripts/estimateRoundTripGasCost';
import getMultiDayTicketCost  from '../scripts/getMultiDayTicketCost';
import Stars from './Stars';

function currency(n) {
  return `$${Number(n).toFixed(2)}`;
}

function PossibleTrip({
  name,
  drivingTime,
  ticket_cost,   // base 1-day lift ticket price
  score,
  housing_cost,  // total housing for the stay
  nights,        // number of nights (used also as number of ski days)
  distance_miles,
  gasPrice = 3.75,
  mpg = 28,
  avgSpeed = 55,
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

export default PossibleTrip;
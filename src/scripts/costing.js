// Shared cost helpers (used by SubmitPage + PossibleTrip)

export const DEFAULT_AVG_GAS_PRICE = 3.75; // $/gal
export const DEFAULT_CAR_MPG = 28;         // miles per gallon
export const DEFAULT_AVG_SPEED = 55;       // mph

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

export function getMultiDayTicketCost(basePrice, days) {
  if (!basePrice || !isFinite(basePrice) || !days || days < 1) return null;
  if (days <= 7) {
    return basePrice * (EPIC_MULTIPLIERS[days] ?? EPIC_MULTIPLIERS[7]);
  }
  const day7Factor = EPIC_MULTIPLIERS[7];
  const avgPerDayAt7 = day7Factor / 7; // ~0.8263 of 1-day price per day
  const extraDays = days - 7;
  const factor = day7Factor + extraDays * avgPerDayAt7;
  return basePrice * factor;
}

// "3 hr 20 min", "2h", "4 hours 5 minutes", "3:30" → hours
export function parseDrivingHours(str) {
  if (typeof str === 'number') return str;
  if (!str || typeof str !== 'string') return 0;
  const s = str.toLowerCase();
  const hrMatch = s.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
  const minMatch = s.match(/(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)/);

  let hours = 0;
  if (hrMatch) hours += parseFloat(hrMatch[1]);
  if (minMatch) hours += parseFloat(minMatch[1]) / 60;

  if (!hrMatch && !minMatch) {
    const colon = s.match(/(\d+):(\d{1,2})/);
    if (colon) {
      hours = parseInt(colon[1], 10) + parseInt(colon[2], 10) / 60;
    }
  }

  return isNaN(hours) ? 0 : hours;
}

export function estimateRoundTripGasCost({
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

// Calculate multi-day lift ticket total from a base 1-day price
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

export default getMultiDayTicketCost;
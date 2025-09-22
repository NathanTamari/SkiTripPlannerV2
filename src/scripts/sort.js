export function sort_resorts(resorts, sort_method, getTotalCost) {
  const sorted = [...resorts];

  if (sort_method === 'Distance') {
    return sorted.sort((a, b) => a.totalKm - b.totalKm);
  } else if (sort_method === 'Relevant') {
    return sorted.sort((a, b) => b.popularity - a.popularity);
  } else if (sort_method === 'Price') {
    // Sort by FULL total (tickets + housing + gas) when available.
    // Unknown totals are pushed to the bottom.
    return sorted.sort((a, b) => {
      const ta = typeof getTotalCost === 'function' ? getTotalCost(a) : Number.POSITIVE_INFINITY;
      const tb = typeof getTotalCost === 'function' ? getTotalCost(b) : Number.POSITIVE_INFINITY;

      const A = Number.isFinite(ta) ? ta : Number.POSITIVE_INFINITY;
      const B = Number.isFinite(tb) ? tb : Number.POSITIVE_INFINITY;

      return A - B;
    });
  } else {
    return sorted;
  }
}

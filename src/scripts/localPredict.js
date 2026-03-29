/**
 * Client-side Random Forest inference.
 *
 * Replicates the feature engineering and prediction pipeline from backend/app.py
 * so no server is needed.  The model JSON files are fetched from /public once
 * and then kept in module-level variables (effectively a one-time cache).
 */

let rfModel = null;    // { n_estimators, trees: [...] }
let kmeansModel = null; // { centers: [[lat, lon], ...] }
let loadPromise = null; // singleton fetch – only fires once

async function loadModels() {
  if (rfModel && kmeansModel) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const [rfResp, kmResp] = await Promise.all([
      fetch(process.env.PUBLIC_URL + "/rf_export.json"),
      fetch(process.env.PUBLIC_URL + "/kmeans_export.json"),
    ]);
    if (!rfResp.ok) throw new Error(`Failed to load rf_export.json: ${rfResp.status}`);
    if (!kmResp.ok) throw new Error(`Failed to load kmeans_export.json: ${kmResp.status}`);
    [rfModel, kmeansModel] = await Promise.all([rfResp.json(), kmResp.json()]);
  })();

  return loadPromise;
}

/** Euclidean distance squared between two arrays */
function distSq(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return s;
}

/** KMeans: return index of nearest centre */
function kmeansPredict(centers, lat, lon) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < centers.length; i++) {
    const d = distSq(centers[i], [lat, lon]);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

/** Traverse a single decision tree and return the leaf value */
function treePredict(tree, features) {
  const { feature, threshold, children_left, children_right, value } = tree;
  let node = 0;
  while (children_left[node] !== -1) {
    node = features[feature[node]] <= threshold[node]
      ? children_left[node]
      : children_right[node];
  }
  return value[node];
}

/**
 * Main entry point.
 *
 * @param {object} params
 * @param {number} params.lat
 * @param {number} params.lon
 * @param {number} params.guests
 * @param {string} params.checkIn   - "YYYY-MM-DD"
 * @param {string} params.checkOut  - "YYYY-MM-DD"
 * @returns {Promise<{ ok: boolean, price: number|null, error?: string }>}
 */
export async function predictPriceLocal({ lat, lon, guests, checkIn, checkOut }) {
  try {
    await loadModels();

    const checkInDate  = new Date(checkIn  + "T12:00:00");
    const checkOutDate = new Date(checkOut + "T12:00:00");
    const today        = new Date();
    today.setHours(12, 0, 0, 0);

    const stayLength       = Math.round((checkOutDate - checkInDate) / 86400000);
    const month            = checkInDate.getMonth() + 1; // 1-12
    const dayOfWeek        = checkInDate.getDay() === 0 ? 6 : checkInDate.getDay() - 1; // Mon=0
    const season           = (month % 12) / 3 | 0;      // integer division, matches Python
    const daysUntilCheckin = Math.round((checkInDate - today) / 86400000);
    const isHoliday        = (month === 12 && checkInDate.getDate() >= 20) ? 1 : 0;
    const locationCluster  = kmeansPredict(kmeansModel.centers, lat, lon);

    const features = [
      lat, lon, guests,
      stayLength, month, dayOfWeek, season,
      daysUntilCheckin, isHoliday, locationCluster,
    ];

    // Average predictions from all trees (same as sklearn RF)
    let sum = 0;
    for (const tree of rfModel.trees) sum += treePredict(tree, features);
    const logPrediction = sum / rfModel.trees.length;

    // Undo log transform (matches np.expm1 in backend)
    const price = Math.expm1(logPrediction);

    return { ok: true, price: Math.round(price * 100) / 100 };
  } catch (err) {
    return { ok: false, price: null, error: err.message };
  }
}

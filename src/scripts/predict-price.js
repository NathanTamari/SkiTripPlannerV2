import { useCallback } from "react";
import axios from "axios";

/**
 * Predict housing price for a resort stay.
 * Accepts: { lat, long, guests, checkIn, checkOut, signal? }
 *
 * Returns: { ok: boolean, price: number|null, error?: string }
 */
export default function usePredictPrice() {
  // Allow easy local/prod switching via env; falls back to Render URL
  const ENDPOINT =
    process.env.REACT_APP_PRICE_ENDPOINT?.trim() ||
    "https://ski-planner-backend.onrender.com/predict_price";

  const predict = useCallback(
    async ({ lat, long, guests, checkIn, checkOut, signal }) => {
      // Basic input validation (keeps noise out of the backend)
      const latN = Number(lat);
      const lonN = Number(long);
      const guestsN = Number(guests);

      if (!Number.isFinite(latN) || !Number.isFinite(lonN)) {
        return { ok: false, price: null, error: "Invalid coordinates" };
      }
      if (!Number.isFinite(guestsN) || guestsN <= 0) {
        return { ok: false, price: null, error: "Invalid guests" };
      }
      if (!checkIn || !checkOut) {
        return { ok: false, price: null, error: "Missing dates" };
      }

      // Translate to backend schema (lon, check_in/check_out)
      const body = {
        lat: latN,
        lon: lonN, // backend expects "lon"
        guests: guestsN,
        check_in: checkIn, // YYYY-MM-DD
        check_out: checkOut, // YYYY-MM-DD
      };

      // simple retry helper with exponential backoff
      const withRetry = async (fn, tries = 3) => {
        let lastErr;
        for (let attempt = 1; attempt <= tries; attempt++) {
          try {
            return await fn();
          } catch (e) {
            // don't retry aborted/canceled requests
            if (axios.isCancel?.(e) || e?.name === "CanceledError") throw e;
            lastErr = e;
            if (attempt === tries) break;
            const sleep = 300 * attempt + Math.random() * 300;
            await new Promise((r) => setTimeout(r, sleep));
          }
        }
        throw lastErr;
      };

      try {
        const data = await withRetry(async () => {
          const resp = await axios.post(ENDPOINT, body, {
            headers: { "Content-Type": "application/json" },
            timeout: 45000, // Render can be slow on cold start
            signal, // AbortController support
          });
          return resp.data;
        }, 3);

        const price =
          typeof data?.predicted_price === "number" ? data.predicted_price : null;

        if (price == null) {
          return { ok: false, price: null, error: "No price in response" };
        }
        return { ok: true, price };
      } catch (e) {
        const status = e?.response?.status;
        const detail =
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          e?.response?.statusText ||
          e?.message ||
          "Request failed";

        return {
          ok: false,
          price: null,
          error: status ? `HTTP ${status}: ${String(detail)}` : String(detail),
        };
      }
    },
    [ENDPOINT]
  );

  return { predict };
}

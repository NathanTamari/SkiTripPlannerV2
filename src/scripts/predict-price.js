import { useCallback } from "react";
import { predictPriceLocal } from "./localPredict";

/**
 * Predict housing price for a resort stay.
 * Accepts: { lat, long, guests, checkIn, checkOut, signal? }
 *
 * Returns: { ok: boolean, price: number|null, error?: string }
 *
 * Runs entirely in the browser using the exported RF model JSON — no server needed.
 */
export default function usePredictPrice() {
  const predict = useCallback(
    async ({ lat, long, guests, checkIn, checkOut }) => {
      const latN    = Number(lat);
      const lonN    = Number(long);
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

      return predictPriceLocal({ lat: latN, lon: lonN, guests: guestsN, checkIn, checkOut });
    },
    []
  );

  return { predict };
}

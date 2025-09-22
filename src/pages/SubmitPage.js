import "./SubmitPage.css";
import { useState, useEffect, useMemo, useRef } from "react";
import dayjs from "dayjs";
import { calculateResortsDriving } from "../scripts/drivingTimeLogic";
import { sort_resorts } from "../scripts/sort";
import PossibleTrip from "../components/PossibleTrip";
import SortByDropdown from "../components/SortByDropdown";
import usePredictPrice from "../scripts/predict-price";
import AOS from "aos";
import SkeletonCard from "../components/SkeletonCard";
import "aos/dist/aos.css";
import submitVideo from "../media/submit-page-backdrop.mp4";

const getResortKey = (r) => r.id ?? `${r.name}|${r.latitude}|${r.longitude}`;

// Concurrency tunable (env override allowed)
const PREDICT_CONCURRENCY = Number(
  process.env.REACT_APP_PRICE_CONCURRENCY || 3
);

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let i = 0;
  const workers = Array(Math.min(limit, items.length))
    .fill(0)
    .map(async () => {
      while (true) {
        const idx = i++;
        if (idx >= items.length) break;
        results[idx] = await mapper(items[idx], idx);
      }
    });
  await Promise.all(workers);
  return results;
}

/**
 * AnimatedOnMount
 * Uses AOS's "zoom-in" animation immediately on mount (not on scroll).
 */
function AnimatedOnMount({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.setAttribute("data-aos", "zoom-in");
    el.setAttribute("data-aos-once", "true");
    el.setAttribute("data-aos-duration", "800");

    el.classList.add("aos-init");
    requestAnimationFrame(() => {
      el.classList.add("aos-animate");
    });

    AOS.refreshHard();
  }, []);

  return <div ref={ref}>{children}</div>;
}

/* =========================================================================
   Local copies of cost math so sorting can use EXACT totals as <PossibleTrip/>
   ========================================================================= */
const DEFAULT_AVG_GAS_PRICE = 3.75; // $/gal
const DEFAULT_CAR_MPG = 28; // mpg
const DEFAULT_AVG_SPEED = 55; // mph

const EPIC_MULTIPLIERS_LOCAL = {
  1: 1.0,
  2: 240 / 125,
  3: 350 / 125,
  4: 453 / 125,
  5: 550 / 125,
  6: 640 / 125,
  7: 723 / 125,
};

function getMultiDayTicketCostLocal(basePrice, days) {
  if (!basePrice || !isFinite(basePrice) || !days || days < 1) return null;
  if (days <= 7)
    return basePrice * (EPIC_MULTIPLIERS_LOCAL[days] ?? EPIC_MULTIPLIERS_LOCAL[7]);
  const d7 = EPIC_MULTIPLIERS_LOCAL[7];
  const perDayAt7 = d7 / 7;
  const extra = days - 7;
  return basePrice * (d7 + extra * perDayAt7);
}

function parseDrivingHoursLocal(str) {
  if (typeof str === "number") return str;
  if (!str || typeof str !== "string") return 0;
  const s = str.toLowerCase();
  const hrMatch = s.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
  const minMatch = s.match(/(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)/);

  let hours = 0;
  if (hrMatch) hours += parseFloat(hrMatch[1]);
  if (minMatch) hours += parseFloat(minMatch[1]) / 60;

  if (!hrMatch && !minMatch) {
    const colon = s.match(/(\d+):(\d{1,2})/);
    if (colon) hours = parseInt(colon[1], 10) + parseInt(colon[2], 10) / 60;
  }
  return Number.isNaN(hours) ? 0 : hours;
}

function estimateRoundTripGasCostLocal({
  drivingTime,
  avgSpeed = DEFAULT_AVG_SPEED,
  mpg = DEFAULT_CAR_MPG,
  gasPrice = DEFAULT_AVG_GAS_PRICE,
  distanceMiles,
}) {
  let oneWayMiles = 0;
  if (typeof distanceMiles === "number" && distanceMiles > 0) {
    oneWayMiles = distanceMiles;
  } else {
    const hours = parseDrivingHoursLocal(drivingTime);
    oneWayMiles = hours * avgSpeed;
  }
  const rtMiles = oneWayMiles * 2;
  const gallons = rtMiles / mpg;
  const cost = gallons * gasPrice;
  return Number.isNaN(cost) ? 0 : cost;
}

function SubmitPage({ data }) {
  const safeData = useMemo(
    () => ({
      Region: data?.Region ?? "All",
      "Zip Code": data?.["Zip Code"] ?? "90210",
      Guests: data?.Guests ?? 2,
      checkIn: data?.checkIn ?? "2025-12-25",
      checkOut: data?.checkOut ?? "2025-12-29",
    }),
    [data]
  );

  const [resorts, setResorts] = useState(() =>
    calculateResortsDriving(safeData.Region, safeData["Zip Code"])
  );

  const [prices, setPrices] = useState({});
  const [displayedKeys, setDisplayedKeys] = useState([]);
  const [pendingKeys, setPendingKeys] = useState([]);
  const [includeSmall, setIncludeSmall] = useState(true);

  const pendingRef = useRef([]);
  const processingRef = useRef(false);
  const timerRef = useRef(null);
  const inflightRef = useRef(new Set()); // keys currently being requested
  const pricesRef = useRef(prices);      // mirror of prices to avoid deps warning

  const { predict } = usePredictPrice();

  // keep pricesRef fresh
  useEffect(() => {
    pricesRef.current = prices;
  }, [prices]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out",
      once: true,
    });
  }, []);

  // Number of nights (and ski days for ticket calculation)
  const nights = useMemo(() => {
    const n = dayjs(safeData.checkOut).diff(dayjs(safeData.checkIn), "day");
    return Math.max(1, n || 1);
  }, [safeData.checkIn, safeData.checkOut]);

  // --------- Total cost callback for sorting (tickets + housing + gas)
  const getTotalCostForResort = (r) => {
    const key = getResortKey(r);
    const housing = prices[key];
    const housingKnown = typeof housing === "number" && isFinite(housing);
    const ticket = getMultiDayTicketCostLocal(r.ticket_cost, nights);
    const ticketKnown = typeof ticket === "number" && isFinite(ticket);
    if (!housingKnown || !ticketKnown) return Number.POSITIVE_INFINITY;

    const gas = estimateRoundTripGasCostLocal({
      drivingTime: r.drivingTime,
      distanceMiles:
        typeof r.distance_miles === "number" ? r.distance_miles : undefined,
    });
    const total = housing + ticket + gas;
    return Number.isFinite(total) ? total : Number.POSITIVE_INFINITY;
  };

  // Filtered resorts list (>1.5 popularity unless includeSmall)
  const visibleResorts = useMemo(() => {
    if (includeSmall) return resorts;
    return resorts.filter((r) => (r?.popularity ?? 0) > 1.5);
  }, [resorts, includeSmall]);

  // Pull the specific safeData fields we use into stable vars (so eslint doesn’t demand 'safeData')
  const guests = safeData.Guests;
  const checkIn = safeData.checkIn;
  const checkOut = safeData.checkOut;

  // Fetch housing prices for all resorts, but only those missing from cache.
  useEffect(() => {
    if (!resorts || resorts.length === 0) return;

    let mounted = true;
    const ac = new AbortController(); // for axios aborts

    // Figure out which need fetching (no price and not in-flight)
    const missing = resorts.filter((r) => {
      const k = getResortKey(r);
      // NOTE: use pricesRef.current (not 'prices') to avoid deps + refires
      return !(k in pricesRef.current) && !inflightRef.current.has(k);
    });
    if (missing.length === 0) return;

    (async () => {
      await mapWithConcurrency(missing, PREDICT_CONCURRENCY, async (r) => {
        const key = getResortKey(r);

        if (r.latitude == null || r.longitude == null) {
          if (mounted) {
            setPrices((prev) => {
              const next = { ...prev, [key]: null };
              // sanity mirror for console inspection
              window.__prices = next;
              return next;
            });
          }
          return null;
        }

        inflightRef.current.add(key);
        const res = await predict({
          lat: r.latitude,
          long: r.longitude,
          guests,
          checkIn,
          checkOut,
          signal: ac.signal,
        });

        if (mounted) {
          const value =
            typeof res === "object" ? (res.ok ? res.price : null) : res;
          setPrices((prev) => {
            const next = { ...prev, [key]: value };
            // sanity mirror for console inspection
            window.__prices = next;
            return next;
          });
        }
        inflightRef.current.delete(key);
        return null;
      });
    })();

    return () => {
      mounted = false;
      ac.abort(); // cancel any stragglers on dependency change/unmount
    };
    // deps intentionally exclude 'prices' and 'safeData'
  }, [resorts, guests, checkIn, checkOut, predict]);

  // Enqueue newly priced cards (uses ref; linter OK)
  useEffect(() => {
    const shown = new Set(displayedKeys);
    const queued = new Set(pendingRef.current);
    const newlyReady = [];

    for (const [key, price] of Object.entries(prices)) {
      const priced = typeof price === "number" && isFinite(price);
      if (priced && !shown.has(key) && !queued.has(key)) newlyReady.push(key);
    }

    if (newlyReady.length) {
      pendingRef.current = [...pendingRef.current, ...newlyReady];
      setPendingKeys(pendingRef.current);
    }
  }, [prices, displayedKeys]);

  // When the visibility filter changes, enqueue priced-but-hidden items for reveal.
  useEffect(() => {
    const visibleKeys = new Set(visibleResorts.map(getResortKey));
    const shown = new Set(displayedKeys);
    const queued = new Set(pendingRef.current);
    const readyNow = [];

    for (const [key, price] of Object.entries(prices)) {
      const priced = typeof price === "number" && isFinite(price);
      if (priced && visibleKeys.has(key) && !shown.has(key) && !queued.has(key)) {
        readyNow.push(key);
      }
    }

    if (readyNow.length) {
      pendingRef.current = [...pendingRef.current, ...readyNow];
      setPendingKeys(pendingRef.current);
    }
  }, [includeSmall, visibleResorts, prices, displayedKeys]);

  // Reveal at most one every 0.35s
  useEffect(() => {
    if (processingRef.current) return;
    if (pendingRef.current.length === 0) return;

    processingRef.current = true;

    const processNext = () => {
      if (pendingRef.current.length === 0) {
        processingRef.current = false;
        return;
      }
      const nextKey = pendingRef.current.shift();
      setDisplayedKeys((prev) =>
        prev.includes(nextKey) ? prev : [...prev, nextKey]
      );
      setPendingKeys([...pendingRef.current]);

      timerRef.current = setTimeout(processNext, 350);
    };

    processNext();

    return () => {
      processingRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pendingKeys]);

  const handleFormChange = (_title, value) => {
    // Pass total-cost callback so "Price" truly means TOTAL price (tickets + housing + gas)
    const sorted = sort_resorts(resorts, value, getTotalCostForResort);
    setResorts(sorted);
  };

  // Display mapping: "All" -> "U.S."
  const header = useMemo(() => {
    const displayRegion = safeData.Region === "All" ? "U.S." : safeData.Region;
    let h = `Available ski trips in the ${displayRegion}`;
    h += safeData["Zip Code"] ? ` leaving from ${safeData["Zip Code"]}:` : ":";
    return h;
  }, [safeData]);

  const subheader = `${data.checkIn} → ${data.checkOut} • ${
    data.Guests
  } ${data.Guests === 1 ? "guest" : "guests"}`;

  return (
    <div className="submit-outer">
      {/* Fixed blurred video background */}
      <div className="submit-video-container" aria-hidden="true">
        <video autoPlay muted loop playsInline>
          <source src={submitVideo} type="video/mp4" />
        </video>
        <div className="submit-video-overlay" />
      </div>

      {/* Content layer */}
      <div className="submit-page theme-alpine-plus">
        {/* Top-right toggle */}
        <label
          style={{
            position: "fixed",
            top: 12,
            right: 12,
            zIndex: 1000,
            background: "rgba(0,0,0,0.45)",
            padding: "8px 12px",
            borderRadius: 12,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#fff",
            fontSize: 14,
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={includeSmall}
            onChange={(e) => setIncludeSmall(e.target.checked)}
            style={{ transform: "scale(1.1)" }}
          />
          Include small mountains
        </label>

        <div className="page-hero">
          <h2 className="hero-title">{header}</h2>
          <div className="hero-sub">{subheader}</div>
          <div className="hero-controls">
            <span className="sort-label">Sort By:</span>
            <div className="sort-by">
              <SortByDropdown
                options={["Relevant", "Distance", "Price", "Most Trails"]}
                onChange={handleFormChange}
              />
            </div>
            <span className="flake">❄︎</span>
          </div>
        </div>

        {visibleResorts.length > 0 ? (
          <div className="resort-grid">
            {visibleResorts
              .filter((r) => displayedKeys.includes(getResortKey(r)))
              .map((r) => {
                const key = getResortKey(r);
                const price = prices[key];

                return (
                  <AnimatedOnMount key={key}>
                    <PossibleTrip
                      name={r.name}
                      drivingTime={r.drivingTime}
                      ticket_cost={r.ticket_cost} // base 1-day
                      score={r.popularity}
                      housing_cost={price ?? "…"} // total housing for stay
                      nights={nights}
                      // distance_miles={r.distance_miles}
                    />
                  </AnimatedOnMount>
                );
              })}

            {(() => {
              const remaining = visibleResorts.length - displayedKeys.length;
              const count = Math.min(3, Math.max(0, remaining));
              return Array.from({ length: count }).map((_, i) => (
                <div key={`sk-bottom-${i}`} className="skeleton-at-end">
                  <SkeletonCard />
                </div>
              ));
            })()}
          </div>
        ) : (
          <div>
            <h1>Invalid zip code. try again</h1>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmitPage;

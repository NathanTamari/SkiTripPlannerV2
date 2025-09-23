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

function getMultiDayTicketCostLocal(basePrice, days, guests) {
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

/* =========================
   Sorting utilities
   ========================= */
function applySortInline(list, key, dir, getTotalCostForResort) {
  const sorted = sort_resorts(list, key, getTotalCostForResort);
  return dir === "desc" ? [...sorted].reverse() : sorted;
}
function sameOrder(a, b) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (getResortKey(a[i]) !== getResortKey(b[i])) return false;
  }
  return true;
}

// Simple pill toggles under "Sort By"
function FilterToggles({ toggles, onToggle }) {
  return (
    <div className="filter-toggles">
      {toggles.map((t) => (
        <label key={t.key} className="filter-toggle-pill">
          <input
            type="checkbox"
            checked={!!t.checked}
            onChange={(e) => onToggle(t.key, e.target.checked)}
          />
          {t.label}
        </label>
      ))}
    </div>
  );
}

function SubmitPage({ data, onBack }) {
  const [resorts, setResorts] = useState(() =>
    calculateResortsDriving(data.Region, data["Zip Code"])
  );

  const [prices, setPrices] = useState({});
  const [displayedKeys, setDisplayedKeys] = useState([]);
  const [pendingKeys, setPendingKeys] = useState([]);
  const [includeSmall, setIncludeSmall] = useState(true);

  const [sortKey, setSortKey] = useState("Relevant");
  const [sortDir, setSortDir] = useState("asc");

  const pendingRef = useRef([]);
  const processingRef = useRef(false);
  const timerRef = useRef(null);
  const inflightRef = useRef(new Set());
  const pricesRef = useRef(prices);

  const { predict } = usePredictPrice();
  useEffect(() => {
    pricesRef.current = prices;
  }, [prices]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out",
      once: true,
    });
  }, []);

  const nights = useMemo(() => {
    const n = dayjs(data.checkOut).diff(dayjs(data.checkIn), "day");
    return Math.max(1, n || 1);
  }, [data.checkIn, data.checkOut]);

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

  const visibleResorts = useMemo(() => {
    if (includeSmall) return resorts;
    return resorts.filter((r) => (r?.popularity ?? 0) > 1.5);
  }, [resorts, includeSmall]);

  const guests = data.Guests;
  const checkIn = data.checkIn;
  const checkOut = data.checkOut;

  // Fetch housing prices for missing resorts with concurrency
  useEffect(() => {
    if (!resorts || resorts.length === 0) return;

    let mounted = true;
    const ac = new AbortController(); // for axios aborts

    const missing = resorts.filter((r) => {
      const k = getResortKey(r);
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
      ac.abort();
    };
  }, [resorts, guests, checkIn, checkOut, predict]);

  // Enqueue newly priced cards
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

  // Initial sort once
  useEffect(() => {
    setResorts((prev) =>
      applySortInline(prev, sortKey, sortDir, getTotalCostForResort)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-apply sorting whenever prices/sort/nights change
  useEffect(() => {
    if (!resorts || resorts.length === 0) return;
    setResorts((prev) => {
      const next = applySortInline(prev, sortKey, sortDir, getTotalCostForResort);
      return sameOrder(prev, next) ? prev : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices, sortKey, sortDir, nights]);

  const handleSortChange = (_title, payload) => {
    const key = typeof payload === "string" ? payload : payload?.key;
    const dir = typeof payload === "string" ? sortDir : payload?.direction || "asc";
    setSortKey(key);
    setSortDir(dir);
    setResorts((prev) => applySortInline(prev, key, dir, getTotalCostForResort));
  };

  const header = useMemo(() => {
    const displayRegion = data.Region === "All" ? "U.S." : data.Region;
    let h = `Available ski trips in the ${displayRegion}`;
    h += data["Zip Code"] ? ` leaving from ${data["Zip Code"]}` : "";
    return h;
  }, [data]);

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
        {/* Title bar: Back left, title centered */}
        <div className="title-bar">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h2 className="hero-title">{header}</h2>
        </div>

        <div className="hero-sub">{subheader}</div>

        {/* Controls centered */}
        <div className="hero-controls">
          <div className="controls-row">
            <span className="sort-label" style={{ opacity: 0.9 }}>
              Sort By:
            </span>
            <SortByDropdown
              options={["Relevant", "Distance", "Price", "Most Trails"]}
              value={sortKey}
              direction={sortDir}
              onChange={handleSortChange}
              tone="onDark"
            />
            <span className="flake" aria-hidden="true">
              ❄︎
            </span>
          </div>

          {/* Include small mountains under Sort By */}
          <FilterToggles
            toggles={[
              { key: "includeSmall", label: "Include small mountains", checked: includeSmall },
              // Add more toggles here later if needed
            ]}
            onToggle={(key, checked) => {
              if (key === "includeSmall") setIncludeSmall(checked);
            }}
          />
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
                      guests={data.Guests}
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

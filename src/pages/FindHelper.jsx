import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORIES, getTier } from "../data/MockData";
import { useHelpers } from "../context/HelperContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import RequireLogin from "../components/RequireLogin.jsx";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CATEGORY_PIN_COLORS = {
  Plumber: "#3b82f6",
  Tutor: "#8b5cf6",
  Driver: "#f59e0b",
  Electrician: "#eab308",
  Carpenter: "#92400e",
  Cleaner: "#10b981",
  Gardener: "#22c55e",
  Mechanic: "#64748b",
  Designer: "#ec4899",
  Coder: "#06b6d4",
};

const CATEGORY_ICONS = {
  Plumber: "🔧",
  Tutor: "📚",
  Driver: "🚗",
  Electrician: "⚡",
  Carpenter: "🪚",
  Cleaner: "🧹",
  Gardener: "🌿",
  Mechanic: "🔩",
  Designer: "🎨",
  Coder: "💻",
};

const CATEGORY_DOT_COLORS = CATEGORY_PIN_COLORS;

function createHelperIcon(helper, isSelected) {
  const color = CATEGORY_PIN_COLORS[helper.category] || "#3b82f6";
  const icon = CATEGORY_ICONS[helper.category] || "📍";
  const pinSize = isSelected ? 42 : 34;

  return L.divIcon({
    className: "custom-helper-pin",
    html: `
      <div style="
        display:flex; flex-direction:column; align-items:center;
        transform: scale(${isSelected ? 1.1 : 1});
        transform-origin: bottom center;
        transition: transform 0.2s ease;
      ">
        <div style="
          width:${pinSize}px; height:${pinSize}px;
          background:${color};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          display:flex; align-items:center; justify-content:center;
          font-size:${pinSize * 0.5}px;
          margin-bottom: 4px;
        ">${icon}</div>
        <div style="
          background:white; padding:3px 9px; border-radius:8px;
          font-size:11px; font-weight:600; color:#1f2937;
          box-shadow: 0 2px 5px rgba(0,0,0,0.18);
          white-space:nowrap; max-width:130px; overflow:hidden; text-overflow:ellipsis;
        ">${helper.name}</div>
      </div>
    `,
    iconSize: [pinSize + 20, pinSize + 30],
    iconAnchor: [(pinSize + 20) / 2, pinSize + 26],
  });
}

const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "jobs", label: "Most Jobs Done" },
];

const TIER_BADGE_STYLE = {
  Bronze: "bg-orange-100 text-orange-900 dark:bg-orange-950/50 dark:text-orange-300",
  Silver: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  Gold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Platinum: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const TIER_ACCENT = {
  Bronze: "bg-[#8B5A2B]",
  Silver: "bg-gray-400",
  Gold: "bg-[#F0C420]",
  Platinum: "bg-emerald-500",
};

const TIER_BORDER_COLOR = {
  Bronze: "#8B5A2B",
  Silver: "#9CA3AF",
  Gold: "#F0C420",
  Platinum: "#10B981",
  Diamond: "transparent",
};

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function MapFlyController({ selectedHelper, userPos }) {
  const map = useMap();
  useEffect(() => {
    if (selectedHelper) {
      map.flyTo([selectedHelper.lat, selectedHelper.lng], 16, { duration: 1.1 });
    } else if (userPos) {
      map.flyTo([userPos.lat, userPos.lng], 12, { duration: 1.1 });
    }
  }, [selectedHelper, userPos, map]);
  return null;
}

function TierBadgeOrFrame({ tier }) {
  if (tier.label === "Diamond") {
    return (
      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none">
        ◆ Diamond
      </span>
    );
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_BADGE_STYLE[tier.label]}`}>
      {tier.label}
    </span>
  );
}

function HelperCard({ helper, isSelected, onSelect, onView, userPos, avatarSrc }) {
  const tier = getTier(helper.jobsDone);
  const dist = userPos
    ? getDistance(userPos.lat, userPos.lng, helper.lat, helper.lng).toFixed(1)
    : null;
  const dotColor = CATEGORY_DOT_COLORS[helper.category] || "#3b82f6";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onSelect}
      className={`relative bg-white dark:bg-gray-900 rounded-2xl p-4 pl-5 cursor-pointer transition-all hover:shadow-lg overflow-hidden border ${
        isSelected ? "ring-2 ring-blue-400 dark:ring-blue-600 shadow-lg" : ""
      }`}
      style={{ borderColor: TIER_BORDER_COLOR[tier.label] }}
    >
      {tier.label === "Diamond" ? (
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ background: "linear-gradient(180deg, #f97316, #ec4899, #3b82f6)" }}
        />
      ) : (
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${TIER_ACCENT[tier.label]}`} />
      )}
      {tier.label === "Diamond" && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            padding: "1px",
            background: "linear-gradient(120deg, #f97316, #ec4899, #3b82f6)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <img
            src={avatarSrc}
            alt={helper.name}
            className="w-14 h-14 rounded-full object-cover"
          />
          <span
            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${
              helper.available ? "bg-green-400" : "bg-gray-300"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-white">
              {helper.name}
            </span>
            {helper.verified && (
              <span className="text-blue-500 text-xs font-medium flex items-center gap-0.5">
                ✓ Verified
              </span>
            )}
            <TierBadgeOrFrame tier={tier} />
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: dotColor }}
            />
            {helper.category} · {helper.location}
          </p>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-sm text-amber-500 font-semibold">
              ★ {helper.rating}
              <span className="text-gray-400 font-normal text-xs">({helper.reviews})</span>
            </span>
            <span className="text-xs text-gray-400">{helper.jobsDone} jobs done</span>
            {dist && (
              <span className="text-xs text-blue-500 font-medium">📍 {dist} km away</span>
            )}
            <span className={`text-xs font-medium ${helper.available ? "text-green-500" : "text-gray-400"}`}>
              {helper.available ? "● Available" : "○ Unavailable"}
            </span>
          </div>

          <div className="flex gap-1.5 mt-2 flex-wrap">
            {helper.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <span className="font-semibold text-gray-900 dark:text-white">
              ₱{helper.rate.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 block">{helper.rateUnit}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="text-sm font-semibold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white px-4 py-1.5 rounded-xl transition-all active:scale-95"
          >
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Skeleton card shown while results are "loading" ───────────────────────────
function HelperCardSkeleton() {
  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-4 pl-5 overflow-hidden border border-gray-100 dark:border-gray-800">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gray-100 dark:bg-gray-800" />
      <div className="flex items-center gap-4 animate-pulse">
        <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-3 w-44 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-3 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="flex gap-1.5 mt-2">
            <div className="h-5 w-14 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="h-5 w-14 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="h-5 w-14 bg-gray-200 dark:bg-gray-800 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Guest login prompt modal ──────────────────────────────────────────────────
function GuestPromptModal({ onClose }) {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-xl text-center"
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl mb-4">
            🔒
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Log in to view helper profiles
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
            Create a free account or log in to connect with local helpers.
          </p>
          <div className="flex gap-2 mt-6 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all active:scale-95"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-sm font-semibold bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl transition-all active:scale-95"
            >
              Sign Up Free
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-4 transition-colors"
          >
            Maybe later
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FindHelper() {
  const navigate = useNavigate();
  const location = useLocation();
  const { helpers, getHelperAvatar } = useHelpers();
  const { user } = useAuth();

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("rating");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [radius, setRadius] = useState(15);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const cardRefs = useRef({});

  // Simulated initial fetch delay — shows skeleton cards before "data" appears
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!selectedHelper) return;
    const el = cardRefs.current[selectedHelper.id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedHelper]);

  // If guest tries a gated action, show modal instead
  const gatedAction = (fn) => {
    if (!user) {
      setShowGuestModal(true);
      return;
    }
    fn();
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("GPS not supported on this device.");
      return;
    }
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setGpsError("Location access denied.");
        setGpsLoading(false);
      }
    );
  };

  const filtered = helpers
    .filter((h) => {
      const query = q.toLowerCase().trim();
      const matchQ =
        !query ||
        h.name.toLowerCase().includes(query) ||
        h.category.toLowerCase().includes(query) ||
        h.bio.toLowerCase().includes(query) ||
        h.tags.some((t) => t.toLowerCase().includes(query));
      const matchCat = category === "All" || h.category === category;
      const matchAvail = !availableOnly || h.available;
      const matchDist = userPos
        ? getDistance(userPos.lat, userPos.lng, h.lat, h.lng) <= radius
        : true;
      return matchQ && matchCat && matchAvail && matchDist;
    })
    .sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "price_asc") return a.rate - b.rate;
      if (sort === "price_desc") return b.rate - a.rate;
      if (sort === "jobs") return b.jobsDone - a.jobsDone;
      return 0;
    });

  const relatedSuggestions = (() => {
    const query = q.toLowerCase().trim();
    if (!query || filtered.length > 2) return [];
    const queryWords = query.split(/\s+/).filter((w) => w.length > 2);
    const matches = new Set();
    helpers.forEach((h) => {
      const searchableTerms = [h.category, ...h.tags];
      searchableTerms.forEach((term) => {
        const termLower = term.toLowerCase();
        const isRelated = queryWords.some(
          (qw) => termLower.includes(qw) || qw.includes(termLower)
        );
        if (isRelated && !termLower.includes(query)) matches.add(term);
      });
    });
    return Array.from(matches).slice(0, 4);
  })();

  const initialCenter = userPos
    ? [userPos.lat, userPos.lng]
    : [14.4298, 120.9631];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Guest modal */}
      {showGuestModal && <GuestPromptModal onClose={() => setShowGuestModal(false)} />}

      <div className="w-full mx-auto px-4 py-5">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl text-gray-900 dark:text-white">Find a helper</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {loading ? "Loading helpers..." : (
                <>
                  {filtered.length} helper{filtered.length !== 1 ? "s" : ""} found
                  {category !== "All" ? ` in ${category}` : ""}
                </>
              )}
              {!loading && !user && (
                <span className="ml-2 text-blue-500 font-medium">
                  · <button onClick={() => setShowGuestModal(true)} className="hover:underline">Log in to connect</button>
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              {userPos && (
                <motion.span
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{ boxShadow: "0 0 0 0 rgba(236, 72, 153, 0.6)" }}
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(236, 72, 153, 0.6)",
                      "0 0 0 8px rgba(236, 72, 153, 0)",
                    ],
                  }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <motion.button
                onClick={handleGPS}
                disabled={gpsLoading}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all disabled:opacity-60 overflow-hidden ${
                  userPos
                    ? "text-white"
                    : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                style={
                  userPos
                    ? { background: "linear-gradient(120deg, #f97316, #ec4899, #3b82f6)" }
                    : undefined
                }
              >
                {gpsLoading ? (
                  <svg className="animate-spin h-4 w-4 relative z-10" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <span className="text-base leading-none relative z-10">{userPos ? "◉" : "○"}</span>
                )}
                <span className="relative z-10">{userPos ? "Location active" : "Use my location"}</span>
              </motion.button>
            </div>

            <button
              onClick={() => setShowMap((v) => !v)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200 transition-all"
              title={showMap ? "Hide map" : "Show map"}
            >
              <span className="text-base leading-none">{showMap ? "▤" : "▦"}</span>
            </button>
          </div>
        </div>

        {gpsError && (
          <p className="text-xs text-red-500 mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {gpsError}
          </p>
        )}

        <AnimatePresence>
          {userPos && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div
                className="relative rounded-2xl px-5 py-4 overflow-hidden"
                style={{
                  background: "linear-gradient(120deg, rgba(249,115,22,0.06), rgba(236,72,153,0.06), rgba(59,130,246,0.06))",
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    padding: "1px",
                    background: "linear-gradient(120deg, #f97316, #ec4899, #3b82f6)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    opacity: 0.4,
                  }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-blue-500 animate-pulse" />
                      Search radius
                    </span>
                    <motion.span
                      key={radius}
                      initial={{ scale: 1.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-base font-semibold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent"
                    >
                      {radius} km
                    </motion.span>
                  </div>
                  <div className="relative flex items-center">
                    <div
                      className="absolute left-0 h-1.5 rounded-full pointer-events-none"
                      style={{
                        width: `${((radius - 1) / 49) * 100}%`,
                        background: "linear-gradient(90deg, #f97316, #ec4899, #3b82f6)",
                      }}
                    />
                    <input
                      type="range"
                      min="1"
                      max="50"
                      step="1"
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="relative w-full cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                    <span>1 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">

            {/* Search */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⌕</span>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search helpers, categories, or skills..."
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 flex-wrap mb-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
                    category === cat
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Filter row */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setAvailableOnly((v) => !v)}
                  className={`w-9 h-5 rounded-full transition-all relative ${
                    availableOnly
                      ? "bg-gray-900 dark:bg-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-all ${
                      availableOnly
                        ? "bg-white dark:bg-gray-900"
                        : "bg-white dark:bg-gray-400"
                    }`}
                    style={{ left: availableOnly ? "18px" : "2px" }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Available only
                </span>
              </label>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results */}
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <HelperCardSkeleton key={i} />
                    ))}
                  </motion.div>
                ) : filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800"
                  >
                    <div className="text-4xl mb-3 opacity-40">⌕</div>
                    <p className="font-medium text-gray-600 dark:text-gray-300">No helpers found</p>
                    <p className="text-sm mt-1">Try a different search or category.</p>
                    {relatedSuggestions.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-400 mb-2">You might be looking for:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {relatedSuggestions.map((term) => (
                            <button
                              key={term}
                              onClick={() => setQ(term)}
                              className="text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => { setQ(""); setCategory("All"); setAvailableOnly(false); }}
                      className="mt-4 text-sm text-blue-600 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="results" className="space-y-3">
                    {filtered.map((helper, i) => {
                      const isSelected = selectedHelper?.id === helper.id;
                      return (
                        <motion.div
                          key={helper.id}
                          ref={(el) => { cardRefs.current[helper.id] = el; }}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <HelperCard
                            helper={helper}
                            isSelected={isSelected}
                            userPos={userPos}
                            avatarSrc={getHelperAvatar(helper, user)}
                            onSelect={() => {
                              setSelectedHelper(isSelected ? null : helper);
                              if (!showMap) setShowMap(true);
                            }}
                            onView={() =>
                              gatedAction(() =>
                                navigate(`/helper/${helper.id}`, {
                                  state: { backgroundLocation: location },
                                })
                              )
                            }
                          />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Map */}
          <AnimatePresence>
            {showMap && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.3 }}
                className="w-full lg:w-[480px] xl:w-[560px] flex-shrink-0"
              >
                <div className="sticky top-4 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="bg-white dark:bg-gray-900 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Helper map
                      </p>
                      <p className="text-xs text-gray-400">
                        {selectedHelper ? `Focused on ${selectedHelper.name}` : "Click a card to zoom in"}
                      </p>
                    </div>
                    <span className="text-xs font-semibold bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/30 dark:to-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">
                      {filtered.length} pin{filtered.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <MapContainer
                    center={initialCenter}
                    zoom={12}
                    style={{ height: "600px", width: "100%" }}
                  >
                    <MapFlyController selectedHelper={selectedHelper} userPos={userPos} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {userPos && (
                      <>
                        <Marker position={[userPos.lat, userPos.lng]}>
                          <Popup>📍 Your location</Popup>
                        </Marker>
                        <Circle
                          center={[userPos.lat, userPos.lng]}
                          radius={radius * 1000}
                          pathOptions={{ color: "#3b82f6", fillOpacity: 0.05 }}
                        />
                      </>
                    )}
                    <MarkerClusterGroup
                      chunkedLoading
                      maxClusterRadius={35}
                      spiderfyOnMaxZoom={true}
                      showCoverageOnHover={false}
                      disableClusteringAtZoom={17}
                      iconCreateFunction={(cluster) => {
                        const count = cluster.getChildCount();
                        return L.divIcon({
                          html: `
                            <div style="
                              background: linear-gradient(135deg, #f97316, #3b82f6);
                              width: 40px; height: 40px;
                              border-radius: 50%;
                              border: 3px solid white;
                              box-shadow: 0 3px 8px rgba(0,0,0,0.3);
                              display:flex; align-items:center; justify-content:center;
                              color: white; font-weight: 700; font-size: 14px;
                            ">${count}</div>
                          `,
                          className: "custom-cluster-icon",
                          iconSize: [40, 40],
                        });
                      }}
                    >
                      {filtered.map((helper) => (
                        <Marker
                          key={helper.id}
                          position={[helper.lat, helper.lng]}
                          icon={createHelperIcon(helper, selectedHelper?.id === helper.id)}
                          eventHandlers={{
                            click: () => setSelectedHelper(helper),
                          }}
                        >
                          <Popup>
                            <div className="text-sm">
                              <p className="font-bold">{helper.name}</p>
                              <p className="text-gray-500">{helper.category}</p>
                              <p className="text-yellow-500">★ {helper.rating}</p>
                              <p className="text-green-600">
                                {helper.available ? "Available" : "Unavailable"}
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MarkerClusterGroup>
                  </MapContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
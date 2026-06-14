import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mockHelpers, CATEGORIES, getTier } from "../data/mockData";

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "jobs", label: "Most Jobs Done" },
];

const TIER_COLORS = {
  Bronze: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Silver: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  Gold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Platinum: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Diamond: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
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

export default function FindHelper() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("rating");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  // GPS support
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

  // Filter + sort
  const filtered = mockHelpers
    .filter((h) => {
      const matchQ =
        h.name.toLowerCase().includes(q.toLowerCase()) ||
        h.category.toLowerCase().includes(q.toLowerCase()) ||
        h.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()));
      const matchCat = category === "All" || h.category === category;
      const matchAvail = !availableOnly || h.available;
      const matchDist = userPos
        ? getDistance(userPos.lat, userPos.lng, h.lat, h.lng) <= 50
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

  const mapCenter =
    selectedHelper
      ? [selectedHelper.lat, selectedHelper.lng]
      : userPos
      ? [userPos.lat, userPos.lng]
      : [14.4298, 120.9631];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Find a Helper
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {filtered.length} helper{filtered.length !== 1 ? "s" : ""} found
              {category !== "All" ? ` in ${category}` : ""}
            </p>
          </div>

          {/* GPS + Map toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleGPS}
              disabled={gpsLoading}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 transition-all disabled:opacity-60"
            >
              {gpsLoading ? (
                <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <span>📍</span>
              )}
              {userPos ? "GPS Active" : "Use My Location"}
            </button>
            <button
              onClick={() => setShowMap((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 transition-all"
            >
              {showMap ? "🗺️ Hide Map" : "🗺️ Show Map"}
            </button>
          </div>
        </div>

        {gpsError && (
          <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
            <span>⚠️</span> {gpsError}
          </p>
        )}
        {userPos && (
          <p className="text-xs text-green-600 dark:text-green-400 mb-3 flex items-center gap-1">
            <span>✓</span> Showing helpers within 50km of your location
          </p>
        )}

        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT: Filters + Results */}
          <div className="flex-1 min-w-0">

            {/* Search */}
            <div className="relative mb-4">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search helpers, categories, or tags..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                >
                  ×
                </button>
              )}
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* Category pills */}
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      category === cat
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort + Available toggle */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setAvailableOnly((v) => !v)}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    availableOnly ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      availableOnly ? "left-5" : "left-0.5"
                    }`}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Available only
                </span>
              </label>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 text-gray-400"
                  >
                    <div className="text-5xl mb-3">🔍</div>
                    <p className="font-semibold text-gray-600 dark:text-gray-300">No helpers found</p>
                    <p className="text-sm mt-1">Try a different search or category.</p>
                    <button
                      onClick={() => { setQ(""); setCategory("All"); setAvailableOnly(false); }}
                      className="mt-4 text-sm text-blue-600 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </motion.div>
                ) : (
                  filtered.map((helper, i) => {
                    const tier = getTier(helper.jobsDone);
                    const dist = userPos
                      ? getDistance(userPos.lat, userPos.lng, helper.lat, helper.lng).toFixed(1)
                      : null;
                    const isSelected = selectedHelper?.id === helper.id;

                    return (
                      <motion.div
                        key={helper.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedHelper(isSelected ? null : helper)}
                        className={`bg-white dark:bg-gray-900 border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md ${
                          isSelected
                            ? "border-blue-400 shadow-md shadow-blue-100 dark:shadow-none"
                            : "border-gray-100 dark:border-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <img
                              src={helper.avatar}
                              alt={helper.name}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                            <span
                              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${
                                helper.available ? "bg-green-400" : "bg-gray-300"
                              }`}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 dark:text-white">
                                {helper.name}
                              </span>
                              {helper.verified && (
                                <span className="text-blue-500 text-xs font-medium flex items-center gap-0.5">
                                  ✓ Verified
                                </span>
                              )}
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_COLORS[tier.label]}`}>
                                {tier.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              {helper.category} · {helper.location}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="flex items-center gap-1 text-sm text-yellow-500 font-semibold">
                                ★ {helper.rating}
                                <span className="text-gray-400 font-normal text-xs">
                                  ({helper.reviews})
                                </span>
                              </span>
                              <span className="text-xs text-gray-400">
                                {helper.jobsDone} jobs done
                              </span>
                              {dist && (
                                <span className="text-xs text-blue-500 font-medium">
                                  📍 {dist} km away
                                </span>
                              )}
                              <span
                                className={`text-xs font-medium ${
                                  helper.available
                                    ? "text-green-500"
                                    : "text-gray-400"
                                }`}
                              >
                                {helper.available ? "● Available" : "○ Unavailable"}
                              </span>
                            </div>
                            {/* Tags */}
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

                          {/* Rate + Button */}
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <div className="text-right">
                              <span className="font-bold text-gray-900 dark:text-white">
                                ₱{helper.rate.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-400 block">
                                {helper.rateUnit}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/helper/${helper.id}`);
                              }}
                              className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl transition-all active:scale-95"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: Map */}
          <AnimatePresence>
            {showMap && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.3 }}
                className="w-full lg:w-96 flex-shrink-0"
              >
                <div className="sticky top-4 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      🗺️ Helper Map
                    </p>
                    <p className="text-xs text-gray-400">
                      Click a card to highlight on map
                    </p>
                  </div>
                  <MapContainer
                    center={mapCenter}
                    zoom={12}
                    style={{ height: "460px", width: "100%" }}
                    key={JSON.stringify(mapCenter)}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* User location */}
                    {userPos && (
                      <>
                        <Marker position={[userPos.lat, userPos.lng]}>
                          <Popup>📍 Your location</Popup>
                        </Marker>
                        <Circle
                          center={[userPos.lat, userPos.lng]}
                          radius={50000}
                          pathOptions={{ color: "#3b82f6", fillOpacity: 0.05 }}
                        />
                      </>
                    )}
                    {/* Helper markers */}
                    {filtered.map((helper) => (
                      <Marker key={helper.id} position={[helper.lat, helper.lng]}>
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
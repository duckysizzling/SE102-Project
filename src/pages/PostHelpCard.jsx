import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORIES } from "../data/MockData";
import { useHelpers } from "../context/HelperContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CAVITE_DEFAULT = { lat: 14.4298, lng: 120.9631 };
const POSTABLE_CATEGORIES = CATEGORIES.filter((c) => c !== "All");

function LocationPicker({ position, onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export default function PostHelpCard() {
  const navigate = useNavigate();
  const { addHelper } = useHelpers();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    category: "",
    bio: "",
    rate: "",
    rateUnit: "per hour",
    contact: "",
    available: true,
  });
  const [pin, setPin] = useState(null);
  const [mapCenter, setMapCenter] = useState(CAVITE_DEFAULT);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  // Try to center map on user's GPS location, fall back to Cavite
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setMapCenter(CAVITE_DEFAULT);
        setGpsLoading(false);
      }
    );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Your name is required.";
    if (!form.category) e.category = "Please select a service category.";
    if (!form.bio.trim()) e.bio = "Please describe what help you offer.";
    else if (form.bio.trim().length < 10) e.bio = "Description is too short.";
    if (!form.rate || Number(form.rate) <= 0) e.rate = "Enter a valid rate.";
    if (!form.contact.trim()) e.contact = "Contact number is required.";
    else if (!/^09\d{9}$/.test(form.contact.trim())) e.contact = "Enter a valid PH mobile number (e.g. 09171234567).";
    if (!pin) e.location = "Click on the map to set your location.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    const newHelper = {
      name: form.name.trim(),
      category: form.category,
      avatar: user?.avatar || "https://i.pravatar.cc/150?img=68",
      rating: 0,
      reviews: 0,
      jobsDone: 0,
      rate: Number(form.rate),
      rateUnit: form.rateUnit,
      available: form.available,
      verified: false,
      lat: pin.lat,
      lng: pin.lng,
      bio: form.bio.trim(),
      location: user?.location || "Cavite",
      contact: form.contact.trim(),
      tags: [form.category],
      reviewsList: [],
    };

    addHelper(newHelper);
    setSubmitting(false);
    setToast("Your help card has been posted!");

    setTimeout(() => navigate("/find"), 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Post Your Help Card
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Offer your skills to the community. Fill out the form below.
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          onSubmit={handleSubmit}
          noValidate
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Your name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Juan dela Cruz"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                errors.name ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-700 focus:ring-blue-400"
              }`}
            />
            {errors.name && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>●</span> {errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Service category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all ${
                errors.category ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-700 focus:ring-blue-400"
              }`}
            >
              <option value="">Select a category</option>
              {POSTABLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>●</span> {errors.category}</p>}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Describe your service
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. Experienced plumber available for leak repairs, pipe installation..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.bio ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-700 focus:ring-blue-400"
              }`}
            />
            {errors.bio && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>●</span> {errors.bio}</p>}
          </div>

          {/* Rate + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Rate (₱)
              </label>
              <input
                type="number"
                name="rate"
                value={form.rate}
                onChange={handleChange}
                placeholder="350"
                min="0"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.rate ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-700 focus:ring-blue-400"
                }`}
              />
              {errors.rate && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>●</span> {errors.rate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Unit
              </label>
              <select
                name="rateUnit"
                value={form.rateUnit}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              >
                <option value="per hour">per hour</option>
                <option value="per session">per session</option>
                <option value="per trip">per trip</option>
                <option value="per project">per project</option>
              </select>
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Contact number
            </label>
            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="09171234567"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                errors.contact ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-700 focus:ring-blue-400"
              }`}
            />
            {errors.contact && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>●</span> {errors.contact}</p>}
          </div>

          {/* Availability toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm((f) => ({ ...f, available: !f.available }))}
                className={`w-10 h-5 rounded-full transition-all relative ${form.available ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.available ? "left-5" : "left-0.5"}`} />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {form.available ? "Available for work" : "Currently unavailable"}
              </span>
            </label>
          </div>

          {/* Location map picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Your location
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Click anywhere on the map to drop your pin.
            </p>
            <div className={`rounded-xl overflow-hidden border ${errors.location ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}>
              {!gpsLoading && (
                <MapContainer
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={13}
                  style={{ height: "300px", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker position={pin} onPick={setPin} />
                </MapContainer>
              )}
            </div>
            {errors.location && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>●</span> {errors.location}</p>}
            {pin && !errors.location && (
              <p className="mt-1.5 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <span>✓</span> Pin set at {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Posting...
              </>
            ) : (
              "Post Help Card"
            )}
          </button>
        </motion.form>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORIES } from "../data/MockData";
import { useHelpers } from "../context/HelperContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import RequireLogin from "../components/RequireLogin.jsx";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CAVITE_DEFAULT = { lat: 14.4298, lng: 120.9631 };
const POSTABLE_CATEGORIES = CATEGORIES.filter((c) => c !== "All");
const MAX_TAGS = 5;

function LocationPicker({ position, onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

function SectionLabel({ number, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {number}
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function PostHelpCard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { addHelper, updateHelper, helpers, getUserHelperCards } = useHelpers();
  const { user } = useAuth();

  const existingHelper = editId
    ? helpers.find((h) => String(h.id) === String(editId))
    : null;
  const isEditMode = Boolean(existingHelper);
  const userCards = user ? getUserHelperCards(user.id) : [];
  const otherCards = userCards.filter((h) => !isEditMode || h.id !== existingHelper?.id);
  const usedCategories = otherCards.map((h) => h.category);
  const cardCount = otherCards.length;

  const isHardBlocked = !isEditMode && cardCount >= 5;
  const showSoftWarning = !isEditMode && cardCount >= 3 && cardCount < 5;

  const [form, setForm] = useState({
    name: user?.name || "",
    category: "",
    customCategory: "",
    bio: "",
    rate: "",
    rateUnit: "per hour",
    contact: "",
    available: true,
  });
  const [customTags, setCustomTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [pin, setPin] = useState(null);
  const [mapCenter, setMapCenter] = useState(CAVITE_DEFAULT);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const nameRef = useRef(null);
  const categoryRef = useRef(null);
  const customCategoryRef = useRef(null);
  const bioRef = useRef(null);
  const rateRef = useRef(null);
  const contactRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (existingHelper) {
      const isCustomCategory = !POSTABLE_CATEGORIES.includes(existingHelper.category);
      setForm({
        name: existingHelper.name,
        category: isCustomCategory ? "Other" : existingHelper.category,
        customCategory: isCustomCategory ? existingHelper.category : "",
        bio: existingHelper.bio,
        rate: String(existingHelper.rate),
        rateUnit: existingHelper.rateUnit,
        contact: existingHelper.contact,
        available: existingHelper.available,
      });
      const existingTags = existingHelper.tags || [];
      const filteredTags = existingTags.filter(
        (t) => t !== existingHelper.category && t !== "Other"
      );
      setCustomTags(filteredTags.slice(0, MAX_TAGS));
      setPin({ lat: existingHelper.lat, lng: existingHelper.lng });
      setMapCenter({ lat: existingHelper.lat, lng: existingHelper.lng });
      setGpsLoading(false);
    }
  }, [existingHelper]);

  useEffect(() => {
    if (editId) return;
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
  }, [editId]);

  if (!user) {
    return (
      <RequireLogin
        title="Please log in to post a help card"
        description="You need an account to offer your services on LocalHelp."
        icon="🛠️"
      />
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: "" }));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (customTags.length >= MAX_TAGS) return;
    if (customTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTagInput("");
      return;
    }
    setCustomTags((prev) => [...prev, trimmed]);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setCustomTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validate = () => {
    const e = {};
    if (isHardBlocked) {
      e.limit = "You've reached the maximum of 5 active help cards.";
      return e;
    }
    if (form.category && form.category !== "Other" && usedCategories.includes(form.category)) {
      e.category = "You already have a card in this category.";
    }
    if (!form.name.trim()) e.name = "Your name is required.";
    if (!form.category) e.category = "Please select a service category.";
    if (form.category === "Other" && !form.customCategory.trim()) {
      e.customCategory = "Please describe your specific service.";
    }
    if (!form.bio.trim()) e.bio = "Please describe what help you offer.";
    else if (form.bio.trim().length < 10) e.bio = "Description is too short.";
    if (!form.rate || Number(form.rate) <= 0) e.rate = "Enter a valid rate.";
    if (!form.contact.trim()) e.contact = "Contact number is required.";
    else if (!/^09\d{9}$/.test(form.contact.trim())) e.contact = "Enter a valid PH number (e.g. 09171234567).";
    if (!pin) e.location = "Click on the map to set your location.";
    return e;
  };

  const fieldRefs = {
    name: nameRef,
    category: categoryRef,
    customCategory: customCategoryRef,
    bio: bioRef,
    rate: rateRef,
    contact: contactRef,
    location: mapRef,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const fieldOrder = ["name", "category", "customCategory", "bio", "rate", "contact", "location"];
      const firstErrorField = fieldOrder.find((field) => validationErrors[field]);
      const targetRef = fieldRefs[firstErrorField];
      if (targetRef?.current) {
        targetRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof targetRef.current.focus === "function") {
          setTimeout(() => targetRef.current.focus(), 300);
        }
      }
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    const helperData = {
      name: form.name.trim(),
      category: form.category === "Other" ? form.customCategory.trim() : form.category,
      rate: Number(form.rate),
      rateUnit: form.rateUnit,
      available: form.available,
      lat: pin.lat,
      lng: pin.lng,
      bio: form.bio.trim(),
      contact: form.contact.trim(),
      tags: form.category === "Other"
        ? [form.customCategory.trim(), "Other", ...customTags]
        : [form.category, ...customTags],
    };

    if (isEditMode) {
      updateHelper(existingHelper.id, helperData);
      setSubmitting(false);
      setToast("Your help card has been updated!");
    } else {
      addHelper({
        ...helperData,
        userId: user?.id || null,
        rating: 0,
        reviews: 0,
        jobsDone: 0,
        verified: false,
        location: user?.location || "Cavite",
        reviewsList: [],
      });
      setSubmitting(false);
      setToast("Your help card has been posted!");
    }

    setTimeout(() => navigate("/profile"), 1200);
  };

  const inputClass = (error) =>
    `w-full px-4 py-3 rounded-2xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${error
      ? "border-red-400 focus:ring-red-300/50"
      : "border-gray-200 dark:border-gray-700 focus:ring-blue-400/50 focus:border-blue-400"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Page header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div>
              <h1 className="text-xl text-gray-900 dark:text-white">
                {isEditMode ? "Edit your help card" : "Post a help card"}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {isEditMode
                  ? `Editing ${existingHelper?.category} listing`
                  : `Posting as ${user.name}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Hard block banner */}
        {isHardBlocked && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-4 text-sm text-red-600 dark:text-red-400 flex items-start gap-3"
          >
            <span className="text-lg flex-shrink-0">🚫</span>
            <div>
              You've reached the maximum of 5 active help cards ({cardCount}/5).{" "}
              <button onClick={() => navigate("/profile")} className="font-semibold underline">
                Manage your cards
              </button>{" "}
              to delete one first.
            </div>
          </motion.div>
        )}

        {/* Soft warning banner */}
        {showSoftWarning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4 text-sm text-amber-700 dark:text-amber-300 flex items-start gap-3"
          >
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div>
              You currently have {cardCount} active listings ({cardCount}/5). Make sure each one represents a genuinely different service.
            </div>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4"
        >
          {/* Section 1 — Identity */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <SectionLabel
              number="1"
              title="Your identity"
              subtitle="Who are people contacting when they reach out?"
            />
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Display name
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Juan dela Cruz"
                  className={inputClass(errors.name)}
                />
                {errors.name && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>●</span> {errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Contact number
                </label>
                <input
                  ref={contactRef}
                  type="text"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="09171234567"
                  className={inputClass(errors.contact)}
                />
                {errors.contact && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>●</span> {errors.contact}</p>}
              </div>
            </div>
          </div>

          {/* Section 2 — Service */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <SectionLabel
              number="2"
              title="Your service"
              subtitle="What do you do, and how would you describe it?"
            />
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Category
                </label>
                <select
                  ref={categoryRef}
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass(errors.category)}
                >
                  <option value="">Select a category</option>
                  {POSTABLE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} disabled={usedCategories.includes(cat)}>
                      {cat}{usedCategories.includes(cat) ? " (already posted)" : ""}
                    </option>
                  ))}
                  <option value="Other">Other (not listed)</option>
                </select>
                {errors.category && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>●</span> {errors.category}</p>}

                {form.category === "Other" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 overflow-hidden"
                  >
                    <input
                      ref={customCategoryRef}
                      type="text"
                      name="customCategory"
                      value={form.customCategory}
                      onChange={handleChange}
                      placeholder="e.g. Midwife, Albularyo, Cake Maker..."
                      className={inputClass(errors.customCategory)}
                    />
                    {errors.customCategory && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>●</span> {errors.customCategory}</p>}
                    <p className="mt-1.5 text-xs text-gray-400">Your service will be added as a searchable tag.</p>
                  </motion.div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Description
                </label>
                <textarea
                  ref={bioRef}
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. Experienced plumber available for leak repairs, pipe installation..."
                  className={`${inputClass(errors.bio)} resize-none`}
                />
                {errors.bio && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>●</span> {errors.bio}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Skills / Tags <span className="normal-case font-normal">(optional, up to {MAX_TAGS})</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Add specific skills so people can find you more easily.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type a skill and press Enter..."
                    disabled={customTags.length >= MAX_TAGS}
                    className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || customTags.length >= MAX_TAGS}
                    className="text-sm font-semibold bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed px-4 py-3 rounded-2xl transition-all active:scale-95"
                  >
                    Add
                  </button>
                </div>
                {customTags.length > 0 && (
                  <div className="flex gap-1.5 mt-2.5 flex-wrap">
                    {customTags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-full">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 transition-colors leading-none">×</button>
                      </span>
                    ))}
                  </div>
                )}
                {customTags.length >= MAX_TAGS && (
                  <p className="text-xs text-gray-400 mt-1.5">Maximum of {MAX_TAGS} tags reached.</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3 — Pricing */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <SectionLabel
              number="3"
              title="Pricing & availability"
              subtitle="How much do you charge, and are you currently taking work?"
            />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Rate (₱)
                </label>
                <input
                  ref={rateRef}
                  type="number"
                  name="rate"
                  value={form.rate}
                  onChange={handleChange}
                  placeholder="350"
                  min="0"
                  className={inputClass(errors.rate)}
                />
                {errors.rate && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>●</span> {errors.rate}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Per
                </label>
                <select
                  name="rateUnit"
                  value={form.rateUnit}
                  onChange={handleChange}
                  className={inputClass(false)}
                >
                  <option value="per hour">hour</option>
                  <option value="per session">session</option>
                  <option value="per trip">trip</option>
                  <option value="per project">project</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm((f) => ({ ...f, available: !f.available }))}
                className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${form.available ? "bg-gray-900 dark:bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                  }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-all ${form.available ? "bg-white" : "bg-gray-400 dark:bg-gray-500"
                    }`}
                  style={{ left: form.available ? "18px" : "2px" }}
                />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {form.available ? "Available for work" : "Currently unavailable"}
                </span>
                <p className="text-xs text-gray-400">
                  {form.available ? "Your listing will show as active" : "Your listing will be hidden from searches"}
                </p>
              </div>
            </label>
          </div>

          {/* Section 4 — Location */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <SectionLabel
              number="4"
              title="Your location"
              subtitle="Click anywhere on the map to place your pin."
            />
            <div
              ref={mapRef}
              className={`rounded-2xl overflow-hidden border ${errors.location ? "border-red-400" : "border-gray-200 dark:border-gray-700"
                }`}
            >
              {!gpsLoading && (
                <MapContainer
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={13}
                  style={{ height: "280px", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker position={pin} onPick={setPin} />
                </MapContainer>
              )}
            </div>
            {errors.location && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><span>●</span> {errors.location}</p>
            )}
            {pin && !errors.location && (
              <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Pin placed at {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-2 pb-4">
            {isEditMode && (
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex-shrink-0 text-sm font-semibold text-gray-500 dark:text-gray-400 px-5 py-3.5 rounded-2xl hover:bg-white dark:hover:bg-gray-900 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting || isHardBlocked}
              className="flex-1 font-semibold py-3.5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-white disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: submitting || isHardBlocked
                  ? "#9ca3af"
                  : "linear-gradient(120deg, #f97316, #ec4899, #3b82f6)",
              }}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {isEditMode ? "Saving..." : "Posting..."}
                </>
              ) : isHardBlocked ? (
                "Limit Reached"
              ) : (
                isEditMode ? "Save Changes" : "Post Help Card"
              )}
            </button>
          </div>
        </motion.form>
      </div>

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
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useHelpers } from "../context/HelperContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getTier } from "../data/MockData";

const TIER_BADGE_STYLE = {
  Bronze: "bg-orange-100 text-orange-900 dark:bg-orange-950/50 dark:text-orange-300",
  Silver: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  Gold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Platinum: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const CATEGORY_BANNER_GRADIENT = {
  Plumber: "from-blue-500 to-blue-700",
  Tutor: "from-purple-500 to-purple-700",
  Driver: "from-amber-500 to-amber-700",
  Electrician: "from-yellow-500 to-yellow-700",
  Carpenter: "from-amber-700 to-amber-900",
  Cleaner: "from-emerald-500 to-emerald-700",
  Gardener: "from-green-500 to-green-700",
  Mechanic: "from-slate-500 to-slate-700",
  Designer: "from-pink-500 to-pink-700",
  Coder: "from-cyan-500 to-cyan-700",
};

function TierBadge({ tier }) {
  if (tier.label === "Diamond") {
    return (
      <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-blue-600 text-white shadow-sm">
        ◆ Diamond
      </span>
    );
  }
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${TIER_BADGE_STYLE[tier.label]}`}>
      {tier.label}
    </span>
  );
}

export default function HelperProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { helpers, getHelperAvatar } = useHelpers();
  const { user } = useAuth();
  const baseHelper = helpers.find((h) => String(h.id) === String(id));

  const [reviewsList, setReviewsList] = useState(baseHelper?.reviewsList || []);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  if (!baseHelper) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-3">🔍</div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Helper not found
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          This helper may have been removed or the link is incorrect.
        </p>
        <button
          onClick={() => navigate("/find")}
          className="mt-5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all active:scale-95"
        >
          Back to Find Helper
        </button>
      </div>
    );
  }

  const tier = getTier(baseHelper.jobsDone);
  const avatarSrc = getHelperAvatar(baseHelper, user);
  const bannerGradient = CATEGORY_BANNER_GRADIENT[baseHelper.category] || "from-gray-500 to-gray-700";

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!");
    } catch {
      showToast("Could not copy link.");
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (newRating === 0) {
      setFormError("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      setFormError("Please write a short comment.");
      return;
    }
    setFormError("");
    setReviewsList((prev) => [
      {
        user: user?.name || "You",
        rating: newRating,
        comment: comment.trim(),
        date: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
    setNewRating(0);
    setComment("");
    showToast("Review submitted!");
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setReportOpen(false);
    setReportReason("");
    showToast("Report submitted. Our team will review it.");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto pb-8">

        <button
          onClick={() => navigate("/find")}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mx-4 mt-4 mb-2 flex items-center gap-1.5 transition-colors"
        >
          ← Back to Find Helper
        </button>

        {/* Profile header — banner + overlapping avatar, social-style */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white dark:bg-gray-900 sm:rounded-2xl shadow-sm overflow-hidden border-t border-b sm:border border-gray-100 dark:border-gray-800"
        >
          {/* Banner */}
          <div className={`relative h-32 sm:h-40 bg-gradient-to-br ${bannerGradient}`}>
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="px-5 sm:px-6 pb-6">
            {/* Avatar overlapping banner */}
            <div className="flex justify-between items-end -mt-12 sm:-mt-14 mb-3">
              <div className="relative">
                <img
                  src={avatarSrc}
                  alt={baseHelper.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-gray-900"
                />
                <span
                  className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-3 border-white dark:border-gray-900 ${
                    baseHelper.available ? "bg-green-400" : "bg-gray-300"
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={handleShare}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all active:scale-95"
                  title="Share profile"
                >
                  ⤴
                </button>
                <button
                  onClick={() => setReportOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all active:scale-95"
                  title="Report"
                >
                  ⚑
                </button>
                
                  <a href={`tel:${baseHelper.contact}`}
                  className="flex items-center gap-1.5 text-sm font-semibold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white px-5 py-2.5 rounded-full transition-all active:scale-95"
                >
                  📞 Contact
                </a>
              </div>
            </div>

            {/* Identity */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {baseHelper.name}
              </h1>
              {baseHelper.verified && (
                <span className="text-blue-500 text-sm" title="Verified account">✓</span>
              )}
              <TierBadge tier={tier} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {baseHelper.category} · {baseHelper.location}
            </p>

            {/* Stats row — Instagram-style */}
            <div className="flex items-center gap-6 mt-4 py-4 border-y border-gray-100 dark:border-gray-800">
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{baseHelper.jobsDone}</div>
                <div className="text-xs text-gray-400">jobs done</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  {baseHelper.rating} <span className="text-amber-400 text-sm">★</span>
                </div>
                <div className="text-xs text-gray-400">{reviewsList.length} review{reviewsList.length !== 1 ? "s" : ""}</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ₱{baseHelper.rate.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">{baseHelper.rateUnit}</div>
              </div>
              <div className="ml-auto">
                <span className={`text-sm font-medium ${baseHelper.available ? "text-green-500" : "text-gray-400"}`}>
                  {baseHelper.available ? "● Available" : "○ Unavailable"}
                </span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              {baseHelper.bio}
            </p>

            {/* Tags */}
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {baseHelper.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full">
                  #{tag.replace(/\s+/g, "")}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 sm:rounded-2xl shadow-sm mt-0 sm:mt-5 px-5 sm:px-6 py-6 border-b sm:border border-gray-100 dark:border-gray-800"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            Reviews ({reviewsList.length})
          </h3>

          {user ? (
            <form onSubmit={handleSubmitReview} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-5">
              <div className="flex items-center gap-3 mb-3">
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl leading-none transition-transform active:scale-90"
                    >
                      <span className={star <= (hoverRating || newRating) ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this helper..."
                rows={2}
                className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none"
              />
              {formError && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <span>●</span> {formError}
                </p>
              )}
              <div className="flex justify-end mt-2.5">
                <button
                  type="submit"
                  className="text-sm font-semibold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
                >
                  Post Review
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 mb-5 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Log in to leave a rating and review.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="text-xs font-semibold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <AnimatePresence>
              {reviewsList.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  No reviews yet. Be the first to leave one!
                </p>
              ) : (
                reviewsList.map((r, idx) => (
                  <motion.div
                    key={`${r.user}-${r.date}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-300 flex-shrink-0">
                      {r.user.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {r.user}
                        </span>
                        <span className="text-xs text-gray-400">{r.date}</span>
                      </div>
                      <div className="text-amber-400 text-sm mt-0.5">
                        {"★".repeat(r.rating)}
                        <span className="text-gray-300 dark:text-gray-600">{"★".repeat(5 - r.rating)}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.comment}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
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

      <AnimatePresence>
        {reportOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
            onClick={() => setReportOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                Report {baseHelper.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Tell us what's wrong. Our team will review this report.
              </p>
              <form onSubmit={handleReportSubmit}>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Describe the issue..."
                  rows={3}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setReportOpen(false)}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reportReason.trim()}
                    className="text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
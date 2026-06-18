import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getTier } from "../data/MockData";
import { useHelpers } from "../context/HelperContext.jsx";

const TIER_COLORS = {
  Bronze: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Silver: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  Gold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Platinum: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Diamond: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
};

export default function HelperProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { helpers } = useHelpers();
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
        user: "You",
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
      <div className="max-w-3xl mx-auto px-4 py-8">

        <button
          onClick={() => navigate("/find")}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-5 flex items-center gap-1.5 transition-colors"
        >
          ← Back to Find Helper
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative flex-shrink-0">
              <img
                src={baseHelper.avatar}
                alt={baseHelper.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${
                  baseHelper.available ? "bg-green-400" : "bg-gray-300"
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {baseHelper.name}
                </h1>
                {baseHelper.verified && (
                  <span className="text-blue-500 text-xs font-medium flex items-center gap-0.5">
                    ✓ Verified
                  </span>
                )}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_COLORS[tier.label]}`}>
                  {tier.label}
                </span>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {baseHelper.category} · {baseHelper.location}
              </p>

              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-sm text-yellow-500 font-semibold">
                  ★ {baseHelper.rating}
                  <span className="text-gray-400 font-normal text-xs">
                    ({reviewsList.length} review{reviewsList.length !== 1 ? "s" : ""})
                  </span>
                </span>
                <span className="text-xs text-gray-400">
                  {baseHelper.jobsDone} jobs done
                </span>
                <span className={`text-xs font-medium ${baseHelper.available ? "text-green-500" : "text-gray-400"}`}>
                  {baseHelper.available ? "● Available" : "○ Unavailable"}
                </span>
              </div>

              <div className="mt-2">
                <span className="font-bold text-gray-900 dark:text-white">
                  ₱{baseHelper.rate.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 ml-1">{baseHelper.rateUnit}</span>
              </div>

              <div className="flex gap-1.5 mt-3 flex-wrap">
                {baseHelper.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 flex-wrap">
            <a
              href={`tel:${baseHelper.contact}`}
              className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
            >
              📞 {baseHelper.contact}
            </a>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl hover:border-blue-400 transition-all active:scale-95"
            >
              🔗 Share
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-red-500 px-4 py-2 rounded-xl transition-all active:scale-95 ml-auto"
            >
              ⚑ Report
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {baseHelper.bio}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm mt-5"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            Reviews ({reviewsList.length})
          </h3>

          <form onSubmit={handleSubmitReview} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-5">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Leave a rating
            </p>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-2xl leading-none transition-transform active:scale-90"
                >
                  <span className={star <= (hoverRating || newRating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}>
                    ★
                  </span>
                </button>
              ))}
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
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
              >
                Submit Review
              </button>
            </div>
          </form>

          <div className="space-y-3">
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
                    className="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {r.user}
                      </span>
                      <span className="text-xs text-gray-400">{r.date}</span>
                    </div>
                    <div className="text-yellow-400 text-sm mt-0.5">
                      {"★".repeat(r.rating)}
                      <span className="text-gray-300 dark:text-gray-600">{"★".repeat(5 - r.rating)}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.comment}</p>
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
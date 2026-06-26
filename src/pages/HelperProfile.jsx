import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MessageCircle,
  Share2,
  Flag,
  Phone,
  MapPin,
  ShieldCheck,
  Inbox,
  Heart,
  Flame,
  Send,
  Megaphone,
  HelpCircle,
  Tag,
  CheckCircle,
} from "lucide-react";
import { useHelpers } from "../context/HelperContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { usePosts } from "../context/PostsContext.jsx";
import { getTier } from "../data/MockData";
import ChatDrawer from "../components/ChatDrawer.jsx";

const TIER_BADGE_STYLE = {
  Bronze: "bg-orange-100 text-orange-900 dark:bg-orange-950/50 dark:text-orange-300",
  Silver: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  Gold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Platinum: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const CATEGORY_BANNER_GRADIENT = {
  Plumber: "135deg, #3b82f6, #1d4ed8",
  Tutor: "135deg, #a855f7, #7c3aed",
  Driver: "135deg, #f59e0b, #b45309",
  Electrician: "135deg, #eab308, #a16207",
  Carpenter: "135deg, #b45309, #78350f",
  Cleaner: "135deg, #10b981, #047857",
  Gardener: "135deg, #22c55e, #15803d",
  Mechanic: "135deg, #64748b, #334155",
  Designer: "135deg, #ec4899, #be185d",
  Coder: "135deg, #06b6d4, #0e7490",
};

const CATEGORY_ICONS = {
  Announcement: Megaphone,
  Question: HelpCircle,
  Sale: Tag,
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

// ── Skeletons ──────────────────────────────────────────────────────────────────
function HelperHeroSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="h-40 sm:h-48 bg-gray-200 dark:bg-gray-800" />
      <div className="px-5 sm:px-6 pb-5">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 ring-4 ring-white dark:ring-gray-900" />
          <div className="flex items-center gap-2 pb-1">
            <div className="h-9 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
          </div>
        </div>
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
        <div className="grid grid-cols-4 gap-2 py-4 border-y border-gray-100 dark:border-gray-800">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="h-5 w-10 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-2.5 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
        <div className="space-y-2 mt-4">
          <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        <div className="flex gap-1.5 mt-3">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
      <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
      <div className="px-5 sm:px-6 py-4 space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
              <div className="h-2.5 w-16 bg-gray-200 dark:bg-gray-800 rounded ml-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostsSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
      <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
      <div className="px-5 sm:px-6 py-4 space-y-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-2.5 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HelperProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { helpers, getHelperAvatar, markJobDone } = useHelpers();
  const { user } = useAuth();
  const { posts, toggleLike, addComment, getPostAvatar, hasLiked } = usePosts();
  const baseHelper = helpers.find((h) => String(h.id) === String(id));

  const [reviewsList, setReviewsList] = useState(baseHelper?.reviewsList || []);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [lightboxImage, setLightboxImage] = useState(null);

  // Mark as Done states
  const [markDoneOpen, setMarkDoneOpen] = useState(false);
  const [markDoneRating, setMarkDoneRating] = useState(0);
  const [markDoneHover, setMarkDoneHover] = useState(0);
  const [markDoneComment, setMarkDoneComment] = useState("");
  const [markDoneError, setMarkDoneError] = useState("");

  if (!baseHelper) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <Search size={44} strokeWidth={1.5} className="mb-3 text-gray-300 dark:text-gray-700" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Helper not found</h2>
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

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const tier = getTier(baseHelper.jobsDone);
  const avatarSrc = getHelperAvatar(baseHelper, user);

  const isOwnCard = user && String(baseHelper.userId) === String(user.id);
  const coverPhoto = isOwnCard ? (user.coverPhoto || null) : (baseHelper.coverPhoto || null);
  const bannerStyle = coverPhoto
    ? { backgroundImage: `url(${coverPhoto})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(${CATEGORY_BANNER_GRADIENT[baseHelper.category] || "135deg, #6b7280, #374151"})` };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard!");
    } catch {
      showToast("Could not copy link.");
    }
  };

  const handleChat = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setChatOpen(true);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (newRating === 0) { setFormError("Please select a star rating."); return; }
    if (!comment.trim()) { setFormError("Please write a short comment."); return; }
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

  const handleMarkDone = (e) => {
    e.preventDefault();
    if (markDoneRating === 0) { setMarkDoneError("Please select a star rating."); return; }
    if (!markDoneComment.trim()) { setMarkDoneError("Please write a short comment."); return; }

    const review = {
      user: user?.name || "Anonymous",
      rating: markDoneRating,
      comment: markDoneComment.trim(),
      date: new Date().toISOString().split("T")[0],
    };

    markJobDone(baseHelper.id, review);
    setReviewsList((prev) => [review, ...prev]);
    setMarkDoneOpen(false);
    setMarkDoneRating(0);
    setMarkDoneComment("");
    setMarkDoneError("");
    showToast("Job marked as done! Review submitted ✓");
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setReportOpen(false);
    setReportReason("");
    showToast("Report submitted. Our team will review it.");
  };

  const userPosts = posts.filter((p) => String(p.userId) === String(baseHelper.userId));

  const isLiked = (post) => hasLiked(post, user?.id);
  const handleLikeClick = (post) => {
    if (!user) { navigate("/login"); return; }
    toggleLike(post.id, user.id);
  };
  const handleToggleComments = (id) =>
    setOpenComments((prev) => ({ ...prev, [id]: !prev[id] }));
  const handleCommentChange = (id, val) =>
    setCommentDrafts((prev) => ({ ...prev, [id]: val }));
  const handleAddComment = (id) => {
    const text = commentDrafts[id]?.trim();
    if (!text) return;
    addComment(id, text);
    setCommentDrafts((prev) => ({ ...prev, [id]: "" }));
  };

  const CATEGORY_COLORS = {
    Announcement: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    Question: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    Sale: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">

      {/* ── Back button ── */}
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-2">
        <button
          onClick={() => navigate("/find")}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors"
        >
          ← Back to Find Helper
        </button>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-4xl mx-auto px-4 space-y-4 pb-10">

        {/* ── Profile hero card ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="hero-skeleton" exit={{ opacity: 0 }}>
              <HelperHeroSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="hero-content"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              {/* Cover banner */}
              <div className="h-44 sm:h-56 relative" style={bannerStyle}>
                <div className="absolute inset-0 bg-black/15" />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-all"
                    title="Share profile"
                  >
                    <Share2 size={16} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => setReportOpen(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-all"
                    title="Report"
                  >
                    <Flag size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-6">
                {/* Avatar overlapping banner */}
                <div className="flex items-end justify-between -mt-12 mb-4">
                  <div className="relative">
                    <img
                      src={avatarSrc}
                      alt={baseHelper.name}
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-900 shadow-md"
                    />
                    <span
                      className={`absolute bottom-1 right-1 w-4 h-4 rounded-full ring-2 ring-white dark:ring-gray-900 ${
                        baseHelper.available ? "bg-green-400" : "bg-gray-300"
                      }`}
                    />
                  </div>

                  {/* CTA buttons */}
                  <div className="flex items-center gap-2 pb-1 flex-wrap justify-end">
                    {user && !isOwnCard && (
                      <button
                        onClick={() => setMarkDoneOpen(true)}
                        className="flex items-center gap-1.5 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition-all active:scale-95"
                      >
                        <CheckCircle size={15} strokeWidth={2} />
                        Mark as Done
                      </button>
                    )}
                    <button
                      onClick={handleChat}
                      className="flex items-center gap-1.5 text-sm font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full transition-all active:scale-95"
                    >
                      <MessageCircle size={15} strokeWidth={2} />
                      Chat
                    </button>
                    <a
                      href={`tel:${baseHelper.contact}`}
                      className="flex items-center gap-1.5 text-sm font-semibold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white px-5 py-2 rounded-full transition-all active:scale-95"
                    >
                      <Phone size={14} strokeWidth={2.25} />
                      Contact
                    </a>
                  </div>
                </div>

                {/* Name + verified + tier */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {baseHelper.name}
                  </h1>
                  {baseHelper.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                      <ShieldCheck size={12} strokeWidth={2.5} />
                      Verified
                    </span>
                  )}
                  <TierBadge tier={tier} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <MapPin size={13} strokeWidth={2} />
                  {baseHelper.category} · {baseHelper.location}
                </p>

                {/* Stats strip */}
                <div className="grid grid-cols-4 gap-2 mt-4 py-4 border-y border-gray-100 dark:border-gray-800 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{baseHelper.jobsDone}</p>
                    <p className="text-xs text-gray-400 mt-1">Jobs done</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-500 leading-none">★ {baseHelper.rating}</p>
                    <p className="text-xs text-gray-400 mt-1">{reviewsList.length} reviews</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                      ₱{baseHelper.rate.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{baseHelper.rateUnit}</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold leading-none ${baseHelper.available ? "text-green-500" : "text-gray-400"}`}>
                      {baseHelper.available ? "Open" : "Closed"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">availability</p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  {baseHelper.bio}
                </p>

                {/* Tags */}
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {baseHelper.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full"
                    >
                      #{tag.replace(/\s+/g, "")}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Reviews wall ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="reviews-skeleton" exit={{ opacity: 0 }}>
              <ReviewsSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="reviews-content"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="px-6 sm:px-8 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Reviews
                  <span className="ml-1.5 text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {reviewsList.length}
                  </span>
                </h3>
                {baseHelper.rating > 0 && (
                  <span className="text-sm font-bold text-amber-500">★ {baseHelper.rating} avg</span>
                )}
              </div>

              <div className="px-6 sm:px-8 py-4">
                {user ? (
                  <div className="flex gap-3 mb-5">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 mt-0.5" />
                    <form onSubmit={handleSubmitReview} className="flex-1">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="text-xl leading-none transition-transform active:scale-90"
                          >
                            <span className={star <= (hoverRating || newRating) ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}>
                              ★
                            </span>
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={`How was your experience with ${baseHelper.name}?`}
                        rows={2}
                        className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all resize-none"
                      />
                      {formError && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <span>●</span> {formError}
                        </p>
                      )}
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          className="text-sm font-semibold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
                        >
                          Post Review
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-5 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      Log in to leave a rating and review.
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => navigate("/login")}
                        className="text-xs font-semibold bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
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
                          className="flex gap-3"
                        >
                          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-300 flex-shrink-0">
                            {r.user.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                  {r.user}
                                </span>
                                <div className="text-amber-400 text-xs">
                                  {"★".repeat(r.rating)}
                                  <span className="text-gray-300 dark:text-gray-600">{"★".repeat(5 - r.rating)}</span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 ml-2">{r.date}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Posts wall ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="posts-skeleton" exit={{ opacity: 0 }}>
              <PostsSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="posts-content"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="px-6 sm:px-8 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Posts
                  <span className="ml-1.5 text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {userPosts.length}
                  </span>
                </h3>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {userPosts.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <Inbox size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No posts yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {baseHelper.name} hasn't posted anything on the community feed.
                    </p>
                  </div>
                ) : (
                  userPosts.map((post, i) => {
                    const CategoryIcon = CATEGORY_ICONS[post.category];
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-6 sm:px-8 py-4"
                      >
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={getPostAvatar(post, user)}
                              alt={post.user}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.user}</p>
                              <p className="text-xs text-gray-400">{post.date}</p>
                            </div>
                          </div>
                          <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${CATEGORY_COLORS[post.category]}`}>
                            {CategoryIcon && <CategoryIcon size={12} strokeWidth={2.5} />}
                            {post.category}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {post.content}
                        </p>

                        {post.images && post.images.length > 0 && (
                          <div className={`grid gap-1.5 mt-3 rounded-xl overflow-hidden ${
                            post.images.length === 1 ? "grid-cols-1" :
                            post.images.length === 2 ? "grid-cols-2" :
                            "grid-cols-3"
                          }`}>
                            {post.images.slice(0, 6).map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setLightboxImage(img)}
                                className={`relative ${post.images.length === 1 ? "aspect-video" : "aspect-square"} overflow-hidden`}
                              >
                                <img
                                  src={img}
                                  alt={`Post image ${idx + 1}`}
                                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                                />
                              </button>
                            ))}
                          </div>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {post.tags.map((tag) => (
                              <span key={tag} className="text-xs text-blue-500">{tag}</span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <button
                            onClick={() => handleLikeClick(post)}
                            className={`flex items-center gap-1.5 text-sm font-medium transition-all active:scale-90 ${
                              isLiked(post) ? "text-red-500" : "text-gray-400 hover:text-red-400"
                            }`}
                          >
                            <Heart size={17} strokeWidth={2} fill={isLiked(post) ? "currentColor" : "none"} />
                            {post.likes}
                          </button>
                          <button
                            onClick={() => handleToggleComments(post.id)}
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <MessageCircle size={17} strokeWidth={2} />
                            {post.comments.length}
                          </button>
                          {post.trending && (
                            <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-orange-500">
                              <Flame size={13} strokeWidth={2.25} fill="currentColor" />
                              Trending
                            </span>
                          )}
                        </div>

                        <AnimatePresence>
                          {openComments[post.id] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 overflow-hidden"
                            >
                              {post.comments.length > 0 && (
                                <div className="space-y-2 mb-3">
                                  {post.comments.map((c, idx) => (
                                    <div key={idx} className="flex gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">{c.user}</span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">{c.text}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {post.comments.length === 0 && (
                                <p className="text-xs text-gray-400 mb-3 text-center">No comments yet.</p>
                              )}
                              {user ? (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={commentDrafts[post.id] || ""}
                                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                                    placeholder="Write a comment..."
                                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                  />
                                  <button
                                    onClick={() => handleAddComment(post.id)}
                                    disabled={!commentDrafts[post.id]?.trim()}
                                    className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white px-3 py-2 rounded-xl transition-all active:scale-95"
                                  >
                                    <Send size={13} strokeWidth={2.25} />
                                    Post
                                  </button>
                                </div>
                              ) : (
                                <p className="text-xs text-center text-gray-400 py-1">
                                  <button onClick={() => navigate("/login")} className="text-blue-500 hover:underline font-medium">Log in</button> to comment.
                                </p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Chat Drawer ── */}
      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        helper={baseHelper}
        currentUser={user}
        avatarSrc={avatarSrc}
      />

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg z-50 whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mark as Done modal ── */}
      <AnimatePresence>
        {markDoneOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
            onClick={() => setMarkDoneOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={18} className="text-green-500" strokeWidth={2.5} />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Mark Job as Done
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Rate your experience with <span className="font-semibold">{baseHelper.name}</span>. This will count toward their job total and tier progress.
              </p>
              <form onSubmit={handleMarkDone}>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Your Rating</p>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setMarkDoneRating(star)}
                      onMouseEnter={() => setMarkDoneHover(star)}
                      onMouseLeave={() => setMarkDoneHover(0)}
                      className="text-2xl leading-none transition-transform active:scale-90"
                    >
                      <span className={star <= (markDoneHover || markDoneRating) ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Your Review</p>
                <textarea
                  value={markDoneComment}
                  onChange={(e) => setMarkDoneComment(e.target.value)}
                  placeholder={`How was your experience with ${baseHelper.name}?`}
                  rows={3}
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all resize-none"
                />
                {markDoneError && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <span>●</span> {markDoneError}
                  </p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setMarkDoneOpen(false)}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
                  >
                    Confirm & Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Report modal ── */}
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

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60] cursor-zoom-out"
          >
            <img
              src={lightboxImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
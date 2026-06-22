import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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
      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-blue-600 text-white">
        ◆ Diamond
      </span>
    );
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${TIER_BADGE_STYLE[tier.label]}`}>
      {tier.label}
    </span>
  );
}

export default function HelperProfileModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { helpers, getHelperAvatar } = useHelpers();
  const { user } = useAuth();
  const [chatToast, setChatToast] = useState(false);

  const baseHelper = helpers.find((h) => String(h.id) === String(id));
  const backgroundLocation = location.state?.backgroundLocation;

  const handleClose = () => {
    navigate(backgroundLocation ? -1 : "/find");
  };

  const handleViewFullProfile = () => {
    navigate(`/helper/${id}`, { replace: true });
  };

  const handleChat = () => {
    setChatToast(true);
    setTimeout(() => setChatToast(false), 2200);
  };

  if (!baseHelper) {
    return null;
  }

  const tier = getTier(baseHelper.jobsDone);
  const avatarSrc = getHelperAvatar(baseHelper, user);
  const bannerGradient = CATEGORY_BANNER_GRADIENT[baseHelper.category] || "from-gray-500 to-gray-700";
  const coverPhoto = baseHelper.coverPhoto || null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col"
        >
          {/* Banner — photo if set, gradient fallback otherwise */}
          <div
            className={`relative h-40 flex-shrink-0 rounded-t-2xl overflow-hidden ${coverPhoto ? "" : `bg-gradient-to-br ${bannerGradient}`}`}
            style={coverPhoto ? { backgroundImage: `url(${coverPhoto})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            <div className="absolute inset-0 bg-black/10" />
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/40 text-white text-lg transition-all z-10"
            >
              ×
            </button>
          </div>

          {/* Avatar sits OUTSIDE the scroll container so overflow-y-auto doesn't clip it */}
          <div className="px-6 -mt-12 relative z-10">
            <img
              src={avatarSrc}
              alt={baseHelper.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-900 shadow-md"
            />
          </div>

          <div className="px-6 pb-6 overflow-y-auto">
            {/* Identity */}
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {baseHelper.name}
              </h2>
              {baseHelper.verified && (
                <span className="text-blue-500 text-sm" title="Verified">✓</span>
              )}
              <TierBadge tier={tier} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {baseHelper.category} · {baseHelper.location}
            </p>

            {/* Quick stats */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                ★ {baseHelper.rating}
                <span className="text-gray-400 font-normal text-xs">({baseHelper.reviews})</span>
              </span>
              <span className="text-gray-400 text-xs">{baseHelper.jobsDone} jobs done</span>
              <span className={`text-xs font-medium ${baseHelper.available ? "text-green-500" : "text-gray-400"}`}>
                {baseHelper.available ? "● Available" : "○ Unavailable"}
              </span>
            </div>

            {/* Rate */}
            <div className="mt-2">
              <span className="font-bold text-gray-900 dark:text-white">
                ₱{baseHelper.rate.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 ml-1">{baseHelper.rateUnit}</span>
            </div>

            {/* Brief bio */}
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-3 line-clamp-3">
              {baseHelper.bio}
            </p>

            {/* Tags */}
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {baseHelper.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">

              <a href={`tel:${baseHelper.contact}`}
                className="text-center text-sm font-semibold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white px-3 py-2.5 rounded-xl transition-all active:scale-95"
              >
                📞 Contact
              </a>
              <button
                onClick={handleChat}
                className="text-center text-sm font-semibold bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-3 py-2.5 rounded-xl transition-all active:scale-95"
              >
                💬 Chat
              </button>
              <button
                onClick={handleViewFullProfile}
                className="text-center text-sm font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2.5 rounded-xl transition-all active:scale-95"
              >
                Profile →
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Chat coming soon toast */}
      <AnimatePresence>
        {chatToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg z-[60]"
          >
            💬 Chat feature coming soon!
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
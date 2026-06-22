import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Pencil,
  Check,
  X,
  Settings,
  MapPin,
  ShieldCheck,
  Loader2,
  ClipboardList,
  Inbox,
  Heart,
  MessageCircle,
  Flame,
  Trash2,
  Send,
  Megaphone,
  HelpCircle,
  Tag,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useHelpers } from "../context/HelperContext.jsx";
import { usePosts } from "../context/PostsContext.jsx";
import AvatarPickerModal from "../components/AvatarPickerModal.jsx";
import RequireLogin from "../components/RequireLogin.jsx";

const CATEGORY_ICONS = {
  Announcement: Megaphone,
  Question: HelpCircle,
  Sale: Tag,
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { helpers, deleteHelper, getHelperAvatar, requestVerification } = useHelpers();
  const { posts, toggleLike, addComment, getPostAvatar, hasLiked } = usePosts();
  const navigate = useNavigate();

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [toast, setToast] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [lightboxImage, setLightboxImage] = useState(null);

  if (!user) {
    return (
      <RequireLogin
        title="Please log in to view your profile"
        description="Manage your account, posted listings, and settings here."
        icon={<User size={30} strokeWidth={1.75} />}
      />
    );
  }

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const startEdit = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValue("");
  };

  const saveEdit = (field) => {
    if (!tempValue.trim()) return;
    updateUser({ [field]: tempValue.trim() });
    setEditingField(null);
    showToast(`${field === "name" ? "Name" : "Location"} updated!`);
  };

  const handleAvatarSelect = (newAvatar) => {
    updateUser({ avatar: newAvatar });
    setAvatarModalOpen(false);
    showToast("Profile picture updated!");
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteHelper(deleteTarget.id);
    setDeleteTarget(null);
    showToast("Help card deleted.");
  };

  const myPostedHelpers = helpers.filter((h) => h.userId === user.id);
  const isAccountVerified = myPostedHelpers.some((h) => h.verified);
  const isReviewing = myPostedHelpers.some((h) => h.verificationStatus === "reviewing");
  const totalReviews = myPostedHelpers.reduce((sum, h) => sum + (h.reviews || 0), 0);
  const totalJobs = myPostedHelpers.reduce((sum, h) => sum + (h.jobsDone || 0), 0);
  const avgRating =
    myPostedHelpers.length > 0
      ? (myPostedHelpers.reduce((sum, h) => sum + (h.rating || 0), 0) / myPostedHelpers.length).toFixed(1)
      : null;

  const handleRequestVerification = () => {
    if (myPostedHelpers.length === 0) {
      showToast("Post a help card before requesting verification.");
      return;
    }
    requestVerification(user.id);
    showToast("Verification request submitted!");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">

      {/* ── Cover + Avatar hero ── */}
      <div className="relative">
        {/* Cover photo */}
        <div
          className="h-48 sm:h-56 w-full relative group cursor-pointer"
          style={{
            background: user.coverPhoto
              ? `url(${user.coverPhoto}) center/cover no-repeat`
              : "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #3b82f6 100%)",
          }}
          onClick={() => document.getElementById("cover-upload").click()}
        >
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Camera size={14} strokeWidth={2.25} />
              Change cover photo
            </span>
          </div>
        </div>

        <input
          id="cover-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              updateUser({ coverPhoto: ev.target.result });
              showToast("Cover photo updated!");
            };
            reader.readAsDataURL(file);
            e.target.value = "";
          }}
        />

        {/* Avatar — overlaps cover */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-end justify-between -mt-12">
            <div className="relative flex-shrink-0 group">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-950 shadow-lg"
              />
              <button
                onClick={() => setAvatarModalOpen(true)}
                className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all"
              >
                <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Change
                </span>
              </button>
              <button
                onClick={() => setAvatarModalOpen(true)}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 shadow transition-all hover:scale-110"
                title="Change profile picture"
              >
                <Pencil size={12} strokeWidth={2.25} />
              </button>
            </div>

            {/* Settings shortcut — floats top-right while avatar overlaps */}
            <button
              onClick={() => navigate("/settings")}
              className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
            >
              <Settings size={14} strokeWidth={2.25} />
              Settings
            </button>
          </div>

          {/* Name + email — sits cleanly BELOW the cover, after avatar */}
          <div className="mt-3">
            {editingField === "name" ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  autoFocus
                  className="text-lg font-bold px-2 py-1 rounded-lg border border-blue-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button onClick={() => saveEdit("name")} className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg p-1 transition-all">
                  <Check size={16} strokeWidth={2.5} />
                </button>
                <button onClick={cancelEdit} className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-1 transition-all">
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {user.name}
                </h1>
                {isAccountVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                    <ShieldCheck size={12} strokeWidth={2.5} />
                    Verified
                  </span>
                )}
                <button
                  onClick={() => startEdit("name", user.name)}
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Pencil size={13} strokeWidth={2.25} />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>

      {/* ── Info strip (location + stats) ── */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-4 shadow-sm">
          {/* Top row: location */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <MapPin size={15} strokeWidth={2} className="text-gray-400" />
            {editingField === "location" ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  autoFocus
                  className="text-sm px-2 py-0.5 rounded-lg border border-blue-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 w-32"
                />
                <button onClick={() => saveEdit("location")} className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg p-1 transition-all">
                  <Check size={14} strokeWidth={2.5} />
                </button>
                <button onClick={cancelEdit} className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-1 transition-all">
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <>
                <span>{user.location}</span>
                <button
                  onClick={() => startEdit("location", user.location)}
                  className="text-gray-400 hover:text-blue-500 transition-colors ml-1"
                >
                  <Pencil size={12} strokeWidth={2.25} />
                </button>
              </>
            )}
          </div>

          {/* Bottom row: stats + post button aligned */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-base font-bold text-gray-900 dark:text-white leading-none">{myPostedHelpers.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">Listings</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-gray-900 dark:text-white leading-none">{totalJobs}</p>
                <p className="text-xs text-gray-400 mt-0.5">Jobs done</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-gray-900 dark:text-white leading-none">{totalReviews}</p>
                <p className="text-xs text-gray-400 mt-0.5">Reviews</p>
              </div>
              {avgRating && (
                <div className="text-center">
                  <p className="text-base font-bold text-yellow-500 leading-none">★ {avgRating}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Avg rating</p>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/post")}
              className="text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl transition-all active:scale-95 flex-shrink-0"
            >
              + Post card
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* ── Verification card ── */}
        {!isAccountVerified && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-indigo-500">
                <ShieldCheck size={18} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Account Verification</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Get a trust badge shown on all your listings.
                </p>
                <button
                  onClick={() => setShowCriteria((v) => !v)}
                  className="text-xs text-blue-500 hover:underline mt-1.5 block"
                >
                  {showCriteria ? "Hide" : "View"} requirements
                </button>
                <AnimatePresence>
                  {showCriteria && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1 pl-1"
                    >
                      <li>• Complete profile with a full bio</li>
                      <li>• No unresolved reports against your account</li>
                      <li>• At least 20 completed services</li>
                      <li>• 4.0+ average rating</li>
                      <li>• No prohibited or illegal content in listings</li>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex-shrink-0">
                {isReviewing ? (
                  <span className="text-xs text-indigo-500 flex items-center gap-1.5 font-medium">
                    <Loader2 size={14} className="animate-spin" />
                    Reviewing...
                  </span>
                ) : (
                  <button
                    onClick={handleRequestVerification}
                    className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl transition-all active:scale-95"
                  >
                    Request
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── My Help Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              My Help Cards
              <span className="ml-1.5 text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {myPostedHelpers.length}/5
              </span>
            </h3>
          </div>

          {myPostedHelpers.length === 0 ? (
            <div className="text-center py-10 px-4">
              <ClipboardList size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300 dark:text-gray-700" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No listings yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Post your first help card so people can find you.
              </p>
              <button
                onClick={() => navigate("/post")}
                className="text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-xl transition-all active:scale-95 inline-block"
              >
                Post your first card →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <AnimatePresence>
                {myPostedHelpers.map((h) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all"
                  >
                    <img
                      src={getHelperAvatar(h, user)}
                      alt={h.name}
                      onClick={() => navigate(`/helper/${h.id}`)}
                      className="w-11 h-11 rounded-full object-cover cursor-pointer flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-800"
                    />
                    <div
                      onClick={() => navigate(`/helper/${h.id}`)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                        {h.category}
                        {h.verified && (
                          <span className="text-xs font-semibold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <ShieldCheck size={11} strokeWidth={2.5} />
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{h.bio}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium flex items-center gap-1 ${h.available ? "text-green-500" : "text-gray-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${h.available ? "bg-green-500" : "bg-gray-400"}`} />
                          {h.available ? "Available" : "Unavailable"}
                        </span>
                        {h.rating > 0 && (
                          <span className="text-xs text-yellow-500">★ {h.rating.toFixed(1)}</span>
                        )}
                        {h.jobsDone > 0 && (
                          <span className="text-xs text-gray-400">{h.jobsDone} jobs</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/post?edit=${h.id}`); }}
                        className="text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-xl transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(h); }}
                        className="text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-xl transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* ── My Posts wall ── */}
        {(() => {
          const userPosts = posts.filter((p) => String(p.userId) === String(user.id));
          const isLiked = (post) => hasLiked(post, user?.id);
          const handleLikeClick = (post) => {
            if (!user) {
              navigate("/login");
              return;
            }
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
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  My Posts
                  <span className="ml-1.5 text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {userPosts.length}
                  </span>
                </h3>
                <button
                  onClick={() => navigate("/whatsnew")}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  + New post
                </button>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {userPosts.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <Inbox size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No posts yet</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">
                      Share announcements, questions, or deals with the community.
                    </p>
                    <button
                      onClick={() => navigate("/whatsnew")}
                      className="text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-xl transition-all active:scale-95 inline-block"
                    >
                      Go to What's New →
                    </button>
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
                      className="px-5 py-4"
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

                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{post.content}</p>

                      {post.images && post.images.length > 0 && (
                        <div className={`grid gap-1.5 mt-3 rounded-xl overflow-hidden ${
                          post.images.length === 1 ? "grid-cols-1" :
                          post.images.length === 2 ? "grid-cols-2" : "grid-cols-3"
                        }`}>
                          {post.images.slice(0, 6).map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setLightboxImage(img)}
                              className={`relative ${post.images.length === 1 ? "aspect-video" : "aspect-square"} overflow-hidden`}
                            >
                              <img src={img} alt={`Post image ${idx + 1}`} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          );
        })()}

        {/* ── Settings row ── */}
        <button
          onClick={() => navigate("/settings")}
          className="w-full flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all"
        >
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Settings size={16} strokeWidth={2} />
            Settings
          </span>
          <span className="text-gray-400">→</span>
        </button>

        <div className="pb-6" />
      </div>

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

      {/* ── Avatar picker ── */}
      <AnimatePresence>
        {avatarModalOpen && (
          <AvatarPickerModal
            currentAvatar={user.avatar}
            onSelect={handleAvatarSelect}
            onClose={() => setAvatarModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Delete confirm modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl text-center"
            >
              <Trash2 size={32} strokeWidth={1.75} className="mx-auto mb-3 text-red-400" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                Delete this help card?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                Your "{deleteTarget.category}" listing will be permanently removed. This can't be undone.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="text-sm font-semibold bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
                >
                  Delete
                </button>
              </div>
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
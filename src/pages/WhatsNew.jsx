import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Flame,
  Inbox,
  BarChart3,
  X,
  Send,
  Megaphone,
  HelpCircle,
  Tag,
} from "lucide-react";
import { POST_CATEGORIES, TRENDING_TAGS } from "../data/MockData";
import { usePosts } from "../context/PostsContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import PostComposer from "../components/PostComposer.jsx";
import { useHelpers } from "../context/HelperContext.jsx";

const CATEGORY_ICONS = {
  Announcement: Megaphone,
  Question: HelpCircle,
  Sale: Tag,
};

// ── Skeletons ──────────────────────────────────────────────────────────────────
function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-2.5 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded-full flex-shrink-0" />
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>

      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="h-4 w-10 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-10 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 animate-pulse">
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 animate-pulse">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-2.5 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-2.5 w-6 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WhatsNew() {
  const { posts, toggleLike, addComment, getPostAvatar, hasLiked } = usePosts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { helpers } = useHelpers();
  const [category, setCategory] = useState("All");
  const [activeTag, setActiveTag] = useState(null);
  const [openComments, setOpenComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [lightboxImage, setLightboxImage] = useState(null);

  const normalizeName = (value = "") =>
    value
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .trim()
      .replace(/\s+/g, " ");

  const findMatchedHelper = (commentUser) => {
    const rawName = normalizeName(commentUser);
    if (!rawName) return null;

    const parts = rawName.split(" ").filter(Boolean);
    const first = parts[0] || "";
    const second = parts[1] || "";

    return (
      helpers.find((h) => normalizeName(h.name) === rawName) ||
      helpers.find((h) => {
        const helperParts = normalizeName(h.name).split(" ").filter(Boolean);
        const helperFirst = helperParts[0] || "";
        const helperLast = helperParts[1] || "";

        if (first && second) {
          return helperFirst === first && helperLast.startsWith(second);
        }

        return helperFirst === first;
      }) ||
      null
    );
  };

  const escapeRegExp = (value = "") =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const getCommentMention = (commentText) => {
    if (!commentText) return null;

    const sortedHelpers = [...helpers].sort((a, b) => b.name.length - a.name.length);
    for (const helper of sortedHelpers) {
      const pattern = new RegExp(`\\b${escapeRegExp(helper.name)}\\b`, "i");
      const match = commentText.match(pattern);
      if (match && typeof match.index === "number") {
        const start = match.index;
        const end = start + match[0].length;
        return {
          helper,
          before: commentText.slice(0, start),
          mention: commentText.slice(start, end),
          after: commentText.slice(end),
        };
      }
    }

    return null;
  };

  // Simulated initial fetch delay — shows skeletons before "data" appears
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = posts.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchTag = !activeTag || (p.tags || []).includes(activeTag);
    return matchCat && matchTag;
  });

  const isLiked = (post) => hasLiked(post, user?.id);

  const handleLikeClick = (post) => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleLike(post.id, user.id);
  };

  const handleToggleComments = (id) => {
    setOpenComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCommentChange = (id, val) => {
    setCommentDrafts((prev) => ({ ...prev, [id]: val }));
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            What's New
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Community feed — announcements, questions, and local deals.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          <div className="flex-1 min-w-0">

            <PostComposer />

            <div className="flex gap-2 mb-5 flex-wrap">
              {POST_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setActiveTag(null); }}
                  className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-all ${
                    category === cat && !activeTag
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {activeTag && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Filtering by:
                </span>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  {activeTag}
                </span>
                <button
                  onClick={() => setActiveTag(null)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} strokeWidth={2.5} /> Clear
                </button>
              </div>
            )}

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <PostCardSkeleton key={i} />
                    ))}
                  </motion.div>
                ) : filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 text-gray-400"
                  >
                    <Inbox size={44} strokeWidth={1.5} className="mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                    <p className="font-semibold text-gray-600 dark:text-gray-300">No posts found</p>
                    <p className="text-sm mt-1">Try a different category or tag.</p>
                    <button
                      onClick={() => { setCategory("All"); setActiveTag(null); }}
                      className="mt-4 text-sm text-blue-600 hover:underline"
                    >
                      Clear filters
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="results" className="space-y-4">
                    {filtered.map((post, i) => {
                      const CategoryIcon = CATEGORY_ICONS[post.category];
                      const matchedPostHelper = findMatchedHelper(post.user);
                      return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={getPostAvatar(post, user)}
                              alt={post.user}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-gray-900"
                            />
                            <div>
                              {matchedPostHelper ? (
                                <button
                                  onClick={() =>
                                    navigate(`/helper/${matchedPostHelper.id}`, {
                                      state: { backgroundLocation: location },
                                    })
                                  }
                                  className="font-semibold text-sm text-blue-600 hover:underline dark:text-blue-400 text-left"
                                >
                                  {post.user}
                                </button>
                              ) : (
                                <div className="font-semibold text-sm text-gray-900 dark:text-white">
                                  {post.user}
                                </div>
                              )}
                              <div className="text-xs text-gray-400">
                                {post.date}
                              </div>
                            </div>
                          </div>
                          <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${CATEGORY_COLORS[post.category]}`}>
                            {CategoryIcon && <CategoryIcon size={12} strokeWidth={2.5} />}
                            {post.category}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
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
                          <div className="flex gap-1.5 mt-3 flex-wrap">
                            {post.tags.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => { setActiveTag(tag); setCategory("All"); }}
                                className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <button
                            onClick={() => handleLikeClick(post)}
                            className={`flex items-center gap-1.5 text-sm font-medium transition-all active:scale-90 ${
                              isLiked(post) ? "text-red-500" : "text-gray-400 hover:text-red-400"
                            }`}
                          >
                            <motion.span
                              key={isLiked(post) ? "liked" : "unliked"}
                              initial={{ scale: 0.6 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                              className="flex"
                            >
                              <Heart
                                size={18}
                                strokeWidth={2}
                                fill={isLiked(post) ? "currentColor" : "none"}
                              />
                            </motion.span>
                            {post.likes}
                          </button>

                          <button
                            onClick={() => handleToggleComments(post.id)}
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <MessageCircle size={18} strokeWidth={2} />
                            {post.comments.length}
                          </button>

                          {post.trending && (
                            <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-orange-500">
                              <Flame size={14} strokeWidth={2.25} fill="currentColor" />
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
                                  {post.comments.map((c, idx) => {
                                    const matchedHelper = findMatchedHelper(c.user);
                                    const mentioned = getCommentMention(c.text);

                                    return (
                                      <div
                                        key={idx}
                                        className="flex gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2"
                                      >
                                        {matchedHelper ? (
                                          <button
                                            onClick={() =>
                                              navigate(`/helper/${matchedHelper.id}`, {
                                                state: { backgroundLocation: location },
                                              })
                                            }
                                            className="text-xs font-semibold text-blue-600 hover:underline flex-shrink-0 text-left"
                                          >
                                            {c.user}
                                          </button>
                                        ) : (
                                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
                                            {c.user}
                                          </span>
                                        )}

                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {mentioned ? (
                                            <>
                                              {mentioned.before}
                                              <button
                                                onClick={() =>
                                                  navigate(`/helper/${mentioned.helper.id}`, {
                                                    state: { backgroundLocation: location },
                                                  })
                                                }
                                                className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
                                              >
                                                {mentioned.mention}
                                              </button>
                                              {mentioned.after}
                                            </>
                                          ) : (
                                            c.text
                                          )}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {post.comments.length === 0 && (
                                <p className="text-xs text-gray-400 mb-3 text-center">
                                  No comments yet. Be the first!
                                </p>
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
                                    className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white px-3 py-2 rounded-xl transition-all active:scale-95"
                                  >
                                    <Send size={13} strokeWidth={2.25} />
                                    Post
                                  </button>
                                </div>
                              ) : (
                                <p className="text-xs text-center text-gray-400 py-1">
                                  <button onClick={() => navigate("/login")} className="text-blue-500 hover:underline font-medium">
                                    Log in
                                  </button> to leave a comment.
                                </p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-4 space-y-4">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="sidebar-skeleton" exit={{ opacity: 0 }}>
                    <SidebarSkeleton />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sidebar-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
                      <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white mb-3">
                        <Flame size={15} strokeWidth={2.25} className="text-orange-500" fill="currentColor" />
                        Trending Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {TRENDING_TAGS.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => { setActiveTag(tag === activeTag ? null : tag); setCategory("All"); }}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                              activeTag === tag
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-gray-50 dark:bg-gray-800 text-blue-500 border-gray-200 dark:border-gray-700 hover:border-blue-400"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
                      <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white mb-3">
                        <BarChart3 size={15} strokeWidth={2.25} className="text-blue-500" />
                        Community
                      </h3>
                      <div className="space-y-2">
                        {[
                          { label: "Total Posts", value: posts.length },
                          { label: "Questions", value: posts.filter(p => p.category === "Question").length },
                          { label: "Announcements", value: posts.filter(p => p.category === "Announcement").length },
                          { label: "For Sale", value: posts.filter(p => p.category === "Sale").length },
                        ].map((stat) => (
                          <div key={stat.label} className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 cursor-zoom-out"
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <X size={28} strokeWidth={2} />
            </button>
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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { POST_CATEGORIES, TRENDING_TAGS } from "../data/MockData";
import { usePosts } from "../context/PostsContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import PostComposer from "../components/PostComposer.jsx";

export default function WhatsNew() {
  const { posts, toggleLike, addComment, getPostAvatar } = usePosts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [activeTag, setActiveTag] = useState(null);
  const [openComments, setOpenComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [lightboxImage, setLightboxImage] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());

  const filtered = posts.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchTag = !activeTag || (p.tags || []).includes(activeTag);
    return matchCat && matchTag;
  });

  const isLiked = (id) => likedIds.has(id);

  const handleLikeClick = (id) => {
    const currentlyLiked = isLiked(id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      currentlyLiked ? next.delete(id) : next.add(id);
      return next;
    });
    toggleLike(id, currentlyLiked);
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
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  ✕ Clear
                </button>
              </div>
            )}

            <div className="space-y-4">
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 text-gray-400"
                  >
                    <div className="text-5xl mb-3">📭</div>
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
                  filtered.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={getPostAvatar(post, user)}
                            alt={post.user}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-sm text-gray-900 dark:text-white">
                              {post.user}
                            </div>
                            <div className="text-xs text-gray-400">
                              {post.date}
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${CATEGORY_COLORS[post.category]}`}>
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

                      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => handleLikeClick(post.id)}
                          className={`flex items-center gap-1.5 text-sm font-medium transition-all active:scale-95 ${
                            isLiked(post.id) ? "text-red-500" : "text-gray-400 hover:text-red-400"
                          }`}
                        >
                          {isLiked(post.id) ? "❤️" : "🤍"} {post.likes}
                        </button>

                        <button
                          onClick={() => handleToggleComments(post.id)}
                          className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          💬 {post.comments.length}
                        </button>

                        {post.trending && (
                          <span className="ml-auto text-xs font-semibold text-orange-500 flex items-center gap-1">
                            🔥 Trending
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
                                  <div
                                    key={idx}
                                    className="flex gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2"
                                  >
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
                                      {c.user}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {c.text}
                                    </span>
                                  </div>
                                ))}
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
                                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white px-3 py-2 rounded-xl transition-all active:scale-95"
                                >
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
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-4 space-y-4">

              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  🔥 Trending Tags
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
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  📊 Community
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
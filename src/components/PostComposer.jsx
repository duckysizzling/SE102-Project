import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { usePosts } from "../context/PostsContext.jsx";

const POSTABLE_CATEGORIES = ["Announcement", "Question", "Sale"];
const MAX_IMAGES = 5;
const MAX_TOTAL_MB = 5;

export default function PostComposer({ onPosted }) {
  const { user } = useAuth();
  const { addPost } = usePosts();

  const [modalOpen, setModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Announcement");
  const [images, setImages] = useState([]); // array of { dataUrl, sizeBytes }
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const totalSizeBytes = images.reduce((sum, img) => sum + img.sizeBytes, 0);
  const totalSizeMB = totalSizeBytes / (1024 * 1024);

  const resetForm = () => {
    setContent("");
    setCategory("Announcement");
    setImages([]);
    setError("");
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError("");

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setError(`You can attach up to ${MAX_IMAGES} images.`);
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }

      const projectedTotalMB = totalSizeMB + file.size / (1024 * 1024);
      if (projectedTotalMB > MAX_TOTAL_MB) {
        setError(`Total image size can't exceed ${MAX_TOTAL_MB}MB. Try smaller or fewer photos.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => {
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, { dataUrl: reader.result, sizeBytes: file.size }];
        });
      };
      reader.onerror = () => {
        setError("Couldn't read one of the selected files.");
      };
      reader.readAsDataURL(file);
    });

    e.target.value = ""; // allow re-selecting the same file later
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setError("");
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Write something before posting.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    addPost({
      user: user?.name || "Guest",
      avatar: user?.avatar || "https://i.pravatar.cc/150?img=68",
      category,
      content: content.trim(),
      tags: [],
      images: images.map((img) => img.dataUrl),
    });

    setSubmitting(false);
    closeModal();
    onPosted?.();
  };

  return (
    <>
      {/* Compact trigger bar (Facebook-style) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm mb-5">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || "https://i.pravatar.cc/150?img=68"}
            alt="You"
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 text-left text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            "Share something with the community..."
          </button>
        </div>
        <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => {
              setModalOpen(true);
              setTimeout(() => fileInputRef.current?.click(), 100);
            }}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-1.5 rounded-lg transition-all"
          >
            🖼️ Photo
          </button>
        </div>
      </div>

      {/* Expanded composer modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-white text-center flex-1">
                  Create Post
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 overflow-y-auto flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={user?.avatar || "https://i.pravatar.cc/150?img=68"}
                    alt="You"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.name || "Guest"}
                    </p>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {POSTABLE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "there"}?`}
                  rows={4}
                  autoFocus
                  className="w-full text-sm px-1 py-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none resize-none"
                />

                {/* Image previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden aspect-square group">
                        <img src={img.dataUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-sm transition-all"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Storage indicator */}
                {images.length > 0 && (
                  <p className="text-[10px] text-gray-400 mt-2">
                    {totalSizeMB.toFixed(1)}MB / {MAX_TOTAL_MB}MB used · {images.length}/{MAX_IMAGES} photos
                  </p>
                )}

                {error && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <span>●</span> {error}
                  </p>
                )}

                {/* Add photo button */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelected}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={images.length >= MAX_IMAGES}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-xl transition-all border border-gray-200 dark:border-gray-700"
                  >
                    🖼️ Add Photos {images.length > 0 && `(${images.length}/${MAX_IMAGES})`}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !content.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-95"
                >
                  {submitting ? "Posting..." : "Post"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
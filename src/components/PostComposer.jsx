import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, Megaphone, HelpCircle, Tag, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { usePosts } from "../context/PostsContext.jsx";

const POSTABLE_CATEGORIES = [
  { value: "Announcement", icon: Megaphone, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800" },
  { value: "Question", icon: HelpCircle, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800" },
  { value: "Sale", icon: Tag, color: "text-green-600 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800" },
];

const MAX_IMAGES = 5;
const MAX_TOTAL_MB = 5;

export default function PostComposer({ onPosted }) {
  const { user } = useAuth();
  const { addPost } = usePosts();

  const [modalOpen, setModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Announcement");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm mb-5 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Log in to share announcements, questions, or post something for sale.
        </p>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => window.location.assign("/login")}
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
          >
            Log In
          </button>
          <button
            onClick={() => window.location.assign("/signup")}
            className="text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  const totalSizeBytes = images.reduce((sum, img) => sum + img.sizeBytes, 0);
  const totalSizeMB = totalSizeBytes / (1024 * 1024);
  const activeCategory = POSTABLE_CATEGORIES.find((c) => c.value === category) ?? POSTABLE_CATEGORIES[0];

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

    e.target.value = "";
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
      userId: user?.id || null,
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
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm mb-5">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || "https://i.pravatar.cc/150?img=68"}
            alt="You"
            className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-gray-900"
          />
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 text-left text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-700 hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-900/50 transition-all"
          >
            What's on your mind, {user?.name?.split(" ")[0] || "there"}?
          </button>
        </div>

        <div className="flex items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => {
              setModalOpen(true);
              setTimeout(() => fileInputRef.current?.click(), 100);
            }}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 py-1.5 rounded-lg transition-all"
          >
            <ImageIcon size={18} className="text-green-500" strokeWidth={2} />
            Photo
          </button>
        </div>
      </div>

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
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-white text-center flex-1">
                  Create Post
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-5 py-4 overflow-y-auto flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={user?.avatar || "https://i.pravatar.cc/150?img=68"}
                    alt="You"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.name || "Guest"}
                  </p>
                </div>

                <div className="flex gap-2 mb-4">
                  {POSTABLE_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const active = category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          active
                            ? cat.color
                            : "text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <Icon size={14} strokeWidth={2.25} />
                        {cat.value}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "there"}?`}
                  rows={4}
                  autoFocus
                  className="w-full text-sm px-1 py-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none resize-none"
                />

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden aspect-square group">
                        <img src={img.dataUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all"
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length > 0 && (
                  <p className="text-[10px] text-gray-400 mt-2">
                    {totalSizeMB.toFixed(1)}MB / {MAX_TOTAL_MB}MB used · {images.length}/{MAX_IMAGES} photos
                  </p>
                )}

                {error && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" /> {error}
                  </p>
                )}

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
                    <ImageIcon size={16} className="text-green-500" strokeWidth={2} />
                    Add Photos {images.length > 0 && `(${images.length}/${MAX_IMAGES})`}
                  </button>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !content.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-95"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
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
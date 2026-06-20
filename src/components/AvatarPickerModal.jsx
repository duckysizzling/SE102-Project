import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// A curated set of pravatar.cc preset avatars for the picker grid
const PRESET_AVATARS = Array.from({ length: 24 }, (_, i) => 
  `https://i.pravatar.cc/150?img=${i + 1}`
);

const MAX_FILE_SIZE_MB = 2;

export default function AvatarPickerModal({ currentAvatar, onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState("preset");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      setUploadError(`Image must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreview(reader.result);
      setSelectedPreset(null);
    };
    reader.onerror = () => {
      setUploadError("Couldn't read that file. Try a different image.");
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    const finalAvatar = activeTab === "preset" ? selectedPreset : uploadPreview;
    if (finalAvatar) {
      onSelect(finalAvatar);
    }
  };

  const hasSelection = activeTab === "preset" ? Boolean(selectedPreset) : Boolean(uploadPreview);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Update Profile Picture
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Choose a preset avatar or upload your own photo.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 gap-2">
          <button
            onClick={() => setActiveTab("preset")}
            className={`flex-1 text-sm font-semibold py-2 rounded-xl transition-all ${
              activeTab === "preset"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Choose Avatar
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 text-sm font-semibold py-2 rounded-xl transition-all ${
              activeTab === "upload"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Upload Photo
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[400px] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "preset" ? (
              <motion.div
                key="preset"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-6 gap-2.5"
              >
                {PRESET_AVATARS.map((url) => (
                  <button
                    key={url}
                    onClick={() => setSelectedPreset(url)}
                    className={`relative rounded-full overflow-hidden transition-all ${
                      selectedPreset === url
                        ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
                        : "hover:opacity-80"
                    }`}
                  >
                    <img src={url} alt="Avatar option" className="w-full aspect-square object-cover" />
                    {selectedPreset === url && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all overflow-hidden bg-gray-50 dark:bg-gray-800"
                >
                  {uploadPreview ? (
                    <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl text-gray-400">📷</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
                >
                  {uploadPreview ? "Choose a different photo" : "Click to upload a photo"}
                </button>
                <p className="text-xs text-gray-400 mt-1.5">
                  JPG or PNG, max {MAX_FILE_SIZE_MB}MB
                </p>
                {uploadError && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <span>●</span> {uploadError}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-medium text-gray-500 dark:text-gray-400 px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasSelection}
            className="flex-1 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white px-4 py-2.5 rounded-xl transition-all active:scale-95"
          >
            Save Photo
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
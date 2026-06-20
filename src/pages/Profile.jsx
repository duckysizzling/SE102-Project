import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { useHelpers } from "../context/HelperContext.jsx";
import AvatarPickerModal from "../components/AvatarPickerModal.jsx";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { helpers, deleteHelper } = useHelpers();
  const navigate = useNavigate();

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [toast, setToast] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-3">🔒</div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Please log in to view your profile
        </h2>
        <button
          onClick={() => navigate("/login")}
          className="mt-5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all active:scale-95"
        >
          Go to Login
        </button>
      </div>
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

  const myPostedHelpers = helpers.filter((h) => h.name === user.name);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">
          My Profile
        </h1>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0 group">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
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
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white text-xs shadow-md transition-all"
                title="Change profile picture"
              >
                ✎
              </button>
            </div>
            <div className="flex-1 min-w-0">
              {editingField === "name" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    autoFocus
                    className="text-lg font-bold px-2 py-1 rounded-lg border border-blue-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button onClick={() => saveEdit("name")} className="text-green-500 text-sm font-semibold">✓</button>
                  <button onClick={cancelEdit} className="text-gray-400 text-sm">✕</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                  <button
                    onClick={() => startEdit("name", user.name)}
                    className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-500 transition-all"
                  >
                    ✎ edit
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Location
            </p>
            {editingField === "location" ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  autoFocus
                  className="flex-1 text-sm px-3 py-2 rounded-xl border border-blue-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button onClick={() => saveEdit("location")} className="text-green-500 text-sm font-semibold px-2">✓</button>
                <button onClick={cancelEdit} className="text-gray-400 text-sm px-2">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <span className="text-sm text-gray-700 dark:text-gray-300">📍 {user.location}</span>
                <button
                  onClick={() => startEdit("location", user.location)}
                  className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-500 transition-all"
                >
                  ✎ edit
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Posted help cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm mt-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              My Posted Help Cards ({myPostedHelpers.length})
            </h3>
            {myPostedHelpers.length > 0 && (
              <button
                onClick={() => navigate("/post")}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                + Post new
              </button>
            )}
          </div>

          {myPostedHelpers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You haven't posted any help cards yet.
              </p>
              <button
                onClick={() => navigate("/post")}
                className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
              >
                Post your first help card →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {myPostedHelpers.map((h) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <img
                      src={h.avatar}
                      alt={h.name}
                      onClick={() => navigate(`/helper/${h.id}`)}
                      className="w-10 h-10 rounded-full object-cover cursor-pointer flex-shrink-0"
                    />
                    <div
                      onClick={() => navigate(`/helper/${h.id}`)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{h.category}</p>
                      <p className="text-xs text-gray-400 truncate">{h.bio}</p>
                    </div>
                    <span className={`text-xs font-medium flex-shrink-0 ${h.available ? "text-green-500" : "text-gray-400"}`}>
                      {h.available ? "● Available" : "○ Unavailable"}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/post?edit=${h.id}`);
                        }}
                        className="text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(h);
                        }}
                        className="text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg transition-all"
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

        <button
          onClick={() => navigate("/settings")}
          className="w-full mt-5 flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition-all"
        >
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            ⚙️ Go to Settings
          </span>
          <span className="text-gray-400">→</span>
        </button>
      </div>

      {/* Toast */}
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

      {/* Avatar picker modal */}
      <AnimatePresence>
        {avatarModalOpen && (
          <AvatarPickerModal
            currentAvatar={user.avatar}
            onSelect={handleAvatarSelect}
            onClose={() => setAvatarModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
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
              <div className="text-4xl mb-3">🗑️</div>
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
    </div>
  );
}
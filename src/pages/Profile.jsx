import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { useHelpers } from "../context/HelperContext.jsx";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { helpers } = useHelpers();
  const navigate = useNavigate();

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [toast, setToast] = useState("");

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

  // Helpers posted by this user (matched by name, since there's no real backend FK)
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
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              {/* Name (editable) */}
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

          {/* Location (editable) */}
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
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            My Posted Help Cards ({myPostedHelpers.length})
          </h3>

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
              {myPostedHelpers.map((h) => (
                <div
                  key={h.id}
                  onClick={() => navigate(`/helper/${h.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all"
                >
                  <img src={h.avatar} alt={h.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{h.category}</p>
                    <p className="text-xs text-gray-400 truncate">{h.bio}</p>
                  </div>
                  <span className={`text-xs font-medium ${h.available ? "text-green-500" : "text-gray-400"}`}>
                    {h.available ? "● Available" : "○ Unavailable"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Settings link */}
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
    </div>
  );
}
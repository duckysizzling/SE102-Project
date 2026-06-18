import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const [locationPermission, setLocationPermission] = useState(user?.locationPermission ?? false);
  const [notifications, setNotifications] = useState({
    newMessages: true,
    helperUpdates: true,
    communityPosts: false,
  });
  const [toast, setToast] = useState("");
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-3">🔒</div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Please log in to access settings
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

  const handleToggleLocation = () => {
    const next = !locationPermission;
    if (next && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission(true);
          updateUser({ locationPermission: true });
          showToast("Location permission enabled.");
        },
        () => {
          setLocationPermission(false);
          updateUser({ locationPermission: false });
          showToast("Location permission denied by browser.");
        }
      );
    } else {
      setLocationPermission(false);
      updateUser({ locationPermission: false });
      showToast("Location permission disabled.");
    }
  };

  const handleToggleNotif = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const ToggleRow = ({ label, sub, checked, onChange }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div
        onClick={onChange}
        className={`w-10 h-5 rounded-full transition-all relative cursor-pointer flex-shrink-0 ${
          checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-5" : "left-0.5"}`} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <button
          onClick={() => navigate("/profile")}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-5 flex items-center gap-1.5 transition-colors"
        >
          ← Back to Profile
        </button>

        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">
          Settings
        </h1>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Appearance</h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <ToggleRow
              label="Dark mode"
              sub="Switch between light and dark theme"
              checked={darkMode}
              onChange={() => {
                toggleDarkMode();
                showToast(darkMode ? "Switched to light mode" : "Switched to dark mode");
              }}
            />
          </div>
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm mt-5"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Location</h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <ToggleRow
              label="Location access"
              sub="Allow distance (km) to be shown on helper cards"
              checked={locationPermission}
              onChange={handleToggleLocation}
            />
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm mt-5"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Notifications</h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <ToggleRow
              label="New messages"
              sub="Get notified when a helper responds"
              checked={notifications.newMessages}
              onChange={() => handleToggleNotif("newMessages")}
            />
            <ToggleRow
              label="Helper updates"
              sub="Updates on helpers you've contacted"
              checked={notifications.helperUpdates}
              onChange={() => handleToggleNotif("helperUpdates")}
            />
            <ToggleRow
              label="Community posts"
              sub="New posts in What's New feed"
              checked={notifications.communityPosts}
              onChange={() => handleToggleNotif("communityPosts")}
            />
          </div>
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm mt-5"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Account</h3>
          <button
            onClick={() => setConfirmLogout(true)}
            className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            Log out
          </button>
        </motion.div>
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

      {/* Logout confirm modal */}
      <AnimatePresence>
        {confirmLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
            onClick={() => setConfirmLogout(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl text-center"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                Log out of LocalHelp?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                You'll need to log in again to access your account.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
                >
                  Log out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
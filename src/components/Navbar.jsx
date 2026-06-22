import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLink = (to, label, onClick) => (
    <Link
      to={to}
      onClick={onClick}
      className={`text-sm font-medium transition-colors ${
        location.pathname === to
          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-0.5"
          : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      }`}
    >
      {label}
    </Link>
  );

  const handleConfirmLogout = () => {
    logout();
    setConfirmLogout(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="w-full px-4 md:px-6 flex items-center justify-between py-3.5">
          <Link to="/" className="text-xl font-extrabold text-blue-600">
            LocalHelp
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <div className="hidden lg:flex items-center gap-5">
            {navLink("/find", "Find")}
            {navLink("/whatsnew", "What's New")}
            {navLink("/post", "Post a Service")}
            {navLink("/about", "About")}

            {user ? (
              <>
                {navLink("/profile", "Profile")}
                <button
                  onClick={() => setConfirmLogout(true)}
                  className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl transition-all active:scale-95"
                >
                  Sign up
                </Link>
              </>
            )}

            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 transition-all text-lg"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>

          {/* Mobile: dark mode toggle + hamburger button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 transition-all text-lg"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 transition-all"
              aria-label="Toggle menu"
            >
              <div className="flex flex-col gap-1">
                <motion.span
                  animate={mobileMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                  className="w-4 h-0.5 bg-gray-700 dark:bg-gray-200 block"
                />
                <motion.span
                  animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="w-4 h-0.5 bg-gray-700 dark:bg-gray-200 block"
                />
                <motion.span
                  animate={mobileMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                  className="w-4 h-0.5 bg-gray-700 dark:bg-gray-200 block"
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <div className="flex flex-col px-4 py-4 gap-4">
                {navLink("/find", "Find", closeMobileMenu)}
                {navLink("/whatsnew", "What's New", closeMobileMenu)}
                {navLink("/post", "Post a Service", closeMobileMenu)}
                {navLink("/about", "About", closeMobileMenu)}

                {user ? (
                  <>
                    {navLink("/profile", "Profile", closeMobileMenu)}
                    <button
                      onClick={() => setConfirmLogout(true)}
                      className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={closeMobileMenu}
                      className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all active:scale-95 text-center"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {confirmLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-[100]"
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
                  onClick={handleConfirmLogout}
                  className="text-sm font-semibold bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
                >
                  Log out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
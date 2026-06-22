import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Megaphone, PlusCircle, Info, Sun, Moon, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import LocalHelpLogo from "./LocalHelpLogo.jsx";

const NAV_ITEMS = [
  { to: "/find", label: "Find", icon: Search },
  { to: "/whatsnew", label: "What's New", icon: Megaphone },
  { to: "/post", label: "Post a Service", icon: PlusCircle },
  { to: "/about", label: "About", icon: Info },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop nav link: icon + label, label fades away on narrower
  // viewports (xl breakpoint) so only the icon stays visible —
  // a softer collapse than jumping straight to the hamburger.
  const navLink = (to, label, Icon, onClick) => (
    <Link
      to={to}
      onClick={onClick}
      title={label}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${location.pathname === to
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        }`}
    >
      <Icon size={17} strokeWidth={2} />
      <span className="hidden xl:inline">{label}</span>
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
        <div className="w-full px-4 md:px-6 flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <LocalHelpLogo size={30} />
            <span className="text-xl font-extrabold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              LocalHelp
            </span>
          </Link>

          {/* Desktop nav links — hidden on mobile, icon-only between md and xl */}
          <div className="hidden md:flex items-center gap-4 lg:gap-5">
            {NAV_ITEMS.map((item) => (
              <span key={item.to}>
                {navLink(item.to, item.label, item.icon)}
              </span>
            ))}

            {user ? (
              <>
                <Link
                  to="/profile"
                  title="Profile"
                  className={`flex items-center gap-1.5 ${location.pathname === "/profile" ? "ring-2 ring-blue-500" : "ring-2 ring-transparent hover:ring-blue-300 dark:hover:ring-blue-700"
                    } rounded-full transition-all`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </Link>
                <button
                  onClick={() => setConfirmLogout(true)}
                  title="Logout"
                  className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={17} strokeWidth={2} />
                  <span className="hidden xl:inline">Logout</span>
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
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 transition-all text-gray-600 dark:text-gray-300"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
            </button>
          </div>

          {/* Mobile: avatar/dark mode toggle + hamburger button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <img
                src={user.avatar}
                alt={user.name}
                onClick={() => navigate("/profile")}
                className="w-8 h-8 rounded-full object-cover cursor-pointer"
              />
            )}
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 transition-all text-gray-600 dark:text-gray-300"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
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
              className="md:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <div className="flex flex-col px-4 py-4 gap-4">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-2.5 text-sm font-medium transition-colors ${location.pathname === item.to
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                  >
                    <item.icon size={18} strokeWidth={2} />
                    {item.label}
                  </Link>
                ))}

                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-2.5 text-sm font-medium transition-colors ${location.pathname === "/profile"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        }`}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-[18px] h-[18px] rounded-full object-cover"
                      />
                      Profile
                    </Link>
                    <button
                      onClick={() => setConfirmLogout(true)}
                      className="flex items-center gap-2.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors text-left"
                    >
                      <LogOut size={18} strokeWidth={2} />
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
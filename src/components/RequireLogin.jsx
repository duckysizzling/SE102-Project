import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function RequireLogin({
  title = "Please log in to continue",
  description = "You need an account to access this page.",
  icon = "🔒",
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 max-w-sm shadow-sm"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-3xl text-blue-500 mb-4">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
          {description}
        </p>
        <div className="flex gap-2 mt-6 justify-center">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
          >
            Sign Up
          </button>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-4 transition-colors"
        >
          ← Back to home
        </button>
      </motion.div>
    </div>
  );
}
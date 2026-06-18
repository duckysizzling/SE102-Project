import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-7xl mb-4">🧭</div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          404
        </h1>
        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">
          Page not found
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-95"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/find")}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
          >
            Browse Helpers
          </button>
        </div>
      </motion.div>
    </div>
  );
}
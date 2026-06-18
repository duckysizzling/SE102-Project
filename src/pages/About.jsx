import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const VALUES = [
  { icon: "🤝", title: "Community first", desc: "Built to connect neighbors with the help they need, fast." },
  { icon: "✅", title: "Trust through ratings", desc: "Every helper is rated by real finders, so credibility speaks for itself." },
  { icon: "📍", title: "Local by design", desc: "Find help within your area — no agencies, no middlemen." },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            About LocalHelp
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            LocalHelp is a platform that connects everyday Filipinos with skilled
            local helpers — plumbers, tutors, drivers, electricians, and more —
            all within their own community.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 md:p-8 mb-10"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Why we built this
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Finding a trustworthy plumber, tutor, or driver nearby often means
            asking around, scrolling through outdated Facebook groups, or relying
            on word of mouth. LocalHelp brings that experience online — combining
            the simplicity of a phonebook with the convenience of a map, so you
            can see exactly who's available, how far they are, and what other
            people think of their work.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 text-center">
            What we stand for
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 text-center shadow-sm"
              >
                <div className="text-3xl mb-2">{v.icon}</div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {v.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Whether you need help today or want to offer your skills to others —
            LocalHelp is built for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigate("/find")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-95"
            >
              Find a Helper
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
            >
              Join as a Helper
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
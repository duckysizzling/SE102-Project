import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CATEGORIES = [
  { icon: "🔧", label: "Plumber" },
  { icon: "📚", label: "Tutor" },
  { icon: "🚗", label: "Driver" },
  { icon: "⚡", label: "Electrician" },
  { icon: "🪚", label: "Carpenter" },
  { icon: "🧹", label: "Cleaner" },
  { icon: "🌿", label: "Gardener" },
  { icon: "💻", label: "Coder" },
];

const STEPS = [
  {
    number: "01",
    title: "Search for a helper",
    desc: "Browse by skill, location, or tier. Real people, real skills.",
  },
  {
    number: "02",
    title: "Check their profile",
    desc: "See ratings, reviews, availability, and contact info before you commit.",
  },
  {
    number: "03",
    title: "Get help today",
    desc: "Reach out directly. No middleman, no waiting — just local help.",
  },
];

const TESTIMONIALS = [
  {
    name: "Maria Santos",
    location: "Dasmariñas, Cavite",
    avatar: "https://i.pravatar.cc/150?img=32",
    text: "Found a plumber in under 5 minutes. He fixed our burst pipe the same afternoon. LocalHelp is a lifesaver!",
    rating: 5,
  },
  {
    name: "Ben Cruz",
    location: "Imus, Cavite",
    avatar: "https://i.pravatar.cc/150?img=33",
    text: "My daughter's Math grades went from 75 to 92 after I found her a tutor here. Highly recommend!",
    rating: 5,
  },
  {
    name: "Carla Vega",
    location: "Bacoor, Cavite",
    avatar: "https://i.pravatar.cc/150?img=34",
    text: "I listed myself as a cleaner and got my first client within a week. Great platform for local helpers!",
    rating: 5,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-100 dark:border-gray-800">
        <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
          LocalHelp
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
          >
            Sign up free
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex flex-col items-center text-center px-6 pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
        {/* Signature gradient glow — the one bold moment */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-br from-orange-300 via-pink-200 to-blue-300 dark:from-orange-900/40 dark:via-pink-900/20 dark:to-blue-900/40 rounded-full blur-[100px] opacity-50 pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="relative z-10 inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/30 dark:to-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-blue-100 dark:border-blue-800"
        >
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-blue-500 animate-pulse" />
          50+ verified helpers in Cavite
        </motion.div>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="relative z-10 text-4xl md:text-6xl font-bold leading-tight tracking-tight max-w-3xl"
        >
          Find trusted local help,{" "}
          <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
            right in your area.
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="relative z-10 mt-5 text-lg text-gray-500 dark:text-gray-400 max-w-xl"
        >
          LocalHelp connects you with skilled helpers nearby — plumbers, tutors,
          drivers, and more. No agencies, no hassle.
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="relative z-10 mt-8 flex flex-col sm:flex-row items-center gap-3"
        >
          <button
            onClick={() => navigate("/signup")}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700 text-white font-semibold text-base px-8 py-3 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
          >
            Get Started — it's free
          </button>
          <button
            onClick={() => navigate("/find")}
            className="w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-base px-8 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
          >
            Browse helpers →
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="relative z-10 mt-14 flex flex-wrap justify-center gap-8 text-center"
        >
          {[
            { value: "50+", label: "Verified Helpers" },
            { value: "4.8★", label: "Average Rating" },
            { value: "8", label: "Skill Categories" },
            { value: "Free", label: "To Join" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* CATEGORIES */}
      <section className="px-6 md:px-12 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-center mb-2">
            What do you need help with?
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            Browse by category and find the right person fast.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.label}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                onClick={() => navigate("/find")}
                className="flex flex-col items-center gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:border-transparent hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-none hover:-translate-y-0.5 transition-all active:scale-95 group"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                  {cat.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 md:px-12 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-center mb-2">
            How LocalHelp works
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">
            Three steps to finding the help you need.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative flex flex-col items-start gap-3 p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm"
              >
                <span className="text-4xl font-bold bg-gradient-to-br from-orange-400 to-blue-400 dark:from-orange-600 dark:to-blue-600 bg-clip-text text-transparent select-none opacity-90">
                  {step.number}
                </span>
                <h3 className="text-lg -mt-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 md:px-12 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-center mb-2">
            What people are saying
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            Real experiences from real LocalHelp users.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col gap-4"
              >
                <div className="flex text-yellow-400 text-sm">
                  {"★".repeat(t.rating)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="px-6 md:px-12 py-20">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center bg-gradient-to-br from-orange-500 via-pink-500 to-blue-600 rounded-3xl px-8 py-14 shadow-xl shadow-blue-200 dark:shadow-none"
        >
          <h2 className="text-3xl md:text-4xl text-white mb-4">
            Ready to find your helper?
          </h2>
          <p className="text-blue-50 mb-8 text-base">
            Join LocalHelp today — free to use, free to list your skills.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigate("/signup")}
              className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all active:scale-95"
            >
              Create an account
            </button>
            <button
              onClick={() => navigate("/find")}
              className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-3 rounded-xl transition-all active:scale-95"
            >
              Browse helpers
            </button>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-8 text-sm text-gray-400 border-t border-gray-100 dark:border-gray-800">
        © 2026 LocalHelp — Connecting communities, one helper at a time.
      </footer>
    </div>
  );
}
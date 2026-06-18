import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800">
      <div className="container mx-auto py-6 flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Link
          to="/about"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          About LocalHelp
        </Link>
        <span>
          © {new Date().getFullYear()} LocalHelp — Connect with helpers in your neighborhood
        </span>
      </div>
    </footer>
  );
}
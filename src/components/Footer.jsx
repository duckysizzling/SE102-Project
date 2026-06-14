export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800">
      <div className="container mx-auto py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} LocalHelp — Connect with helpers in your neighborhood
      </div>
    </footer>
  );
}

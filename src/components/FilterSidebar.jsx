export default function FilterSidebar({ children }) {
  return (
    <aside className="w-64 hidden lg:block">
      <div className="space-y-4">{children}</div>
    </aside>
  );
}

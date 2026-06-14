export default function SearchBar({ value = '', onChange }) {
  return (
    <div className="w-full">
      <input
        value={value}
        onChange={onChange}
        placeholder="Search helpers, categories, or tags"
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

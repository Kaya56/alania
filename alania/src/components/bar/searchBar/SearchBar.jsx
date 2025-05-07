// components/searchBar/SearchBar.jsx
function SearchBar({ onSearch, value, placeholder }) {
  return (
    <input
      type="text"
      placeholder={placeholder || "Rechercher..."}
      value={value}
      onChange={(e) => onSearch(e.target.value)}
      className="w-full p-2 mt-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
    />
  );
}

export default SearchBar;
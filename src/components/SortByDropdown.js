import { useState } from "react";

const SortByDropdown = ({
  options = [],
  onChange,
  label = "Sort By",
  defaultValue = undefined, // e.g. "Relevant"
}) => {
  const initial = defaultValue ?? (options.length ? options[0] : "");
  const [selected, setSelected] = useState(initial);

  const handleChange = (e) => {
    const value = e.target.value;
    setSelected(value);
    onChange?.(label, value);
  };

  return (
    <form
      className="sort-by flex items-center space-x-2 p-2 rounded-xl shadow-lg bg-gradient-to-b from-yellow-50 to-yellow-100 border border-yellow-300"
      onSubmit={(e) => e.preventDefault()}
    >
      <label htmlFor="sort" className="font-semibold text-gray-700">
        {label}:
      </label>
      <select
        id="sort"
        value={selected}
        onChange={handleChange}
        className="
          bg-wood-pattern text-gray-900 font-medium px-4 py-2 rounded-lg border border-brown-400
          focus:outline-none focus:ring-2 focus:ring-blue-300 hover:bg-wood-hover transition-all duration-300
        "
      >
        {options.map((option, idx) => (
          <option key={idx} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-white text-lg animate-snowfall">❄️</span>
    </form>
  );
};

export default SortByDropdown;

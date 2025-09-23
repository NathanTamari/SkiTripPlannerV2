import { useState, useEffect } from "react";


const SortByDropdown = ({
  options = [],
  value,
  direction = "asc",
  onChange,
  label = "Sort By",
  tone = "default",
}) => {
  const initial = value ?? (options.length ? options[0] : "");
  const [selected, setSelected] = useState(initial);
  const [dir, setDir] = useState(direction);

  // keep internal state in sync when parent changes
  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);
  useEffect(() => {
    if (direction) setDir(direction);
  }, [direction]);

  const fire = (key, d) => {
    onChange?.(label, { key, direction: d });
  };

  const handleChange = (e) => {
    const key = e.target.value;
    setSelected(key);
    fire(key, dir);
  };

  const toggleDir = () => {
    const next = dir === "asc" ? "desc" : "asc";
    setDir(next);
    fire(selected, next);
  };

  // visual styles: inherit type scale and color from parent; subtle borders
  const shared = {
    font: "inherit",
    color: "inherit",
    background: tone === "onDark" ? "rgba(255,255,255,0.08)" : "transparent",
    border: "1px solid rgba(255,255,255,0.6)",
    borderRadius: 10,
    padding: "6px 12px",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    lineHeight: 1.15,
  };

  const buttonStyle = {
    ...shared,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    userSelect: "none",
  };

  return (
    <div
      className="sort-by-inline"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <select
        id="sort-key"
        value={selected}
        onChange={handleChange}
        style={shared}
        aria-label="Sort key"
      >
        {options.map((option, idx) => (
          <option
            key={idx}
            value={option}
            // Make option text dark on light dropdown list for readability,
            // but keep the control itself inheriting color.
            style={{ color: "#111" }}
          >
            {option}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={toggleDir}
        aria-label={dir === "asc" ? "Sort ascending" : "Sort descending"}
        title={dir === "asc" ? "Ascending" : "Descending"}
        style={buttonStyle}
      >
        {dir === "asc" ? "▲" : "▼"}
      </button>
    </div>
  );
};

export default SortByDropdown;

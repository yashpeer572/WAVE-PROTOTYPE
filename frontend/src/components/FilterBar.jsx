export default function FilterBar({ filters, values, onChange, onClear }) {
  return (
    <div className="filter-bar">
      {filters.map((f) => (
        <div key={f.key} className="filter-bar__item">
          <label className="filter-bar__label">{f.label}</label>
          <select
            className="filter-bar__select"
            value={values[f.key] || ''}
            onChange={(e) => onChange(f.key, e.target.value)}
          >
            <option value="">All</option>
            {f.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
      <button className="filter-bar__clear" onClick={onClear}>Clear Filters</button>
    </div>
  );
}

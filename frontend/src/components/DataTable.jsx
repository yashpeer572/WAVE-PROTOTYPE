import { useState, useMemo } from 'react';

export default function DataTable({
  columns, data, onRowClick, emptyMessage = 'No data found.', showRecordCount = true,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 15;

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.accessor ? col.accessor(row) : row[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const col = columns.find((c) => c.key === sortKey);
      const aVal = col?.accessor ? col.accessor(a) : a[sortKey];
      const bVal = col?.accessor ? col.accessor(b) : b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const paged = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="datatable-wrapper">
      <div className="datatable__toolbar">
        <input
          type="text"
          className="datatable__search"
          placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
        {showRecordCount && (
          <span className="datatable__count">{sorted.length} record{sorted.length !== 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="datatable__scroll">
        <table className="datatable">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[col.sortable !== false ? 'datatable__sortable' : '', col.headerClassName || ''].filter(Boolean).join(' ')}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  {col.label}
                  {sortKey === col.key && <span className="datatable__sort-icon">{sortDir === 'asc' ? ' \u25B2' : ' \u25BC'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length} className="datatable__empty">{emptyMessage}</td></tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={row.id || i}
                  className={onRowClick ? 'datatable__clickable' : ''}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={col.cellClassName || ''}>
                      {col.render ? col.render(row) : (col.accessor ? col.accessor(row) : row[col.key]) ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="datatable__pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

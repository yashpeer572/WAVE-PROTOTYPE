export function RagBadge({ value }) {
  if (!value) return <span className="badge badge--none">-</span>;
  const cls = value.toLowerCase();
  return <span className={`badge badge--rag-${cls}`}>{value}</span>;
}

export function StatusBadge({ value }) {
  if (!value) return null;
  const cls = value.toLowerCase().replace(/\s+/g, '-');
  return <span className={`badge badge--status-${cls}`}>{value}</span>;
}

export function PriorityBadge({ value }) {
  if (!value) return null;
  const cls = value.toLowerCase();
  return <span className={`badge badge--priority-${cls}`}>{value}</span>;
}

export function RiskBadge({ value }) {
  if (!value) return null;
  const cls = value.toLowerCase();
  return <span className={`badge badge--risk-${cls}`}>{value}</span>;
}

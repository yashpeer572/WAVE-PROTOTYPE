/** Filled circle for RAG health (Green / Amber / Red) in tables. */
export function RagHealthDot({ value }) {
  const v = value ? String(value).trim().toLowerCase() : '';
  const tone = v === 'green' || v === 'amber' || v === 'red' ? v : 'none';
  const label = value ? `RAG health: ${value}` : 'RAG health: not set';
  return (
    <span
      className={`rag-health-dot rag-health-dot--${tone}`}
      title={label}
      aria-label={label}
      role="img"
    />
  );
}

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

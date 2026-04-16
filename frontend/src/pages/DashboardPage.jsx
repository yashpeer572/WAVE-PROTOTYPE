import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { dashboard as dashboardApi } from '../services/api';
import { StatusBadge, RiskBadge } from '../components/Badge';

const RAG_COLORS = { Green: '#22c55e', Amber: '#f59e0b', Red: '#ef4444' };
const STATUS_COLORS = { 'Not Started': '#94a3b8', 'In Progress': '#3b82f6', Completed: '#22c55e', Blocked: '#ef4444' };

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;
  if (!data) return <div className="page-error">Failed to load dashboard</div>;

  const ragData = [
    { name: 'Green', value: data.rag.green },
    { name: 'Amber', value: data.rag.amber },
    { name: 'Red', value: data.rag.red },
  ].filter((d) => d.value > 0);

  const statusData = Object.entries(data.status_breakdown)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  const ktData = [
    { name: 'Planned', value: data.kt_progress.planned },
    { name: 'In Progress', value: data.kt_progress.in_progress },
    { name: 'Completed', value: data.kt_progress.completed },
  ].filter((d) => d.value > 0);

  return (
    <div className="dashboard">
      <h2 className="page-title">SteerCo Dashboard</h2>

      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-card__value">{data.total_initiatives}</div><div className="kpi-card__label">Total Initiatives</div></div>
        <div className="kpi-card kpi-card--green"><div className="kpi-card__value">{data.rag.green}</div><div className="kpi-card__label">Green</div></div>
        <div className="kpi-card kpi-card--amber"><div className="kpi-card__value">{data.rag.amber}</div><div className="kpi-card__label">Amber</div></div>
        <div className="kpi-card kpi-card--red"><div className="kpi-card__value">{data.rag.red}</div><div className="kpi-card__label">Red</div></div>
        <div className="kpi-card"><div className="kpi-card__value">{data.completed}</div><div className="kpi-card__label">Completed</div></div>
        <div className="kpi-card"><div className="kpi-card__value">{data.actions.open}</div><div className="kpi-card__label">Open Actions</div></div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>RAG Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ragData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label>
                {ragData.map((entry) => <Cell key={entry.name} fill={RAG_COLORS[entry.name]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label>
                {statusData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>KT Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ktData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label>
                {ktData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6366f1'} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section-grid">
        <div className="section-card">
          <h3>RAG by Workstream</h3>
          <table className="mini-table">
            <thead><tr><th>Workstream</th><th>Green</th><th>Amber</th><th>Red</th><th>Total</th></tr></thead>
            <tbody>
              {data.rag_by_workstream.map((ws) => (
                <tr key={ws.workstream}>
                  <td>{ws.workstream}</td>
                  <td>{ws.green}</td>
                  <td>{ws.amber}</td>
                  <td>{ws.red}</td>
                  <td>{ws.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.high_risk_dependencies.length > 0 && (
          <div className="section-card section-card--alert">
            <h3>High Risk Dependencies</h3>
            {data.high_risk_dependencies.map((dep) => (
              <div key={dep.id} className="alert-item">
                <strong>{dep.dependency_id}</strong>: {dep.description}
                <div className="alert-item__meta">
                  <RiskBadge value={dep.risk} /> <StatusBadge value={dep.status} />
                  <span>{dep.workstreams?.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.actions.overdue.length > 0 && (
          <div className="section-card section-card--alert">
            <h3>Overdue Actions</h3>
            <table className="mini-table">
              <thead><tr><th>ID</th><th>Description</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {data.actions.overdue.map((a) => (
                  <tr key={a.id} className="row--overdue">
                    <td>{a.action_id}</td>
                    <td>{a.description}</td>
                    <td>{a.due_date}</td>
                    <td><StatusBadge value={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

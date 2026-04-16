import { useState, useEffect, useCallback } from 'react';
import { dependencies as api, workstreams as wsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import { RiskBadge, StatusBadge } from '../components/Badge';
import toast from 'react-hot-toast';

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export default function DependenciesPage() {
  const { canEdit, canDelete } = useAuth();
  const [items, setItems] = useState([]);
  const [workstreams, setWorkstreams] = useState([]);
  const [filters, setFilters] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([api.list(filters), wsApi.list()])
      .then(([res, wsRes]) => { setItems(res.data); setWorkstreams(wsRes.data); })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (formData) => {
    try {
      if (editItem) {
        await api.update(editItem.id, formData);
        toast.success('Dependency updated');
      } else {
        await api.create(formData);
        toast.success('Dependency created');
      }
      setModalOpen(false); setEditItem(null); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this dependency?')) return;
    try { await api.delete(item.id); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  const columns = [
    { key: 'dependency_id', label: 'ID' },
    { key: 'workstreams', label: 'Workstreams', render: (r) => r.workstreams?.map((w) => w.name).join(', ') || '-' },
    { key: 'description', label: 'Description' },
    { key: 'type', label: 'Type' },
    { key: 'dependent_on', label: 'Dependent On' },
    { key: 'target_date', label: 'Target Date', render: (r) => r.target_date?.slice(0, 10) || '-' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
    { key: 'risk', label: 'Risk', render: (r) => <RiskBadge value={r.risk} /> },
    ...(canEdit() ? [{
      key: 'actions',
      label: 'Actions',
      sortable: false,
      headerClassName: 'datatable__actions-col',
      cellClassName: 'datatable__actions-cell',
      render: (r) => (
        <div className="action-buttons">
          <button
            type="button"
            className="btn btn--sm btn--secondary btn--icon"
            aria-label="Edit dependency"
            onClick={() => { setEditItem(r); setModalOpen(true); }}
          >
            <IconEdit />
          </button>
          {canDelete() && (
            <button
              type="button"
              className="btn btn--sm btn--danger btn--icon"
              aria-label="Delete dependency"
              onClick={() => handleDelete(r)}
            >
              <IconTrash />
            </button>
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Dependency Tracker</h2>
        {canEdit() && <button className="btn btn--primary" onClick={() => { setEditItem(null); setModalOpen(true); }}>+ Add Dependency</button>}
      </div>
      <FilterBar
        filters={[
          { key: 'risk', label: 'Risk', options: ['Low', 'Medium', 'High'] },
          { key: 'status', label: 'Status', options: ['Open', 'In Progress', 'Resolved', 'Blocked'] },
        ]}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v || undefined }))}
        onClear={() => setFilters({})}
      />
      {loading ? <div className="page-loading">Loading...</div> : <DataTable columns={columns} data={items} />}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} title={editItem ? 'Edit Dependency' : 'Add Dependency'}>
        <DependencyForm item={editItem} workstreams={workstreams} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditItem(null); }} />
      </Modal>
    </div>
  );
}

function DependencyForm({ item, workstreams, onSave, onCancel }) {
  const [form, setForm] = useState({
    dependency_id: item?.dependency_id || '',
    description: item?.description || '',
    type: item?.type || 'Technical',
    dependent_on: item?.dependent_on || '',
    target_date: item?.target_date?.slice(0, 10) || '',
    status: item?.status || 'Open',
    risk: item?.risk || 'Medium',
    mitigation: item?.mitigation || '',
    escalation: item?.escalation || '',
    workstream_ids: item?.workstreams?.map((w) => w.id) || [],
  });

  useEffect(() => {
    if (!item && !form.dependency_id) {
      api.nextId().then((res) => setForm((p) => ({ ...p, dependency_id: res.data.next_id })));
    }
  }, [item]);

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="modal-form">
      <div className="form-row">
        <div className="form-group"><label>Dependency ID</label><input value={form.dependency_id} onChange={(e) => handleChange('dependency_id', e.target.value)} required readOnly={!!item} /></div>
        <div className="form-group">
          <label>Type</label>
          <select value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
            {['Technical', 'Access', 'Resource', 'Process'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={2} /></div>
      <div className="form-row">
        <div className="form-group"><label>Dependent On</label><input value={form.dependent_on} onChange={(e) => handleChange('dependent_on', e.target.value)} /></div>
        <div className="form-group"><label>Target Date</label><input type="date" value={form.target_date} onChange={(e) => handleChange('target_date', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
            {['Open', 'In Progress', 'Resolved', 'Blocked'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Risk</label>
          <select value={form.risk} onChange={(e) => handleChange('risk', e.target.value)}>
            {['Low', 'Medium', 'High'].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group"><label>Mitigation</label><textarea value={form.mitigation} onChange={(e) => handleChange('mitigation', e.target.value)} rows={2} /></div>
      <div className="form-group"><label>Escalation</label><textarea value={form.escalation} onChange={(e) => handleChange('escalation', e.target.value)} rows={2} /></div>
      <div className="modal-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary">Save</button>
      </div>
    </form>
  );
}

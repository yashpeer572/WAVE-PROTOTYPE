import { useState, useEffect, useCallback } from 'react';
import { actions as api, workstreams as wsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
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

export default function ActionsPage() {
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

  const isOverdue = (item) => item.status !== 'Closed' && item.due_date && new Date(item.due_date) < new Date();

  const handleSave = async (formData) => {
    try {
      if (editItem) {
        await api.update(editItem.id, formData);
        toast.success('Action updated');
      } else {
        await api.create(formData);
        toast.success('Action created');
      }
      setModalOpen(false); setEditItem(null); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this action?')) return;
    try { await api.delete(item.id); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  const columns = [
    { key: 'action_id', label: 'ID' },
    { key: 'description', label: 'Description' },
    { key: 'source', label: 'Source' },
    { key: 'workstream', label: 'Workstream', accessor: (r) => r.workstream?.name },
    {
      key: 'priority',
      label: 'Priority',
      render: (r) => (
        <span className="action-tracker__plain-value">{r.priority || '—'}</span>
      ),
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (r) => (
        <span className={isOverdue(r) ? 'text-overdue' : ''}>
          {r.due_date?.slice(0, 10) || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className="action-tracker__plain-value">{r.status || '—'}</span>
      ),
    },
    ...(canEdit() ? [{
      key: 'actions', label: 'Actions', sortable: false,
      headerClassName: 'datatable__actions-col',
      cellClassName: 'datatable__actions-cell',
      render: (r) => (
        <div className="action-buttons">
          <button type="button" className="btn btn--sm btn--secondary btn--icon" aria-label="Edit action" onClick={() => { setEditItem(r); setModalOpen(true); }}>
            <IconEdit />
          </button>
          {canDelete() && (
            <button type="button" className="btn btn--sm btn--danger btn--icon" aria-label="Delete action" onClick={() => handleDelete(r)}>
              <IconTrash />
            </button>
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="page page--action-tracker">
      <div className="page-header">
        <h2 className="page-title">Action Tracker</h2>
        {canEdit() && <button className="btn btn--primary" onClick={() => { setEditItem(null); setModalOpen(true); }}>+ Add Action</button>}
      </div>
      <FilterBar
        filters={[
          { key: 'priority', label: 'Priority', options: ['Low', 'Medium', 'High'] },
          { key: 'status', label: 'Status', options: ['Open', 'In Progress', 'Closed'] },
        ]}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v || undefined }))}
        onClear={() => setFilters({})}
      />
      {loading ? <div className="page-loading">Loading...</div> : <DataTable columns={columns} data={items} showRecordCount={false} />}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} title={editItem ? 'Edit Action' : 'Add Action'}>
        <ActionForm item={editItem} workstreams={workstreams} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditItem(null); }} />
      </Modal>
    </div>
  );
}

function ActionForm({ item, workstreams, onSave, onCancel }) {
  const [form, setForm] = useState({
    action_id: item?.action_id || '',
    description: item?.description || '',
    source: item?.source || '',
    priority: item?.priority || 'Medium',
    due_date: item?.due_date?.slice(0, 10) || '',
    status: item?.status || 'Open',
    closure_criteria: item?.closure_criteria || '',
    notes: item?.notes || '',
    workstream_id: item?.workstream_id || '',
  });

  useEffect(() => {
    if (!item && !form.action_id) {
      api.nextId().then((res) => setForm((p) => ({ ...p, action_id: res.data.next_id })));
    }
  }, [item]);

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="modal-form">
      <div className="form-row">
        <div className="form-group"><label>Action ID</label><input value={form.action_id} onChange={(e) => handleChange('action_id', e.target.value)} required readOnly={!!item} /></div>
        <div className="form-group">
          <label>Priority</label>
          <select value={form.priority} onChange={(e) => handleChange('priority', e.target.value)}>
            {['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={2} required /></div>
      <div className="form-row">
        <div className="form-group"><label>Source</label><input value={form.source} onChange={(e) => handleChange('source', e.target.value)} /></div>
        <div className="form-group">
          <label>Workstream</label>
          <select value={form.workstream_id} onChange={(e) => handleChange('workstream_id', e.target.value)}>
            <option value="">None</option>
            {workstreams.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Due Date</label><input type="date" value={form.due_date} onChange={(e) => handleChange('due_date', e.target.value)} required /></div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
            {['Open', 'In Progress', 'Closed'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group"><label>Closure Criteria</label><textarea value={form.closure_criteria} onChange={(e) => handleChange('closure_criteria', e.target.value)} rows={2} /></div>
      <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={2} /></div>
      <div className="modal-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary">Save</button>
      </div>
    </form>
  );
}

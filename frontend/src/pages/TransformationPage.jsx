import { useState, useEffect, useCallback } from 'react';
import { transformationItems as api, initiatives as initApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import { StatusBadge, RagBadge } from '../components/Badge';
import toast from 'react-hot-toast';

export default function TransformationPage() {
  const { canEdit, canDelete } = useAuth();
  const [items, setItems] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [filters, setFilters] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([api.list(filters), initApi.list()])
      .then(([res, initRes]) => { setItems(res.data); setInitiatives(initRes.data); })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (formData) => {
    try {
      if (editItem) {
        await api.update(editItem.id, formData);
        toast.success('Item updated');
      } else {
        await api.create(formData);
        toast.success('Item created');
      }
      setModalOpen(false); setEditItem(null); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this transformation item?')) return;
    try { await api.delete(item.id); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  const columns = [
    { key: 'initiative', label: 'Initiative', accessor: (r) => r.initiative?.name },
    { key: 'objective', label: 'Objective' },
    { key: 'owner_org', label: 'Owner Org' },
    { key: 'five_flow_contact', label: '5Flow Contact' },
    { key: 'peer_contact', label: 'Peer Contact' },
    { key: 'start_date', label: 'Start Date', render: (r) => r.start_date?.slice(0, 10) || '-' },
    { key: 'end_date', label: 'End Date', render: (r) => r.end_date?.slice(0, 10) || '-' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
    { key: 'rag', label: 'RAG', render: (r) => <RagBadge value={r.rag} /> },
    { key: 'percent_complete', label: '% Complete', render: (r) => `${r.percent_complete ?? 0}%` },
    ...(canEdit() ? [{
      key: 'actions', label: 'Actions', sortable: false,
      render: (r) => (
        <div className="action-buttons">
          <button className="btn btn--sm btn--secondary" onClick={() => { setEditItem(r); setModalOpen(true); }}>Edit</button>
          {canDelete() && <button className="btn btn--sm btn--danger" onClick={() => handleDelete(r)}>Del</button>}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Transformation Plan</h2>
        {canEdit() && <button className="btn btn--primary" onClick={() => { setEditItem(null); setModalOpen(true); }}>+ Add Item</button>}
      </div>
      <FilterBar
        filters={[
          { key: 'status', label: 'Status', options: ['Not Started', 'In Progress', 'Completed', 'Blocked'] },
          { key: 'rag', label: 'RAG', options: ['Green', 'Amber', 'Red'] },
          { key: 'owner_org', label: 'Owner Org', options: ['5Flow', 'Peer'] },
        ]}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v || undefined }))}
        onClear={() => setFilters({})}
      />
      {loading ? <div className="page-loading">Loading...</div> : <DataTable columns={columns} data={items} />}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} title={editItem ? 'Edit Transformation Item' : 'Add Transformation Item'} size="lg">
        <TransformationForm item={editItem} initiatives={initiatives} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditItem(null); }} />
      </Modal>
    </div>
  );
}

function TransformationForm({ item, initiatives, onSave, onCancel }) {
  const [form, setForm] = useState({
    initiative_id: item?.initiative_id || '',
    objective: item?.objective || '',
    owner_org: item?.owner_org || 'Peer',
    five_flow_contact: item?.five_flow_contact || '',
    peer_contact: item?.peer_contact || '',
    start_date: item?.start_date?.slice(0, 10) || '',
    end_date: item?.end_date?.slice(0, 10) || '',
    status: item?.status || 'Not Started',
    rag: item?.rag || '',
    success_metrics: item?.success_metrics || '',
    risks: item?.risks || '',
    percent_complete: item?.percent_complete ?? 0,
  });

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="modal-form">
      <div className="form-row">
        <div className="form-group">
          <label>Initiative</label>
          <select value={form.initiative_id} onChange={(e) => handleChange('initiative_id', e.target.value)} required>
            <option value="">Select Initiative</option>
            {initiatives.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Owner Org</label>
          <select value={form.owner_org} onChange={(e) => handleChange('owner_org', e.target.value)}>
            {['5Flow', 'Peer'].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group"><label>Objective</label><textarea value={form.objective} onChange={(e) => handleChange('objective', e.target.value)} rows={2} /></div>
      <div className="form-row">
        <div className="form-group"><label>5Flow Contact</label><input value={form.five_flow_contact} onChange={(e) => handleChange('five_flow_contact', e.target.value)} /></div>
        <div className="form-group"><label>Peer Contact</label><input value={form.peer_contact} onChange={(e) => handleChange('peer_contact', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Start Date</label><input type="date" value={form.start_date} onChange={(e) => handleChange('start_date', e.target.value)} /></div>
        <div className="form-group"><label>End Date</label><input type="date" value={form.end_date} onChange={(e) => handleChange('end_date', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
            {['Not Started', 'In Progress', 'Completed', 'Blocked'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>RAG</label>
          <select value={form.rag} onChange={(e) => handleChange('rag', e.target.value)}>
            <option value="">None</option>
            {['Green', 'Amber', 'Red'].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>% Complete</label>
        <input type="number" min="0" max="100" value={form.percent_complete} onChange={(e) => handleChange('percent_complete', parseInt(e.target.value, 10) || 0)} />
      </div>
      <div className="form-group"><label>Success Metrics</label><textarea value={form.success_metrics} onChange={(e) => handleChange('success_metrics', e.target.value)} rows={2} /></div>
      <div className="form-group"><label>Risks</label><textarea value={form.risks} onChange={(e) => handleChange('risks', e.target.value)} rows={2} /></div>
      <div className="modal-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary">Save</button>
      </div>
    </form>
  );
}

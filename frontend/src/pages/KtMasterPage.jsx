import { useState, useEffect, useCallback } from 'react';
import { ktSessions as api, workstreams as wsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import { StatusBadge } from '../components/Badge';
import toast from 'react-hot-toast';

export default function KtMasterPage() {
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
        toast.success('KT session updated');
      } else {
        await api.create(formData);
        toast.success('KT session created');
      }
      setModalOpen(false); setEditItem(null); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this KT session?')) return;
    try { await api.delete(item.id); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  const columns = [
    { key: 'workstream', label: 'Workstream', accessor: (r) => r.workstream?.name },
    { key: 'product_platform', label: 'Product / Platform' },
    { key: 'kt_scope', label: 'KT Scope' },
    { key: 'sme', label: 'SME' },
    { key: 'receiving_team', label: 'Receiving Team' },
    { key: 'start_date', label: 'Start', render: (r) => r.start_date?.slice(0, 10) || '-' },
    { key: 'end_date', label: 'End', render: (r) => r.end_date?.slice(0, 10) || '-' },
    { key: 'current_stage', label: 'Stage', render: (r) => <StatusBadge value={r.current_stage} /> },
    { key: 'overall_status', label: 'Status' },
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

  const wsNames = [...new Set(items.map((i) => i.workstream?.name).filter(Boolean))];

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">KT Master</h2>
        {canEdit() && <button className="btn btn--primary" onClick={() => { setEditItem(null); setModalOpen(true); }}>+ Add KT Session</button>}
      </div>
      <FilterBar
        filters={[
          { key: 'workstream_id', label: 'Workstream', options: workstreams.map((w) => w.name) },
          { key: 'current_stage', label: 'Stage', options: ['Planned', 'In Progress', 'Completed'] },
        ]}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v || undefined }))}
        onClear={() => setFilters({})}
      />
      {loading ? <div className="page-loading">Loading...</div> : <DataTable columns={columns} data={items} />}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} title={editItem ? 'Edit KT Session' : 'Add KT Session'}>
        <KtForm item={editItem} workstreams={workstreams} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditItem(null); }} />
      </Modal>
    </div>
  );
}

function KtForm({ item, workstreams, onSave, onCancel }) {
  const [form, setForm] = useState({
    workstream_id: item?.workstream_id || '',
    product_platform: item?.product_platform || '',
    kt_scope: item?.kt_scope || '',
    sme: item?.sme || '',
    receiving_team: item?.receiving_team || '',
    start_date: item?.start_date?.slice(0, 10) || '',
    end_date: item?.end_date?.slice(0, 10) || '',
    current_stage: item?.current_stage || 'Planned',
    overall_status: item?.overall_status || 'Not Started',
  });

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="modal-form">
      <div className="form-row">
        <div className="form-group">
          <label>Workstream</label>
          <select value={form.workstream_id} onChange={(e) => handleChange('workstream_id', e.target.value)} required>
            <option value="">Select...</option>
            {workstreams.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Product / Platform</label><input value={form.product_platform} onChange={(e) => handleChange('product_platform', e.target.value)} /></div>
      </div>
      <div className="form-group"><label>KT Scope</label><textarea value={form.kt_scope} onChange={(e) => handleChange('kt_scope', e.target.value)} rows={2} /></div>
      <div className="form-row">
        <div className="form-group"><label>SME</label><input value={form.sme} onChange={(e) => handleChange('sme', e.target.value)} /></div>
        <div className="form-group"><label>Receiving Team</label><input value={form.receiving_team} onChange={(e) => handleChange('receiving_team', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Start Date</label><input type="date" value={form.start_date} onChange={(e) => handleChange('start_date', e.target.value)} /></div>
        <div className="form-group"><label>End Date</label><input type="date" value={form.end_date} onChange={(e) => handleChange('end_date', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Stage</label>
          <select value={form.current_stage} onChange={(e) => handleChange('current_stage', e.target.value)}>
            {['Planned', 'In Progress', 'Completed'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Overall Status</label><input value={form.overall_status} onChange={(e) => handleChange('overall_status', e.target.value)} /></div>
      </div>
      <div className="modal-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary">Save</button>
      </div>
    </form>
  );
}

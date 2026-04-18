import { useState, useEffect, useCallback } from 'react';
import {
  dependencies as api,
  workstreams as wsApi,
  initiatives as initApi,
  transformationItems as taskApi
} from '../services/api';
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

export default function DependenciesPage() {
  const { canEdit, canDelete } = useAuth();
  const [items, setItems] = useState([]);
  const [workstreams, setWorkstreams] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    let dependenciesLoaded = false;
    try {
      const depRes = await api.list(filters);
      const rows = depRes.data;
      setItems(Array.isArray(rows) ? rows : []);
      dependenciesLoaded = true;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load dependencies');
      setItems([]);
    }

    const lookups = await Promise.allSettled([
      wsApi.list(),
      initApi.list(),
      taskApi.list(),
    ]);
    const [wsR, initR, taskR] = lookups;
    if (wsR.status === 'fulfilled' && Array.isArray(wsR.value.data)) {
      setWorkstreams(wsR.value.data);
    } else {
      setWorkstreams([]);
      if (wsR.status === 'rejected') console.error(wsR.reason);
    }
    if (initR.status === 'fulfilled' && Array.isArray(initR.value.data)) {
      setInitiatives(initR.value.data);
    } else {
      setInitiatives([]);
      if (initR.status === 'rejected') console.error(initR.reason);
    }
    if (taskR.status === 'fulfilled' && Array.isArray(taskR.value.data)) {
      setTasks(taskR.value.data);
    } else {
      setTasks([]);
      if (taskR.status === 'rejected') console.error(taskR.reason);
    }
    if (dependenciesLoaded && lookups.some((r) => r.status === 'rejected')) {
      toast.error('Workstreams, initiatives, or milestones could not all be loaded. Add/edit form may be incomplete.');
    }
    setLoading(false);
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
    {
      key: 'linked_to',
      label: 'Dependency',
      render: (r) => {
        const links = [];
        // Laravel Eloquent relations are usually snake_case in JSON
        r.workstreams?.forEach(w => links.push({ type: 'WS', name: w.name }));
        r.initiatives?.forEach(i => links.push({ type: 'Init', name: i.name }));
        r.transformation_items?.forEach(t => links.push({ type: 'Task', name: t.objective }));

        // Handling custom "Other" links if provided by backend in a separate property
        r.other_links?.forEach(o => links.push({ type: 'Other', name: o.metadata }));

        if (links.length === 0) return '-';
        return (
          <div className="dependency-links-cell">
            {links.map((l, i) => (
              <span key={i} className="badge badge--secondary" style={{ marginRight: '4px', marginBottom: '4px' }}>
                <small style={{ opacity: 0.7, marginRight: '4px' }}>{l.type}:</small>
                {l.name}
              </span>
            ))}
          </div>
        );
      }
    },
    { key: 'description', label: 'Description' },
    { key: 'type', label: 'Type' },
    { key: 'target_date', label: 'Target Date', render: (r) => r.target_date?.slice(0, 10) || '-' },
    { key: 'status', label: 'Status' },
    { key: 'risk', label: 'Risk' },
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
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} title={editItem ? 'Edit Dependency' : 'Add Dependency'} size="lg">
        <DependencyForm
          item={editItem}
          workstreams={workstreams}
          initiatives={initiatives}
          tasks={tasks}
          onSave={handleSave}
          onCancel={() => { setModalOpen(false); setEditItem(null); }}
        />
      </Modal>
    </div>
  );
}

function DependencyForm({ item, workstreams, initiatives, tasks, onSave, onCancel }) {
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
    links: []
  });

  useEffect(() => {
    if (item) {
      const initialLinks = [];
      item.workstreams?.forEach(w => initialLinks.push({ type: 'Workstream', id: w.id }));
      item.initiatives?.forEach(i => initialLinks.push({ type: 'Initiative', id: i.id }));
      item.transformation_items?.forEach(t => initialLinks.push({ type: 'Task', id: t.id }));
      // Metadata (Others) is handled in the pivot, but for display we might need a dedicated array
      setForm(p => ({ ...p, links: initialLinks }));
    }
  }, [item]);

  useEffect(() => {
    if (!item && !form.dependency_id) {
      api.nextId().then((res) => setForm((p) => ({ ...p, dependency_id: res.data.next_id })));
    }
  }, [item]);

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const addLink = () => {
    setForm(p => ({ ...p, links: [...p.links, { type: 'Workstream', id: '', metadata: '' }] }));
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...form.links];
    newLinks[index][field] = value;
    if (field === 'type') newLinks[index].id = ''; // Reset ID when type changes
    setForm(p => ({ ...p, links: newLinks }));
  };

  const removeLink = (index) => {
    setForm(p => ({ ...p, links: p.links.filter((_, i) => i !== index) }));
  };

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

      <div className="dependency-form__links" style={{ marginBottom: '20px', padding: '15px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ fontWeight: 600 }}>Dependency</label>
          <button type="button" className="btn btn--sm btn--secondary" onClick={addLink}>+ Add Link</button>
        </div>
        {form.links.length === 0 && <p className="text-muted" style={{ fontSize: '0.9rem' }}>No links added. This dependency is currently standalone.</p>}
        {form.links.map((link, idx) => (
          <div key={idx} className="form-row" style={{ alignItems: 'flex-end', marginBottom: '10px', background: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #eee' }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Type</label>
              <select value={link.type} onChange={(e) => updateLink(idx, 'type', e.target.value)}>
                <option value="Workstream">Workstream</option>
                <option value="Initiative">Initiative</option>
                <option value="Task">Task (Milestone)</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 3 }}>
              {link.type === 'Other' ? (
                <>
                  <label>Label</label>
                  <input
                    placeholder="Enter entity description"
                    value={link.metadata || ''}
                    onChange={(e) => updateLink(idx, 'metadata', e.target.value)}
                    required
                  />
                </>
              ) : (
                <>
                  <label>Select {link.type}</label>
                  <select value={link.id} onChange={(e) => updateLink(idx, 'id', e.target.value)} required>
                    <option value="">Choose...</option>
                    {link.type === 'Workstream' && workstreams.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    {link.type === 'Initiative' && initiatives.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    {link.type === 'Task' && tasks.map(t => <option key={t.id} value={t.id}>{t.objective}</option>)}
                  </select>
                </>
              )}
            </div>
            <button type="button" className="btn btn--sm btn--danger" style={{ marginBottom: '4px' }} onClick={() => removeLink(idx)}>×</button>
          </div>
        ))}
      </div>

      <div className="form-row">
        <div className="form-group" style={{ flex: 1 }}><label>Target Date</label><input type="date" value={form.target_date} onChange={(e) => handleChange('target_date', e.target.value)} style={{ width: '100%' }} /></div>
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

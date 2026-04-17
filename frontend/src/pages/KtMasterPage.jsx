import { useState, useEffect, useCallback } from 'react';
import { ktSessions as api, workstreams as wsApi, users as usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { StatusBadge } from '../components/Badge';
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

function IconLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconUserPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function KtMasterPage() {
  const { canEdit, canDelete } = useAuth();
  const [items, setItems] = useState([]);
  const [workstreams, setWorkstreams] = useState([]);
  const [filters, setFilters] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
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

  const handleRowClick = async (row) => {
    try {
      const res = await api.get(row.id);
      setDetailItem(res.data);
    } catch {
      toast.error('Failed to load session details');
    }
  };

  const handleEditFromDetail = () => {
    setEditItem(detailItem);
    setDetailItem(null);
    setModalOpen(true);
  };

  const refreshDetail = async (id) => {
    try {
      const res = await api.get(id);
      setDetailItem(res.data);
      fetchData();
    } catch {
      toast.error('Failed to refresh session');
    }
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
      headerClassName: 'datatable__actions-col',
      cellClassName: 'datatable__actions-cell',
      render: (r) => (
        <div className="action-buttons">
          <button type="button" className="btn btn--sm btn--secondary btn--icon" aria-label="Edit KT session" onClick={(e) => { e.stopPropagation(); setEditItem(r); setModalOpen(true); }}>
            <IconEdit />
          </button>
          {canDelete() && (
            <button type="button" className="btn btn--sm btn--danger btn--icon" aria-label="Delete KT session" onClick={(e) => { e.stopPropagation(); handleDelete(r); }}>
              <IconTrash />
            </button>
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="page">
      <div className="page-header page-header--with-subtitle">
        <div>
          <h2 className="page-title">KT Master</h2>
          <p className="page-subtitle">Knowledge Transfer Sessions</p>
        </div>
        {canEdit() && (
          <div className="page-header__actions">
            <button className="btn btn--primary" onClick={() => { setEditItem(null); setModalOpen(true); }}>+ Add KT Session</button>
          </div>
        )}
      </div>
      {loading
        ? <div className="page-loading">Loading...</div>
        : <DataTable
            columns={columns}
            data={items}
            onRowClick={handleRowClick}
            toolbarExtra={
              <div className="kt-toolbar__filters">
                <label className="kt-toolbar__filter-wrap">
                  <span className="kt-toolbar__filter-label">Workstream</span>
                  <select
                    className="kt-toolbar__filter-select"
                    value={filters.workstream_id || ''}
                    onChange={(e) => setFilters((p) => ({ ...p, workstream_id: e.target.value || undefined }))}
                    aria-label="Filter by workstream"
                  >
                    <option value="">All</option>
                    {workstreams.map((w) => <option key={w.id} value={w.name}>{w.name}</option>)}
                  </select>
                </label>
                <label className="kt-toolbar__filter-wrap">
                  <span className="kt-toolbar__filter-label">Stage</span>
                  <select
                    className="kt-toolbar__filter-select"
                    value={filters.current_stage || ''}
                    onChange={(e) => setFilters((p) => ({ ...p, current_stage: e.target.value || undefined }))}
                    aria-label="Filter by stage"
                  >
                    <option value="">All</option>
                    {['Planned', 'In Progress', 'Completed'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                {(filters.workstream_id || filters.current_stage) && (
                  <button
                    type="button"
                    className="kt-toolbar__clear"
                    onClick={() => setFilters({})}
                    aria-label="Clear all filters"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Clear
                  </button>
                )}
              </div>
            }
          />
      }
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} title={editItem ? 'Edit KT Session' : 'Add KT Session'} size="lg">
        <KtForm item={editItem} workstreams={workstreams} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditItem(null); }} />
      </Modal>
      {detailItem && (
        <KtDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={canEdit() ? handleEditFromDetail : null}
          onRefresh={refreshDetail}
          canEdit={canEdit()}
        />
      )}
    </div>
  );
}

/* ─── Detail Modal ─── */

function KtDetailModal({ item, onClose, onEdit, onRefresh, canEdit }) {
  const [allUsers, setAllUsers] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    usersApi.list().then((res) => setAllUsers(res.data)).catch(() => {});
  }, []);

  const participantIds = new Set((item.participants || []).map((p) => p.id));
  const availableUsers = allUsers.filter((u) => !participantIds.has(u.id) && u.id !== item.kt_owner_id);

  const handleInvite = async () => {
    if (!inviteUserId) return;
    setInviting(true);
    try {
      const currentIds = (item.participants || []).map((p) => p.id);
      await api.update(item.id, { participant_ids: [...currentIds, Number(inviteUserId)] });
      toast.success('Participant added');
      setInviteUserId('');
      setInviteOpen(false);
      onRefresh(item.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add participant');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveParticipant = async (userId) => {
    try {
      const newIds = (item.participants || []).filter((p) => p.id !== userId).map((p) => p.id);
      await api.update(item.id, { participant_ids: newIds });
      toast.success('Participant removed');
      onRefresh(item.id);
    } catch {
      toast.error('Failed to remove participant');
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="KT Session Details" size="lg">
      <div className="kt-detail">
        <div className="kt-detail__header-actions">
          {onEdit && (
            <button className="btn btn--secondary btn--sm" onClick={onEdit}>
              <IconEdit /> Edit Session
            </button>
          )}
        </div>

        <div className="kt-detail__grid">
          <div className="kt-detail__field">
            <span className="kt-detail__label">Workstream</span>
            <span className="kt-detail__value">{item.workstream?.name || '-'}</span>
          </div>
          <div className="kt-detail__field">
            <span className="kt-detail__label">Product / Platform</span>
            <span className="kt-detail__value">{item.product_platform || '-'}</span>
          </div>
          <div className="kt-detail__field">
            <span className="kt-detail__label">Stage</span>
            <span className="kt-detail__value"><StatusBadge value={item.current_stage} /></span>
          </div>
          <div className="kt-detail__field">
            <span className="kt-detail__label">Overall Status</span>
            <span className="kt-detail__value">{item.overall_status || '-'}</span>
          </div>
          <div className="kt-detail__field">
            <span className="kt-detail__label">Start Date</span>
            <span className="kt-detail__value">{item.start_date?.slice(0, 10) || '-'}</span>
          </div>
          <div className="kt-detail__field">
            <span className="kt-detail__label">End Date</span>
            <span className="kt-detail__value">{item.end_date?.slice(0, 10) || '-'}</span>
          </div>
          <div className="kt-detail__field">
            <span className="kt-detail__label">KT Owner</span>
            <span className="kt-detail__value">{item.kt_owner?.name || 'Not assigned'}</span>
          </div>
          <div className="kt-detail__field">
            <span className="kt-detail__label">SME</span>
            <span className="kt-detail__value">{item.sme || '-'}</span>
          </div>
          <div className="kt-detail__field">
            <span className="kt-detail__label">Receiving Team</span>
            <span className="kt-detail__value">{item.receiving_team || '-'}</span>
          </div>
          <div className="kt-detail__field">
            <span className="kt-detail__label">Meeting Link</span>
            <span className="kt-detail__value">
              {item.meet_link ? (
                <a href={item.meet_link} target="_blank" rel="noopener noreferrer" className="kt-detail__meet-link">
                  <IconLink /> Join Meeting
                </a>
              ) : (
                <span className="kt-detail__empty">No link added</span>
              )}
            </span>
          </div>
        </div>

        <div className="kt-detail__field kt-detail__field--full">
          <span className="kt-detail__label">KT Scope</span>
          <span className="kt-detail__value kt-detail__value--block">{item.kt_scope || '-'}</span>
        </div>

        <div className="kt-detail__section">
          <div className="kt-detail__section-header">
            <h4 className="kt-detail__section-title">Participants ({(item.participants || []).length})</h4>
            {canEdit && (
              <button className="btn btn--primary btn--sm" onClick={() => setInviteOpen(!inviteOpen)}>
                <IconUserPlus /> Invite Participant
              </button>
            )}
          </div>

          {inviteOpen && (
            <div className="kt-detail__invite">
              <select value={inviteUserId} onChange={(e) => setInviteUserId(e.target.value)} className="kt-detail__invite-select">
                <option value="">Select a user...</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <button className="btn btn--primary btn--sm" onClick={handleInvite} disabled={!inviteUserId || inviting}>
                {inviting ? 'Adding...' : 'Add'}
              </button>
              <button className="btn btn--secondary btn--sm" onClick={() => { setInviteOpen(false); setInviteUserId(''); }}>
                Cancel
              </button>
            </div>
          )}

          {(item.participants || []).length > 0 ? (
            <table className="kt-detail__participants-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  {canEdit && <th></th>}
                </tr>
              </thead>
              <tbody>
                {item.participants.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.email}</td>
                    <td><span className="badge badge--status-planned">{p.pivot?.participant_role || 'Attendee'}</span></td>
                    {canEdit && (
                      <td className="kt-detail__participants-actions">
                        <button className="btn btn--sm btn--danger btn--icon" aria-label="Remove participant" onClick={() => handleRemoveParticipant(p.id)}>
                          <IconX />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="kt-detail__empty">No participants added yet.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ─── Create / Edit Form ─── */

function KtForm({ item, workstreams, onSave, onCancel }) {
  const [allUsers, setAllUsers] = useState([]);
  const [form, setForm] = useState({
    workstream_id: item?.workstream_id || '',
    product_platform: item?.product_platform || '',
    kt_scope: item?.kt_scope || '',
    kt_owner_id: item?.kt_owner_id || '',
    sme: item?.sme || '',
    receiving_team: item?.receiving_team || '',
    start_date: item?.start_date?.slice(0, 10) || '',
    end_date: item?.end_date?.slice(0, 10) || '',
    current_stage: item?.current_stage || 'Planned',
    overall_status: item?.overall_status || 'Not Started',
    meet_link: item?.meet_link || '',
    participant_ids: (item?.participants || []).map((p) => p.id),
  });

  useEffect(() => {
    usersApi.list().then((res) => setAllUsers(res.data)).catch(() => {});
  }, []);

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleAddParticipant = (userId) => {
    if (!userId) return;
    const id = Number(userId);
    if (!form.participant_ids.includes(id)) {
      handleChange('participant_ids', [...form.participant_ids, id]);
    }
  };

  const handleRemoveParticipant = (userId) => {
    handleChange('participant_ids', form.participant_ids.filter((id) => id !== userId));
  };

  const selectedParticipants = allUsers.filter((u) => form.participant_ids.includes(u.id));
  const availableParticipants = allUsers.filter((u) => !form.participant_ids.includes(u.id) && u.id !== Number(form.kt_owner_id));

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
        <div className="form-group">
          <label>KT Owner</label>
          <select value={form.kt_owner_id} onChange={(e) => handleChange('kt_owner_id', e.target.value)}>
            <option value="">Select owner...</option>
            {allUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div className="form-group"><label>SME</label><input value={form.sme} onChange={(e) => handleChange('sme', e.target.value)} /></div>
      </div>
      <div className="form-group"><label>Receiving Team</label><input value={form.receiving_team} onChange={(e) => handleChange('receiving_team', e.target.value)} /></div>
      <div className="form-group">
        <label>Meeting Link</label>
        <input type="url" value={form.meet_link} onChange={(e) => handleChange('meet_link', e.target.value)} placeholder="https://meet.google.com/..." />
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

      <div className="form-group">
        <label>Participants</label>
        <div className="kt-form__participants">
          {selectedParticipants.length > 0 && (
            <div className="kt-form__participant-chips">
              {selectedParticipants.map((u) => (
                <span key={u.id} className="kt-form__chip">
                  {u.name}
                  <button type="button" className="kt-form__chip-remove" onClick={() => handleRemoveParticipant(u.id)} aria-label={`Remove ${u.name}`}>
                    <IconX />
                  </button>
                </span>
              ))}
            </div>
          )}
          <select value="" onChange={(e) => handleAddParticipant(e.target.value)}>
            <option value="">Add participant...</option>
            {availableParticipants.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
          </select>
        </div>
      </div>

      <div className="modal-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary">Save</button>
      </div>
    </form>
  );
}

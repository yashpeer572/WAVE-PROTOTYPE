import {
  useState, useEffect, useCallback, useMemo, Fragment,
} from 'react';
import {
  transformationItems as api,
  initiatives as initApi,
  users as usersApi,
  workstreams as wsApi,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import { StatusBadge, RagHealthDot } from '../components/Badge';
import toast from 'react-hot-toast';

const ITEM_STATUSES = ['Not Started', 'In Progress', 'Completed', 'Blocked'];
const WS_RAG_OPTIONS = ['Green', 'Amber', 'Red'];
/** Table columns spanned by workstream name (Milestones → Status); RAG and % are separate cells. */
const WS_ROW_LABEL_COLSPAN = 5;

const RAG_RANK = { green: 1, amber: 2, red: 3 };

function ragRankValue(rag) {
  const v = rag ? String(rag).trim().toLowerCase() : '';
  return RAG_RANK[v] ?? 0;
}

function isoDateOnly(s) {
  if (!s || typeof s !== 'string') return null;
  const d = s.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

function todayIsoLocal() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const day = String(t.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isIncompleteMilestone(row) {
  return row.status !== 'Completed';
}

/** Incomplete milestone whose end date is strictly before today. */
function isMilestonePastDue(row) {
  if (!isIncompleteMilestone(row)) return false;
  const end = isoDateOnly(row.end_date);
  if (!end) return false;
  return todayIsoLocal() > end;
}

/** RAG dot on milestone row: Amber when past due (unless stored RAG is Red). */
function milestoneRagDisplayForRow(row) {
  if (isMilestonePastDue(row)) {
    if (ragRankValue(row.rag) >= 3) return row.rag;
    return 'Amber';
  }
  return row.rag || '';
}

/** Today within milestone window when dates exist (incomplete only). */
function isMilestoneInScheduleWindow(row) {
  if (!isIncompleteMilestone(row)) return true;
  const t = todayIsoLocal();
  const sd = isoDateOnly(row.start_date);
  const ed = isoDateOnly(row.end_date);
  if (sd && ed) return sd <= t && t <= ed;
  if (ed) return t <= ed;
  if (sd) return t >= sd;
  return true;
}

/**
 * Workstream RAG from schedule + manual Red:
 * - Red if any milestone has RAG Red
 * - Amber if any incomplete milestone is past end_date
 * - Green if there are milestones, none past due, and every incomplete one is in its start–end window (when dates exist)
 * - Else fall back to worst non-red milestone RAG, or unset
 */
function buildWorkstreamDisplayRagById(items) {
  const byWs = new Map();
  for (const row of items) {
    const wid = row.initiative?.workstream?.id;
    if (!wid) continue;
    if (!byWs.has(wid)) byWs.set(wid, []);
    byWs.get(wid).push(row);
  }
  const out = new Map();
  for (const [wid, rows] of byWs) {
    if (rows.some((r) => ragRankValue(r.rag) >= 3)) {
      out.set(wid, 'Red');
      continue;
    }
    if (rows.some(isMilestonePastDue)) {
      out.set(wid, 'Amber');
      continue;
    }
    if (rows.length && rows.every((r) => !isIncompleteMilestone(r) || isMilestoneInScheduleWindow(r))) {
      out.set(wid, 'Green');
      continue;
    }
    let best = 0;
    let label = '';
    for (const row of rows) {
      const r = ragRankValue(row.rag);
      if (r > best) {
        best = r;
        label = row.rag?.trim() || '';
      }
    }
    out.set(wid, label);
  }
  return out;
}

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

function IconChevron({ expanded }) {
  return (
    <svg
      className={`transformation-tree__chevron ${expanded ? 'transformation-tree__chevron--expanded' : ''}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function groupItemsByWorkstreamAndInitiative(items) {
  const wsMap = new Map();
  for (const row of items) {
    const ini = row.initiative;
    const ws = ini?.workstream;
    if (!ws?.id || !ini?.id) continue;

    if (!wsMap.has(ws.id)) {
      wsMap.set(ws.id, { workstream: ws, initiatives: new Map() });
    }
    const bucket = wsMap.get(ws.id);
    if (!bucket.initiatives.has(ini.id)) {
      bucket.initiatives.set(ini.id, { initiative: ini, items: [] });
    }
    bucket.initiatives.get(ini.id).items.push(row);
  }

  const groups = [...wsMap.values()].map((g) => ({
    workstream: g.workstream,
    initiatives: [...g.initiatives.values()].sort((a, b) => String(a.initiative.name).localeCompare(String(b.initiative.name), undefined, { sensitivity: 'base' })),
  }));

  for (const g of groups) {
    for (const block of g.initiatives) {
      block.items.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    }
  }

  groups.sort((a, b) => String(a.workstream.name).localeCompare(String(b.workstream.name), undefined, { sensitivity: 'base' }));
  return groups;
}

/**
 * Milestone rows alone never include workstreams that have no items yet.
 * Merge those in from `workstreamsList` so newly created workstreams appear.
 * When a status filter is on, skip empty workstreams (they have no milestone status).
 * When search is on, only add empty workstreams whose name matches the query.
 */
function mergeWorkstreamsWithoutMilestones(
  groupsFromFiltered,
  workstreamsList,
  allItems,
  searchTrimmed,
  filterStatus,
) {
  const wsIdsWithMilestones = new Set();
  for (const row of allItems) {
    const ws = row.initiative?.workstream;
    if (ws?.id) wsIdsWithMilestones.add(ws.id);
  }
  const byId = new Map(groupsFromFiltered.map((g) => [g.workstream.id, g]));
  const q = searchTrimmed.trim().toLowerCase();
  const statusFilter = Boolean(filterStatus);

  for (const ws of workstreamsList) {
    if (!ws?.id || wsIdsWithMilestones.has(ws.id) || byId.has(ws.id)) continue;
    if (statusFilter) continue;
    if (q && !String(ws.name || '').toLowerCase().includes(q)) continue;
    byId.set(ws.id, { workstream: ws, initiatives: [] });
  }

  const merged = [...byId.values()];
  merged.sort((a, b) => String(a.workstream.name).localeCompare(String(b.workstream.name), undefined, { sensitivity: 'base' }));
  return merged;
}

/** Milestone counts per workstream for timeline + % (uses full `items`, not search/status filter). */
function buildWorkstreamCompletionStatsById(items) {
  const buckets = new Map();
  for (const row of items) {
    const wid = row.initiative?.workstream?.id;
    if (!wid) continue;
    if (!buckets.has(wid)) buckets.set(wid, { total: 0, completed: 0 });
    const b = buckets.get(wid);
    b.total += 1;
    if (row.status === 'Completed') b.completed += 1;
  }
  const out = new Map();
  for (const [wid, { total, completed }] of buckets) {
    if (total === 0) out.set(wid, null);
    else {
      out.set(wid, {
        total,
        completed,
        pct: Math.round((completed / total) * 100),
      });
    }
  }
  return out;
}

/** Workstream row: one segment per milestone, filled left-to-right for completed count. */
function CompletionTimelineWorkstream({ stats }) {
  if (!stats) {
    return <span className="completion-timeline completion-timeline--empty">—</span>;
  }
  const { total, completed, pct } = stats;
  const label = `${completed} of ${total} milestones (${pct}%)`;
  return (
    <div
      className="completion-timeline completion-timeline--workstream"
      role="img"
      aria-label={label}
      title={label}
    >
      <div className="completion-timeline__row">
        <div className="completion-timeline__segments" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`completion-timeline__segment${i < completed ? ' completion-timeline__segment--done' : ''}`}
            />
          ))}
        </div>
        <span className="completion-timeline__pct" aria-hidden>{pct}%</span>
      </div>
    </div>
  );
}

/** Display string for a user in dropdowns / table (name preferred). */
function formatUserOptionLabel(userLike) {
  if (!userLike) return '';
  const n = userLike.name?.trim();
  if (n) return n;
  const u = userLike.username?.trim();
  if (u) return u;
  const e = userLike.email?.trim();
  if (e) return e;
  if (userLike.id != null) return `User #${userLike.id}`;
  return '';
}

/** Linked user label, or legacy contact text when `owner_id` is not set. */
function formatTransformationOwner(row) {
  if (row.owner) return formatUserOptionLabel(row.owner);
  const ff = row.five_flow_contact?.trim();
  const pc = row.peer_contact?.trim();
  if (row.owner_org === 'Peer') return pc || ff || '-';
  return ff || pc || '-';
}

function formatOwnerOrgLabel(ownerOrg) {
  if (!ownerOrg) return '—';
  if (ownerOrg === '5Flow') return '5FLOW';
  return ownerOrg;
}

function userMatchesOwnerOrg(userLike, ownerOrg) {
  return userLike?.owner_org === ownerOrg;
}

/** Values shown in the Owner column for this org (linked user or legacy contact text). */
function buildOwnerChoicesFromPlan(items, ownerOrg) {
  const rows = items.filter((r) => (r.owner_org || 'Peer') === ownerOrg);
  const choices = [];
  const seenValues = new Set();

  for (const row of rows) {
    const label = formatTransformationOwner(row);
    if (!label || label === '-') continue;

    if (row.owner_id) {
      const value = `u|${row.owner_id}`;
      if (seenValues.has(value)) continue;
      seenValues.add(value);
      choices.push({ value, label });
    } else {
      const value = `c|${encodeURIComponent(label)}`;
      if (seenValues.has(value)) continue;
      seenValues.add(value);
      choices.push({ value, label });
    }
  }

  choices.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  return choices;
}

/** Plan-derived owners first, then app users for this org not already listed. */
function buildOwnerSelectChoices(items, ownerOrg, users) {
  const plan = buildOwnerChoicesFromPlan(items, ownerOrg);
  const seen = new Set(plan.map((c) => c.value));

  for (const u of users) {
    if (!userMatchesOwnerOrg(u, ownerOrg)) continue;
    const value = `u|${u.id}`;
    if (seen.has(value)) continue;
    seen.add(value);
    plan.push({ value, label: formatUserOptionLabel(u) });
  }

  plan.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  return plan;
}

function initialOwnerPick(item) {
  if (!item) return '';
  if (item.owner_id) return `u|${item.owner_id}`;
  const lab = formatTransformationOwner(item);
  if (lab && lab !== '-') return `c|${encodeURIComponent(lab)}`;
  return '';
}

function ownerFieldsFromPick(ownerPick, ownerOrg) {
  if (!ownerPick) {
    return { owner_id: null, peer_contact: null, five_flow_contact: null };
  }
  if (ownerPick.startsWith('u|')) {
    const id = Number(ownerPick.slice(2), 10);
    return {
      owner_id: Number.isFinite(id) ? id : null,
      peer_contact: null,
      five_flow_contact: null,
    };
  }
  if (ownerPick.startsWith('c|')) {
    const label = decodeURIComponent(ownerPick.slice(2));
    if (ownerOrg === 'Peer') {
      return { owner_id: null, peer_contact: label, five_flow_contact: null };
    }
    return { owner_id: null, peer_contact: null, five_flow_contact: label };
  }
  return { owner_id: null, peer_contact: null, five_flow_contact: null };
}

export default function TransformationPage() {
  const { canEdit, canDelete } = useAuth();
  const [items, setItems] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [workstreamsList, setWorkstreamsList] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addItemType, setAddItemType] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [wsModalOpen, setWsModalOpen] = useState(false);
  const [wsEdit, setWsEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [openWs, setOpenWs] = useState(() => new Set());
  const [pinnedOwnerTooltipId, setPinnedOwnerTooltipId] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([api.list(), initApi.list(), usersApi.list(), wsApi.list()])
      .then(([res, initRes, usersRes, wsRes]) => {
        setItems(res.data);
        setInitiatives(initRes.data);
        setUsers(usersRes.data);
        setWorkstreamsList(wsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    setPinnedOwnerTooltipId(null);
  }, [items]);

  useEffect(() => {
    if (pinnedOwnerTooltipId == null) return undefined;
    const onDocMouseDown = (e) => {
      if (!e.target.closest?.('.transformation-owner__wrap')) {
        setPinnedOwnerTooltipId(null);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setPinnedOwnerTooltipId(null);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [pinnedOwnerTooltipId]);

  const filteredItems = useMemo(() => {
    let rows = items;

    if (filterStatus) {
      rows = rows.filter((row) => row.status === filterStatus);
    }

    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const hay = [
        row.initiative?.workstream?.name,
        row.initiative?.name,
        row.objective,
        formatTransformationOwner(row),
        row.owner_org,
        formatOwnerOrgLabel(row.owner_org),
        row.status,
        row.rag,
        String(row.percent_complete ?? ''),
      ].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [items, search, filterStatus]);

  const grouped = useMemo(
    () => mergeWorkstreamsWithoutMilestones(
      groupItemsByWorkstreamAndInitiative(filteredItems),
      workstreamsList,
      items,
      search,
      filterStatus,
    ),
    [filteredItems, workstreamsList, items, search, filterStatus],
  );

  const workstreamCompletionStats = useMemo(
    () => buildWorkstreamCompletionStatsById(items),
    [items],
  );

  const workstreamDisplayRag = useMemo(
    () => buildWorkstreamDisplayRagById(items),
    [items],
  );

  const groupKey = useMemo(
    () => grouped.map((g) => g.workstream.id).sort((a, b) => a - b).join(','),
    [grouped],
  );

  useEffect(() => {
    setOpenWs(new Set(grouped.map((g) => g.workstream.id)));
  }, [groupKey]);

  const toggleWorkstream = (wsId) => {
    setOpenWs((prev) => {
      const next = new Set(prev);
      if (next.has(wsId)) next.delete(wsId);
      else next.add(wsId);
      return next;
    });
  };

  const handleSave = async (formData) => {
    const { owner_pick, workstream_id: _ws, ...rest } = formData;
    const payload = {
      ...rest,
      ...ownerFieldsFromPick(owner_pick, formData.owner_org),
    };
    try {
      if (editItem) {
        await api.update(editItem.id, payload);
        toast.success('Item updated');
      } else {
        await api.create(payload);
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

  const handleSaveWorkstream = async (formData) => {
    if (!wsEdit?.id) return;
    const payload = {
      name: formData.name?.trim(),
      description: formData.description?.trim() || null,
    };
    try {
      await wsApi.update(wsEdit.id, payload);
      toast.success('Workstream updated');
      setWsModalOpen(false);
      setWsEdit(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const handleCreateWorkstreamFromAdd = async (formData) => {
    const payload = {
      name: formData.name?.trim(),
      description: formData.description?.trim() || null,
      rag_status: formData.rag_status || null,
    };
    try {
      await wsApi.create(payload);
      toast.success('Workstream created');
      setAddModalOpen(false);
      setAddItemType('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const handleCreateInitiativeFromAdd = async (formData) => {
    try {
      await initApi.create({
        workstream_id: Number(formData.workstream_id),
        name: formData.name?.trim(),
        description: formData.description?.trim() || null,
      });
      toast.success('Initiative created');
      setAddModalOpen(false);
      setAddItemType('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const handleCreateMilestoneFromAdd = async (formData) => {
    const { owner_pick, workstream_id: _ws } = formData;
    const ownerPayload = ownerFieldsFromPick(owner_pick, formData.owner_org);
    const payload = {
      initiative_id: Number(formData.initiative_id),
      objective: formData.objective?.trim() || null,
      owner_org: formData.owner_org,
      ...ownerPayload,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      status: formData.status || 'Not Started',
      rag: formData.rag || null,
      success_metrics: formData.success_metrics?.trim() || null,
      risks: formData.risks?.trim() || null,
      percent_complete: formData.percent_complete ?? 0,
    };
    try {
      await api.create(payload);
      toast.success('Milestone created');
      setAddModalOpen(false);
      setAddItemType('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDeleteWorkstream = async (ws) => {
    if (!window.confirm(`Delete workstream "${ws.name}"? This also removes its initiatives and milestones.`)) return;
    try {
      await wsApi.delete(ws.id);
      toast.success('Workstream deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const openEditWorkstream = async (ws) => {
    try {
      const res = await wsApi.get(ws.id);
      setWsEdit(res.data);
      setWsModalOpen(true);
    } catch {
      toast.error('Could not load workstream');
    }
  };

  const handleInlineStatusChange = useCallback(async (row, newStatus) => {
    if (newStatus === row.status) return;
    if (!window.confirm(`Change status from "${row.status}" to "${newStatus}"?`)) return;
    try {
      await api.updateStatus(row.id, { status: newStatus });
      toast.success('Status updated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  }, [fetchData]);

  const colCount = canEdit() ? 8 : 7;

  const renderItemRow = (r) => (
    <tr key={r.id} className="transformation-tree__item-row">
      <td>{r.objective || '-'}</td>
      <td className="transformation-owner-cell">
        <span
          className={`transformation-owner__wrap${pinnedOwnerTooltipId === r.id ? ' transformation-owner__wrap--pinned' : ''}`}
        >
          <button
            type="button"
            className="transformation-owner__name-btn"
            id={`owner-btn-${r.id}`}
            aria-describedby={`owner-tip-${r.id}`}
            aria-expanded={pinnedOwnerTooltipId === r.id}
            aria-label={`${formatTransformationOwner(r)}, show owner group in tooltip`}
            onClick={(e) => {
              e.stopPropagation();
              setPinnedOwnerTooltipId((id) => (id === r.id ? null : r.id));
            }}
          >
            {formatTransformationOwner(r)}
          </button>
          <span
            id={`owner-tip-${r.id}`}
            className="transformation-owner__tooltip"
            role="tooltip"
          >
            {formatOwnerOrgLabel(r.owner_org)}
          </span>
        </span>
      </td>
      <td>{r.start_date?.slice(0, 10) || '-'}</td>
      <td>{r.end_date?.slice(0, 10) || '-'}</td>
      <td>
        {canEdit() ? (
          <select
            className="datatable__inline-select"
            value={r.status}
            aria-label="Status"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleInlineStatusChange(r, e.target.value)}
          >
            {ITEM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <StatusBadge value={r.status} />
        )}
      </td>
      <td className="transformation-tree__item-rag-cell">
        <RagHealthDot value={milestoneRagDisplayForRow(r)} />
      </td>
      <td className="transformation-tree__item-pct-cell" aria-hidden="true" />
      {canEdit() && (
        <td className="transformation-tree__actions-cell">
          <div className="action-buttons">
            <button
              type="button"
              className="btn btn--sm btn--secondary btn--icon"
              aria-label="Edit item"
              onClick={(e) => { e.stopPropagation(); setEditItem(r); setModalOpen(true); }}
            >
              <IconEdit />
            </button>
            {canDelete() && (
              <button
                type="button"
                className="btn btn--sm btn--danger btn--icon"
                aria-label="Delete item"
                onClick={(e) => { e.stopPropagation(); handleDelete(r); }}
              >
                <IconTrash />
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="page">
      <div className="page-header page-header--with-subtitle">
        <div>
          <h2 className="page-title">Transformation Plan</h2>
          <p className="page-subtitle">Workstreams, Initiatives, Milestones</p>
        </div>
        {canEdit() && (
          <div className="page-header__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => { setEditItem(null); setAddItemType(''); setAddModalOpen(true); }}
            >
              + Add Item
            </button>
          </div>
        )}
      </div>
      <FilterBar
        filters={[
          { key: 'status', label: 'Status', options: ITEM_STATUSES },
        ]}
        values={{ status: filterStatus }}
        onChange={(_, v) => setFilterStatus(v || '')}
        onClear={() => setFilterStatus('')}
      />
      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : (
        <div className="datatable-wrapper datatable-wrapper--owner-tooltips">
          <div className="datatable__toolbar">
            <input
              type="text"
              className="datatable__search"
              placeholder="Search milestones, initiatives…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search"
            />
          </div>
          <div className="datatable__scroll">
            <table
              className={`datatable transformation-tree${canEdit() ? ' transformation-tree--with-actions' : ''}`}
            >
              <colgroup>
                <col className="transformation-tree__col--milestone" />
                <col className="transformation-tree__col--owner" />
                <col className="transformation-tree__col--date" />
                <col className="transformation-tree__col--date" />
                <col className="transformation-tree__col--status" />
                <col className="transformation-tree__col--rag" />
                <col className="transformation-tree__col--pct" />
                {canEdit() && <col className="transformation-tree__col--actions" />}
              </colgroup>
              <thead>
                <tr>
                  <th>Milestones</th>
                  <th>Owner</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>RAG health</th>
                  <th className="transformation-tree__th-pct">Progress</th>
                  {canEdit() && <th className="transformation-tree__actions-col">Actions</th>}
                </tr>
              </thead>
              {grouped.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={colCount} className="datatable__empty">No data found.</td>
                  </tr>
                </tbody>
              ) : (
                grouped.map((group) => {
                  const expanded = openWs.has(group.workstream.id);
                  const wsStats = workstreamCompletionStats.get(group.workstream.id);
                  const wsRag = workstreamDisplayRag.get(group.workstream.id) ?? '';
                  return (
                    <tbody key={group.workstream.id}>
                      <tr className="transformation-tree__ws-row">
                        <td
                          colSpan={WS_ROW_LABEL_COLSPAN}
                          className="transformation-tree__ws-toggle-cell"
                        >
                          <button
                            type="button"
                            className="transformation-tree__ws-toggle"
                            onClick={() => toggleWorkstream(group.workstream.id)}
                            aria-expanded={expanded}
                          >
                            <IconChevron expanded={expanded} />
                            <span className="transformation-tree__ws-name">{group.workstream.name}</span>
                          </button>
                        </td>
                        <td
                          className="transformation-tree__ws-rag-cell"
                          title="Schedule health: green when milestones are on track, amber if any are past due; red if any milestone RAG is red"
                        >
                          <RagHealthDot value={wsRag} />
                        </td>
                        <td className="transformation-tree__ws-pct-cell">
                          <CompletionTimelineWorkstream stats={wsStats} />
                        </td>
                        {canEdit() && (
                          <td className="transformation-tree__actions-cell transformation-tree__actions-cell--workstream">
                            <div className="action-buttons">
                              <button
                                type="button"
                                className="btn btn--sm btn--secondary btn--icon"
                                aria-label="Edit workstream"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditWorkstream(group.workstream);
                                }}
                              >
                                <IconEdit />
                              </button>
                              {canDelete() && (
                                <button
                                  type="button"
                                  className="btn btn--sm btn--danger btn--icon"
                                  aria-label="Delete workstream"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteWorkstream(group.workstream);
                                  }}
                                >
                                  <IconTrash />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                      {expanded && group.initiatives.map((block) => (
                        <Fragment key={block.initiative.id}>
                          <tr className="transformation-tree__init-row">
                            <td colSpan={colCount}>{block.initiative.name}</td>
                          </tr>
                          {block.items.map((row) => renderItemRow(row))}
                        </Fragment>
                      ))}
                    </tbody>
                  );
                })
              )}
            </table>
          </div>
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} title="Edit milestone" size="lg">
        <TransformationForm
          key={editItem?.id ?? 'new'}
          item={editItem}
          items={items}
          workstreams={workstreamsList}
          initiatives={initiatives}
          users={users}
          onSave={handleSave}
          onCancel={() => { setModalOpen(false); setEditItem(null); }}
        />
      </Modal>
      <Modal
        isOpen={addModalOpen}
        onClose={() => { setAddModalOpen(false); setAddItemType(''); }}
        title="Add Item"
        size="lg"
      >
        <div className="add-item-modal">
          <div className="form-group">
            <label>Type</label>
            <select
              className="add-item-modal__type"
              value={addItemType}
              onChange={(e) => setAddItemType(e.target.value)}
              aria-label="Item type to create"
            >
              <option value="">Select type…</option>
              <option value="workstream">Workstream</option>
              <option value="initiative">Initiative</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>
          {addItemType === 'workstream' && (
            <WorkstreamForm
              key="add-ws"
              workstream={null}
              onSave={handleCreateWorkstreamFromAdd}
              onCancel={() => setAddItemType('')}
            />
          )}
          {addItemType === 'initiative' && (
            <InitiativeCreateForm
              key="add-init"
              workstreams={workstreamsList}
              onSave={handleCreateInitiativeFromAdd}
              onCancel={() => setAddItemType('')}
            />
          )}
          {addItemType === 'milestone' && (
            <TransformationForm
              key="add-milestone"
              item={null}
              items={items}
              workstreams={workstreamsList}
              initiatives={initiatives}
              users={users}
              onSave={handleCreateMilestoneFromAdd}
              onCancel={() => setAddItemType('')}
            />
          )}
        </div>
      </Modal>
      <Modal
        isOpen={wsModalOpen}
        onClose={() => { setWsModalOpen(false); setWsEdit(null); }}
        title="Edit Workstream"
        size="md"
      >
        <WorkstreamForm
          key={wsEdit?.id ?? 'edit-ws'}
          workstream={wsEdit}
          onSave={handleSaveWorkstream}
          onCancel={() => { setWsModalOpen(false); setWsEdit(null); }}
        />
      </Modal>
    </div>
  );
}

function InitiativeCreateForm({ workstreams, onSave, onCancel }) {
  const [form, setForm] = useState({
    workstream_id: '',
    name: '',
    description: '',
  });

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  if (!workstreams?.length) {
    return (
      <div className="modal-form add-item-modal__hint">
        <p className="text-muted">Create a workstream first, then you can add initiatives under it.</p>
        <div className="modal-form__actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="modal-form">
      <div className="form-group">
        <label>Workstream</label>
        <select value={form.workstream_id} onChange={(e) => handleChange('workstream_id', e.target.value)} required>
          <option value="">Select workstream</option>
          {workstreams.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Name</label>
        <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
      </div>
      <div className="modal-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary">Save</button>
      </div>
    </form>
  );
}

function WorkstreamForm({ workstream, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: workstream?.name || '',
    description: workstream?.description || '',
    rag_status: workstream?.rag_status || '',
  });

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="modal-form">
      <div className="form-group">
        <label>Name</label>
        <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
      </div>
      {!workstream && (
        <div className="form-group">
          <label>RAG health</label>
          <select value={form.rag_status} onChange={(e) => handleChange('rag_status', e.target.value)}>
            <option value="">Not set</option>
            {WS_RAG_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      )}
      <div className="modal-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary">Save</button>
      </div>
    </form>
  );
}

function initiativeWorkstreamId(ini) {
  if (!ini) return '';
  return String(ini.workstream_id ?? ini.workstream?.id ?? '');
}

function TransformationForm({
  item, items = [], workstreams = [], initiatives, users, onSave, onCancel,
}) {
  const initialWsId = item ? initiativeWorkstreamId(item.initiative) : '';
  const [form, setForm] = useState({
    workstream_id: initialWsId,
    initiative_id: item?.initiative_id != null ? String(item.initiative_id) : '',
    objective: item?.objective || '',
    owner_pick: initialOwnerPick(item),
    owner_org: item?.owner_org || 'Peer',
    start_date: item?.start_date?.slice(0, 10) || '',
    end_date: item?.end_date?.slice(0, 10) || '',
    status: item?.status || 'Not Started',
    rag: item?.rag || '',
    success_metrics: item?.success_metrics || '',
    risks: item?.risks || '',
    percent_complete: item?.percent_complete ?? 0,
  });

  const initiativesForSelect = useMemo(() => {
    let list = [];
    if (!form.workstream_id) {
      list = item ? initiatives : [];
    } else {
      list = initiatives.filter(
        (i) => initiativeWorkstreamId(i) === String(form.workstream_id),
      );
    }
    if (item?.initiative_id) {
      const cur = initiatives.find((i) => String(i.id) === String(item.initiative_id));
      if (cur && !list.some((i) => String(i.id) === String(cur.id))) {
        list = [...list, cur];
      }
    }
    return list;
  }, [initiatives, form.workstream_id, item]);

  const ownerSelectChoices = useMemo(() => {
    let list = buildOwnerSelectChoices(items, form.owner_org, users);
    if (item?.owner_id && !list.some((c) => c.value === `u|${item.owner_id}`)) {
      list = [
        ...list,
        {
          value: `u|${item.owner_id}`,
          label: item.owner ? formatUserOptionLabel(item.owner) : `User #${item.owner_id}`,
        },
      ];
    }
    const pick0 = item ? initialOwnerPick(item) : '';
    if (pick0.startsWith('c|') && !list.some((c) => c.value === pick0)) {
      list = [...list, { value: pick0, label: decodeURIComponent(pick0.slice(2)) }];
    }
    list.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
    return list;
  }, [items, form.owner_org, users, item]);

  const handleChange = (k, v) => {
    setForm((p) => {
      const next = { ...p, [k]: v };
      if (k === 'workstream_id') {
        const ok = initiatives.some(
          (i) => String(i.id) === String(next.initiative_id)
            && initiativeWorkstreamId(i) === String(v),
        );
        if (!ok) next.initiative_id = '';
      }
      if (k === 'initiative_id') {
        const ini = initiatives.find((i) => String(i.id) === String(v));
        const wid = ini ? initiativeWorkstreamId(ini) : '';
        if (wid) next.workstream_id = wid;
      }
      if (k === 'owner_org') {
        const nextChoices = buildOwnerSelectChoices(items, v, users);
        if (!nextChoices.some((c) => c.value === next.owner_pick)) {
          next.owner_pick = '';
        }
      }
      return next;
    });
  };

  if (!item && !workstreams?.length) {
    return (
      <div className="modal-form add-item-modal__hint">
        <p className="text-muted">Create a workstream first, then add an initiative before creating a milestone.</p>
        <div className="modal-form__actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const { workstream_id, owner_pick, ...fields } = form;
        onSave({
          ...fields,
          owner_pick,
          owner_org: form.owner_org,
        });
      }}
      className="modal-form"
    >
      <div className="form-row">
        <div className="form-group">
          <label>Workstream</label>
          <select
            value={form.workstream_id}
            onChange={(e) => handleChange('workstream_id', e.target.value)}
            required
          >
            <option value="">Select workstream</option>
            {workstreams.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Initiative</label>
          <select
            value={form.initiative_id}
            onChange={(e) => handleChange('initiative_id', e.target.value)}
            required
            disabled={!item && !form.workstream_id}
          >
            <option value="">
              {!item && !form.workstream_id ? 'Select workstream first' : 'Select initiative'}
            </option>
            {initiativesForSelect.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Owner Org</label>
          <select value={form.owner_org} onChange={(e) => handleChange('owner_org', e.target.value)}>
            {['5Flow', 'Peer'].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Owner</label>
          <select
            value={form.owner_pick}
            onChange={(e) => handleChange('owner_pick', e.target.value)}
            aria-label="Owner (same names as plan table)"
          >
            <option value="">Not assigned</option>
            {ownerSelectChoices.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group"><label>Milestones</label><textarea value={form.objective} onChange={(e) => handleChange('objective', e.target.value)} rows={2} /></div>
      <div className="form-row">
        <div className="form-group"><label>Start Date</label><input type="date" value={form.start_date} onChange={(e) => handleChange('start_date', e.target.value)} /></div>
        <div className="form-group"><label>End Date</label><input type="date" value={form.end_date} onChange={(e) => handleChange('end_date', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
            {ITEM_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>RAG health</label>
          <select value={form.rag} onChange={(e) => handleChange('rag', e.target.value)}>
            <option value="">Not set</option>
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

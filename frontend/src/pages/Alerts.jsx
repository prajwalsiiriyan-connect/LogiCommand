import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, RefreshCw, CheckCircle, AlertTriangle, AlertOctagon, Info, Trash2 } from 'lucide-react';
import { alertAPI } from '../services/api';
import { Badge, Modal, ConfirmModal, EmptyState, SearchBar, FilterSelect } from '../components/UI/index.jsx';
import { useToast } from '../context/ToastContext';

const SEVERITY_OPTIONS = ['All','Critical','High','Medium','Low'];
const STATUS_OPTIONS   = ['All','Active','Acknowledged','Resolved'];
const CATEGORY_OPTIONS = ['All','Shipment','Inventory','Supplier','Order','System'];
const ALERT_TYPES = ['Delay Alert','Low Stock Alert','Contract Expiry','Customs Hold','Weather Disruption','Vehicle Breakdown','System Alert','Payment Overdue'];

const EMPTY = { type: ALERT_TYPES[0], message: '', severity: 'Medium', status: 'Active', category: 'System', relatedId: '' };

const severityIcon = (s) => {
  if (s === 'Critical') return <AlertOctagon size={15} className="text-red-500" />;
  if (s === 'High')     return <AlertTriangle size={15} className="text-orange-500" />;
  if (s === 'Medium')   return <AlertTriangle size={15} className="text-amber-500" />;
  return <Info size={15} className="text-blue-500" />;
};

const severityBorder = { Critical: 'border-l-red-500', High: 'border-l-orange-500', Medium: 'border-l-amber-500', Low: 'border-l-blue-400' };

export default function Alerts() {
  const [alerts,     setAlerts]     = useState([]);
  const [stats,      setStats]      = useState({});
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [severityF,  setSeverityF]  = useState('All');
  const [statusF,    setStatusF]    = useState('All');
  const [categoryF,  setCategoryF]  = useState('All');
  const [modal,      setModal]      = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      alertAPI.getAll({ status: statusF === 'All' ? '' : statusF, severity: severityF === 'All' ? '' : severityF, category: categoryF === 'All' ? '' : categoryF, search }),
      alertAPI.getStats(),
    ]).then(([{ data }, { data: s }]) => {
      setAlerts(data.alerts || []);
      setStats(s);
    }).catch(() => toast.error('Failed to load alerts'))
      .finally(() => setLoading(false));
  }, [statusF, severityF, categoryF, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const iv = setInterval(load, 20000); return () => clearInterval(iv); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await alertAPI.create(form); toast.success('Alert created'); setModal(false); load(); }
    catch { toast.error('Failed to create alert'); }
    finally { setSaving(false); }
  };

  const handleResolve = async (id) => {
    try { await alertAPI.update(id, { status: 'Resolved' }); toast.success('Alert resolved ✓'); load(); }
    catch { toast.error('Failed to update'); }
  };

  const handleAcknowledge = async (id) => {
    try { await alertAPI.update(id, { status: 'Acknowledged' }); toast.info('Alert acknowledged'); load(); }
    catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    try { await alertAPI.remove(confirmDel); toast.success('Alert deleted'); setConfirmDel(null); load(); }
    catch { toast.error('Delete failed'); }
  };

  const fmtTime = (d) => {
    if (!d) return '—';
    const diff = Date.now() - new Date(d).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days  > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Alerts',  val: stats.total,    cls: '' },
          { label: 'Active',        val: stats.active,   cls: 'bg-red-50 border-red-200 text-red-700' },
          { label: 'Critical',      val: stats.critical, cls: 'bg-orange-50 border-orange-200 text-orange-700' },
          { label: 'Resolved',      val: stats.resolved, cls: 'bg-green-50 border-green-200 text-green-700' },
        ].map(({ label, val, cls }) => (
          <div key={label} className={`card flex items-center justify-between border ${cls || 'border-slate-100'}`}>
            <span className="text-sm font-semibold">{label}</span>
            <span className="text-2xl font-bold">{val ?? '—'}</span>
          </div>
        ))}
      </div>

      {/* Filters + table */}
      <div className="card">
        <div className="flex flex-wrap gap-3 mb-5">
          <SearchBar value={search} onChange={setSearch} placeholder="Search alerts…" />
          <FilterSelect value={severityF} onChange={setSeverityF} options={SEVERITY_OPTIONS.map(v=>({value:v,label:v}))} />
          <FilterSelect value={statusF}   onChange={setStatusF}   options={STATUS_OPTIONS.map(v=>({value:v,label:v}))} />
          <FilterSelect value={categoryF} onChange={setCategoryF} options={CATEGORY_OPTIONS.map(v=>({value:v,label:v}))} />
          <div className="ml-auto flex gap-2">
            <button className="btn-secondary" onClick={load}><RefreshCw size={15} />Refresh</button>
            <button className="btn-primary"   onClick={() => { setForm(EMPTY); setModal(true); }}><Plus size={15} />New Alert</button>
          </div>
        </div>

        {loading
          ? <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
          : alerts.length === 0
            ? <EmptyState icon={Bell} title="No alerts found" subtitle="System is running smoothly 🎉" />
            : (
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a._id}
                       className={`flex items-start gap-4 bg-white border border-slate-100 border-l-4 ${severityBorder[a.severity] || 'border-l-slate-300'}
                                  rounded-xl px-4 py-3.5 hover:shadow-card transition-all`}>
                    <div className="mt-0.5 flex-shrink-0">{severityIcon(a.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-800">{a.type}</p>
                        <Badge label={a.severity} size="sm" />
                        <Badge label={a.status}   size="sm" />
                        {a.category && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{a.category}</span>}
                        {a.relatedId && <span className="text-[10px] font-mono text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{a.relatedId}</span>}
                      </div>
                      <p className="text-xs text-slate-600 leading-snug">{a.message}</p>
                      <p className="text-[11px] text-slate-400 mt-1.5">{fmtTime(a.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {a.status === 'Active' && (
                        <>
                          <button onClick={() => handleAcknowledge(a._id)}
                                  className="text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors">
                            Ack
                          </button>
                          <button onClick={() => handleResolve(a._id)}
                                  className="text-xs text-green-600 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1">
                            <CheckCircle size={12} /> Resolve
                          </button>
                        </>
                      )}
                      {a.status === 'Acknowledged' && (
                        <button onClick={() => handleResolve(a._id)}
                                className="text-xs text-green-600 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1">
                          <CheckCircle size={12} /> Resolve
                        </button>
                      )}
                      <button onClick={() => setConfirmDel(a._id)}
                              className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
        }
      </div>

      {/* Create alert modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create Alert" width="max-w-lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Alert Type</label>
            <select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})} className="input">
              {ALERT_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Message</label>
            <textarea value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})}
                      className="input resize-none" rows={3} required placeholder="Describe the alert…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Severity</label>
              <select value={form.severity} onChange={(e)=>setForm({...form,severity:e.target.value})} className="input">
                {['Critical','High','Medium','Low'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} className="input">
                {['Shipment','Inventory','Supplier','Order','System'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Related ID (optional)</label>
            <input value={form.relatedId} onChange={(e)=>setForm({...form,relatedId:e.target.value})}
                   className="input" placeholder="e.g. SHP-0042 or SKU-0018" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating…' : 'Create Alert'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={handleDelete}
        title="Delete Alert" message="This will permanently delete the alert from the system." />
    </div>
  );
}

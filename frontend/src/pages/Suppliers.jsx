import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Users } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { supplierAPI } from '../services/api';
import { Badge, Modal, ConfirmModal, EmptyState, SearchBar, FilterSelect, StarRating } from '../components/UI/index.jsx';
import { useToast } from '../context/ToastContext';

const REGIONS    = ['All','North India','South India','East India','West India','Central India','Northeast India'];
const CATEGORIES = ['Electronics','Automotive','FMCG','Pharmaceuticals','Textiles','Industrial Equipment','Food & Beverage','Chemicals'];
const STATUS_OPT = ['All','Active','Inactive','Under Review'];

const EMPTY = {
  supplierName: '', region: 'North India', category: 'Electronics',
  contactPerson: '', email: '', phone: '', totalOrders: '', rating: '3',
  onTimeRate: '85', contractExpiry: '', status: 'Active', paymentTerms: 'Net 30',
};

export default function Suppliers() {
  const [suppliers,  setSuppliers]  = useState([]);
  const [stats,      setStats]      = useState({});
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [statusF,    setStatusF]    = useState('All');
  const [regionF,    setRegionF]    = useState('All');
  const [modal,      setModal]      = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      supplierAPI.getAll({ status: statusF === 'All' ? '' : statusF, region: regionF === 'All' ? '' : regionF, search }),
      supplierAPI.getStats(),
    ]).then(([{ data }, { data: s }]) => {
      setSuppliers(data.suppliers || []);
      setStats(s);
    }).catch(() => toast.error('Failed to load suppliers'))
      .finally(() => setLoading(false));
  }, [statusF, regionF, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (s) => { setEditItem(s); setForm({ ...s, contractExpiry: s.contractExpiry?.split('T')[0] || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await supplierAPI.update(editItem._id, form); toast.success('Supplier updated!'); }
      else          { await supplierAPI.create(form);               toast.success('Supplier added!'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await supplierAPI.remove(confirmDel); toast.success('Supplier removed'); setConfirmDel(null); load(); }
    catch { toast.error('Delete failed'); }
  };

  const fmtDate   = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
  const daysLeft  = (d) => {
    if (!d) return null;
    const n = Math.ceil((new Date(d) - Date.now()) / 86400000);
    return n;
  };

  const topByRegion = (stats.regionStats || []).map((r) => ({ region: r._id?.replace(' India',''), count: r.count, rating: parseFloat(r.avgRating?.toFixed(1) || 0) }));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Suppliers', val: stats.total,        cls: '' },
          { label: 'Active',          val: stats.active,       cls: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Avg Rating',      val: stats.avgRating,    cls: 'bg-amber-50 border-amber-200 text-amber-700', suffix: '/ 5' },
          { label: 'Avg On-Time %',   val: stats.avgOnTimeRate,cls: 'bg-blue-50 border-blue-200 text-blue-700', suffix: '%' },
        ].map(({ label, val, cls, suffix }) => (
          <div key={label} className={`card flex items-center justify-between border ${cls || 'border-slate-100'}`}>
            <span className="text-sm font-semibold">{label}</span>
            <span className="text-2xl font-bold">{val ?? '—'}{suffix}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Region distribution */}
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4">Suppliers by Region</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topByRegion} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="region" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="count" name="Suppliers" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expiring contracts */}
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4">Contract Expiry Watch</h3>
          {(stats.expiringContracts || []).length === 0
            ? <p className="text-sm text-slate-400 py-8 text-center">No contracts expiring within 30 days 🎉</p>
            : (
              <div className="space-y-2">
                {(stats.expiringContracts || []).map((c) => {
                  const days = daysLeft(c.contractExpiry);
                  return (
                    <div key={c._id} className={`flex items-center justify-between p-3 rounded-xl border ${days <= 7 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{c.supplierName}</p>
                        <p className="text-[11px] text-slate-400">{c.supplierId} · Expires {fmtDate(c.contractExpiry)}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${days <= 7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {days <= 0 ? 'Expired' : `${days}d left`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search suppliers…" />
          <FilterSelect value={statusF} onChange={setStatusF} options={STATUS_OPT.map(v => ({ value: v, label: v }))} />
          <FilterSelect value={regionF} onChange={setRegionF} options={REGIONS.map(v => ({ value: v, label: v }))} />
          <div className="ml-auto flex gap-2">
            <button className="btn-secondary" onClick={load}><RefreshCw size={15} />Refresh</button>
            <button className="btn-primary"   onClick={openCreate}><Plus size={15} />Add Supplier</button>
          </div>
        </div>

        {loading ? <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        : suppliers.length === 0 ? <EmptyState icon={Users} title="No suppliers found" />
        : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Supplier ID</th><th>Name</th><th>Region</th><th>Category</th><th>Orders</th><th>Rating</th><th>On-Time %</th><th>Contract Expiry</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {suppliers.map((s) => {
                  const days = daysLeft(s.contractExpiry);
                  return (
                    <tr key={s._id}>
                      <td><span className="font-mono text-xs text-slate-500">{s.supplierId}</span></td>
                      <td>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{s.supplierName}</p>
                          <p className="text-[11px] text-slate-400">{s.contactPerson}</p>
                        </div>
                      </td>
                      <td className="text-xs text-slate-600">{s.region}</td>
                      <td><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s.category}</span></td>
                      <td className="text-xs font-semibold text-slate-700">{s.totalOrders}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <StarRating value={s.rating} />
                          <span className="text-xs text-slate-500">{s.rating}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-16">
                            <div className="bg-emerald-500 rounded-full h-1.5" style={{ width: `${s.onTimeRate}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-emerald-600">{s.onTimeRate}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`text-xs font-medium ${days !== null && days <= 30 ? (days <= 7 ? 'text-red-600' : 'text-amber-600') : 'text-slate-500'}`}>
                          {fmtDate(s.contractExpiry)}
                          {days !== null && days <= 30 && <span className="ml-1">({days <= 0 ? 'Expired' : `${days}d`})</span>}
                        </span>
                      </td>
                      <td><Badge label={s.status} /></td>
                      <td>
                        <div className="flex gap-1.5">
                          <button onClick={() => openEdit(s)} className="text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg font-medium">Edit</button>
                          <button onClick={() => setConfirmDel(s._id)} className="text-xs text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Edit Supplier' : 'Add Supplier'} width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[['supplierName','Company Name'],['contactPerson','Contact Person'],['email','Email','email'],['phone','Phone']].map(([k,l,t='text']) => (
              <div key={k}>
                <label className="label">{l}</label>
                <input type={t} value={form[k]||''} onChange={(e)=>setForm({...form,[k]:e.target.value})} className="input" required={k==='supplierName'} />
              </div>
            ))}
            <div>
              <label className="label">Region</label>
              <select value={form.region} onChange={(e)=>setForm({...form,region:e.target.value})} className="input">
                {REGIONS.slice(1).map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} className="input">
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Rating (1–5)</label>
              <input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={(e)=>setForm({...form,rating:e.target.value})} className="input" />
            </div>
            <div>
              <label className="label">On-Time Rate (%)</label>
              <input type="number" min="0" max="100" value={form.onTimeRate} onChange={(e)=>setForm({...form,onTimeRate:e.target.value})} className="input" />
            </div>
            <div>
              <label className="label">Total Orders</label>
              <input type="number" value={form.totalOrders} onChange={(e)=>setForm({...form,totalOrders:e.target.value})} className="input" />
            </div>
            <div>
              <label className="label">Contract Expiry</label>
              <input type="date" value={form.contractExpiry} onChange={(e)=>setForm({...form,contractExpiry:e.target.value})} className="input" />
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})} className="input">
                {['Active','Inactive','Under Review'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Payment Terms</label>
              <select value={form.paymentTerms} onChange={(e)=>setForm({...form,paymentTerms:e.target.value})} className="input">
                {['Net 15','Net 30','Net 45','Immediate'].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : editItem ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={handleDelete}
        title="Remove Supplier" message="This will permanently remove the supplier from the directory." />
    </div>
  );
}

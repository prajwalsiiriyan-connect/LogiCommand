import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Route, Zap, Clock, Fuel, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { routeAPI } from '../services/api';
import { Badge, Modal, ConfirmModal, EmptyState, SearchBar, FilterSelect } from '../components/UI/index.jsx';
import { useToast } from '../context/ToastContext';

const CITIES   = ['Mumbai','Delhi','Bangalore','Chennai','Kolkata','Hyderabad','Pune','Ahmedabad','Surat','Jaipur','Lucknow','Kochi','Nagpur','Indore'];
const CARRIERS = ['FedEx Logistics','DHL Express','Blue Dart','DTDC Courier','Ekart Logistics','Delhivery','Gati KWE'];
const VEHICLES = ['Truck 20T','Mini Truck 5T','Container 40ft','Rail Freight','Air Cargo','Refrigerated Van'];

const EMPTY = { origin: 'Mumbai', destination: 'Delhi', carrier: CARRIERS[0], distance: '', estimatedTime: '', fuelCost: '', totalCost: '', status: 'Active', vehicleType: VEHICLES[0], co2Emission: '' };

export default function RoutesPage() {
  const [routes,     setRoutes]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [statusF,    setStatusF]    = useState('All');
  const [modal,      setModal]      = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    routeAPI.getAll({ status: statusF === 'All' ? '' : statusF, search })
      .then(({ data }) => setRoutes(data.routes || []))
      .catch(() => toast.error('Failed to load routes'))
      .finally(() => setLoading(false));
  }, [statusF, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (r)  => { setEditItem(r); setForm({ ...r }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await routeAPI.update(editItem._id, form); toast.success('Route updated!'); }
      else          { await routeAPI.create(form);               toast.success('Route created!'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await routeAPI.remove(confirmDel); toast.success('Route deleted'); setConfirmDel(null); load(); }
    catch { toast.error('Delete failed'); }
  };

  const recommended = routes.filter((r) => r.status === 'Recommended' || r.efficiency >= 80).slice(0, 3);
  const chartData   = routes.slice(0, 8).map((r) => ({ name: `${r.origin}→${r.destination}`.substring(0, 14), efficiency: r.efficiency, fuelCost: r.fuelCost, distance: r.distance }));

  // Simulated map nodes
  const mapNodes = [
    { city: 'Mumbai',    x: 15,  y: 55 },
    { city: 'Delhi',     x: 42,  y: 18 },
    { city: 'Bangalore', x: 38,  y: 72 },
    { city: 'Chennai',   x: 50,  y: 78 },
    { city: 'Kolkata',   x: 72,  y: 35 },
    { city: 'Hyderabad', x: 45,  y: 58 },
    { city: 'Pune',      x: 22,  y: 58 },
    { city: 'Ahmedabad', x: 20,  y: 35 },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Routes',    val: routes.length,                          icon: Route,    cls: '' },
          { label: 'Active Routes',   val: routes.filter(r=>r.status==='Active').length, icon: Zap, cls: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Avg Efficiency',  val: routes.length ? Math.round(routes.reduce((a,r)=>a+r.efficiency,0)/routes.length)+'%' : '—', icon: TrendingUp, cls: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Avg Fuel Cost',   val: routes.length ? `₹${Math.round(routes.reduce((a,r)=>a+r.fuelCost,0)/routes.length).toLocaleString()}` : '—', icon: Fuel, cls: 'bg-amber-50 border-amber-200 text-amber-700' },
        ].map(({ label, val, icon: Icon, cls }) => (
          <div key={label} className={`card flex items-center gap-4 border ${cls || 'border-slate-100'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cls ? cls.split(' ')[0]+' '+cls.split(' ')[1] : 'bg-slate-100'}`}>
              <Icon size={18} className="opacity-70" />
            </div>
            <div>
              <p className="text-xs font-semibold text-current opacity-60">{label}</p>
              <p className="text-xl font-bold">{val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended routes */}
      {recommended.length > 0 && (
        <div className="card border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <h3 className="font-bold text-slate-800">AI Recommended Routes</h3>
            <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full ml-auto">Optimized</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recommended.map((r) => (
              <div key={r._id} className="bg-white rounded-xl border border-emerald-100 p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{r.routeId}</span>
                  <span className="text-xs font-bold text-emerald-600">{r.efficiency}% efficient</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{r.origin} → {r.destination}</p>
                <p className="text-xs text-slate-500 mt-1">{r.carrier}</p>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-50 text-center">
                  <div><p className="text-xs font-bold text-slate-700">{r.distance} km</p><p className="text-[10px] text-slate-400">Distance</p></div>
                  <div><p className="text-xs font-bold text-slate-700">{r.estimatedTime}</p><p className="text-[10px] text-slate-400">Est. Time</p></div>
                  <div><p className="text-xs font-bold text-emerald-600">₹{r.fuelCost?.toLocaleString()}</p><p className="text-[10px] text-slate-400">Fuel Cost</p></div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400">Efficiency</span>
                    <span className="text-[10px] font-bold text-emerald-600">{r.efficiency}%</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 rounded-full h-1.5 transition-all" style={{ width: `${r.efficiency}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts + Map */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Efficiency chart */}
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4">Route Efficiency Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
              <Tooltip formatter={(v, n) => [n === 'efficiency' ? `${v}%` : `₹${v}`, n === 'efficiency' ? 'Efficiency' : 'Fuel Cost']} />
              <Bar dataKey="efficiency" name="efficiency" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Simulated route map */}
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4">Route Network Map (India)</h3>
          <div className="relative bg-gradient-to-br from-blue-50 to-slate-100 rounded-xl overflow-hidden" style={{ height: 220 }}>
            {/* SVG network */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Route lines */}
              {routes.slice(0, 6).map((r, i) => {
                const o = mapNodes.find(n => n.city === r.origin);
                const d = mapNodes.find(n => n.city === r.destination);
                if (!o || !d) return null;
                return (
                  <line key={i} x1={o.x} y1={o.y} x2={d.x} y2={d.y}
                    stroke={r.status === 'Recommended' ? '#10b981' : '#3b82f6'}
                    strokeWidth="0.8" strokeDasharray={r.status === 'Active' ? '' : '2,1'} opacity="0.6" />
                );
              })}
            </svg>
            {/* City nodes */}
            {mapNodes.map((n) => (
              <div key={n.city} className="absolute transform -translate-x-1/2 -translate-y-1/2"
                   style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                <div className="w-3 h-3 rounded-full bg-primary-600 border-2 border-white shadow-md" />
                <span className="absolute left-3.5 top-0 text-[9px] font-bold text-slate-600 whitespace-nowrap">{n.city}</span>
              </div>
            ))}
            <div className="absolute bottom-2 right-2 flex items-center gap-3 bg-white/80 backdrop-blur rounded-lg px-3 py-1.5">
              <div className="flex items-center gap-1"><div className="w-4 h-0.5 bg-emerald-500" /><span className="text-[10px] text-slate-500">Recommended</span></div>
              <div className="flex items-center gap-1"><div className="w-4 h-0.5 bg-blue-500" /><span className="text-[10px] text-slate-500">Active</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Routes table */}
      <div className="card">
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search routes…" />
          <FilterSelect value={statusF} onChange={setStatusF} options={['All','Active','Inactive','Recommended'].map(v=>({value:v,label:v}))} />
          <div className="ml-auto flex gap-2">
            <button className="btn-secondary" onClick={load}><RefreshCw size={15} />Refresh</button>
            <button className="btn-primary"   onClick={openCreate}><Plus size={15} />Add Route</button>
          </div>
        </div>

        {loading ? <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        : routes.length === 0 ? <EmptyState icon={Route} title="No routes configured" />
        : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Route ID</th><th>Origin → Dest</th><th>Carrier</th><th>Distance</th><th>Est. Time</th><th>Fuel Cost</th><th>Total Cost</th><th>Efficiency</th><th>Vehicle</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr key={r._id}>
                    <td><span className="font-mono text-xs font-semibold text-slate-500">{r.routeId}</span></td>
                    <td className="text-xs font-medium text-slate-800">{r.origin} → {r.destination}</td>
                    <td className="text-xs text-slate-500">{r.carrier}</td>
                    <td className="text-xs font-semibold text-slate-700">{r.distance} km</td>
                    <td className="text-xs text-slate-500"><div className="flex items-center gap-1"><Clock size={11} />{r.estimatedTime}</div></td>
                    <td className="text-xs font-semibold text-amber-600">₹{r.fuelCost?.toLocaleString()}</td>
                    <td className="text-xs font-semibold text-slate-700">₹{r.totalCost?.toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${r.efficiency >= 80 ? 'bg-emerald-500' : r.efficiency >= 60 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${r.efficiency}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{r.efficiency}%</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-500">{r.vehicleType}</td>
                    <td><Badge label={r.status} /></td>
                    <td>
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(r)} className="text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg font-medium">Edit</button>
                        <button onClick={() => setConfirmDel(r._id)} className="text-xs text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Edit Route' : 'Add Route'} width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Origin</label>
              <select value={form.origin} onChange={(e)=>setForm({...form,origin:e.target.value})} className="input">
                {CITIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">Destination</label>
              <select value={form.destination} onChange={(e)=>setForm({...form,destination:e.target.value})} className="input">
                {CITIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">Carrier</label>
              <select value={form.carrier} onChange={(e)=>setForm({...form,carrier:e.target.value})} className="input">
                {CARRIERS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">Vehicle Type</label>
              <select value={form.vehicleType} onChange={(e)=>setForm({...form,vehicleType:e.target.value})} className="input">
                {VEHICLES.map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
            {[['distance','Distance (km)','number'],['estimatedTime','Estimated Time (e.g. 14h 30m)'],['fuelCost','Fuel Cost (₹)','number'],['totalCost','Total Cost (₹)','number'],['co2Emission','CO₂ Emission (kg)','number']].map(([k,l,t='text'])=>(
              <div key={k}><label className="label">{l}</label>
                <input type={t} value={form[k]||''} onChange={(e)=>setForm({...form,[k]:e.target.value})} className="input" />
              </div>
            ))}
            <div><label className="label">Status</label>
              <select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})} className="input">
                {['Active','Inactive','Recommended'].map(s=><option key={s}>{s}</option>)}
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
        title="Delete Route" message="This will permanently remove this route configuration." />
    </div>
  );
}

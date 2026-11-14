import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Package, MapPin } from 'lucide-react';
import { shipmentAPI } from '../services/api';
import { Badge, Modal, ConfirmModal, PageLoader, SearchBar, FilterSelect, EmptyState } from '../components/UI/index.jsx';
import { useToast } from '../context/ToastContext';

const STATUS_OPTIONS = [
  { value: 'All',        label: 'All Statuses' },
  { value: 'In Transit', label: 'In Transit' },
  { value: 'Delivered',  label: 'Delivered' },
  { value: 'Delayed',    label: 'Delayed' },
  { value: 'Pending',    label: 'Pending' },
];
const CARRIERS = ['FedEx Logistics','DHL Express','Blue Dart','DTDC Courier','Ekart Logistics','XpressBees','Delhivery','Gati KWE'];
const CITIES   = ['Mumbai','Delhi','Bangalore','Chennai','Kolkata','Hyderabad','Pune','Ahmedabad','Surat','Jaipur','Lucknow','Kochi'];

const EMPTY = {
  origin: '', destination: '', carrier: '', weight: '', status: 'Pending',
  estimatedDelivery: '', currentLocation: '', customer: '', value: '', priority: 'Medium',
};

function ShipmentForm({ form, setForm, onSubmit, loading, edit }) {
  const field = (k, label, type = 'text', opts = null) => (
    <div key={k}>
      <label className="label">{label}</label>
      {opts
        ? <select value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="input">
            {opts.map((o) => <option key={o}>{o}</option>)}
          </select>
        : <input type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                 className="input" required={['origin','destination','carrier','weight','estimatedDelivery'].includes(k)} />
      }
    </div>
  );
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {field('origin',            'Origin City',       'text', CITIES)}
        {field('destination',       'Destination City',  'text', CITIES)}
        {field('carrier',           'Carrier',           'text', CARRIERS)}
        {field('weight',            'Weight (kg)',       'number')}
        {field('estimatedDelivery', 'Est. Delivery',    'date')}
        {field('currentLocation',   'Current Location', 'text', CITIES)}
        {field('customer',          'Customer Name')}
        {field('value',             'Shipment Value (₹)', 'number')}
        {field('status', 'Status', 'text', ['Pending','In Transit','Delivered','Delayed'])}
        {field('priority','Priority','text', ['Low','Medium','High','Critical'])}
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : edit ? 'Update Shipment' : 'Create Shipment'}
        </button>
      </div>
    </form>
  );
}

export default function Shipments() {
  const [shipments,  setShipments]  = useState([]);
  const [stats,      setStats]      = useState({});
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [statusF,    setStatusF]    = useState('All');
  const [modal,      setModal]      = useState(false);
  const [detailModal,setDetailModal]= useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [editItem,   setEditItem]   = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      shipmentAPI.getAll({ status: statusF === 'All' ? '' : statusF, search }),
      shipmentAPI.getStats(),
    ]).then(([{ data }, { data: s }]) => {
      setShipments(data.shipments || []);
      setStats(s);
    }).catch(() => toast.error('Failed to load shipments'))
      .finally(() => setLoading(false));
  }, [statusF, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (s)  => { setEditItem(s); setForm({ ...s, weight: s.weight, value: s.value, estimatedDelivery: s.estimatedDelivery?.split('T')[0] || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await shipmentAPI.update(editItem._id, form); toast.success('Shipment updated!'); }
      else          { await shipmentAPI.create(form);               toast.success('Shipment created!'); }
      setModal(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await shipmentAPI.remove(confirmDel);
      toast.success('Shipment deleted');
      setConfirmDel(null); load();
    } catch { toast.error('Delete failed'); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',      val: stats.total,      cls: 'border-slate-200 text-slate-700' },
          { label: 'In Transit', val: stats.inTransit,  cls: 'border-blue-200 text-blue-700 bg-blue-50' },
          { label: 'Delivered',  val: stats.delivered,  cls: 'border-green-200 text-green-700 bg-green-50' },
          { label: 'Delayed',    val: stats.delayed,    cls: 'border-red-200 text-red-700 bg-red-50' },
        ].map(({ label, val, cls }) => (
          <div key={label} className={`card flex items-center justify-between border ${cls}`}>
            <span className="text-sm font-semibold">{label}</span>
            <span className="text-2xl font-bold">{val ?? '—'}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search shipments…" />
          <FilterSelect value={statusF} onChange={setStatusF} options={STATUS_OPTIONS} />
          <div className="ml-auto flex gap-2">
            <button className="btn-secondary" onClick={load}><RefreshCw size={15} />Refresh</button>
            <button className="btn-primary"   onClick={openCreate}><Plus size={15} />New Shipment</button>
          </div>
        </div>

        {/* Table */}
        {loading ? <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        : shipments.length === 0 ? <EmptyState icon={Package} title="No shipments found" subtitle="Try changing your filters" />
        : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Shipment ID</th><th>Origin</th><th>Destination</th><th>Carrier</th>
                  <th>Weight</th><th>Status</th><th>Est. Delivery</th><th>Location</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <button onClick={() => setDetailModal(s)}
                              className="font-mono text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded hover:bg-primary-100">
                        {s.shipmentId}
                      </button>
                    </td>
                    <td className="text-xs">{s.origin}</td>
                    <td className="text-xs">{s.destination}</td>
                    <td className="text-xs text-slate-600">{s.carrier}</td>
                    <td className="text-xs">{s.weight} kg</td>
                    <td><Badge label={s.status} /></td>
                    <td className="text-xs text-slate-500">{fmtDate(s.estimatedDelivery)}</td>
                    <td>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={11} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[100px]">{s.currentLocation || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(s)} className="text-xs text-primary-600 hover:text-primary-800 font-medium bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition-colors">Edit</button>
                        <button onClick={() => setConfirmDel(s._id)} className="text-xs text-red-500 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Edit Shipment' : 'New Shipment'} width="max-w-2xl">
        <ShipmentForm form={form} setForm={setForm} onSubmit={handleSubmit} loading={saving} edit={!!editItem} />
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title="Shipment Details" width="max-w-lg">
        {detailModal && (
          <div className="space-y-3">
            {[
              ['Shipment ID', detailModal.shipmentId],
              ['Origin',      detailModal.origin],
              ['Destination', detailModal.destination],
              ['Carrier',     detailModal.carrier],
              ['Weight',      `${detailModal.weight} kg`],
              ['Status',      null],
              ['Priority',    null],
              ['Est. Delivery', fmtDate(detailModal.estimatedDelivery)],
              ['Current Location', detailModal.currentLocation],
              ['Customer',    detailModal.customer],
              ['Value',       `₹${Number(detailModal.value || 0).toLocaleString('en-IN')}`],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
                {label === 'Status'   ? <Badge label={detailModal.status}   />
                : label === 'Priority'? <Badge label={detailModal.priority} />
                : <span className="text-sm font-medium text-slate-700">{val}</span>
                }
              </div>
            ))}
            <div className="pt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Tracking Events</p>
              {detailModal.trackingEvents?.length
                ? detailModal.trackingEvents.map((ev, i) => (
                  <div key={i} className="flex gap-3 mb-2">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 mt-1" />
                      {i < detailModal.trackingEvents.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                    </div>
                    <div className="pb-2">
                      <p className="text-xs font-semibold text-slate-700">{ev.location}</p>
                      <p className="text-[11px] text-slate-400">{ev.status} · {new Date(ev.timestamp).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))
                : <p className="text-xs text-slate-400">No tracking events</p>
              }
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm delete */}
      <ConfirmModal
        open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={handleDelete}
        title="Delete Shipment" message="Are you sure you want to delete this shipment? This action cannot be undone."
      />
    </div>
  );
}

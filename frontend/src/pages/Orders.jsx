import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, ShoppingCart } from 'lucide-react';
import { orderAPI } from '../services/api';
import { Badge, Modal, ConfirmModal, EmptyState, SearchBar, FilterSelect } from '../components/UI/index.jsx';
import { useToast } from '../context/ToastContext';

const STATUS_OPTIONS = ['All','Pending','Processing','Shipped','Delivered','Cancelled'];
const PRODUCTS = ['Industrial Motor 5HP','LED Display Panel 32"','Hydraulic Pump Unit','Laptop Core i7','Server Rack 42U','Network Switch 48-Port','Automotive Brake Pads','Paracetamol 500mg Tabs','Organic Rice 50kg','Cotton Fabric Roll'];
const STAFF    = ['Arun Kumar','Priya Sharma','Rahul Verma','Sunita Patel','Vikram Singh','Meera Nair','Arjun Das','Kavitha Rao'];

const EMPTY = { customer: '', product: PRODUCTS[0], quantity: '', value: '', status: 'Pending', assignedTo: STAFF[0], deliveryDate: '', shippingAddress: '', notes: '', priority: 'Medium' };

export default function Orders() {
  const [orders,     setOrders]     = useState([]);
  const [stats,      setStats]      = useState({});
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
    Promise.all([
      orderAPI.getAll({ status: statusF === 'All' ? '' : statusF, search }),
      orderAPI.getStats(),
    ]).then(([{ data }, { data: s }]) => {
      setOrders(data.orders || []);
      setStats(s);
    }).catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [statusF, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (o)  => { setEditItem(o);  setForm({ ...o, deliveryDate: o.deliveryDate?.split('T')[0] || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await orderAPI.update(editItem._id, form); toast.success('Order updated!'); }
      else          { await orderAPI.create(form);               toast.success('Order created!'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await orderAPI.remove(confirmDel); toast.success('Order deleted'); setConfirmDel(null); load(); }
    catch { toast.error('Delete failed'); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fmtVal  = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total',       val: stats.total,      cls: '' },
          { label: 'Pending',     val: stats.pending,    cls: 'bg-amber-50  border-amber-200  text-amber-700' },
          { label: 'Processing',  val: stats.processing, cls: 'bg-purple-50 border-purple-200 text-purple-700' },
          { label: 'Shipped',     val: stats.shipped,    cls: 'bg-blue-50   border-blue-200   text-blue-700' },
          { label: 'Delivered',   val: stats.delivered,  cls: 'bg-green-50  border-green-200  text-green-700' },
          { label: 'Cancelled',   val: stats.cancelled,  cls: 'bg-slate-50  border-slate-200  text-slate-500' },
        ].map(({ label, val, cls }) => (
          <div key={label} className={`card flex flex-col items-center py-3 border ${cls || 'border-slate-100'}`}>
            <span className="text-xl font-bold">{val ?? '—'}</span>
            <span className="text-xs font-semibold text-current opacity-70 mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      {/* Revenue banner */}
      <div className="card bg-gradient-to-r from-primary-700 to-primary-500 border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-200 text-xs font-semibold uppercase tracking-wide">Total Revenue (ex. cancelled)</p>
            <p className="text-white text-3xl font-bold mt-1">{fmtVal(stats.totalRevenue)}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
            <ShoppingCart size={26} className="text-white" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search orders…" />
          <FilterSelect value={statusF} onChange={setStatusF} options={STATUS_OPTIONS.map(v => ({ value: v, label: v }))} />
          <div className="ml-auto flex gap-2">
            <button className="btn-secondary" onClick={load}><RefreshCw size={15} />Refresh</button>
            <button className="btn-primary"   onClick={openCreate}><Plus size={15} />New Order</button>
          </div>
        </div>

        {loading ? <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        : orders.length === 0 ? <EmptyState icon={ShoppingCart} title="No orders found" />
        : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Value</th><th>Assigned To</th><th>Order Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td><span className="font-mono text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">{o.orderId}</span></td>
                    <td className="text-xs font-medium text-slate-700">{o.customer}</td>
                    <td className="text-xs text-slate-600 max-w-[140px] truncate">{o.product}</td>
                    <td className="text-xs font-semibold text-slate-700">{o.quantity}</td>
                    <td className="text-xs font-semibold text-emerald-600">{fmtVal(o.value)}</td>
                    <td className="text-xs text-slate-500">{o.assignedTo}</td>
                    <td className="text-xs text-slate-400">{fmtDate(o.orderDate)}</td>
                    <td><Badge label={o.status} /></td>
                    <td>
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(o)} className="text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg font-medium">Edit</button>
                        <button onClick={() => setConfirmDel(o._id)} className="text-xs text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg font-medium">Delete</button>
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
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Edit Order' : 'New Order'} width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Customer Name</label>
              <input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Product</label>
              <select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className="input">
                {PRODUCTS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Quantity</label>
              <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Order Value (₹)</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                {STATUS_OPTIONS.slice(1).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Assigned To</label>
              <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="input">
                {STAFF.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Delivery Date</label>
              <input type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input">
                {['Low','Medium','High'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Shipping Address</label>
              <input value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input resize-none" rows={2} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : editItem ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={handleDelete}
        title="Delete Order" message="This will permanently delete the order. This cannot be undone." />
    </div>
  );
}

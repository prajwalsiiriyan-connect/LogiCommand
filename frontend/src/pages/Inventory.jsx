import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Archive } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { inventoryAPI } from '../services/api';
import { Badge, Modal, ConfirmModal, EmptyState, SearchBar, FilterSelect } from '../components/UI/index.jsx';
import { useToast } from '../context/ToastContext';

const WAREHOUSES = ['All','Mumbai Warehouse A','Delhi Central Hub','Bangalore Facility B','Chennai Port Depot','Kolkata East Yard','Hyderabad Tech Park'];
const CATEGORIES = ['All','Electronics','Automotive','FMCG','Pharmaceuticals','Textiles','Industrial Equipment','Food & Beverage','Chemicals'];
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'];

const EMPTY = { sku: '', productName: '', category: 'Electronics', warehouse: 'Mumbai Warehouse A', stockQty: '', reorderLevel: '', unitPrice: '', supplier: '' };

export default function Inventory() {
  const [items,      setItems]     = useState([]);
  const [stats,      setStats]     = useState({});
  const [loading,    setLoading]   = useState(true);
  const [search,     setSearch]    = useState('');
  const [statusF,    setStatusF]   = useState('All');
  const [warehouse,  setWarehouse] = useState('All');
  const [modal,      setModal]     = useState(false);
  const [editItem,   setEditItem]  = useState(null);
  const [confirmDel, setConfirmDel]= useState(null);
  const [form,       setForm]      = useState(EMPTY);
  const [saving,     setSaving]    = useState(false);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      inventoryAPI.getAll({ status: statusF === 'All' ? '' : statusF, warehouse: warehouse === 'All' ? '' : warehouse, search }),
      inventoryAPI.getStats(),
    ]).then(([{ data }, { data: s }]) => {
      setItems(data.items || []);
      setStats(s);
    }).catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false));
  }, [statusF, warehouse, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (i)  => { setEditItem(i); setForm({ ...i }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await inventoryAPI.update(editItem._id, form); toast.success('Item updated!'); }
      else          { await inventoryAPI.create(form);               toast.success('Item created!'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await inventoryAPI.remove(confirmDel); toast.success('Item deleted'); setConfirmDel(null); load(); }
    catch { toast.error('Delete failed'); }
  };

  const pieData = (stats.categoryStats || []).map((c) => ({ name: c._id, value: c.count }));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total SKUs',   val: stats.total,      cls: '' },
          { label: 'In Stock',     val: stats.inStock,    cls: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Low Stock',    val: stats.lowStock,   cls: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Out of Stock', val: stats.outOfStock, cls: 'bg-red-50 border-red-200 text-red-700' },
        ].map(({ label, val, cls }) => (
          <div key={label} className={`card flex items-center justify-between border ${cls || 'border-slate-100'}`}>
            <span className="text-sm font-semibold">{label}</span>
            <span className="text-2xl font-bold">{val ?? '—'}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4">Stock by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [v, 'Items']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4">Warehouse Utilization</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.warehouseStats || []} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} width={120} />
              <Tooltip />
              <Bar dataKey="totalStock" name="Total Stock" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table card */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search SKU, product…" />
          <FilterSelect value={statusF}   onChange={setStatusF}   options={['All','In Stock','Low Stock','Out of Stock'].map(v => ({ value: v, label: v }))} />
          <FilterSelect value={warehouse} onChange={setWarehouse} options={WAREHOUSES.map(v => ({ value: v, label: v }))} />
          <div className="ml-auto flex gap-2">
            <button className="btn-secondary" onClick={load}><RefreshCw size={15} />Refresh</button>
            <button className="btn-primary"   onClick={openCreate}><Plus size={15} />Add Item</button>
          </div>
        </div>

        {loading ? <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        : items.length === 0 ? <EmptyState icon={Archive} title="No inventory items" subtitle="Add your first item" />
        : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>SKU</th><th>Product Name</th><th>Category</th><th>Warehouse</th><th>Stock Qty</th><th>Reorder Level</th><th>Unit Price</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td><span className="font-mono text-xs font-semibold text-slate-600">{item.sku}</span></td>
                    <td className="font-medium text-slate-800 text-xs">{item.productName}</td>
                    <td><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{item.category}</span></td>
                    <td className="text-xs text-slate-500">{item.warehouse}</td>
                    <td>
                      <span className={`text-sm font-bold ${item.stockQty === 0 ? 'text-red-600' : item.stockQty <= item.reorderLevel ? 'text-amber-600' : 'text-slate-800'}`}>
                        {item.stockQty.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">{item.reorderLevel}</td>
                    <td className="text-xs text-slate-600">₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                    <td><Badge label={item.status} /></td>
                    <td>
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(item)} className="text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition-colors font-medium">Edit</button>
                        <button onClick={() => setConfirmDel(item._id)} className="text-xs text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors font-medium">Delete</button>
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
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Edit Inventory Item' : 'Add Inventory Item'} width="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              ['sku', 'SKU Code'], ['productName', 'Product Name'],
              ['unitPrice', 'Unit Price (₹)', 'number'], ['stockQty', 'Stock Quantity', 'number'],
              ['reorderLevel', 'Reorder Level', 'number'], ['supplier', 'Supplier'],
            ].map(([k, label, type = 'text']) => (
              <div key={k}>
                <label className="label">{label}</label>
                <input type={type} value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                       className="input" required={['sku','productName','stockQty','reorderLevel'].includes(k)} />
              </div>
            ))}
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                {CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Warehouse</label>
              <select value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })} className="input">
                {WAREHOUSES.slice(1).map((w) => <option key={w}>{w}</option>)}
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
        title="Delete Inventory Item" message="This will permanently remove this item from inventory." />
    </div>
  );
}

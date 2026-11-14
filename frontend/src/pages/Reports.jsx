import React, { useState, useEffect } from 'react';
import { BarChart2, Download, TrendingUp, Package, DollarSign, Truck } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { dashboardAPI, shipmentAPI, orderAPI } from '../services/api';
import { PageLoader } from '../components/UI/index.jsx';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Generate realistic monthly data
function buildMonthly(base) {
  return months.slice(0, 7).map((m, i) => ({
    month: m,
    shipments: Math.max(5,  base.shipments  + Math.round((Math.random()-0.4)*10)),
    orders:    Math.max(5,  base.orders     + Math.round((Math.random()-0.4)*15)),
    revenue:   Math.max(0,  base.revenue    + Math.round((Math.random()-0.3)*500000)),
    delivered: Math.max(5,  base.delivered  + Math.round((Math.random()-0.3)*10)),
    delayed:   Math.max(0,  base.delayed    + Math.round((Math.random()-0.5)*5)),
  }));
}

const regionData = [
  { region: 'North India', shipments: 124, revenue: 4500000, onTime: 88 },
  { region: 'South India', shipments: 98,  revenue: 3800000, onTime: 92 },
  { region: 'West India',  shipments: 112, revenue: 5200000, onTime: 85 },
  { region: 'East India',  shipments: 67,  revenue: 2100000, onTime: 79 },
  { region: 'Central',     shipments: 43,  revenue: 1600000, onTime: 83 },
];

const deliveryPieData = [
  { name: 'On Time',  value: 68 },
  { name: 'Delayed',  value: 18 },
  { name: 'Early',    value: 14 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-card-hover border border-slate-100 px-4 py-3 text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium capitalize">
          {p.name}: {p.name === 'revenue' ? `₹${(p.value/100000).toFixed(1)}L` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const [monthly, setMonthly]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [period,  setPeriod]   = useState('7M');

  useEffect(() => {
    Promise.all([dashboardAPI.getOverview()])
      .then(([{ data }]) => {
        const m = data.monthlyData || [];
        if (m.length) setMonthly(m);
        else setMonthly(buildMonthly({ shipments: 20, orders: 30, revenue: 1500000, delivered: 18, delayed: 3 }));
      })
      .catch(() => setMonthly(buildMonthly({ shipments: 20, orders: 30, revenue: 1500000, delivered: 18, delayed: 3 })))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = (type) => {
    // Simulate export
    const content = type === 'csv'
      ? 'Month,Shipments,Orders,Revenue\n' + monthly.map(m=>`${m.month},${m.shipments},${m.orders},${m.revenue}`).join('\n')
      : JSON.stringify(monthly, null, 2);
    const blob = new Blob([content], { type: type === 'csv' ? 'text/csv' : 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = `logistics-report.${type}`; a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue  = monthly.reduce((a, m) => a + (m.revenue  || 0), 0);
  const totalShipments= monthly.reduce((a, m) => a + (m.shipments|| 0), 0);
  const totalOrders   = monthly.reduce((a, m) => a + (m.orders   || 0), 0);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {['7M','All'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${period === p ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {p === '7M' ? 'Last 7 Months' : 'All Time'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="btn-secondary text-xs">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => handleExport('json')} className="btn-secondary text-xs">
            <Download size={14} /> Export JSON
          </button>
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue',    val: `₹${(totalRevenue/100000).toFixed(1)}L`,    icon: DollarSign, cls: 'from-blue-600 to-blue-500' },
          { label: 'Total Shipments',  val: totalShipments,                              icon: Truck,      cls: 'from-emerald-600 to-emerald-500' },
          { label: 'Total Orders',     val: totalOrders,                                 icon: Package,    cls: 'from-violet-600 to-violet-500' },
        ].map(({ label, val, icon: Icon, cls }) => (
          <div key={label} className={`rounded-2xl bg-gradient-to-br ${cls} p-5 flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">{label}</p>
              <p className="text-white text-2xl font-bold mt-0.5">{val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-1">Shipment Volume Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Monthly shipment & order counts</p>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={monthly} margin={{ left: -15, right: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="shipments" name="shipments" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="orders"    name="orders"    stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-bold text-slate-800 mb-1">Revenue Analytics</h3>
          <p className="text-xs text-slate-400 mb-4">Monthly revenue breakdown</p>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={monthly} margin={{ left: -10, right: 5 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 4, fill: '#10b981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Delivery performance pie */}
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4">Delivery Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={deliveryPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}
                   label={({ name, value }) => `${value}%`}>
                {deliveryPieData.map((_, i) => <Cell key={i} fill={['#10b981','#ef4444','#3b82f6'][i]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {deliveryPieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: ['#10b981','#ef4444','#3b82f6'][i] }} />
                <span className="text-xs text-slate-500">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Region-wise analysis */}
        <div className="card xl:col-span-2">
          <h3 className="font-bold text-slate-800 mb-4">Region-wise Analysis</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Region</th><th>Shipments</th><th>Revenue</th><th>On-Time %</th><th>Performance</th></tr>
              </thead>
              <tbody>
                {regionData.map((r) => (
                  <tr key={r.region}>
                    <td className="text-xs font-semibold text-slate-700">{r.region}</td>
                    <td className="text-xs text-slate-600">{r.shipments}</td>
                    <td className="text-xs font-semibold text-emerald-600">₹{(r.revenue/100000).toFixed(1)}L</td>
                    <td className="text-xs font-semibold">{r.onTime}%</td>
                    <td className="w-32">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-primary-500 rounded-full h-1.5" style={{ width: `${r.onTime}%` }} />
                        </div>
                        <span className={`text-xs font-bold ${r.onTime >= 90 ? 'text-green-600' : r.onTime >= 80 ? 'text-amber-600' : 'text-red-500'}`}>{r.onTime >= 90 ? '🟢' : r.onTime >= 80 ? '🟡' : '🔴'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bar chart - carrier performance */}
      <div className="card">
        <h3 className="font-bold text-slate-800 mb-1">Monthly Delivery Status</h3>
        <p className="text-xs text-slate-400 mb-4">Delivered vs Delayed comparison</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthly} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="shipments" name="Total Shipments" fill="#3b82f6" radius={[4,4,0,0]} />
            <Bar dataKey="orders"    name="Orders"          fill="#10b981" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, CheckCircle, AlertTriangle, Archive,
  DollarSign, Truck, Users, Bell, ArrowUpRight, Clock, MapPin,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { dashboardAPI } from '../services/api';
import { StatCard, Badge, PageLoader, StarRating } from '../components/UI/index.jsx';

const fmt = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-card-hover border border-slate-100 px-4 py-3 text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.name === 'Revenue' ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    dashboardAPI.getOverview()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 30000);
    return () => clearInterval(iv);
  }, [fetchData]);

  if (loading) return <PageLoader />;
  if (!data)   return <p className="text-slate-500">Failed to load dashboard</p>;

  const { stats, recentShipments, recentAlerts, topSuppliers, monthlyData } = data;

  const statCards = [
    { title: 'Active Shipments',  value: stats.activeShipments,  icon: Package,      iconBg: 'bg-blue-50',   iconColor: 'text-blue-600',   trend: 8, trendLabel: 'vs last month' },
    { title: 'Orders Fulfilled',  value: stats.ordersFulfilled,  icon: CheckCircle,  iconBg: 'bg-green-50',  iconColor: 'text-green-600',  trend: 12 },
    { title: 'Delayed Shipments', value: stats.delayedShipments, icon: AlertTriangle,iconBg: 'bg-red-50',    iconColor: 'text-red-500',    trend: -3 },
    { title: 'Low Stock Items',   value: stats.lowStockItems,    icon: Archive,      iconBg: 'bg-amber-50',  iconColor: 'text-amber-600',  subtitle: 'Needs restock' },
    { title: 'Total Revenue',     value: fmt(stats.totalRevenue),icon: DollarSign,   iconBg: 'bg-emerald-50',iconColor: 'text-emerald-600',trend: 18 },
    { title: 'Active Suppliers',  value: stats.activeSuppliers,  icon: Users,        iconBg: 'bg-violet-50', iconColor: 'text-violet-600', subtitle: 'Partners' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map((card) => <StatCard key={card.title} {...card} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Shipments & Orders chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Shipments & Orders</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly volume — last 7 months</p>
            </div>
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gShip" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="shipments" name="Shipments" stroke="#3b82f6" strokeWidth={2} fill="url(#gShip)" dot={{ r: 3, fill: '#3b82f6' }} />
              <Area type="monotone" dataKey="orders"    name="Orders"    stroke="#8b5cf6" strokeWidth={2} fill="url(#gOrd)"  dot={{ r: 3, fill: '#8b5cf6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Revenue Analytics</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly revenue trend</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">+18% YoY</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent shipments */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Recent Shipments</h3>
            <a href="/shipments" className="text-xs text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </a>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Origin → Dest</th>
                  <th>Carrier</th>
                  <th>Status</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.map((s) => (
                  <tr key={s._id}>
                    <td><span className="font-mono text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">{s.shipmentId}</span></td>
                    <td>
                      <span className="text-slate-700 text-xs">{s.origin}</span>
                      <span className="text-slate-300 mx-1">→</span>
                      <span className="text-slate-700 text-xs">{s.destination}</span>
                    </td>
                    <td className="text-slate-600 text-xs">{s.carrier}</td>
                    <td><Badge label={s.status} /></td>
                    <td>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={11} className="text-slate-400" />
                        {s.currentLocation || '—'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: alerts + suppliers */}
        <div className="space-y-5">
          {/* Recent alerts */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Bell size={16} className="text-red-500" /> Active Alerts
              </h3>
              <a href="/alerts" className="text-xs text-primary-600 font-semibold hover:underline">View all</a>
            </div>
            <div className="space-y-2">
              {recentAlerts.map((a) => (
                <div key={a._id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    a.severity === 'Critical' ? 'bg-red-500' :
                    a.severity === 'High'     ? 'bg-orange-500' :
                    a.severity === 'Medium'   ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{a.type}</p>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">{a.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top suppliers */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Top Suppliers</h3>
              <a href="/suppliers" className="text-xs text-primary-600 font-semibold hover:underline">View all</a>
            </div>
            <div className="space-y-3">
              {topSuppliers.map((s, i) => (
                <div key={s._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold text-xs">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{s.supplierName}</p>
                    <StarRating value={s.rating} />
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-emerald-600">{s.onTimeRate}%</p>
                    <p className="text-[10px] text-slate-400">on-time</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

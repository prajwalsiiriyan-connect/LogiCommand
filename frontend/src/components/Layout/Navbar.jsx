import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown, LogOut, User, Settings, Wifi } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { alertAPI } from '../../services/api';

const PAGE_TITLES = {
  '/':          { title: 'Dashboard',      sub: 'Real-time supply chain overview' },
  '/shipments': { title: 'Shipment Tracking', sub: 'Monitor all active shipments' },
  '/inventory': { title: 'Inventory',      sub: 'Warehouse stock management' },
  '/orders':    { title: 'Orders',         sub: 'Order lifecycle management' },
  '/suppliers': { title: 'Suppliers',      sub: 'Supplier directory & analytics' },
  '/routes':    { title: 'Route Optimizer',sub: 'AI-powered route recommendations' },
  '/reports':   { title: 'Reports',        sub: 'Analytics & business intelligence' },
  '/alerts':    { title: 'Alerts',         sub: 'System notifications & alerts' },
};

export default function Navbar({ liveAlerts }) {
  const { user, logout }        = useAuth();
  const location                = useLocation();
  const navigate                = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showAlerts,  setShowAlerts]  = useState(false);
  const [alertCount,  setAlertCount]  = useState(0);
  const [alerts,      setAlerts]      = useState([]);
  const profileRef = useRef(null);
  const alertRef   = useRef(null);

  const page = PAGE_TITLES[location.pathname] || { title: 'LogiCommand', sub: '' };

  useEffect(() => {
    alertAPI.getAll({ status: 'Active' }).then(({ data }) => {
      setAlerts(data.alerts?.slice(0, 5) || []);
      setAlertCount(data.total || 0);
    }).catch(() => {});
  }, [liveAlerts]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (alertRef.current   && !alertRef.current.contains(e.target))   setShowAlerts(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const severityColor = (s) => {
    if (s === 'Critical') return 'bg-red-100 text-red-700';
    if (s === 'High')     return 'bg-orange-100 text-orange-700';
    if (s === 'Medium')   return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 sticky top-0 z-40">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-slate-800 leading-tight">{page.title}</h1>
        <p className="text-xs text-slate-400">{page.sub}</p>
      </div>

      {/* Live badge */}
      <div className="hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1">
        <Wifi size={12} className="text-green-500" />
        <span className="text-xs font-semibold text-green-600">LIVE</span>
      </div>

      {/* Alert bell */}
      <div className="relative" ref={alertRef}>
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center
                     hover:bg-slate-100 transition-colors"
        >
          <Bell size={17} className="text-slate-600" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white
                             flex items-center justify-center font-bold leading-none">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>
        {showAlerts && (
          <div className="absolute right-0 top-11 w-[360px] bg-white rounded-2xl shadow-modal border border-slate-100 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
              <p className="font-semibold text-slate-800 text-sm">Active Alerts</p>
              <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">{alertCount} Active</span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {alerts.length === 0
                ? <p className="text-sm text-slate-400 text-center py-6">No active alerts</p>
                : alerts.map((a) => (
                  <div key={a._id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${severityColor(a.severity)}`}>
                        {a.severity}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{a.type}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{a.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
            <button
              onClick={() => { navigate('/alerts'); setShowAlerts(false); }}
              className="w-full text-center text-xs font-semibold text-primary-600 hover:text-primary-700 py-3
                         border-t border-slate-50 hover:bg-primary-50 transition-colors"
            >
              View All Alerts →
            </button>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5
                     hover:bg-slate-100 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-700 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-400 capitalize leading-tight">{user?.role}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
        {showProfile && (
          <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-modal border border-slate-100 z-50 overflow-hidden py-1">
            <div className="px-4 py-3 border-b border-slate-50">
              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <User size={15} /> My Profile
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <Settings size={15} /> Settings
            </button>
            <div className="border-t border-slate-50 mt-1" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

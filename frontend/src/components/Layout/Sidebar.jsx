import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Archive, ShoppingCart, Users,
  Route, BarChart3, Bell, ChevronLeft, ChevronRight, Truck, Zap,
} from 'lucide-react';

const navItems = [
  { path: '/',          label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/shipments', label: 'Shipments',      icon: Package },
  { path: '/inventory', label: 'Inventory',      icon: Archive },
  { path: '/orders',    label: 'Orders',         icon: ShoppingCart },
  { path: '/suppliers', label: 'Suppliers',      icon: Users },
  { path: '/routes',    label: 'Route Optimizer',icon: Route },
  { path: '/reports',   label: 'Reports',        icon: BarChart3 },
  { path: '/alerts',    label: 'Alerts',         icon: Bell },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className={`sidebar-gradient flex flex-col h-screen transition-all duration-300 ease-in-out flex-shrink-0
                  ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
          <Truck size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-base leading-tight whitespace-nowrap">LogiCommand</p>
            <p className="text-primary-300 text-[10px] font-medium uppercase tracking-widest whitespace-nowrap">Supply Chain ERP</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5">
        {!collapsed && (
          <p className="text-primary-300/60 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">Navigation</p>
        )}
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Live indicator */}
      {!collapsed && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
            <div className="live-dot" />
            <span className="text-green-400 text-xs font-medium">Live Tracking Active</span>
            <Zap size={12} className="text-green-400 ml-auto" />
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="border-t border-white/10 p-2 flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white
                     hover:bg-white/10 rounded-xl py-2 transition-all duration-150 text-xs font-medium"
        >
          {collapsed
            ? <ChevronRight size={16} />
            : <><ChevronLeft size={16} /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}

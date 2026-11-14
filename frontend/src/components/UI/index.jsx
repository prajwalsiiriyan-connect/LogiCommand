import React from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

// ── Badge ────────────────────────────────────
const BADGE_COLORS = {
  // Shipment statuses
  'In Transit': 'bg-blue-100 text-blue-700 border-blue-200',
  'Delivered':  'bg-green-100 text-green-700 border-green-200',
  'Delayed':    'bg-red-100 text-red-700 border-red-200',
  'Pending':    'bg-amber-100 text-amber-700 border-amber-200',
  // Order statuses
  'Processing': 'bg-purple-100 text-purple-700 border-purple-200',
  'Shipped':    'bg-blue-100 text-blue-700 border-blue-200',
  'Cancelled':  'bg-slate-100 text-slate-500 border-slate-200',
  // Inventory
  'In Stock':     'bg-green-100 text-green-700 border-green-200',
  'Low Stock':    'bg-amber-100 text-amber-700 border-amber-200',
  'Out of Stock': 'bg-red-100 text-red-700 border-red-200',
  // Supplier
  'Active':       'bg-green-100 text-green-700 border-green-200',
  'Inactive':     'bg-slate-100 text-slate-500 border-slate-200',
  'Under Review': 'bg-amber-100 text-amber-700 border-amber-200',
  // Alerts
  'Critical': 'bg-red-100 text-red-700 border-red-200',
  'High':     'bg-orange-100 text-orange-700 border-orange-200',
  'Medium':   'bg-amber-100 text-amber-700 border-amber-200',
  'Low':      'bg-blue-100 text-blue-700 border-blue-200',
  'Resolved': 'bg-green-100 text-green-700 border-green-200',
  'Acknowledged': 'bg-purple-100 text-purple-700 border-purple-200',
  // Routes
  'Recommended': 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export function Badge({ label, size = 'sm' }) {
  const cls = BADGE_COLORS[label] || 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center border rounded-full font-semibold ${cls}
                      ${size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'}`}>
      {label}
    </span>
  );
}

// ── Modal ────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 'max-w-xl' }) {
  React.useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else       document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`modal-content bg-white rounded-2xl shadow-modal w-full ${width} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                       hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── StatCard ─────────────────────────────────
export function StatCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, trend, trendLabel }) {
  return (
    <div className="stat-card hover:shadow-card-hover transition-all duration-200 group">
      <div className={`icon-box ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5 counter-value">{value}</p>
        {(trend !== undefined || subtitle) && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend !== undefined && (
              <>
                {trend >= 0
                  ? <TrendingUp size={12} className="text-green-500" />
                  : <TrendingDown size={12} className="text-red-500" />
                }
                <span className={`text-xs font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend >= 0 ? '+' : ''}{trend}%
                </span>
              </>
            )}
            {trendLabel && <span className="text-xs text-slate-400">{trendLabel}</span>}
            {subtitle && !trendLabel && <span className="text-xs text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────
export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-5 h-5 border-2' : size === 'lg' ? 'w-12 h-12 border-4' : 'w-8 h-8 border-3';
  return (
    <div className={`${s} border-primary-500 border-t-transparent rounded-full animate-spin`} />
  );
}

// ── Full-page loader ──────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-400 font-medium">Loading data…</p>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────
export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-300" />
      </div>
      <p className="text-base font-semibold text-slate-500">{title}</p>
      {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

// ── Search + Filter bar ───────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative flex-1 max-w-sm">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="15" height="15"
           viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9"
      />
    </div>
  );
}

// ── Select filter ─────────────────────────────
export function FilterSelect({ value, onChange, options, className = '' }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
            className={`input w-auto ${className}`}>
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  );
}

// ── Confirm delete dialog ─────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, message }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </Modal>
  );
}

// ── Star rating ───────────────────────────────
export function StarRating({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width="14" height="14" viewBox="0 0 24 24"
             fill={star <= Math.round(value) ? '#f59e0b' : '#e2e8f0'}
             stroke={star <= Math.round(value) ? '#f59e0b' : '#cbd5e1'}
             strokeWidth="1">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

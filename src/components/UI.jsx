import React from 'react';

export function Badge({ variant = 'teal', children, className = '' }) {
  const v = {
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    gray: 'bg-gray-100 text-gray-500 border-gray-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return <span className={`badge ${v[variant] || v.teal} ${className}`}>{children}</span>;
}

export function Card({ children, noPad, className = '' }) {
  return <div className={`card ${className}`}>{noPad ? children : <div className="p-5">{children}</div>}</div>;
}

export function CardHeader({ title, icon, action, onAction }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
      <div className="flex items-center gap-2 text-sm font-medium text-navy-600">
        {icon && <i className={`ti ${icon} text-teal-500 text-base`} />}
        {title}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="text-xs text-teal-600 hover:text-teal-700 cursor-pointer bg-transparent border-none transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  );
}

export function StatCard({ icon, iconBg, value, label, badge, badgeVariant }) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base mb-1 ${iconBg}`}>
        <i className={`ti ${icon}`} />
      </div>
      <div className="font-display font-semibold text-2xl text-navy-600">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
      {badge && <Badge variant={badgeVariant} className="w-fit mt-0.5">{badge}</Badge>}
    </div>
  );
}

export function StatusDot({ status }) {
  const c = status === 'active' ? 'bg-red-400' : status === 'managed' ? 'bg-amber-400' : 'bg-gray-300';
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${c}`} />;
}

export function AlertBanner({ variant = 'red', icon, title, detail }) {
  const v = {
    red: 'bg-red-50 border-red-100 text-red-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    teal: 'bg-teal-50 border-teal-100 text-teal-700',
  };

  const ic = { red: 'text-red-500', amber: 'text-amber-500', teal: 'text-teal-600' };

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${v[variant]}`}>
      <i className={`ti ${icon} text-lg mt-0.5 flex-shrink-0 ${ic[variant]}`} />
      <div>
        <p className="text-sm font-medium">{title}</p>
        {detail && <p className="text-xs mt-0.5 opacity-75">{detail}</p>}
      </div>
    </div>
  );
}

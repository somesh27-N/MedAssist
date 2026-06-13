import React from 'react';
import { useApp } from '../context/AppContext';

const USER_NAV = [
  { s: 'Overview' },
  { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
  { id: 'summary', label: 'Health summary', icon: 'ti-activity' },
  { s: 'Records' },
  { id: 'medications', label: 'Medications', icon: 'ti-pill' },
  { id: 'diseases', label: 'Disease history', icon: 'ti-virus' },
  { id: 'surgeries', label: 'Surgeries', icon: 'ti-cut' },
  { id: 'reports', label: 'Reports & labs', icon: 'ti-report-medical' },
  { id: 'documents', label: 'Documents', icon: 'ti-file-text' },
  { s: 'Identity' },
  { id: 'insurance', label: 'Insurance & schemes', icon: 'ti-shield-check' },
  { id: 'emergency', label: 'Emergency contacts', icon: 'ti-phone-call' },
  { id: 'identity', label: 'Personal identity', icon: 'ti-id' },
  { id: 'access_control', label: 'Access control & logs', icon: 'ti-lock' },
  { s: 'Portals' },
  { id: 'doctor_view', label: 'Doctor portal', icon: 'ti-stethoscope' },
];

const HOSPITAL_NAV = [
  { s: 'Portal' },
  { id: 'hospital_view', label: 'Hospital Portal', icon: 'ti-building-hospital' },
];

export function Sidebar() {
  const { user, logout, view, setView } = useApp();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';

  const navItems = user?.role === 'hospital' ? HOSPITAL_NAV : USER_NAV;
  const roleLabel = user?.role === 'hospital' ? 'Hospital' : user?.role === 'doctor' ? 'Doctor' : 'Citizen';
  const displayName = user?.role === 'hospital' ? (user.name || 'City Hospital') : (user?.role === 'doctor' ? user.name : user?.name?.split(' ')[0]);

  return (
    <aside className="flex flex-col bg-navy-600 overflow-hidden" style={{ width: 220, minWidth: 220, height: '100vh' }}>
      <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex flex-col items-center justify-center gap-1">
          <img src="/logo.png" alt="MedAssist Logo" className="h-16 w-auto object-contain" />
          <p className="text-[8px] uppercase tracking-[2px] mt-0.5 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>Health Identity</p>
        </div>
      </div>

      <div className="mx-3 mt-3 flex-shrink-0 rounded-lg px-3 py-2 flex items-center gap-2.5" style={{ background: 'rgba(0,184,169,0.08)', border: '1px solid rgba(0,184,169,0.18)' }}>
        <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-xs text-white font-medium flex-shrink-0">{initials}</div>
        <div className="min-w-0">
          <p className="text-[10px] leading-none mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{roleLabel}</p>
          <p className="text-sm text-white font-medium leading-none truncate">{displayName}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2 mt-1">
        {navItems.filter(item => {
          if (user?.role === 'hospital') return true;
          if (user?.role !== 'doctor' && (item.id === 'doctor_view' || item.s === 'Portals')) {
            return false;
          }
          if (user?.role === 'doctor' && item.id === 'access_control') {
            return false;
          }
          return true;
        }).map((item, i) => {
          if (item.s) return <p key={i} className="text-[9px] uppercase tracking-[1.8px] font-medium px-3 pt-4 pb-1 first:pt-2" style={{ color: 'rgba(255,255,255,0.22)' }}>{item.s}</p>;
          return (
            <button key={item.id} onClick={() => setView(item.id)} className={`nav-item${view === item.id ? ' active' : ''}`}>
              <i className={`ti ${item.icon} text-base`} style={{ width: 18, textAlign: 'center' }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 flex-shrink-0 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {user?.role !== 'hospital' && (
          <div className="rounded-lg p-2.5 text-center cursor-pointer transition-colors" style={{ background: 'rgba(0,184,169,0.07)', border: '1px solid rgba(0,184,169,0.18)' }}>
            <i className="ti ti-qrcode text-teal-400 text-2xl block" />
            <p className="text-[10px] mt-1 flex items-center justify-center gap-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse-slow" />QR Auth Active
            </p>
          </div>
        )}
        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer border-none bg-transparent transition-all hover:opacity-80" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <i className="ti ti-logout text-sm" />Sign out
        </button>
      </div>
    </aside>
  );
}

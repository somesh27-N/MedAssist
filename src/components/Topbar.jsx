import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

const VIEW_TITLES = {
  dashboard: { title: 'Dashboard', sub: 'Your health at a glance' },
  summary: { title: 'Health Summary', sub: 'Full medical overview' },
  medications: { title: 'Medications', sub: 'Current & past prescriptions' },
  diseases: { title: 'Disease History', sub: 'All recorded conditions' },
  surgeries: { title: 'Surgeries', sub: 'Surgical history & hospitals' },
  reports: { title: 'Reports & Labs', sub: 'Test results & imaging' },
  documents: { title: 'Documents', sub: 'Uploaded health documents' },
  insurance: { title: 'Insurance & Schemes', sub: 'Ayushman, private & government' },
  emergency: { title: 'Emergency Contacts', sub: 'People to reach in a crisis' },
  identity: { title: 'Personal Identity', sub: 'DNR, organ donation & more' },
  doctor_view: { title: 'Doctor Portal', sub: 'Authenticated clinical view' },
  hospital_view: { title: 'Hospital Portal', sub: 'Admissions & Blood Bank Manager' },
  access_control: { title: 'Access Control & Logs', sub: 'Security & consent audit trail' },
};

export function Topbar() {
  const { user, view } = useApp();
  const info = VIEW_TITLES[view] || { title: 'MedAssist', sub: '' };
  
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const formatted = new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      setTimeStr(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';

  return (
    <header className="bg-gray-100 flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ borderBottom: '1px solid #e5e7eb' }}>
      <div>
        <h1 className="font-display font-semibold text-navy-600 text-base leading-tight">{info.title}</h1>
        <p className="text-xs text-gray-400 mt-0.5">{info.sub}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 hidden sm:block">{timeStr}</span>
        {user?.uid && <span className="bg-teal-50 text-teal-700 text-xs font-mono px-2.5 py-1 rounded-full border border-teal-100">UID: {user.uid}</span>}
        <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 0 3px rgba(52,211,153,0.2)' }} title="Verified" />
        <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-xs text-white font-medium">{initials}</div>
      </div>
    </header>
  );
}

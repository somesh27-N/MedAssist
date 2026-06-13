import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertBanner, StatCard, Card, CardHeader, Badge, StatusDot } from '../components/UI';

export function Dashboard() {
  const { user, setView } = useApp();

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {user.dnr && (
        <AlertBanner 
          variant="red" 
          icon="ti-alert-circle" 
          title="DNR order active" 
          detail="Do Not Resuscitate — documented 14 Jan 2025. Accessible to all QR-authenticated providers."
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="ti-drop" iconBg="bg-teal-50 text-teal-600" value={user.bloodGroup} label="Blood group" badge="Rh Positive" badgeVariant="teal"/>
        <StatCard icon="ti-pill" iconBg="bg-amber-50 text-amber-600" value={user.medications.length} label="Active medications" badge="Updated 3d ago" badgeVariant="amber"/>
        <StatCard icon="ti-virus" iconBg="bg-red-50 text-red-500" value={user.currentDiseases.length} label="Active conditions" badge="1 chronic" badgeVariant="red"/>
        <StatCard icon="ti-cut" iconBg="bg-purple-50 text-purple-600" value={user.surgeries.length} label="Past surgeries" badge="All documented" badgeVariant="purple"/>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card noPad>
          <CardHeader title="Current medications" icon="ti-pill" action="View all" onAction={() => setView('medications')}/>
          <div className="divide-y divide-gray-50">
            {user.medications.map(m => (
              <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-600 truncate">{m.name} <span className="font-normal text-gray-400">{m.dose}</span></p>
                  <p className="text-xs text-gray-400">{m.doctor} · {m.hospital}</p>
                </div>
                <Badge variant="teal">{m.frequency}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card noPad>
          <CardHeader title="Disease history" icon="ti-virus" action="Full history" onAction={() => setView('diseases')}/>
          <div className="divide-y divide-gray-50">
            {user.totalDiseases.slice(0, 4).map(d => (
              <div key={d.id} className="px-5 py-3 flex items-center gap-3">
                <StatusDot status={d.status}/>
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-600">{d.name}</p>
                  <p className="text-xs text-gray-400">Since {d.since} · {d.note}</p>
                </div>
                <Badge variant={d.status === 'active' ? 'red' : 'gray'}>{d.status === 'active' ? 'Active' : 'Resolved'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <Card noPad className="md:col-span-2">
          <CardHeader title="Surgical history" icon="ti-cut" action="Details" onAction={() => setView('surgeries')}/>
          <div className="divide-y divide-gray-50">
            {user.surgeries.slice(0, 3).map(s => (
              <div key={s.id} className="px-5 py-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-navy-600">{s.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.date} · {s.type}</p>
                  <p className="text-xs text-teal-600 mt-0.5">{s.hospital} · {s.doctor}</p>
                </div>
                <Badge variant="gray">{s.city}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card noPad>
          <CardHeader title="Identity" icon="ti-id" action="Edit" onAction={() => setView('identity')}/>
          <div className="px-5 py-4 grid grid-cols-2 gap-2">
            {[
              { k: 'DOB', v: user.dob },
              { k: 'Gender', v: user.gender },
              { k: 'Blood', v: user.bloodGroup },
              { k: 'Birthmark', v: user.birthmark, full: true },
              { k: 'DNR', v: user.dnr ? 'Active' : 'None', badge: user.dnr ? 'red' : 'gray' },
              { k: 'Organ donor', v: user.organDonor ? 'Yes' : 'No', badge: user.organDonor ? 'green' : 'gray' },
            ].map(({ k, v, badge, full }) => (
              <div key={k} className={`bg-gray-50 rounded-lg px-3 py-2.5 ${full ? 'col-span-2' : ''}`}>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{k}</p>
                {badge ? <Badge variant={badge} className="mt-1">{v}</Badge> : <p className="text-sm font-medium text-navy-600 mt-0.5 truncate">{v}</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card noPad>
          <CardHeader title="Emergency contacts" icon="ti-phone-call" action="Edit" onAction={() => setView('emergency')}/>
          <div className="px-5 py-4 space-y-2.5">
            {user.emergencyContacts.map(ec => (
              <div key={ec.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: '#FFFBF0', border: '1px solid #FEE5C0' }}>
                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
                  {ec.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-600">{ec.name}</p>
                  <p className="text-xs text-gray-400">{ec.relation}{ec.primary ? ' · Primary' : ''}</p>
                </div>
                <p className="text-xs text-amber-600 font-mono flex-shrink-0">{ec.phone}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card noPad>
          <CardHeader title="Insurance & schemes" icon="ti-shield-check" action="Details" onAction={() => setView('insurance')}/>
          <div className="px-5 py-4 space-y-1">
            {[
              { label: 'Ayushman Bharat', val: `Active · ${user.insurance.ayushman.cover}`, green: true },
              { label: 'Card number', val: user.insurance.ayushman.cardNo, mono: true },
              { label: 'Star Health', val: `Active till ${user.insurance.private.expiry}`, green: true },
              { label: 'Sum insured', val: user.insurance.private.cover },
              { label: 'Policy no.', val: user.insurance.private.policyNo, mono: true },
            ].map(({ label, val, green, mono }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-400">{label}</span>
                <span className={`text-xs font-medium ${green ? 'text-green-600' : 'text-navy-600'} ${mono ? 'font-mono' : ''}`}>{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card noPad>
        <CardHeader title="Recent documents & reports" icon="ti-file-text" action="Upload" onAction={() => setView('documents')}/>
        <div className="divide-y divide-gray-50">
          {user.reports.slice(0, 4).map(r => (
            <div key={r.id} onClick={() => setView('documents')} className="px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ti ti-file-text text-teal-500 text-base"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-600 truncate">{r.name}</p>
                <p className="text-xs text-gray-400">{r.lab} · {r.date} · {r.type} · {r.size}</p>
              </div>
              {r.verified && <Badge variant="green">Verified</Badge>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, Badge, AlertBanner } from '../components/UI';
import { QRPatientModal } from '../components/QRPatientModal';

export function IdentityView() {
  const { user, updateUser } = useApp();
  const [showQR, setShowQR] = useState(false);

  function Toggle({ on, onChange }) {
    return (
      <button 
        type="button"
        onClick={() => onChange(!on)} 
        className="toggle flex-shrink-0" 
        style={{ background: on ? '#00B8A9' : '#e5e7eb' }}
      >
        <span className="toggle-thumb" style={{ transform: on ? 'translateX(20px)' : 'translateX(2px)' }} />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {user.dnr && (
        <AlertBanner 
          variant="red" 
          icon="ti-alert-circle" 
          title="DNR order is active" 
          detail="Healthcare providers with QR access can see this. Contact your physician to modify."
        />
      )}
      
      <div className="grid md:grid-cols-2 gap-5">
        <Card noPad>
          <CardHeader title="Personal details" icon="ti-id" />
          <div className="px-5 py-4 grid grid-cols-2 gap-3">
            {[
              { k: 'Full name', v: user.name, full: true },
              { k: 'Date of birth', v: user.dob },
              { k: 'Gender', v: user.gender },
              { k: 'Blood group', v: user.bloodGroup, badge: 'teal' },
              { k: 'Address', v: user.address || 'Block 4B, Janakpuri, New Delhi' },
              { k: 'Birthmark', v: user.birthmark, full: true },
              { k: 'UID', v: user.uid, mono: true, full: true },
            ].map(({ k, v, badge, mono, full }) => (
              <div key={k} className={`bg-gray-50 rounded-lg px-3 py-2.5 ${full ? 'col-span-2' : ''}`}>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{k}</p>
                {badge ? <Badge variant={badge}>{v}</Badge> : <p className={`text-sm font-medium text-navy-600 ${mono ? 'font-mono' : ''}`}>{v}</p>}
              </div>
            ))}
          </div>
        </Card>

        <Card noPad>
          <CardHeader title="Directives & preferences" icon="ti-settings" />
          <div className="px-5 py-3 divide-y divide-gray-50">
            {[
              { 
                label: 'Do Not Resuscitate (DNR)', 
                desc: 'Instructs providers not to perform CPR if your heart or breathing stops.', 
                val: user.dnr, 
                fn: (val) => updateUser({ dnr: val }) 
              },
              { 
                label: 'Organ donation consent', 
                desc: 'Authorise donation of organs/tissues after death.', 
                val: user.organDonor, 
                fn: (val) => updateUser({ organDonor: val }) 
              },
              { 
                label: 'Save to local drive (public)', 
                desc: 'Allow QR-linked devices to locally cache your emergency data.', 
                val: user.localSave, 
                fn: (val) => updateUser({ localSave: val }) 
              },
            ].map(({ label, desc, val, fn }) => (
              <div key={label} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-medium text-navy-600">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <Toggle on={val} onChange={fn} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card noPad>
        <CardHeader title="QR authentication code" icon="ti-qrcode" />
        <div className="px-5 py-5 flex items-center gap-6">
          {/* Clickable QR — opens the full modal */}
          <button
            type="button"
            onClick={() => setShowQR(true)}
            className="relative group flex-shrink-0 cursor-pointer border-none p-0"
            style={{ background: 'transparent' }}
            title="Click to view & scan full QR"
          >
            <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-1 border border-gray-100/10 transition-transform group-hover:scale-105 group-hover:shadow-lg"
              style={{ boxShadow: '0 0 0 0 rgba(77,210,204,0)' }}
            >
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0a1628&data=${encodeURIComponent(
                  `Name: ${user.name}\nUID: ${user.uid}\nBlood: ${user.bloodGroup}\nDOB: ${user.dob}\nPhone: ${user.phone}`
                )}`} 
                alt="Health QR Code" 
                className="w-full h-full object-contain" 
              />
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(77,210,204,0.15)' }}>
              <i className="ti ti-zoom-in text-teal-400 text-xl" />
            </div>
          </button>

          <div className="flex-1">
            <p className="text-sm font-medium text-navy-600">Your health QR code</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">Authenticated doctors and government portals can scan this to access your health record. Access is logged and auditable.</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Badge variant="green"><i className="ti ti-check text-xs mr-1" />Verified by NHA</Badge>
              <Badge variant="teal"><i className="ti ti-shield text-xs mr-1" />Govt authenticated</Badge>
            </div>
            {/* Scan / Preview button */}
            <button
              type="button"
              onClick={() => setShowQR(true)}
              className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-none"
              style={{ background: 'rgba(77,210,204,0.12)', color: '#4DD2CC', border: '1px solid rgba(77,210,204,0.25)' }}
            >
              <i className="ti ti-qrcode text-sm" />
              Scan / Preview QR
            </button>
          </div>
        </div>
      </Card>

      {/* QR Patient Detail Modal */}
      {showQR && <QRPatientModal user={user} onClose={() => setShowQR(false)} />}
    </div>
  );
}


export function IdentityView() {
  const { user, updateUser } = useApp();

  function Toggle({ on, onChange }) {
    return (
      <button 
        type="button"
        onClick={() => onChange(!on)} 
        className="toggle flex-shrink-0" 
        style={{ background: on ? '#00B8A9' : '#e5e7eb' }}
      >
        <span className="toggle-thumb" style={{ transform: on ? 'translateX(20px)' : 'translateX(2px)' }} />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {user.dnr && (
        <AlertBanner 
          variant="red" 
          icon="ti-alert-circle" 
          title="DNR order is active" 
          detail="Healthcare providers with QR access can see this. Contact your physician to modify."
        />
      )}
      
      <div className="grid md:grid-cols-2 gap-5">
        <Card noPad>
          <CardHeader title="Personal details" icon="ti-id" />
          <div className="px-5 py-4 grid grid-cols-2 gap-3">
            {[
              { k: 'Full name', v: user.name, full: true },
              { k: 'Date of birth', v: user.dob },
              { k: 'Gender', v: user.gender },
              { k: 'Blood group', v: user.bloodGroup, badge: 'teal' },
              { k: 'Address', v: user.address || 'Block 4B, Janakpuri, New Delhi' },
              { k: 'Birthmark', v: user.birthmark, full: true },
              { k: 'UID', v: user.uid, mono: true, full: true },
            ].map(({ k, v, badge, mono, full }) => (
              <div key={k} className={`bg-gray-50 rounded-lg px-3 py-2.5 ${full ? 'col-span-2' : ''}`}>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{k}</p>
                {badge ? <Badge variant={badge}>{v}</Badge> : <p className={`text-sm font-medium text-navy-600 ${mono ? 'font-mono' : ''}`}>{v}</p>}
              </div>
            ))}
          </div>
        </Card>

        <Card noPad>
          <CardHeader title="Directives & preferences" icon="ti-settings" />
          <div className="px-5 py-3 divide-y divide-gray-50">
            {[
              { 
                label: 'Do Not Resuscitate (DNR)', 
                desc: 'Instructs providers not to perform CPR if your heart or breathing stops.', 
                val: user.dnr, 
                fn: (val) => updateUser({ dnr: val }) 
              },
              { 
                label: 'Organ donation consent', 
                desc: 'Authorise donation of organs/tissues after death.', 
                val: user.organDonor, 
                fn: (val) => updateUser({ organDonor: val }) 
              },
              { 
                label: 'Save to local drive (public)', 
                desc: 'Allow QR-linked devices to locally cache your emergency data.', 
                val: user.localSave, 
                fn: (val) => updateUser({ localSave: val }) 
              },
            ].map(({ label, desc, val, fn }) => (
              <div key={label} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-medium text-navy-600">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <Toggle on={val} onChange={fn} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card noPad>
        <CardHeader title="QR authentication code" icon="ti-qrcode" />
        <div className="px-5 py-5 flex items-center gap-6">
          <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center flex-shrink-0 p-1 border border-gray-100/10">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0a1628&data=${encodeURIComponent(
                `Name: ${user.name}\nUID: ${user.uid}\nPhone: ${user.phone}\nBlood: ${user.bloodGroup}\nDOB: ${user.dob}\nAddress: ${user.address || 'Block 4B, Janakpuri, New Delhi'}`
              )}`} 
              alt="Health QR Code" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <p className="text-sm font-medium text-navy-600">Your health QR code</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">Authenticated doctors and government portals can scan this to access your health record. Access is logged and auditable.</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Badge variant="green"><i className="ti ti-check text-xs mr-1" />Verified by NHA</Badge>
              <Badge variant="teal"><i className="ti ti-shield text-xs mr-1" />Govt authenticated</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

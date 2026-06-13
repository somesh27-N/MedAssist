import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function QRPatientModal({ user, onClose }) {
  const [copied, setCopied] = useState(false);

  // Build the payload that goes into the QR code
  const qrPayload = JSON.stringify({
    name: user.name,
    uid: user.uid,
    dob: user.dob,
    gender: user.gender,
    blood: user.bloodGroup,
    phone: user.phone,
    dnr: user.dnr ? 'YES' : 'NO',
    organDonor: user.organDonor ? 'YES' : 'NO',
    allergies: (user.totalDiseases || [])
      .filter(d => d.name.toLowerCase().includes('allergy'))
      .map(d => d.name)
      .join(', ') || 'None',
    conditions: (user.currentDiseases || [])
      .filter(d => !d.name.toLowerCase().includes('allergy'))
      .map(d => d.name)
      .join(', ') || 'None',
    emergency: (user.emergencyContacts || [])[0]
      ? `${user.emergencyContacts[0].name} (${user.emergencyContacts[0].relation}): ${user.emergencyContacts[0].phone}`
      : 'None',
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden animate-slide-up"
        style={{ background: '#0D1B2E', border: '1px solid rgba(77,210,204,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <i className="ti ti-qrcode text-teal-400 text-lg" />
            <span className="text-white font-semibold text-sm">Health Identity QR</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border-none cursor-pointer"
            style={{ background: 'transparent' }}
          >
            <i className="ti ti-x text-sm" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center px-6 pt-6 pb-4">
          <div
            className="p-4 rounded-2xl mb-5"
            style={{ background: '#fff', boxShadow: '0 0 40px rgba(77,210,204,0.15)' }}
          >
            <QRCodeSVG
              value={qrPayload}
              size={200}
              bgColor="#ffffff"
              fgColor="#0A1628"
              level="M"
              includeMargin={false}
            />
          </div>

          {/* Patient Basic Details */}
          <div className="w-full space-y-3">
            {/* Name + UID */}
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(77,210,204,0.08)', border: '1px solid rgba(77,210,204,0.15)' }}>
              <div>
                <p className="text-white font-semibold text-base">{user.name}</p>
                <p className="text-teal-400 text-xs font-mono mt-0.5">{user.uid}</p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: 'rgba(77,210,204,0.15)', color: '#4DD2CC' }}
              >
                {user.name?.charAt(0)}
              </div>
            </div>

            {/* Grid of quick details */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Blood', value: user.bloodGroup, icon: 'ti-droplet' },
                { label: 'Age', value: user.dob ? `${new Date().getFullYear() - parseInt(user.dob.split(' ').pop())} yr` : '—', icon: 'ti-calendar' },
                { label: 'Gender', value: user.gender || '—', icon: 'ti-user' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="p-2.5 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <i className={`ti ${icon} text-white/30 text-xs`} />
                  <p className="text-white text-sm font-semibold mt-1">{value}</p>
                  <p className="text-white/30 text-[10px]">{label}</p>
                </div>
              ))}
            </div>

            {/* DNR / Organ Donor */}
            <div className="flex gap-2">
              {user.dnr && (
                <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <i className="ti ti-alert-triangle text-red-400 text-sm" />
                  <span className="text-red-300 text-xs font-medium">DNR Active</span>
                </div>
              )}
              {user.organDonor && (
                <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <i className="ti ti-heart text-green-400 text-sm" />
                  <span className="text-green-300 text-xs font-medium">Organ Donor</span>
                </div>
              )}
            </div>

            {/* Active Conditions */}
            {user.currentDiseases?.length > 0 && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Active Conditions</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.currentDiseases.slice(0, 4).map(d => (
                    <span key={d.id} className="px-2 py-0.5 rounded-full text-[11px]" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
                      {d.name}
                    </span>
                  ))}
                  {user.currentDiseases.length > 4 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] text-white/40" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      +{user.currentDiseases.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {user.emergencyContacts?.[0] && (
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <i className="ti ti-phone text-teal-400 text-sm" />
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">Emergency Contact</p>
                  <p className="text-white text-sm font-medium">{user.emergencyContacts[0].name} <span className="text-white/40 font-normal">({user.emergencyContacts[0].relation})</span></p>
                  <p className="text-teal-400 text-xs">{user.emergencyContacts[0].phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-5 flex gap-2 mt-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border-none"
            style={{ background: 'rgba(77,210,204,0.1)', color: '#4DD2CC', border: '1px solid rgba(77,210,204,0.2)' }}
          >
            <i className={`ti ${copied ? 'ti-check' : 'ti-copy'} text-sm`} />
            {copied ? 'Copied!' : 'Copy data'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border-none"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <i className="ti ti-printer text-sm" />
            Print / Save
          </button>
        </div>
      </div>
    </div>
  );
}

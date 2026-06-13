import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, Badge, AlertBanner, StatusDot } from '../components/UI';

export function HospitalView() {
  const { 
    admissions, addDBAdmission, updateDBAdmissionStatus,
    bloodInventory, updateDBBloodBank,
    staff, addDBStaff, toggleDBStaffStatus,
    queryPatientFromSupabase,
    checkActiveConsent, requestConsent, bypassConsentAndLog
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchedPatient, setSearchedPatient] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Consent flow states
  const [tempPatient, setTempPatient] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const accessorId = 'HOSP-DL-20269999';
  const accessorName = 'City General Hospital';

  // Add admission form state
  const [showAddAdmission, setShowAddAdmission] = useState(false);
  const [admissionForm, setAdmissionForm] = useState({
    patientName: '',
    uid: '',
    ward: '',
    bed: ''
  });

  // Add staff form state
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    role: '',
    status: 'On Duty'
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchedPatient(null);
    setTempPatient(null);
    setAuthorized(false);
    setOtpSent(false);
    setOtpCode('');
    setOtpError('');

    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    try {
      const patient = await queryPatientFromSupabase(q);
      if (patient) {
        setTempPatient(patient);
        const active = await checkActiveConsent(patient.id, accessorId);
        if (active) {
          setAuthorized(true);
          setSearchedPatient(patient);
        }
      } else {
        setSearchError('No verified patient found under that name or Health ID/UID.');
      }
    } catch (err) {
      console.error(err);
      setSearchError('Error performing patient registry lookup.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendOtp = () => {
    setIsActionLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setIsActionLoading(false);
    }, 800);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setIsActionLoading(true);
    setOtpError('');

    setTimeout(async () => {
      if (otpCode.trim() === '1234' || otpCode.trim() === '123456' || otpCode.length > 2) {
        const success = await requestConsent(tempPatient.id, accessorId, accessorName, 'hospital');
        if (success) {
          setAuthorized(true);
          setSearchedPatient(tempPatient);
        } else {
          setOtpError('Failed to grant consent. Please try again.');
        }
      } else {
        setOtpError('Invalid OTP code. Try entering "1234".');
      }
      setIsActionLoading(false);
    }, 950);
  };

  const handleEmergencyBypass = async () => {
    if (!window.confirm('WARNING: Emergency Bypass will bypass citizen consent. This action is audited, logged, and reviewed by the National Health Authority. Proceed?')) {
      return;
    }
    setIsActionLoading(true);
    try {
      const success = await bypassConsentAndLog(tempPatient.id, accessorName, 'hospital');
      if (success) {
        setAuthorized(true);
        setSearchedPatient(tempPatient);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddAdmission = async (e) => {
    e.preventDefault();
    if (!admissionForm.patientName) return;
    await addDBAdmission({
      patientName: admissionForm.patientName,
      uid: admissionForm.uid || 'N/A',
      ward: admissionForm.ward || 'General Ward',
      bed: admissionForm.bed || 'TBD'
    });
    setAdmissionForm({ patientName: '', uid: '', ward: '', bed: '' });
    setShowAddAdmission(false);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.role) return;
    await addDBStaff({
      name: staffForm.name,
      role: staffForm.role,
      status: staffForm.status
    });
    setStaffForm({ name: '', role: '', status: 'On Duty' });
    setShowAddStaff(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Column: Patient Lookup */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <Card>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Patient Registry Lookup</p>
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <input 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400"
                placeholder="Search patient by Name or UID (Try: Rahul)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" disabled={isSearching} className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 cursor-pointer border-none font-semibold flex items-center gap-1.5" style={{ opacity: isSearching ? 0.7 : 1 }}>
                {isSearching ? 'Searching...' : <><i className="ti ti-search"/> Search</>}
              </button>
            </form>

            {searchError && (
              <AlertBanner variant="amber" icon="ti-info-circle" title="Lookup Unsuccessful" detail={searchError} />
            )}

            {/* Consent Gateway Screen */}
            {tempPatient && !authorized && (
              <div className="mt-4 p-5 bg-gray-55 border border-gray-200 rounded-xl animate-fade-in flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-lg mb-2">
                  <i className="ti ti-shield-lock"/>
                </div>
                <h3 className="font-display font-semibold text-sm text-navy-600">Consent Verification Required</h3>
                <p className="text-xs text-gray-400 mt-1 mb-4 text-center">
                  Access to <strong>{tempPatient.name}</strong> ({tempPatient.uid}) requires verification or emergency bypass.
                </p>

                {otpSent ? (
                  <form onSubmit={handleVerifyOtp} className="w-full max-w-xs space-y-3">
                    <input 
                      type="text"
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 font-mono text-center tracking-widest text-lg"
                      placeholder="XXXX"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                    {otpError && <p className="text-xs text-red-500 mt-1 text-center font-medium">{otpError}</p>}
                    <div className="flex gap-2">
                      <button type="submit" disabled={isActionLoading} className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold border-none cursor-pointer">
                        {isActionLoading ? 'Verifying...' : 'Verify OTP'}
                      </button>
                      <button type="button" onClick={() => setOtpSent(false)} className="px-3 py-2 bg-gray-200 text-gray-500 rounded-lg text-xs font-semibold border-none cursor-pointer">
                        Back
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="w-full max-w-xs space-y-2">
                    <button 
                      onClick={handleSendOtp}
                      disabled={isActionLoading}
                      className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold border-none cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <i className="ti ti-message-dots"/> Request SMS OTP
                    </button>
                    <button 
                      onClick={handleEmergencyBypass}
                      disabled={isActionLoading}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold border border-red-100 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <i className="ti ti-alert-octagon"/> Emergency Bypass
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Patient Info Card (Only shown if authorized) */}
            {searchedPatient && authorized && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-xl animate-fade-in">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-base text-navy-600">{searchedPatient.name}</h3>
                    <p className="text-xs text-gray-400">UID: {searchedPatient.uid} · {searchedPatient.gender}, {searchedPatient.age} yrs</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={searchedPatient.dnr ? 'red' : 'gray'}>DNR: {searchedPatient.dnr ? 'Active' : 'None'}</Badge>
                    <Badge variant="teal">Blood: {searchedPatient.bloodGroup}</Badge>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Active Medications</p>
                    <div className="space-y-1 mt-1.5">
                      {searchedPatient.medications.map(m => (
                        <div key={m.id} className="text-xs text-navy-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                          <span>{m.name} ({m.dose}) — {m.frequency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Chronic Conditions</p>
                    <div className="space-y-1 mt-1.5">
                      {searchedPatient.currentDiseases.map(d => (
                        <div key={d.id} className="text-xs text-navy-600 flex items-center gap-1.5">
                          <StatusDot status="active" />
                          <span>{d.name} (since {d.since})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Emergency Contact: <strong>{searchedPatient.emergencyContacts[0]?.name}</strong> ({searchedPatient.emergencyContacts[0]?.phone})</p>
                  <button 
                    type="button"
                    onClick={async () => {
                      await addDBAdmission({
                        patientName: searchedPatient.name,
                        uid: searchedPatient.uid,
                        ward: 'ER Observation',
                        bed: 'Bed ' + (admissions.length + 1)
                      });
                      setSearchedPatient(null);
                      setTempPatient(null);
                      setSearchQuery('');
                      setAuthorized(false);
                    }}
                    className="text-xs text-teal-600 hover:underline font-semibold bg-transparent border-none cursor-pointer"
                  >
                    + Admit Patient
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Admissions Registry */}
          <Card noPad>
            <CardHeader title="Current Patient Admissions" icon="ti-bed" action="+ Admit Patient" onAction={() => setShowAddAdmission(!showAddAdmission)} />
            
            {showAddAdmission && (
              <form onSubmit={handleAddAdmission} className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col gap-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Admit New Patient</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input 
                    required
                    className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-navy-600 outline-none"
                    placeholder="Patient Name"
                    value={admissionForm.patientName}
                    onChange={(e) => setAdmissionForm(prev => ({ ...prev, patientName: e.target.value }))}
                  />
                  <input 
                    className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-navy-600 outline-none"
                    placeholder="Patient UID"
                    value={admissionForm.uid}
                    onChange={(e) => setAdmissionForm(prev => ({ ...prev, uid: e.target.value }))}
                  />
                  <input 
                    className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-navy-600 outline-none"
                    placeholder="Ward / Department"
                    value={admissionForm.ward}
                    onChange={(e) => setAdmissionForm(prev => ({ ...prev, ward: e.target.value }))}
                  />
                  <input 
                    className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-navy-600 outline-none"
                    placeholder="Bed Assignment"
                    value={admissionForm.bed}
                    onChange={(e) => setAdmissionForm(prev => ({ ...prev, bed: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="submit" className="px-3 py-1.5 bg-teal-50 text-white rounded text-xs hover:bg-teal-600 cursor-pointer border-none font-semibold">Confirm Admission</button>
                  <button type="button" onClick={() => setShowAddAdmission(false)} className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded text-xs hover:bg-gray-300 cursor-pointer border-none font-semibold">Cancel</button>
                </div>
              </form>
            )}

            <div className="divide-y divide-gray-50 overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-500 border-collapse">
                <thead className="text-[10px] text-gray-400 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-5 py-3">Patient</th>
                    <th scope="col" className="px-5 py-3">UID</th>
                    <th scope="col" className="px-5 py-3">Location</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {admissions.map(adm => (
                    <tr key={adm.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-semibold text-navy-600">{adm.patientName}</td>
                      <td className="px-5 py-3 font-mono">{adm.uid}</td>
                      <td className="px-5 py-3">{adm.ward} · {adm.bed}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          adm.status === 'Admitted' ? 'bg-red-50 text-red-600 border-red-100' :
                          adm.status === 'Observation' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {adm.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {adm.status !== 'Discharged' ? (
                          <div className="flex gap-2 justify-end">
                            {adm.status === 'Admitted' && (
                              <button type="button" onClick={() => updateDBAdmissionStatus(adm.id, 'Observation')} className="text-teal-600 hover:text-teal-700 bg-transparent border-none cursor-pointer">Observe</button>
                            )}
                            <button type="button" onClick={() => updateDBAdmissionStatus(adm.id, 'Discharged')} className="text-red-500 hover:text-red-600 bg-transparent border-none cursor-pointer font-semibold">Discharge</button>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Blood Bank & Staff */}
        <div className="flex flex-col gap-5">
          {/* Blood Bank Inventory */}
          <Card noPad>
            <CardHeader title="Blood Bank Reserves" icon="ti-drop-half-2" />
            <div className="px-5 py-4 grid grid-cols-2 gap-3">
              {bloodInventory.map(item => (
                <div key={item.group} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                  <div>
                    <p className="text-xs font-semibold text-navy-600">{item.group}</p>
                    <p className="text-xs font-mono text-gray-400">{item.units} Units</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button 
                      type="button"
                      onClick={() => updateDBBloodBank(item.group, 1)} 
                      className="w-5 h-5 rounded bg-teal-500 text-white text-xs font-bold flex items-center justify-center cursor-pointer border-none hover:bg-teal-600"
                    >
                      +
                    </button>
                    <button 
                      type="button"
                      onClick={() => updateDBBloodBank(item.group, -1)} 
                      className="w-5 h-5 rounded bg-red-400 text-white text-xs font-bold flex items-center justify-center cursor-pointer border-none hover:bg-red-500"
                    >
                      -
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* On-Duty Staff Registry */}
          <Card noPad>
            <CardHeader title="Clinical Staff Shift" icon="ti-users" action="+ Add Staff" onAction={() => setShowAddStaff(!showAddStaff)} />

            {showAddStaff && (
              <form onSubmit={handleAddStaff} className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col gap-2">
                <input 
                  required
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-navy-600 outline-none"
                  placeholder="Staff Name"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm(prev => ({ ...prev, name: e.target.value }))}
                />
                <input 
                  required
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-navy-600 outline-none"
                  placeholder="Role (e.g. Pediatrician)"
                  value={staffForm.role}
                  onChange={(e) => setStaffForm(prev => ({ ...prev, role: e.target.value }))}
                />
                <div className="flex gap-2 justify-end">
                  <button type="submit" className="px-2 py-1 bg-teal-500 text-white rounded text-[10px] hover:bg-teal-600 cursor-pointer border-none font-semibold">Add</button>
                  <button type="button" onClick={() => setShowAddStaff(false)} className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-[10px] hover:bg-gray-300 cursor-pointer border-none font-semibold">Cancel</button>
                </div>
              </form>
            )}

            <div className="px-5 py-4 divide-y divide-gray-100">
              {staff.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-xs font-semibold text-navy-600">{s.name}</p>
                    <p className="text-[10px] text-gray-400">{s.role}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => toggleDBStaffStatus(s.id)}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-semibold cursor-pointer border-none transition-colors ${
                      s.status === 'On Duty' ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                      s.status === 'On Call' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' :
                      'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {s.status}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

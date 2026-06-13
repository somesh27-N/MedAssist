import React, { useState, useEffect } from 'react';
import { useApp, DEMO_PATIENT } from '../context/AppContext';
import { AlertBanner, StatCard, Card, Badge, StatusDot, CardHeader } from '../components/UI';

export function DoctorView() {
  const { 
    user, 
    activePatientSession, 
    setActivePatientSession, 
    permissions, 
    addAccessLog,
    queryPatientFromSupabase,
    checkActiveConsent,
    requestConsent,
    bypassConsentAndLog,
    logAccess
  } = useApp();

  const [step, setStep] = useState(activePatientSession ? 'patient_dashboard' : 'verify_license');
  const [licenseId, setLicenseId] = useState(user?.uid || 'MCI-DL-9938102');
  const [verifyingLicense, setVerifyingLicense] = useState(false);
  const [patientUid, setPatientUid] = useState('7823-XXXX-4401');
  const [accessReason, setAccessReason] = useState('Routine Checkup');
  const [otp, setOtp] = useState('');
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricProgress, setBiometricProgress] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const [overrideUnlocked, setOverrideUnlocked] = useState(false);
  const [tab, setTab] = useState(0);

  // Auto-set step if patient session is active
  useEffect(() => {
    if (activePatientSession) {
      setStep('patient_dashboard');
      if (activePatientSession.mode === 'emergency') {
        setOverrideUnlocked(true);
      }
    } else {
      setStep('verify_license');
    }
  }, [activePatientSession]);

  // Handle countdown for emergency summary
  useEffect(() => {
    if (step !== 'emergency_summary') return;
    if (countdown <= 0) {
      const logTimeout = async () => {
        const patientData = await queryPatientFromSupabase(patientUid);
        if (patientData) {
          await logAccess(patientData.id || 1, `${user.name} (${user.hospital})`, 'doctor', 'Emergency Timeout', true);
        }
        addAccessLog({
          viewer: `${user.name} (${user.hospital})`,
          time: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          method: 'Biometric Scan',
          status: 'Timeout',
          reason: 'Emergency Access Expired (30s limit)'
        });
        setErrorMsg('Emergency access window expired. Access has been locked.');
        setStep('request_access');
      };
      logTimeout();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, step]);

  const handleVerifyLicense = () => {
    setVerifyingLicense(true);
    setErrorMsg('');
    setTimeout(() => {
      setVerifyingLicense(false);
      setStep('request_access');
    }, 1200);
  };

  const handleRequestAccess = async () => {
    setErrorMsg('');
    if (accessReason === 'Emergency') {
      setStep('emergency_biometric');
      return;
    }

    if (!otp) {
      setErrorMsg('Please enter the patient OTP.');
      return;
    }

    setRequestingAccess(true);
    try {
      const patientData = await queryPatientFromSupabase(patientUid);
      if (!patientData) {
        setErrorMsg('Patient profile not found.');
        return;
      }

      const docKey = user?.name?.includes('Kapoor') ? 'Kapoor' : user?.name?.includes('Mehta') ? 'Mehta' : 'Joshi';
      const isBlocked = permissions[docKey]?.status === 'blocked';
      const logTime = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      if (isBlocked) {
        await logAccess(patientData.id || 1, `${user.name} (${user.hospital})`, 'doctor', `${accessReason} (Attempted Blocked)`, false);
        addAccessLog({
          viewer: `${user.name} (${user.hospital})`,
          time: logTime,
          method: 'UID Search',
          status: 'Blocked',
          reason: `${accessReason} (Attempted)`
        });
        setErrorMsg('Access Denied: You have been blocked by the patient.');
        return;
      }

      if (otp !== '4401' && otp !== '1234') {
        await logAccess(patientData.id || 1, `${user.name} (${user.hospital})`, 'doctor', `${accessReason} (Invalid OTP)`, false);
        addAccessLog({
          viewer: `${user.name} (${user.hospital})`,
          time: logTime,
          method: 'UID Search',
          status: 'Failed',
          reason: `${accessReason} (Invalid OTP)`
        });
        setErrorMsg('Access Denied: Invalid OTP Code.');
        return;
      }

      // Successful Access
      await requestConsent(patientData.id || 1, user.uid || 'MCI-DL-9938102', user.name, 'doctor');
      addAccessLog({
        viewer: `${user.name} (${user.hospital})`,
        time: logTime,
        method: 'UID + OTP',
        status: 'Success',
        reason: accessReason
      });
      setActivePatientSession({ patient: patientData, mode: 'normal' });
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred during verification.');
    } finally {
      setRequestingAccess(false);
    }
  };

  const handleStartBiometricScan = () => {
    setBiometricScanning(true);
    setBiometricProgress(0);
    const interval = setInterval(() => {
      setBiometricProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setBiometricScanning(false);
          
          (async () => {
            const patientData = await queryPatientFromSupabase(patientUid);
            const logTime = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            if (patientData) {
              await bypassConsentAndLog(patientData.id || 1, `${user.name} (${user.hospital})`, 'doctor');
            }
            addAccessLog({
              viewer: `${user.name} (${user.hospital})`,
              time: logTime,
              method: 'Biometric Scan',
              status: 'Success',
              reason: 'Emergency Critical Summary Vitals'
            });
            setCountdown(30);
            setStep('emergency_summary');
          })();
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleEmergencyOverride = async () => {
    const patientData = await queryPatientFromSupabase(patientUid);
    const logTime = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    if (patientData) {
      await logAccess(patientData.id || 1, `${user.name} (${user.hospital})`, 'doctor', 'Emergency Override', true);
    }
    addAccessLog({
      viewer: `${user.name} (${user.hospital})`,
      time: logTime,
      method: 'Emergency Override',
      status: 'Override Approved',
      reason: 'Accident/Trauma Override'
    });
    setOverrideUnlocked(true);
    setActivePatientSession({ patient: patientData || DEMO_PATIENT, mode: 'emergency' });
    alert("Emergency override approved and logged. Patient's emergency contacts have been notified via SMS.");
  };

  const TABS = overrideUnlocked 
    ? ['Emergency summary', 'Full record', 'Blood bank', 'Lab reports']
    : ['Emergency summary', 'Blood bank'];

  if (step === 'patient_dashboard' && activePatientSession) {
    const patient = activePatientSession.patient;
    return (
      <div className="flex flex-col gap-5 animate-fade-in text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/5 p-3 rounded-xl card">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">QR-authenticated session &bull; Patient: {patient.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate">UID: {patient.uid} &bull; Blood group: {patient.bloodGroup} &bull; Mode: {activePatientSession.mode === 'emergency' ? 'Emergency Override Unlocked' : 'Standard View'}</p>
          </div>
          <button 
            onClick={() => {
              setActivePatientSession(null);
              setStep('request_access');
              setOverrideUnlocked(false);
            }} 
            className="px-4 py-2 border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 self-start sm:self-center border-none"
          >
            <i className="ti ti-lock"/> Close Session
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon="ti-drop" iconBg="bg-red-50 text-red-500" value={patient.bloodGroup} label="Blood group"/>
          <StatCard icon="ti-pill" iconBg="bg-amber-50 text-amber-600" value={patient.medications?.length || 0} label="Active meds"/>
          <StatCard icon="ti-heart" iconBg="bg-teal-50 text-teal-600" value={patient.organDonor ? 'Yes' : 'No'} label="Organ donor"/>
          <StatCard icon="ti-alert-circle" iconBg="bg-red-50 text-red-500" value={patient.dnr ? 'Active' : 'None'} label="DNR" badge={patient.dnr ? 'Active' : 'None'} badgeVariant={patient.dnr ? 'red' : 'gray'}/>
        </div>

        <Card noPad>
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className="px-5 py-3 text-sm font-medium whitespace-nowrap -mb-px cursor-pointer bg-transparent border-l-0 border-r-0 border-t-0 transition-colors"
                style={{ color: tab === i ? '#00968A' : '#9ca3af', borderBottom: tab === i ? '2px solid #00B8A9' : '2px solid transparent' }}>
                {t}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Chronic conditions</p>
                  <div className="space-y-2">
                    {(patient.currentDiseases || []).map(d => (
                      <div key={d.id} className="flex items-start gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
                        <StatusDot status="active"/>
                        <div className="text-left">
                          <p className="text-sm font-medium text-navy-600">{d.name}</p>
                          <p className="text-xs text-gray-400">{d.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-4 mb-3">Current medications</p>
                  <div className="space-y-2">
                    {(patient.medications || []).map(m => (
                      <div key={m.id} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400"/>
                        <p className="text-sm text-navy-600 flex-1 text-left">{m.name} <span className="text-gray-400">{m.dose}</span></p>
                        <Badge variant="teal">{m.frequency}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Surgical history</p>
                  <div className="space-y-2">
                    {(patient.surgeries || []).map(s => (
                      <div key={s.id} className="bg-gray-50 rounded-xl px-3 py-2.5 text-left">
                        <p className="text-sm font-medium text-navy-600">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.date} &bull; {s.hospital}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-4 mb-3">Emergency contacts</p>
                  <div className="space-y-2">
                    {(patient.emergencyContacts || []).map(ec => (
                      <div key={ec.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}>
                        <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-xs text-white font-medium">
                          {ec.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-navy-600">{ec.name}</p>
                          <p className="text-xs text-gray-400">{ec.relation}</p>
                        </div>
                        <p className="text-xs text-amber-600 font-mono">{ec.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 1 && overrideUnlocked && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { l: 'Full name', v: patient.name },
                    { l: 'DOB', v: patient.dob },
                    { l: 'Blood group', v: patient.bloodGroup },
                    { l: 'Birthmark', v: patient.birthmark },
                    { l: 'DNR', v: patient.dnr ? 'Active' : 'None' },
                    { l: 'Organ donor', v: patient.organDonor ? 'Yes' : 'No' }
                  ].map(({ l, v }) => (
                    <div key={l} className="bg-gray-50 rounded-xl px-3 py-2.5 text-left">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{l}</p>
                      <p className="text-sm font-medium text-navy-600 mt-1">{v}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest text-left">All conditions ({(patient.totalDiseases || []).length})</p>
                <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                  {(patient.totalDiseases || []).map(d => (
                    <div key={d.id} className="px-4 py-3 flex items-center gap-3">
                      <StatusDot status={d.status}/>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-navy-600">{d.name}</p>
                        <p className="text-xs text-gray-400">Since {d.since} &bull; {d.note}</p>
                      </div>
                      <Badge variant={d.status === 'active' ? 'red' : 'gray'}>{d.status === 'active' ? 'Active' : 'Resolved'}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {((tab === 1 && !overrideUnlocked) || (tab === 2 && overrideUnlocked)) && (
              <div className="space-y-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest text-left">Nearby Blood Banks</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(patient.bloodBankNearby || []).map((bb, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-shadow text-left">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-navy-600">{bb.name}</p>
                          <Badge variant={bb.available ? 'green' : 'red'}>{bb.available ? 'Stock Available' : 'No Stock'}</Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-left"><i className="ti ti-map-pin mr-1 text-teal-500"/>{bb.distance} away &bull; {bb.hours}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-50/10 pt-3 mt-1">
                        <span className="text-xs font-mono text-gray-400">{bb.phone}</span>
                        <a href={`tel:${bb.phone}`} className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1">
                          <i className="ti ti-phone"/> Call Bank
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 3 && overrideUnlocked && (
              <div className="space-y-3 text-left">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest text-left">Uploaded Labs & Reports</p>
                <div className="divide-y divide-gray-50/10 border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                  {(patient.reports || []).map(r => (
                    <div key={r.id} className="px-4 py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-teal-500/10 rounded-lg flex items-center justify-center flex-shrink-0 text-teal-400">
                          <i className="ti ti-file-analytics text-lg"/>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-navy-600">{r.name}</p>
                          <p className="text-xs text-gray-400">{r.lab} &bull; {r.date} &bull; {r.type} &bull; {r.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={r.verified ? 'green' : 'amber'}>{r.verified ? 'Verified' : 'Pending'}</Badge>
                        <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-teal-400 cursor-pointer border-none bg-transparent transition-colors">
                          <i className="ti ti-download text-base"/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      {step === 'verify_license' && (
        <div className="w-full max-w-md card p-6 text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto text-2xl">
            <i className="ti ti-stethoscope"/>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-white">NMC License Verification</h2>
            <p className="text-xs text-gray-400 mt-1.5">Verify your clinical credentials with the National Medical Commission registry.</p>
          </div>

          <div className="text-left">
            <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5 font-medium">MCI / NMC License ID</label>
            <input 
              className="input-field" 
              value={licenseId} 
              onChange={e => setLicenseId(e.target.value)} 
              placeholder="MCI-DL-XXXXXXXX"
            />
          </div>

          <button 
            onClick={handleVerifyLicense} 
            disabled={verifyingLicense}
            className="btn-primary w-full cursor-pointer border-none"
          >
            {verifyingLicense ? (
              <><span className="inline-block w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin mr-2"/>Verifying with NMC Registry...</>
            ) : (
              <>Verify & Enter Portal <i className="ti ti-shield-check text-base ml-1"/></>
            )}
          </button>
        </div>
      )}

      {step === 'request_access' && (
        <div className="w-full max-w-md card p-6 space-y-5 animate-fade-in text-left">
          <div className="text-center pb-2 border-b border-gray-50/10">
            <h2 className="font-display text-lg font-semibold text-white">Request Patient Access</h2>
            <p className="text-xs text-gray-400 mt-1">Authenticate access to patient records using UID/QR code or Emergency overrides.</p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg">
              <i className="ti ti-alert-circle text-sm mt-0.5"/>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5 font-medium">Patient Unique ID (UID) / Scan QR</label>
              <div className="relative">
                <input 
                  className="input-field pr-10" 
                  value={patientUid} 
                  onChange={e => setPatientUid(e.target.value)} 
                  placeholder="XXXX-XXXX-XXXX"
                />
                <button type="button" className="absolute right-2.5 top-2.5 text-teal-400 hover:text-teal-300 bg-transparent border-none cursor-pointer">
                  <i className="ti ti-qrcode text-lg"/>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5 font-medium">Access Reason</label>
              <select 
                value={accessReason} 
                onChange={e => setAccessReason(e.target.value)}
                className="input-field bg-navy-800"
                style={{ color: '#fff' }}
              >
                <option value="Routine Checkup">Routine Checkup</option>
                <option value="Specialty Consultation">Specialty Consultation</option>
                <option value="Emergency">Emergency (Patient Unconscious / Biometric)</option>
              </select>
            </div>

            {accessReason !== 'Emergency' && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5 font-medium">Approval Code / OTP</label>
                  <span className="text-[10px] text-teal-500 bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 rounded">Demo: 4401</span>
                </div>
                <input 
                  type="password" 
                  className="input-field font-mono text-center tracking-[4px]" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  placeholder="XXXX"
                  maxLength={4}
                />
              </div>
            )}
          </div>

          <button 
            onClick={handleRequestAccess} 
            disabled={requestingAccess}
            className={`w-full py-2.5 text-sm font-semibold rounded-lg text-white font-display cursor-pointer flex items-center justify-center gap-1.5 border-none transition-colors ${
              accessReason === 'Emergency' ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'
            }`}
          >
            {requestingAccess ? (
              <span className="inline-block w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin"/>
            ) : accessReason === 'Emergency' ? (
              <>Initiate Emergency Biometric Scan <i className="ti ti-fingerprint"/></>
            ) : (
              <>Request Patient Records <i className="ti ti-arrow-right"/></>
            )}
          </button>
        </div>
      )}

      {step === 'emergency_biometric' && (
        <div className="w-full max-w-md card p-6 text-center space-y-6 animate-fade-in">
          <div>
            <span className="px-2.5 py-1 border border-red-500/20 bg-red-500/10 text-red-400 text-[10px] font-semibold tracking-wider uppercase rounded-full">Emergency Mode</span>
            <h2 className="font-display text-lg font-semibold text-white mt-3">Patient Identity Verification</h2>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">Establish hospital and staff authorization, then perform biometric fingerprint verification.</p>
          </div>

          <div className="space-y-2.5 text-left bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <i className="ti ti-circle-check-filled text-sm"/>
              <span>Hospital Authority Verified (ABDM System ID Active)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <i className="ti ti-circle-check-filled text-sm"/>
              <span>Medical Professional Verified ({licenseId})</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            <button
              onClick={handleStartBiometricScan}
              disabled={biometricScanning}
              className={`w-28 h-28 rounded-full border-2 border-red-500/20 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${
                biometricScanning ? 'bg-red-500/5 ring-8 ring-red-500/10 scale-95' : 'bg-red-500/10 hover:scale-105 active:scale-95'
              }`}
              style={{ borderStyle: 'solid' }}
            >
              {biometricScanning && (
                <div 
                  className="absolute bottom-0 left-0 w-full bg-red-500/30 transition-all duration-300"
                  style={{ height: `${biometricProgress}%` }}
                />
              )}
              <i className={`ti ti-fingerprint text-4xl relative z-10 ${biometricScanning ? 'text-red-400 animate-pulse' : 'text-red-500'}`}/>
            </button>
            <p className="text-xs font-semibold text-white mt-4 tracking-wider">
              {biometricScanning ? `Scanning Biometrics... ${biometricProgress}%` : 'Tap Fingerprint to Scan'}
            </p>
          </div>

          <button 
            onClick={() => setStep('request_access')} 
            className="text-xs text-gray-400 hover:text-white bg-transparent border-none cursor-pointer flex items-center gap-1 mx-auto"
          >
            <i className="ti ti-arrow-left"/> Go back
          </button>
        </div>
      )}

      {step === 'emergency_summary' && (
        <div className="w-full max-w-2xl card p-6 space-y-6 animate-fade-in text-left border-red-500/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-50/10 pb-3 gap-3">
            <div>
              <span className="px-2.5 py-1 border border-red-500/20 bg-red-500/10 text-red-400 text-[10px] font-semibold tracking-wider uppercase rounded-full">Critical Emergency Summary</span>
              <h2 className="font-display text-lg font-semibold text-white mt-2">Patient Identified: Rahul Sharma</h2>
            </div>
            <div className="px-3.5 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-sm font-semibold rounded-lg flex items-center gap-2 border-solid">
              <i className="ti ti-alarm animate-pulse"/>
              <span>00:{countdown.toString().padStart(2, '0')}</span>
            </div>
          </div>

          <AlertBanner variant="red" icon="ti-alert-circle" title="DNR Order Documented" detail="Do Not Resuscitate (DNR) instruction is actively registered for this identity."/>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Medical Basics</p>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Blood Group</span>
                <p className="text-sm font-semibold text-white">B+ (Rh Positive)</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Allergies</span>
                <p className="text-sm font-semibold text-red-400">No known drug allergies (NKDA)</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Chronic Conditions</span>
                <p className="text-sm font-medium text-white">Type 2 Diabetes Mellitus, Hypertension</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Contacts & Insurance</p>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Emergency Contact</span>
                <p className="text-sm font-semibold text-white">Priya Sharma (Spouse) &bull; +91 98100 XXXXX</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Government Insurance</span>
                <p className="text-sm font-semibold text-emerald-400">Ayushman Bharat (AB-MP-2203XXXXX)</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Current Medications</span>
                <p className="text-xs text-gray-400 leading-relaxed">Metformin 500mg, Amlodipine 5mg, Atorvastatin 20mg</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              onClick={handleEmergencyOverride}
              className="flex-1 py-3 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white font-display border-none cursor-pointer flex items-center justify-center gap-1.5"
            >
              <i className="ti ti-lock-open"/> Request Full Medical History (Emergency Override)
            </button>
            <button 
              onClick={() => {
                setActivePatientSession(null);
                setStep('request_access');
                setOverrideUnlocked(false);
              }}
              className="px-5 py-3 text-sm font-semibold rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white cursor-pointer hover:bg-white/10 border-solid"
            >
              Cancel Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

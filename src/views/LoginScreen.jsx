import React, { useState } from 'react';
import { useApp, DEMO_PATIENT } from '../context/AppContext';

export function LoginScreen() {
  const { login, signUpCitizen, signUpDoctor, authError, setAuthError } = useApp();
  const [portal, setPortal] = useState('user');
  const [method, setMethod] = useState('Aadhaar');
  const [loading, setLoading] = useState(false);

  // Signup states
  const [isSignUp, setIsSignUp] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);

  // Citizen signup inputs
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenAadhaar, setCitizenAadhaar] = useState('');
  const [citizenOtp, setCitizenOtp] = useState('');

  // Doctor signup inputs
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorLicense, setDoctorLicense] = useState('');
  const [doctorHospital, setDoctorHospital] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');

  // Login inputs
  const [loginAadhaar, setLoginAadhaar] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginLicense, setLoginLicense] = useState('');
  const [loginHospital, setLoginHospital] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleGoogleConnect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGoogleConnected(true);
      if (portal === 'doctor') {
        setDoctorName('Dr. Anand Joshi');
        setDoctorEmail('dr.anand.joshi@gmail.com');
      } else {
        setCitizenName('Rahul Sharma');
        setCitizenEmail('rahul.sharma@gmail.com');
      }
    }, 800);
  };

  const doSubmit = (e) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setLoading(true);
    setTimeout(async () => {
      try {
        if (portal === 'hospital') {
          await login('hospital', { name: loginHospital || 'AIIMS New Delhi', uid: loginLicense || 'HOSP-DEL-01' });
          return;
        }

        if (isSignUp) {
          if (portal === 'doctor') {
            // Register doctor in Supabase first
            const profile = await signUpDoctor({
              name: doctorName,
              phone: doctorPhone,
              email: doctorEmail,
              license: doctorLicense,
              hospital: doctorHospital,
            });
            if (!profile) return; // authError already set
            const docData = {
              ...DEMO_PATIENT,
              name: profile.name || doctorName || 'Dr. Anand Joshi',
              phone: profile.phone || doctorPhone || DEMO_PATIENT.phone,
              uid: profile.uid || doctorLicense || 'MCI-DL-9938102',
              hospital: doctorHospital || 'AIIMS New Delhi',
              id: profile.id,
            };
            await login('doctor', docData);
          } else {
            // Register citizen in Supabase first
            const profile = await signUpCitizen({
              name: citizenName,
              phone: citizenPhone,
              email: citizenEmail,
              aadhaar: citizenAadhaar,
            });
            if (!profile) return; // authError already set
            const patData = {
              ...DEMO_PATIENT,
              name: profile.name || citizenName || 'New User',
              phone: profile.phone || citizenPhone || DEMO_PATIENT.phone,
              uid: profile.uid,
              id: profile.id,
            };
            await login('user', patData);
          }
        } else {
          // Sign In — pass real typed credentials
          if (portal === 'doctor') {
            await login('doctor', {
              uid: loginLicense || undefined,
              hospital: loginHospital || 'AIIMS New Delhi',
            });
          } else {
            await login('user', {
              uid: loginAadhaar
                ? `${loginAadhaar.replace(/\s/g,'').slice(0,4)}-XXXX-${loginAadhaar.replace(/\s/g,'').slice(-4)}`
                : undefined,
              phone: loginPhone || undefined,
            });
          }
        }
      } catch (err) {
        console.error('Login submit error:', err);
      } finally {
        setLoading(false);
      }
    }, 1100);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 60% 0%, #0d2040 0%, #0A1628 60%)' }}>

      {/* Video Background (Screen Size Frame) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60"
          src="https://www.nmbioscience.org/wp-content/uploads/2020/07/DNA-Helix.mp4"></video>
        {/* Dark overlay to ensure text contrast */}
        <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-[1px]" />
      </div>

      <div className="mb-6 text-center flex flex-col items-center z-10">
        <img src="/logo.png" alt="MedAssist Logo" className="h-32 w-auto object-contain mb-3" />
        <p className="text-white/40 text-sm tracking-wide">Your complete health identity</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-slide-up z-10" style={{ background: '#111E33', border: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Portal tabs */}
        <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            ['user', 'Citizen', 'ti-user'],
            ['doctor', 'Doctor', 'ti-stethoscope'],
            ['hospital', 'Hospital', 'ti-building-hospital']
          ].map(([id, label, ic]) => (
            <button key={id} type="button" onClick={() => { setPortal(id); setGoogleConnected(false); }}
              className="flex-1 py-3 flex flex-col items-center gap-1 text-xs cursor-pointer border-none transition-all duration-150"
              style={{
                background: portal === id ? 'rgba(0,184,169,0.06)' : 'transparent',
                color: portal === id ? '#4DD2CC' : 'rgba(255,255,255,0.35)',
                borderBottom: portal === id ? '2px solid #4DD2CC' : '2px solid transparent'
              }}>
              <i className={`ti ${ic} text-base`} />{label}
            </button>
          ))}
        </div>

        <form onSubmit={doSubmit} className="p-6">

          {/* Auth Error Banner */}
          {authError && (
            <div className="mb-4 p-3 rounded-lg text-xs font-medium flex items-start gap-2"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
              <i className="ti ti-alert-circle text-sm mt-0.5 shrink-0" />
              <span>{authError}</span>
              <button type="button" onClick={() => setAuthError(null)}
                className="ml-auto text-white/40 hover:text-white/70 bg-transparent border-none cursor-pointer">
                <i className="ti ti-x text-xs" />
              </button>
            </div>
          )}

          {portal === 'hospital' ? (
            isSignUp ? (
              <div className="py-6 text-center text-white/50 space-y-3">
                <i className="ti ti-building-hospital text-4xl text-teal-500/40 block" />
                <p className="text-xs uppercase tracking-wider font-semibold text-white/80">Hospital Registration</p>
                <p className="text-[11px] max-w-xs mx-auto leading-relaxed">Hospital profiles require offline credentials and NHA authority verification. Please contact support to register your hospital.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Hospital ID</label>
                  <input className="input-field" value={loginLicense} onChange={e => setLoginLicense(e.target.value)} placeholder="HOSP-XXXXXXXX" />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Hospital Name</label>
                  <input className="input-field" value={loginHospital} onChange={e => setLoginHospital(e.target.value)} placeholder="e.g. AIIMS New Delhi" />
                </div>
                <div className="mb-5">
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Password</label>
                  <input type="password" className="input-field" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Secure password" />
                </div>
              </div>
            )
          ) : portal === 'doctor' ? (
            isSignUp ? (
              // Doctor Sign Up
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Full Name</label>
                  <input className="input-field" value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="e.g. Dr. Anand Joshi" />
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10 mb-2">
                  <span className="text-xs text-white/70">{googleConnected ? 'Connected with Google' : 'Connect credentials'}</span>
                  <button type="button" onClick={handleGoogleConnect} className="text-xs text-teal-400 font-semibold bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors border-none cursor-pointer">
                    {googleConnected ? 'Connected' : 'Google Auth'}
                  </button>
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Phone Number</label>
                  <input className="input-field" value={doctorPhone} onChange={e => setDoctorPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Google Email ID</label>
                  <input className="input-field" type="email" value={doctorEmail} onChange={e => setDoctorEmail(e.target.value)} placeholder="e.g. dr.anand@gmail.com" />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">MCI Licence ID</label>
                  <input className="input-field" value={doctorLicense} onChange={e => setDoctorLicense(e.target.value)} placeholder="MCI-DL-XXXXXXXX" />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Hospital</label>
                  <input className="input-field" value={doctorHospital} onChange={e => setDoctorHospital(e.target.value)} placeholder="e.g. AIIMS New Delhi" />
                </div>
                <div className="mb-5">
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Password</label>
                  <input type="password" className="input-field" value={doctorPassword} onChange={e => setDoctorPassword(e.target.value)} placeholder="Secure password" />
                </div>
              </div>
            ) : (
              // Doctor Login
              <div className="space-y-4">
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">MCI Licence ID</label>
                  <input className="input-field" value={loginLicense} onChange={e => setLoginLicense(e.target.value)} placeholder="MCI-DL-XXXXXXXX" />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Hospital</label>
                  <input className="input-field" value={loginHospital} onChange={e => setLoginHospital(e.target.value)} placeholder="e.g. AIIMS New Delhi" />
                </div>
                <div className="mb-5">
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Password</label>
                  <input type="password" className="input-field" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Secure password" />
                </div>
              </div>
            )
          ) : (
            // Citizen (Patient) Portal
            isSignUp ? (
              // Citizen Sign Up
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Full Name</label>
                  <input className="input-field" value={citizenName} onChange={e => setCitizenName(e.target.value)} placeholder="e.g. Rahul Sharma" />
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10 mb-2">
                  <span className="text-xs text-white/70">{googleConnected ? 'Connected with Google' : 'Connect credentials'}</span>
                  <button type="button" onClick={handleGoogleConnect} className="text-xs text-teal-400 font-semibold bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors border-none cursor-pointer">
                    {googleConnected ? 'Connected' : 'Google Auth'}
                  </button>
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Phone number</label>
                  <input className="input-field" value={citizenPhone} onChange={e => setCitizenPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Google Email ID</label>
                  <input className="input-field" type="email" value={citizenEmail} onChange={e => setCitizenEmail(e.target.value)} placeholder="e.g. rahul@gmail.com" />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Aadhaar number</label>
                  <input className="input-field" value={citizenAadhaar} onChange={e => setCitizenAadhaar(e.target.value)} placeholder="XXXX XXXX XXXX" />
                </div>
                <div className="mb-5">
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">OTP / PIN</label>
                  <input type="password" className="input-field" value={citizenOtp} onChange={e => setCitizenOtp(e.target.value)} placeholder="Enter OTP sent to mobile" />
                </div>
              </div>
            ) : (
              // Citizen Login
              <div className="space-y-4">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Verify via</p>
                  <div className="flex gap-2">
                    {['Aadhaar', 'Retina', 'Phone'].map(m => (
                      <button key={m} type="button" onClick={() => setMethod(m)}
                        className="flex-1 py-2 rounded-lg text-xs cursor-pointer transition-all"
                        style={{
                          border: method === m ? '1px solid rgba(77,210,204,0.5)' : '1px solid rgba(255,255,255,0.1)',
                          background: method === m ? 'rgba(0,184,169,0.1)' : 'transparent',
                          color: method === m ? '#4DD2CC' : 'rgba(255,255,255,0.4)'
                        }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                {method === 'Phone' ? (
                  <div>
                    <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Phone number</label>
                    <input className="input-field" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
                  </div>
                ) : method === 'Aadhaar' ? (
                  <div>
                    <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Aadhaar number</label>
                    <input className="input-field" value={loginAadhaar} onChange={e => setLoginAadhaar(e.target.value)} placeholder="XXXX XXXX XXXX" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Scan retina</label>
                    <input className="input-field" readOnly placeholder="Position eyes for scan" />
                  </div>
                )}
                <div className="mb-5">
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">OTP / PIN</label>
                  <input type="password" className="input-field" value={loginOtp} onChange={e => setLoginOtp(e.target.value)} placeholder="Enter OTP sent to mobile" />
                </div>
              </div>
            )
          )}

          {!(portal === 'hospital' && isSignUp) && (
            <button type="submit" disabled={loading} className="btn-primary mt-2 cursor-pointer" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <><span className="inline-block w-4 h-4 border-2 rounded-full" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 1s linear infinite' }} />{isSignUp ? 'Registering…' : 'Verifying…'}</>
                : <>{isSignUp ? 'Create Account & Sign in' : 'Verify & Sign in'} <i className="ti ti-arrow-right text-sm" /></>}
            </button>
          )}

          <div className="mt-5 text-center">
            {isSignUp ? (
              <p className="text-xs text-white/45">
                Already have an account?{' '}
                <button type="button" onClick={() => { setIsSignUp(false); setGoogleConnected(false); }} className="text-teal-400 hover:text-teal-300 font-semibold underline bg-transparent border-none cursor-pointer">
                  Sign in
                </button>
              </p>
            ) : (
              <p className="text-xs text-white/45">
                Don't have an account?{' '}
                <button type="button" onClick={() => { setIsSignUp(true); setGoogleConnected(false); }} className="text-teal-400 hover:text-teal-300 font-semibold underline bg-transparent border-none cursor-pointer">
                  Sign up
                </button>
              </p>
            )}
          </div>

        </form>

        <div className="px-6 pb-5 text-center">
          <p className="text-xs flex items-center justify-center gap-1.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse-slow" />
            Secured by Aadhaar + biometric · Govt of India
          </p>
        </div>

      </div>

      <button type="button" onClick={async () => {
        if (portal === 'hospital') {
          await login('hospital', { name: 'AIIMS New Delhi', uid: 'HOSP-DEL-01' });
        } else if (portal === 'doctor') {
          await login('doctor', DEMO_PATIENT);
        } else {
          await login('user', DEMO_PATIENT);
        }
      }}
        className="mt-5 text-xs underline cursor-pointer bg-transparent border-none transition-colors hover:opacity-60 z-10"
        style={{ color: 'rgba(255,255,255,0.25)' }}>
        Skip — enter as demo {portal} →
      </button>

    </div>
  );
}

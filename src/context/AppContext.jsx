import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';

// Default Demo Patient Profile
export const DEMO_PATIENT = {
  name: 'Rahul Sharma',
  dob: '14 Aug 1982',
  age: 43,
  gender: 'Male',
  uid: '7823-XXXX-4401',
  phone: '+91 98100 XXXXX',
  bloodGroup: 'B+',
  address: 'Block 4B, Janakpuri, New Delhi',
  birthmark: 'Left shoulder, oval ~2cm',
  dnr: true,
  organDonor: true,
  localSave: true,
  currentDiseases: [
    { id: 1, name: 'Type 2 Diabetes Mellitus', since: '2019', status: 'active', note: 'HbA1c: 7.1% (May 2026)' },
    { id: 2, name: 'Hypertension Stage 1', since: '2021', status: 'active', note: 'BP: 138/88 (Jun 2026)' },
  ],
  totalDiseases: [
    { id: 1, name: 'Type 2 Diabetes Mellitus', since: '2019', status: 'active', note: 'Chronic, managed' },
    { id: 2, name: 'Hypertension Stage 1', since: '2021', status: 'active', note: 'Stage 1' },
    { id: 3, name: 'Appendicitis', since: '2017', status: 'resolved', note: 'Resolved via surgery' },
    { id: 4, name: 'Malaria (P. vivax)', since: '2014', status: 'resolved', note: 'Fully recovered' },
    { id: 5, name: 'Acute Bronchitis', since: '2011', status: 'resolved', note: 'Resolved with antibiotics' },
  ],
  medications: [
    { id: 1, name: 'Metformin', dose: '500mg', frequency: 'Twice daily', doctor: 'Dr. S. Kapoor', hospital: 'AIIMS', since: 'Jan 2020' },
    { id: 2, name: 'Amlodipine', dose: '5mg', frequency: 'Once daily', doctor: 'Dr. R. Mehta', hospital: 'City Hospital', since: 'Mar 2022' },
    { id: 3, name: 'Atorvastatin', dose: '20mg', frequency: 'Nightly', doctor: 'Dr. S. Kapoor', hospital: 'AIIMS', since: 'Jun 2022' },
    { id: 4, name: 'Pantoprazole', dose: '40mg', frequency: 'Morning', doctor: 'Dr. N. Gupta', hospital: 'Apollo', since: 'Feb 2023' },
  ],
  surgeries: [
    { id: 1, name: 'Appendectomy', date: 'Feb 2017', type: 'Laparoscopic', hospital: 'AIIMS New Delhi', doctor: 'Dr. Priya Rao', city: 'New Delhi' },
    { id: 2, name: 'Knee Arthroscopy (L)', date: 'Nov 2020', type: 'Sports injury', hospital: 'Fortis Gurgaon', doctor: 'Dr. Anand Joshi', city: 'Gurgaon' },
    { id: 3, name: 'Cataract Extraction (R)', date: 'Mar 2024', type: 'Phacoemulsification', hospital: 'Sankara Nethralaya', doctor: 'Dr. Leena Iyer', city: 'Chennai' },
  ],
  reports: [
    { id: 1, name: 'Blood test — HbA1c, Lipid panel', date: 'May 2026', lab: 'Thyrocare', type: 'PDF', size: '1.2 MB', verified: true },
    { id: 2, name: 'MRI right knee', date: 'Nov 2020', lab: 'Fortis Imaging', type: 'DICOM', size: '34 MB', verified: true },
    { id: 3, name: 'Discharge summary — Appendectomy', date: 'Feb 2017', lab: 'AIIMS', type: 'PDF', size: '890 KB', verified: true },
    { id: 4, name: 'Eye pressure & OCT scan', date: 'Mar 2024', lab: 'Sankara', type: 'PDF', size: '2.1 MB', verified: true },
    { id: 5, name: 'Chest X-ray', date: 'Jan 2025', lab: 'Medanta', type: 'JPG', size: '4.3 MB', verified: false },
  ],
  emergencyContacts: [
    { id: 1, name: 'Priya Sharma', relation: 'Spouse', phone: '+91 98100 XXXXX', primary: true },
    { id: 2, name: 'Rajesh Sharma', relation: 'Brother', phone: '+91 99990 XXXXX', primary: false },
  ],
  insurance: {
    ayushman: { active: true, cardNo: 'AB-MP-2203XXXXX', cover: '₹5,00,000', expiry: 'Lifetime' },
    private: { provider: 'Star Health Insurance', policyNo: 'SHI-2024-XXXXX', cover: '₹10,00,000', expiry: 'Mar 2027', active: true },
  },
  bloodBankNearby: [
    { name: 'AIIMS Blood Bank', distance: '2.1 km', available: true, hours: '24 hrs', phone: '+91 11 2658 8500' },
    { name: 'Red Cross Blood Bank Delhi', distance: '4.8 km', available: true, hours: '24 hrs', phone: '+91 11 2371 6441' },
    { name: 'Safdarjung Blood Bank', distance: '6.2 km', available: false, hours: '8am–8pm', phone: '+91 11 2616 5060' },
  ],
};

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  
  const [permissions, setPermissions] = useState({
    'Kapoor': { id: 'Kapoor', name: 'Dr. S. Kapoor', hospital: 'AIIMS New Delhi', status: 'authorized' },
    'Mehta': { id: 'Mehta', name: 'Dr. R. Mehta', hospital: 'City Hospital Delhi', status: 'authorized' },
    'Joshi': { id: 'Joshi', name: 'Dr. Anand Joshi', hospital: 'AIIMS New Delhi', status: 'authorized' }
  });

  const [accessLogs, setAccessLogs] = useState([
    { id: 1, viewer: 'Dr. S. Kapoor (AIIMS)', time: '12 Jun 2026, 10:24 AM', method: 'QR Scan', status: 'Success', reason: 'Routine Diabetes Follow-up' },
    { id: 2, viewer: 'Apollo Hospital (ER)', time: '10 Jun 2026, 11:05 PM', method: 'Biometric Scan', status: 'Success', reason: 'Emergency Override (Accident)' },
    { id: 3, viewer: 'Dr. R. Mehta (City Hospital)', time: '08 Jun 2026, 02:15 PM', method: 'UID + OTP', status: 'Success', reason: 'BP Prescription Update' },
    { id: 4, viewer: 'Dr. S. Kapoor (AIIMS)', time: '05 Jun 2026, 09:45 AM', method: 'QR Scan', status: 'Blocked', reason: 'Routine Checkup (Attempted)' }
  ]);

  const [activePatientSession, setActivePatientSession] = useState(null);

  const togglePermission = (id) => {
    setPermissions(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: prev[id].status === 'authorized' ? 'blocked' : 'authorized'
      }
    }));
  };

  const addAccessLog = (log) => {
    setAccessLogs(prev => [
      ...prev,
      {
        id: prev.length + 1,
        ...log
      }
    ]);
  };

  // Hospital-specific state
  const [admissions, setAdmissions] = useState([
    { id: 1, patientName: 'Rahul Sharma', uid: '7823-XXXX-4401', ward: 'General Ward A', bed: 'B-12', status: 'Admitted' },
    { id: 2, patientName: 'Ananya Sen', uid: '9012-XXXX-3345', ward: 'ICU', bed: 'Bed 3', status: 'Observation' },
    { id: 3, patientName: 'Vikram Malhotra', uid: '5678-XXXX-8821', ward: 'Speciality Ward C', bed: 'C-04', status: 'Discharging' },
  ]);

  const [bloodInventory, setBloodInventory] = useState([
    { group: 'A+', units: 24 },
    { group: 'A-', units: 8 },
    { group: 'B+', units: 42 },
    { group: 'B-', units: 12 },
    { group: 'AB+', units: 15 },
    { group: 'AB-', units: 4 },
    { group: 'O+', units: 38 },
    { group: 'O-', units: 18 },
  ]);

  const [staff, setStaff] = useState([
    { id: 1, name: 'Dr. Amit Goel', role: 'Chief Cardiologist', status: 'On Duty' },
    { id: 2, name: 'Dr. Priya Sen', role: 'ER Physician', status: 'On Duty' },
    { id: 3, name: 'Dr. Rohan Mehra', role: 'General Surgeon', status: 'On Call' },
    { id: 4, name: 'Nurse Anjali Sharma', role: 'ICU Head Nurse', status: 'On Duty' },
  ]);

  // Load hospital registry dynamically if Supabase is connected
  const loadHospitalData = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const [admRes, bloodRes, staffRes] = await Promise.all([
        supabase.from('admissions').select('*').order('created_at', { ascending: false }),
        supabase.from('blood_inventory').select('*').order('group', { ascending: true }),
        supabase.from('staff').select('*').order('id', { ascending: true })
      ]);
      if (admRes.data && admRes.data.length > 0) {
        setAdmissions(admRes.data.map(a => ({ id: a.id, patientName: a.patient_name, uid: a.uid, ward: a.ward, bed: a.bed, status: a.status })));
      }
      if (bloodRes.data && bloodRes.data.length > 0) {
        setBloodInventory(bloodRes.data);
      }
      if (staffRes.data && staffRes.data.length > 0) {
        setStaff(staffRes.data);
      }
    } catch (err) {
      console.error('Error loading hospital data from Supabase:', err);
    }
  };

  const loadPatientData = async (role, searchParam, isUid = false) => {
    if (!isSupabaseConfigured) {
      return { role, ...DEMO_PATIENT };
    }

    try {
      let query = supabase.from('profiles').select('*');
      if (isUid) {
        query = query.eq('uid', searchParam);
      } else {
        query = query.eq('name', searchParam);
      }

      const { data: profiles, error: profileErr } = await query;
      if (profileErr || !profiles || profiles.length === 0) {
        console.error('Profile not found in Supabase. Falling back to memory DEMO_PATIENT.');
        return { role, ...DEMO_PATIENT };
      }

      const profile = profiles[0];
      const profileId = profile.id;

      // Fetch related data in parallel
      const [medRes, diseaseRes, surgeryRes, reportRes, contactRes] = await Promise.all([
        supabase.from('medications').select('*').eq('profile_id', profileId),
        supabase.from('diseases').select('*').eq('profile_id', profileId),
        supabase.from('surgeries').select('*').eq('profile_id', profileId),
        supabase.from('reports').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }),
        supabase.from('emergency_contacts').select('*').eq('profile_id', profileId)
      ]);

      const totalDiseases = diseaseRes.data || [];
      const currentDiseases = totalDiseases.filter(d => d.status === 'active');

      return {
        role,
        id: profile.id,
        name: profile.name,
        dob: profile.dob,
        age: 43,
        gender: profile.gender,
        uid: profile.uid,
        phone: profile.phone,
        bloodGroup: profile.blood_group,
        address: profile.address,
        birthmark: profile.birthmark,
        dnr: profile.dnr,
        organDonor: profile.organ_donor,
        localSave: profile.local_save,
        currentDiseases: currentDiseases.map(d => ({ id: d.id, name: d.name, since: d.since, status: d.status, note: d.note })),
        totalDiseases: totalDiseases.map(d => ({ id: d.id, name: d.name, since: d.since, status: d.status, note: d.note })),
        medications: (medRes.data || []).map(m => ({ id: m.id, name: m.name, dose: m.dose, frequency: m.frequency, doctor: m.doctor, hospital: m.hospital, since: m.since })),
        surgeries: (surgeryRes.data || []).map(s => ({ id: s.id, name: s.name, date: s.date, type: s.type, hospital: s.hospital, doctor: s.doctor, city: s.city })),
        reports: (reportRes.data || []).map(r => ({ id: r.id, name: r.name, date: r.date, lab: r.lab, type: r.type, size: r.size, verified: r.verified, abnormalities: r.abnormalities, suggestions: r.suggestions })),
        emergencyContacts: (contactRes.data || []).map(ec => ({ id: ec.id, name: ec.name, relation: ec.relation, phone: ec.phone, primary: ec.primary })),
        insurance: {
          ayushman: { active: true, cardNo: 'AB-MP-2203XXXXX', cover: '₹5,00,000', expiry: 'Lifetime' },
          private: { provider: 'Star Health Insurance', policyNo: 'SHI-2024-XXXXX', cover: '₹10,00,000', expiry: 'Mar 2027', active: true },
        },
        bloodBankNearby: [
          { name: 'AIIMS Blood Bank', distance: '2.1 km', available: true, hours: '24 hrs', phone: '+91 11 2658 8500' },
          { name: 'Red Cross Blood Bank Delhi', distance: '4.8 km', available: true, hours: '24 hrs', phone: '+91 11 2371 6441' },
          { name: 'Safdarjung Blood Bank', distance: '6.2 km', available: false, hours: '8am–8pm', phone: '+91 11 2616 5060' },
        ],
      };
    } catch (err) {
      console.error('Error loading Supabase patient data:', err);
      return { role, ...DEMO_PATIENT };
    }
  };

  const login = async (role, data) => {
    let patientData = data;
    if (role === 'user' || role === 'doctor') {
      patientData = await loadPatientData(role, data.uid || '7823-XXXX-4401', true);
    } else if (role === 'hospital') {
      patientData = { role, ...data };
      await loadHospitalData();
    }

    setUser(patientData);
    if (role === 'hospital') {
      setView('hospital_view');
    } else if (role === 'doctor') {
      setView('doctor_view');
    } else {
      setView('dashboard');
    }
  };

  const logout = () => {
    setUser(null);
    setView('dashboard');
  };

  const updateUser = async (fields) => {
    if (isSupabaseConfigured && user?.id) {
      try {
        const mappedFields = {};
        if (fields.dnr !== undefined) mappedFields.dnr = fields.dnr;
        if (fields.organDonor !== undefined) mappedFields.organ_donor = fields.organDonor;
        if (fields.localSave !== undefined) mappedFields.local_save = fields.localSave;
        if (fields.name !== undefined) mappedFields.name = fields.name;
        if (fields.dob !== undefined) mappedFields.dob = fields.dob;
        if (fields.gender !== undefined) mappedFields.gender = fields.gender;
        if (fields.bloodGroup !== undefined) mappedFields.blood_group = fields.bloodGroup;
        if (fields.address !== undefined) mappedFields.address = fields.address;
        if (fields.birthmark !== undefined) mappedFields.birthmark = fields.birthmark;

        const { error } = await supabase.from('profiles').update(mappedFields).eq('id', user.id);
        if (error) throw error;
      } catch (err) {
        console.error('Failed to sync profile update with Supabase:', err);
      }
    }
    setUser(prev => prev ? { ...prev, ...fields } : null);
  };

  const addMedication = async (med) => {
    let newId = user.medications.length + 1;
    if (isSupabaseConfigured && user?.id) {
      try {
        const { data, error } = await supabase.from('medications').insert({
          profile_id: user.id,
          name: med.name,
          dose: med.dose,
          frequency: med.frequency,
          doctor: med.doctor,
          hospital: med.hospital,
          since: med.since
        }).select();
        if (error) throw error;
        if (data && data[0]) {
          newId = data[0].id;
        }
      } catch (err) {
        console.error('Failed to sync new medication with Supabase:', err);
      }
    }
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        medications: [...prev.medications, { id: newId, ...med }]
      };
    });
  };

  const addDisease = async (disease) => {
    let newId = user.totalDiseases.length + 1;
    if (isSupabaseConfigured && user?.id) {
      try {
        const { data, error } = await supabase.from('diseases').insert({
          profile_id: user.id,
          name: disease.name,
          since: disease.since,
          status: disease.status || 'active',
          note: disease.note
        }).select();
        if (error) throw error;
        if (data && data[0]) {
          newId = data[0].id;
        }
      } catch (err) {
        console.error('Failed to sync new disease with Supabase:', err);
      }
    }
    setUser(prev => {
      if (!prev) return null;
      const newDisease = { id: newId, ...disease };
      const currentDiseases = disease.status === 'active'
        ? [...prev.currentDiseases, { id: newId, name: disease.name, since: disease.since, status: disease.status, note: disease.note }]
        : prev.currentDiseases;
      return {
        ...prev,
        totalDiseases: [...prev.totalDiseases, newDisease],
        currentDiseases
      };
    });
  };

  const addSurgery = async (surgery) => {
    let newId = user.surgeries.length + 1;
    if (isSupabaseConfigured && user?.id) {
      try {
        const { data, error } = await supabase.from('surgeries').insert({
          profile_id: user.id,
          name: surgery.name,
          date: surgery.date,
          type: surgery.type,
          hospital: surgery.hospital,
          doctor: surgery.doctor,
          city: surgery.city
        }).select();
        if (error) throw error;
        if (data && data[0]) {
          newId = data[0].id;
        }
      } catch (err) {
        console.error('Failed to sync new surgery with Supabase:', err);
      }
    }
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        surgeries: [...prev.surgeries, { id: newId, ...surgery }]
      };
    });
  };

  const addReport = async (report) => {
    let newId = user.reports.length + 1;
    if (isSupabaseConfigured && user?.id) {
      try {
        const { data, error } = await supabase.from('reports').insert({
          profile_id: user.id,
          name: report.name,
          date: report.date || 'Today',
          lab: report.lab,
          type: report.type,
          size: report.size,
          verified: report.verified || false,
          abnormalities: report.abnormalities || null,
          suggestions: report.suggestions || null
        }).select();
        if (error) throw error;
        if (data && data[0]) {
          newId = data[0].id;
        }
      } catch (err) {
        console.error('Failed to sync new report with Supabase:', err);
      }
    }
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        reports: [{ id: newId, ...report }, ...prev.reports]
      };
    });
  };

  const addEmergencyContact = async (contact) => {
    let newId = user.emergencyContacts.length + 1;
    if (isSupabaseConfigured && user?.id) {
      try {
        const { data, error } = await supabase.from('emergency_contacts').insert({
          profile_id: user.id,
          name: contact.name,
          relation: contact.relation,
          phone: contact.phone,
          primary: contact.primary || false
        }).select();
        if (error) throw error;
        if (data && data[0]) {
          newId = data[0].id;
        }
      } catch (err) {
        console.error('Failed to sync new emergency contact with Supabase:', err);
      }
    }
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        emergencyContacts: [...prev.emergencyContacts, { id: newId, ...contact }]
      };
    });
  };

  const queryPatientFromSupabase = async (searchParam) => {
    if (!isSupabaseConfigured) {
      const matchesUid = DEMO_PATIENT.uid.toLowerCase().includes(searchParam.toLowerCase());
      const matchesName = DEMO_PATIENT.name.toLowerCase().includes(searchParam.toLowerCase());
      if (matchesUid || matchesName) {
        return DEMO_PATIENT;
      }
      return null;
    }

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`uid.ilike.%${searchParam}%,name.ilike.%${searchParam}%`);

      if (error || !profiles || profiles.length === 0) return null;

      const profile = profiles[0];
      const profileId = profile.id;

      const [medRes, diseaseRes, surgeryRes, reportRes, contactRes] = await Promise.all([
        supabase.from('medications').select('*').eq('profile_id', profileId),
        supabase.from('diseases').select('*').eq('profile_id', profileId),
        supabase.from('surgeries').select('*').eq('profile_id', profileId),
        supabase.from('reports').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }),
        supabase.from('emergency_contacts').select('*').eq('profile_id', profileId)
      ]);

      const totalDiseases = diseaseRes.data || [];
      const currentDiseases = totalDiseases.filter(d => d.status === 'active');

      return {
        id: profile.id,
        name: profile.name,
        dob: profile.dob,
        age: 43,
        gender: profile.gender,
        uid: profile.uid,
        phone: profile.phone,
        bloodGroup: profile.blood_group,
        address: profile.address,
        birthmark: profile.birthmark,
        dnr: profile.dnr,
        organDonor: profile.organ_donor,
        localSave: profile.local_save,
        currentDiseases: currentDiseases.map(d => ({ id: d.id, name: d.name, since: d.since, status: d.status, note: d.note })),
        totalDiseases: totalDiseases.map(d => ({ id: d.id, name: d.name, since: d.since, status: d.status, note: d.note })),
        medications: (medRes.data || []).map(m => ({ id: m.id, name: m.name, dose: m.dose, frequency: m.frequency, doctor: m.doctor, hospital: m.hospital, since: m.since })),
        surgeries: (surgeryRes.data || []).map(s => ({ id: s.id, name: s.name, date: s.date, type: s.type, hospital: s.hospital, doctor: s.doctor, city: s.city })),
        reports: (reportRes.data || []).map(r => ({ id: r.id, name: r.name, date: r.date, lab: r.lab, type: r.type, size: r.size, verified: r.verified, abnormalities: r.abnormalities, suggestions: r.suggestions })),
        emergencyContacts: (contactRes.data || []).map(ec => ({ id: ec.id, name: ec.name, relation: ec.relation, phone: ec.phone, primary: ec.primary })),
      };
    } catch (err) {
      console.error('Error looking up patient in Supabase:', err);
      return null;
    }
  };

  // ── CONSENT & ACCESS LOG ACTIONS ──────────────────────────────────────────────

  const checkActiveConsent = async (patientId, accessorId) => {
    if (!isSupabaseConfigured) {
      const mockConsent = localStorage.getItem(`consent_${patientId}_${accessorId}`);
      if (mockConsent) {
        const { expiresAt } = JSON.parse(mockConsent);
        if (new Date(expiresAt) > new Date()) return true;
      }
      return false;
    }
    try {
      const { data, error } = await supabase
        .from('consents')
        .select('*')
        .eq('profile_id', patientId)
        .eq('accessor_id', accessorId)
        .gt('expires_at', new Date().toISOString());
      if (error || !data || data.length === 0) return false;
      return true;
    } catch (err) {
      console.error('Error checking active consent:', err);
      return false;
    }
  };

  const requestConsent = async (patientId, accessorId, accessorName, accessorRole) => {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    if (!isSupabaseConfigured) {
      localStorage.setItem(`consent_${patientId}_${accessorId}`, JSON.stringify({ expiresAt }));
      await logAccess(patientId, accessorName, accessorRole, 'Read', false);
      return true;
    }
    try {
      const { error: consentErr } = await supabase.from('consents').insert({
        profile_id: patientId,
        accessor_id: accessorId,
        accessor_name: accessorName,
        access_type: 'Read',
        expires_at: expiresAt
      });
      if (consentErr) throw consentErr;
      await logAccess(patientId, accessorName, accessorRole, 'Read', false);
      return true;
    } catch (err) {
      console.error('Error requesting consent:', err);
      return false;
    }
  };

  const bypassConsentAndLog = async (patientId, accessorName, accessorRole) => {
    await logAccess(patientId, accessorName, accessorRole, 'Emergency Bypass', true);
    return true;
  };

  const logAccess = async (patientId, accessorName, accessorRole, actionType, emergencyBypass = false) => {
    if (!isSupabaseConfigured) {
      const localLogs = JSON.parse(localStorage.getItem(`access_logs_${patientId}`) || '[]');
      const newLog = {
        id: localLogs.length + 1,
        profile_id: patientId,
        accessor_name: accessorName,
        accessor_role: accessorRole,
        action_type: actionType,
        emergency_bypass: emergencyBypass,
        created_at: new Date().toISOString()
      };
      localStorage.setItem(`access_logs_${patientId}`, JSON.stringify([newLog, ...localLogs]));
      return;
    }
    try {
      await supabase.from('access_logs').insert({
        profile_id: patientId,
        accessor_name: accessorName,
        accessor_role: accessorRole,
        action_type: actionType,
        emergency_bypass: emergencyBypass
      });
    } catch (err) {
      console.error('Error logging access in Supabase:', err);
    }
  };

  const fetchAccessLogs = async () => {
    if (!user?.id) return [];
    if (!isSupabaseConfigured) {
      return JSON.parse(localStorage.getItem(`access_logs_${user.id}`) || '[]');
    }
    try {
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(d => ({
        id: d.id,
        profile_id: d.profile_id,
        accessor_name: d.accessor_name,
        accessor_role: d.accessor_role,
        action_type: d.action_type,
        emergency_bypass: d.emergency_bypass,
        created_at: d.created_at
      }));
    } catch (err) {
      console.error('Error fetching access logs:', err);
      return [];
    }
  };

  const fetchActiveConsents = async () => {
    if (!user?.id) return [];
    if (!isSupabaseConfigured) {
      const list = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(`consent_${user.id}_`)) {
          const accessorId = key.replace(`consent_${user.id}_`, '');
          const { expiresAt } = JSON.parse(localStorage.getItem(key));
          if (new Date(expiresAt) > new Date()) {
            list.push({ 
              id: accessorId,
              accessor_id: accessorId, 
              accessor_name: accessorId.startsWith('MCI') ? 'Dr. Priya Sen' : 'City General Hospital', 
              expires_at: expiresAt 
            });
          }
        }
      }
      return list;
    }
    try {
      const { data, error } = await supabase
        .from('consents')
        .select('*')
        .eq('profile_id', user.id)
        .gt('expires_at', new Date().toISOString());
      if (error) throw error;
      return data.map(d => ({
        id: d.id,
        accessor_id: d.accessor_id,
        accessor_name: d.accessor_name,
        expires_at: d.expires_at
      }));
    } catch (err) {
      console.error('Error fetching active consents:', err);
      return [];
    }
  };

  const revokeConsent = async (accessorId) => {
    if (!user?.id) return;
    if (!isSupabaseConfigured) {
      localStorage.removeItem(`consent_${user.id}_${accessorId}`);
      return;
    }
    try {
      await supabase
        .from('consents')
        .delete()
        .eq('profile_id', user.id)
        .eq('accessor_id', accessorId);
    } catch (err) {
      console.error('Error revoking consent:', err);
    }
  };

  // ── PERSISTENT REGISTRIES MUTATIONS ────────────────────────────────────────────

  const addDBAdmission = async (adm) => {
    if (!isSupabaseConfigured) {
      setAdmissions(prev => [...prev, { id: prev.length + 1, patientName: adm.patientName, uid: adm.uid, ward: adm.ward, bed: adm.bed, status: 'Admitted' }]);
      return;
    }
    try {
      const { data, error } = await supabase.from('admissions').insert({
        patient_name: adm.patientName,
        uid: adm.uid,
        ward: adm.ward,
        bed: adm.bed,
        status: 'Admitted'
      }).select();
      if (error) throw error;
      if (data && data[0]) {
        const a = data[0];
        setAdmissions(prev => [...prev, { id: a.id, patientName: a.patient_name, uid: a.uid, ward: a.ward, bed: a.bed, status: a.status }]);
      }
    } catch (err) {
      console.error('Error adding admission in Supabase:', err);
    }
  };

  const updateDBAdmissionStatus = async (id, newStatus) => {
    if (!isSupabaseConfigured) {
      setAdmissions(prev => prev.map(adm => adm.id === id ? { ...adm, status: newStatus } : adm));
      return;
    }
    try {
      const { error } = await supabase.from('admissions').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setAdmissions(prev => prev.map(adm => adm.id === id ? { ...adm, status: newStatus } : adm));
    } catch (err) {
      console.error('Error updating admission status in Supabase:', err);
    }
  };

  const updateDBBloodBank = async (group, amount) => {
    let newUnits = 0;
    setBloodInventory(prev => prev.map(item => {
      if (item.group === group) {
        newUnits = Math.max(0, item.units + amount);
        return { ...item, units: newUnits };
      }
      return item;
    }));
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('blood_inventory').update({ units: newUnits, updated_at: new Date().toISOString() }).eq('group', group);
    } catch (err) {
      console.error('Error updating blood inventory in Supabase:', err);
    }
  };

  const addDBStaff = async (member) => {
    if (!isSupabaseConfigured) {
      setStaff(prev => [...prev, { id: prev.length + 1, ...member }]);
      return;
    }
    try {
      const { data, error } = await supabase.from('staff').insert({
        name: member.name,
        role: member.role,
        status: member.status
      }).select();
      if (error) throw error;
      if (data && data[0]) {
        setStaff(prev => [...prev, data[0]]);
      }
    } catch (err) {
      console.error('Error adding staff in Supabase:', err);
    }
  };

  const toggleDBStaffStatus = async (id) => {
    let nextStatus = 'On Duty';
    setStaff(prev => prev.map(s => {
      if (s.id === id) {
        nextStatus = s.status === 'On Duty' ? 'On Call' : s.status === 'On Call' ? 'Off Duty' : 'On Duty';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('staff').update({ status: nextStatus, updated_at: new Date().toISOString() }).eq('id', id);
    } catch (err) {
      console.error('Error updating staff shift status in Supabase:', err);
    }
  };

  return (
    <AppCtx.Provider value={{
      user,
      view,
      setView,
      login,
      logout,
      updateUser,
      addMedication,
      addDisease,
      addSurgery,
      addReport,
      addEmergencyContact,
      queryPatientFromSupabase,
      
      // Consent & Log helpers
      checkActiveConsent,
      requestConsent,
      bypassConsentAndLog,
      logAccess,
      fetchAccessLogs,
      fetchActiveConsents,
      revokeConsent,

      // Registries state & updates
      admissions,
      addDBAdmission,
      updateDBAdmissionStatus,
      bloodInventory,
      updateDBBloodBank,
      staff,
      addDBStaff,
      toggleDBStaffStatus,

      // New UI fields
      permissions,
      accessLogs,
      activePatientSession,
      setActivePatientSession,
      togglePermission,
      addAccessLog
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppCtx);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

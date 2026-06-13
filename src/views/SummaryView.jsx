import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, Badge } from '../components/UI';
import { generateHealthSummary } from '../gemini';

const SYMPTOM_DB = [
  { keyword: 'headache', label: 'Headache', icon: 'ti-mood-sad', severity: 'mild',
    suggestions: [
      { text: 'Drink at least 8 glasses of water daily', icon: 'ti-droplet', type: 'hydration' },
      { text: 'Take a 15-minute break from screens every hour', icon: 'ti-eye-off', type: 'rest' },
      { text: 'Practice deep breathing or meditation for 10 min', icon: 'ti-yoga', type: 'relaxation' },
      { text: 'Ensure 7-8 hours of quality sleep', icon: 'ti-moon', type: 'sleep' }
    ]},
  { keyword: 'fatigue', label: 'Fatigue / Tiredness', icon: 'ti-zzz', severity: 'mild',
    suggestions: [
      { text: 'Walk briskly for 30 minutes every morning', icon: 'ti-walk', type: 'exercise' },
      { text: 'Eat iron-rich foods (spinach, lentils, eggs)', icon: 'ti-salad', type: 'diet' },
      { text: 'Reduce caffeine intake after 2 PM', icon: 'ti-coffee-off', type: 'diet' },
      { text: 'Check Vitamin D & B12 levels with your doctor', icon: 'ti-test-pipe', type: 'medical' }
    ]},
  { keyword: 'sugar', label: 'High Blood Sugar', icon: 'ti-candy-off', severity: 'moderate',
    suggestions: [
      { text: 'Reduce refined sugar and white carbs intake', icon: 'ti-candy-off', type: 'diet' },
      { text: 'Walk for 20 min after every meal', icon: 'ti-walk', type: 'exercise' },
      { text: 'Monitor fasting glucose levels daily', icon: 'ti-report-medical', type: 'medical' },
      { text: 'Increase fiber intake (oats, vegetables, beans)', icon: 'ti-plant', type: 'diet' },
      { text: 'Take Metformin as prescribed - do not skip', icon: 'ti-pill', type: 'medication' }
    ]},
  { keyword: 'blood pressure', label: 'Blood Pressure Issues', icon: 'ti-heart-rate-monitor', severity: 'moderate',
    suggestions: [
      { text: 'Reduce sodium intake (< 2g/day)', icon: 'ti-salt', type: 'diet' },
      { text: 'Practice 30 min of moderate cardio 5x/week', icon: 'ti-run', type: 'exercise' },
      { text: 'Avoid stress - try yoga or guided meditation', icon: 'ti-yoga', type: 'relaxation' },
      { text: 'Monitor BP twice daily (morning & evening)', icon: 'ti-heart-rate-monitor', type: 'medical' },
      { text: 'Take Amlodipine as prescribed', icon: 'ti-pill', type: 'medication' }
    ]},
  { keyword: 'chest pain', label: 'Chest Pain', icon: 'ti-heart-broken', severity: 'severe',
    suggestions: [
      { text: 'Seek immediate medical attention if persistent', icon: 'ti-urgent', type: 'emergency' },
      { text: 'Avoid physical exertion until evaluated', icon: 'ti-stretching', type: 'rest' },
      { text: 'Take prescribed aspirin if advised by doctor', icon: 'ti-pill', type: 'medication' },
      { text: 'Call emergency services if pain radiates to arm/jaw', icon: 'ti-phone-call', type: 'emergency' }
    ]},
  { keyword: 'joint pain', label: 'Joint / Knee Pain', icon: 'ti-bone', severity: 'mild',
    suggestions: [
      { text: 'Apply ice pack for 15 min, 3 times daily', icon: 'ti-snowflake', type: 'self-care' },
      { text: 'Do low-impact exercises (swimming, cycling)', icon: 'ti-swimming', type: 'exercise' },
      { text: 'Maintain healthy weight to reduce joint stress', icon: 'ti-scale', type: 'lifestyle' },
      { text: 'Use turmeric / anti-inflammatory foods in diet', icon: 'ti-leaf', type: 'diet' }
    ]},
  { keyword: 'cough', label: 'Cough / Cold', icon: 'ti-virus', severity: 'mild',
    suggestions: [
      { text: 'Drink warm water with honey & ginger', icon: 'ti-cup', type: 'home-remedy' },
      { text: 'Steam inhalation for 10 min twice daily', icon: 'ti-cloud', type: 'self-care' },
      { text: 'Rest and avoid cold beverages', icon: 'ti-bed', type: 'rest' },
      { text: 'Consult doctor if cough persists > 7 days', icon: 'ti-stethoscope', type: 'medical' }
    ]},
  { keyword: 'anxiety', label: 'Anxiety / Stress', icon: 'ti-brain', severity: 'moderate',
    suggestions: [
      { text: 'Practice box breathing (4-4-4-4 pattern)', icon: 'ti-lungs', type: 'relaxation' },
      { text: 'Limit social media to 30 min/day', icon: 'ti-device-mobile-off', type: 'lifestyle' },
      { text: 'Walk in nature for 20 min daily', icon: 'ti-trees', type: 'exercise' },
      { text: 'Consider speaking with a mental health professional', icon: 'ti-message-heart', type: 'medical' }
    ]},
  { keyword: 'back pain', label: 'Back Pain', icon: 'ti-stretching', severity: 'mild',
    suggestions: [
      { text: 'Maintain good posture - use lumbar support', icon: 'ti-armchair', type: 'lifestyle' },
      { text: 'Do gentle stretching exercises for 15 min', icon: 'ti-stretching', type: 'exercise' },
      { text: 'Apply hot compress on affected area', icon: 'ti-flame', type: 'self-care' },
      { text: 'Avoid lifting heavy objects', icon: 'ti-barbell-off', type: 'rest' }
    ]},
  { keyword: 'stomach', label: 'Stomach / Digestion Issues', icon: 'ti-belly', severity: 'mild',
    suggestions: [
      { text: 'Eat smaller, more frequent meals', icon: 'ti-bowl', type: 'diet' },
      { text: 'Avoid spicy, oily, and processed foods', icon: 'ti-pizza-off', type: 'diet' },
      { text: 'Drink warm water first thing in the morning', icon: 'ti-cup', type: 'home-remedy' },
      { text: 'Include probiotics (curd, buttermilk) in diet', icon: 'ti-bottle', type: 'diet' }
    ]},
  { keyword: 'sleep', label: 'Sleep Problems / Insomnia', icon: 'ti-moon-off', severity: 'mild',
    suggestions: [
      { text: 'Maintain a fixed sleep schedule (10 PM - 6 AM)', icon: 'ti-clock', type: 'lifestyle' },
      { text: 'Avoid screens 1 hour before bedtime', icon: 'ti-device-mobile-off', type: 'lifestyle' },
      { text: 'Drink chamomile or warm milk before sleep', icon: 'ti-cup', type: 'home-remedy' },
      { text: 'Keep bedroom dark, cool, and quiet', icon: 'ti-moon', type: 'sleep' }
    ]},
  { keyword: 'dizziness', label: 'Dizziness / Lightheadedness', icon: 'ti-tornado', severity: 'moderate',
    suggestions: [
      { text: 'Sit or lie down immediately when feeling dizzy', icon: 'ti-armchair', type: 'self-care' },
      { text: 'Stay well hydrated - dehydration is a common cause', icon: 'ti-droplet', type: 'hydration' },
      { text: 'Check blood pressure and blood sugar levels', icon: 'ti-heart-rate-monitor', type: 'medical' },
      { text: 'Avoid sudden standing - rise slowly', icon: 'ti-arrow-up', type: 'lifestyle' }
    ]},
  { keyword: 'skin', label: 'Skin Rash / Irritation', icon: 'ti-hand-stop', severity: 'mild',
    suggestions: [
      { text: 'Apply calamine or aloe vera gel to affected area', icon: 'ti-plant', type: 'self-care' },
      { text: 'Avoid harsh soaps - use gentle, fragrance-free ones', icon: 'ti-droplet', type: 'lifestyle' },
      { text: 'Wear loose, breathable cotton clothes', icon: 'ti-shirt', type: 'lifestyle' },
      { text: 'Consult dermatologist if rash persists > 3 days', icon: 'ti-stethoscope', type: 'medical' }
    ]},
  { keyword: 'eye', label: 'Eye Strain / Vision Issues', icon: 'ti-eye', severity: 'mild',
    suggestions: [
      { text: 'Follow the 20-20-20 rule (every 20 min, look 20 ft away for 20 sec)', icon: 'ti-eye', type: 'rest' },
      { text: 'Use lubricating eye drops if dry', icon: 'ti-droplet', type: 'self-care' },
      { text: 'Ensure adequate lighting while reading/working', icon: 'ti-bulb', type: 'lifestyle' },
      { text: 'Schedule annual eye checkup', icon: 'ti-calendar', type: 'medical' }
    ]}
];

export function SummaryView() {
  const { user } = useApp();
  
  const [symptomInput, setSymptomInput] = useState('');
  const [matchedSymptoms, setMatchedSymptoms] = useState([]);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [symptomHistory, setSymptomHistory] = useState([
    { id: 1, symptom: 'High Blood Sugar', date: '10 Jun 2026', severity: 'moderate', suggestions: SYMPTOM_DB.find(s=>s.keyword==='sugar')?.suggestions || [] },
    { id: 2, symptom: 'Headache', date: '07 Jun 2026', severity: 'mild', suggestions: SYMPTOM_DB.find(s=>s.keyword==='headache')?.suggestions || [] },
    { id: 3, symptom: 'Joint / Knee Pain', date: '01 Jun 2026', severity: 'mild', suggestions: SYMPTOM_DB.find(s=>s.keyword==='joint pain')?.suggestions || [] },
    { id: 4, symptom: 'Blood Pressure Issues', date: '28 May 2026', severity: 'moderate', suggestions: SYMPTOM_DB.find(s=>s.keyword==='blood pressure')?.suggestions || [] },
  ]);
  const [viewingHistory, setViewingHistory] = useState(null);
  const [analyzeAnim, setAnalyzeAnim] = useState(false);

  // AI Summary States
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  
  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    setSummaryError('');
    try {
      const summaryText = await generateHealthSummary(user);
      setAiSummary(summaryText);
    } catch (err) {
      console.error(err);
      setSummaryError('Failed to generate health summary. Please try again.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const getSortableTime = (dateStr) => {
    if (!dateStr) return 0;
    const parts = dateStr.split(' ');
    let year = 0;
    let month = 0;
    
    if (parts.length === 2) {
      const months = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
      month = months[parts[0].toLowerCase().substring(0, 3)] || 0;
      year = parseInt(parts[1]) || 0;
    } else {
      year = parseInt(parts[0]) || 0;
    }
    return year * 12 + month;
  };

  const timelineItems = [
    ...(user.surgeries || []).map(s => ({
      title: s.name,
      sub: `${s.hospital || ''}${s.doctor ? ' · Dr. ' + s.doctor : ''} · Surgery (${s.type || 'Surgical procedure'})`,
      date: s.date,
      sortVal: getSortableTime(s.date)
    })),
    ...(user.totalDiseases || []).map(d => ({
      title: `${d.name}`,
      sub: `${d.note || 'Condition diagnosed'} · Status: ${d.status}`,
      date: d.since,
      sortVal: getSortableTime(d.since)
    }))
  ];
  
  // Sort descending (most recent first)
  timelineItems.sort((a, b) => b.sortVal - a.sortVal);
  
  // Fallback if none exist
  const finalTimeline = timelineItems.length > 0 ? timelineItems : [
    { title: 'Cataract Extraction (R)', sub: 'Sankara Nethralaya, Chennai · Successful surgery', date: 'Mar 2024' },
    { title: 'Hypertension Diagnosis', sub: 'Dr. R. Mehta · Started Amlodipine 5mg daily', date: 'Mar 2022' },
    { title: 'Knee Arthroscopy (L)', sub: 'Fortis Gurgaon · Post sports injury repair', date: 'Nov 2020' },
    { title: 'Type 2 Diabetes Mellitus', sub: 'Dr. S. Kapoor · Initiated Metformin therapy', date: 'Jan 2020' },
    { title: 'Appendectomy', sub: 'AIIMS New Delhi · Laparoscopic procedure', date: 'Feb 2017' }
  ];

  const handleSymptomInput = (val) => {
    setSymptomInput(val);
    if (val.trim().length > 0) {
      const matches = SYMPTOM_DB.filter(s => 
        s.keyword.includes(val.toLowerCase()) || s.label.toLowerCase().includes(val.toLowerCase())
      );
      setMatchedSymptoms(matches);
      setShowDropdown(matches.length > 0);
    } else {
      setMatchedSymptoms([]);
      setShowDropdown(false);
    }
    setSelectedSymptom(null);
  };

  const selectSymptom = (sym) => {
    setSelectedSymptom(sym);
    setSymptomInput(sym.label);
    setShowDropdown(false);
    setAnalyzeAnim(true);
    setTimeout(() => setAnalyzeAnim(false), 600);
  };

  const logSymptom = () => {
    if (!selectedSymptom) return;
    const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    setSymptomHistory(prev => [
      { id: prev.length + 1, symptom: selectedSymptom.label, date: now, severity: selectedSymptom.severity, suggestions: selectedSymptom.suggestions },
      ...prev
    ]);
    setSelectedSymptom(null);
    setSymptomInput('');
  };

  const severityColor = (sev) => {
    if (sev === 'severe') return { bg: 'bg-red-50 text-red-600 border-red-100', text: 'text-red-600', badge: 'red' };
    if (sev === 'moderate') return { bg: 'bg-amber-50 text-amber-600 border-amber-100', text: 'text-amber-600', badge: 'amber' };
    return { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', text: 'text-emerald-600', badge: 'green' };
  };

  const typeColor = (type) => {
    const map = {
      'exercise': 'text-blue-500 bg-blue-50', 'diet': 'text-emerald-500 bg-emerald-50', 'rest': 'text-indigo-500 bg-indigo-50',
      'medical': 'text-purple-500 bg-purple-50', 'medication': 'text-amber-600 bg-amber-50', 'emergency': 'text-red-500 bg-red-50',
      'relaxation': 'text-violet-500 bg-violet-50', 'lifestyle': 'text-teal-500 bg-teal-50', 'self-care': 'text-pink-500 bg-pink-50',
      'home-remedy': 'text-orange-500 bg-orange-50', 'hydration': 'text-cyan-500 bg-cyan-50', 'sleep': 'text-indigo-400 bg-indigo-50'
    };
    return map[type] || 'text-gray-500 bg-gray-50';
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-left">
      {/* Premium AI Health Advisor Card */}
      <Card noPad className="overflow-hidden border border-teal-500/20 shadow-lg shadow-teal-500/5">
        <div className="bg-gradient-to-r from-teal-900/40 to-navy-700/60 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 border border-teal-500/20 shadow-inner">
              <i className="ti ti-sparkles text-xl animate-pulse"/>
            </div>
            <div>
              <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                Gemini Clinical Advisor
              </h3>
              <p className="text-xs text-navy-200">Generate a live, clinical health analysis based on your complete medical file.</p>
            </div>
          </div>
          <button
            onClick={handleGenerateSummary}
            disabled={loadingSummary}
            className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-800 disabled:text-teal-400 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-teal-500/20 cursor-pointer border-none flex items-center justify-center gap-1.5 shrink-0"
          >
            {loadingSummary ? (
              <>
                <div className="w-3.5 h-3.5 border-2 rounded-full border-white border-t-transparent animate-spin" />
                Analyzing File...
              </>
            ) : (
              <>
                <i className="ti ti-sparkles text-sm"/>
                Generate AI Summary
              </>
            )}
          </button>
        </div>

        {summaryError && (
          <div className="p-4 mx-5 my-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <i className="ti ti-alert-circle text-base" /> {summaryError}
          </div>
        )}

        {aiSummary ? (
          <div className="p-6 text-sm text-navy-600 leading-relaxed space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin bg-navy-900/10">
            <div className="prose prose-sm prose-invert max-w-none text-gray-200">
              {aiSummary.split('\n').map((line, i) => {
                if (line.startsWith('###')) {
                  return <h4 key={i} className="font-semibold text-white mt-4 mb-2 text-sm">{line.replace('###', '').trim()}</h4>;
                }
                if (line.startsWith('**') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.')) {
                  return <p key={i} className="font-semibold text-teal-300 mt-3 text-xs tracking-wide uppercase">{line.replace(/\*\*/g, '').trim()}</p>;
                }
                if (line.startsWith('*') || line.startsWith('-')) {
                  return (
                    <div key={i} className="flex items-start gap-2 pl-3 py-1 text-xs">
                      <span className="text-teal-400 mt-1">•</span>
                      <span>{line.replace(/^[\*\-]\s*/, '').trim()}</span>
                    </div>
                  );
                }
                return line.trim() ? <p key={i} className="text-xs text-gray-300 mb-2 pl-3">{line}</p> : null;
              })}
            </div>
          </div>
        ) : (
          !loadingSummary && (
            <div className="p-8 text-center bg-navy-950/20">
              <i className="ti ti-report-medical text-3xl text-gray-300 mb-2 opacity-50 block"/>
              <p className="text-xs text-gray-400 font-medium">Click the button above to synthesize your health dashboard records into an AI summary report.</p>
            </div>
          )
        )}
      </Card>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-teal-500 to-teal-600 text-white border-none">
          <p className="text-xs text-teal-100 uppercase tracking-wider font-medium">Health Score Estimate</p>
          <p className="text-3xl font-display font-semibold mt-2">Excellent</p>
          <p className="text-[11px] text-teal-100 mt-2 opacity-85">Based on regular medication adherence and controlled chronic conditions.</p>
        </div>
        <div className="card p-5 bg-navy-600 text-white border-none flex flex-col justify-between">
          <div>
            <p className="text-xs text-navy-200 uppercase tracking-wider font-medium">Next Clinic Visit</p>
            <p className="text-lg font-semibold mt-2">Dr. S. Kapoor (AIIMS)</p>
            <p className="text-xs text-navy-200 mt-0.5 font-light">Endocrinology Follow-up</p>
          </div>
          <span className="text-[11px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full w-fit mt-3">24 Jun 2026</span>
        </div>
        <div className="card p-5 bg-gray-50 flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Allergies & Risks</p>
            <p className="text-sm font-semibold text-navy-600 mt-2">No known drug allergies (NKDA)</p>
            <p className="text-xs text-gray-400 mt-0.5">Low risk of acute cardiac events</p>
          </div>
          <Badge variant="teal" className="w-fit mt-3">Verified profile</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* LEFT COLUMN - Vitals + Timeline */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Card noPad>
            <CardHeader title="Health Vitals History" icon="ti-heart-rate-monitor"/>
            <div className="px-5 py-4 space-y-4">
              {[
                {name:'HbA1c (Blood Sugar)',value:'7.1%',date:'May 2026',status:'Managed',color:'bg-amber-400'},
                {name:'Blood Pressure (BP)',value:'138/88 mmHg',date:'Jun 2026',status:'Stage 1 Hypertension',color:'bg-red-400'},
                {name:'Lipid Profile (LDL)',value:'98 mg/dL',date:'May 2026',status:'Normal',color:'bg-emerald-400'},
                {name:'Body Mass Index (BMI)',value:'24.2 (Normal)',date:'Jan 2026',status:'Normal',color:'bg-emerald-400'}
              ].map((vital,i)=>(
                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-none last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-navy-600">{vital.name}</p>
                    <p className="text-xs text-gray-400">Measured: {vital.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-navy-600">{vital.value}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 justify-end mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${vital.color}`}/>{vital.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card noPad>
            <CardHeader title="Medical Milestones Timeline" icon="ti-timeline"/>
            <div className="px-5 py-4 relative border-l-2 border-teal-100 ml-4 space-y-5">
              {finalTimeline.map((item,i)=>(
                <div key={i} className="relative pl-6">
                  <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-teal-500 border-2 border-white ring-4 ring-teal-50"/>
                  <span className="text-[10px] text-teal-600 font-semibold">{item.date}</span>
                  <p className="text-sm font-semibold text-navy-600 mt-0.5">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN - Symptom Checker */}
        <div className="flex flex-col gap-5">
          <Card noPad>
            <CardHeader title="Symptom Checker" icon="ti-stethoscope"/>
            <div className="px-5 py-4 space-y-4">
              <p className="text-xs text-gray-400 leading-relaxed">Describe what you're feeling and get personalized health suggestions based on your medical profile.</p>
              
              <div className="relative">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
                  <i className="ti ti-search text-gray-400 text-base"/>
                  <input 
                    type="text"
                    value={symptomInput}
                    onChange={(e) => handleSymptomInput(e.target.value)}
                    onFocus={() => { if (matchedSymptoms.length > 0) setShowDropdown(true); }}
                    placeholder="e.g. headache, fatigue, sugar..."
                    className="flex-1 text-sm outline-none border-none bg-transparent text-navy-600 placeholder-gray-300"
                  />
                  {symptomInput && (
                    <button onClick={() => { setSymptomInput(''); setMatchedSymptoms([]); setSelectedSymptom(null); setShowDropdown(false); }}
                      className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-300 cursor-pointer border-none text-xs">x</button>
                  )}
                </div>
                
                {/* Autocomplete Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-20 animate-fade-in">
                    {matchedSymptoms.map((sym) => (
                      <button key={sym.keyword} onClick={() => selectSymptom(sym)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-teal-50/50 transition-colors cursor-pointer border-none bg-transparent text-left border-b border-gray-50 last:border-none">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${severityColor(sym.severity).bg} ${severityColor(sym.severity).text}`}>
                          <i className={`ti ${sym.icon} text-base`}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy-600">{sym.label}</p>
                          <p className="text-[10px] text-gray-400">{sym.suggestions.length} suggestions available</p>
                        </div>
                        <Badge variant={severityColor(sym.severity).badge}>{sym.severity}</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Selected Symptom Suggestions */}
          {selectedSymptom && (
            <div className={`animate-fade-in ${analyzeAnim ? 'scale-[0.98] opacity-80' : 'scale-100 opacity-100'} transition-all duration-300`}>
              <Card noPad>
                <div className={`px-5 py-3 flex items-center justify-between ${severityColor(selectedSymptom.severity).bg} border-b ${severityColor(selectedSymptom.severity).text} border-solid border-gray-100`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${severityColor(selectedSymptom.severity).text} bg-white/60`}>
                      <i className={`ti ${selectedSymptom.icon} text-lg`}/>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${severityColor(selectedSymptom.severity).text}`}>{selectedSymptom.label}</p>
                      <p className="text-[10px] text-gray-400">Personalized for your profile</p>
                    </div>
                  </div>
                  <Badge variant={severityColor(selectedSymptom.severity).badge}>{selectedSymptom.severity}</Badge>
                </div>
                <div className="px-5 py-4 space-y-2.5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Recommended Actions</p>
                  {selectedSymptom.suggestions.map((sug, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-gray-50 rounded-xl px-3.5 py-3 hover:bg-gray-100/80 transition-colors">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor(sug.type)}`}>
                        <i className={`ti ${sug.icon} text-sm`}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-navy-600 leading-relaxed">{sug.text}</p>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider mt-1 inline-block">{sug.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-gray-50">
                  <button onClick={logSymptom}
                    className="w-full py-2.5 text-xs font-semibold rounded-lg bg-teal-500 hover:bg-teal-600 text-white border-none cursor-pointer transition-colors flex items-center justify-center gap-1.5">
                    <i className="ti ti-check text-sm"/> Log This Symptom
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* Previous Symptoms History */}
          <Card noPad>
            <CardHeader title="Previous Symptoms" icon="ti-history"/>
            <div className="divide-y divide-gray-50">
              {symptomHistory.length > 0 ? symptomHistory.map((entry) => (
                <div key={entry.id}>
                  <button 
                    onClick={() => setViewingHistory(viewingHistory === entry.id ? null : entry.id)}
                    className="w-full px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors cursor-pointer border-none bg-transparent text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${severityColor(entry.severity).bg} ${severityColor(entry.severity).text}`}>
                        <i className={`ti ${SYMPTOM_DB.find(s=>s.label===entry.symptom)?.icon || 'ti-mood-sad'} text-base`}/>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-navy-600 truncate">{entry.symptom}</p>
                        <p className="text-[10px] text-gray-400">{entry.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={severityColor(entry.severity).badge}>{entry.severity}</Badge>
                      <i className={`ti ${viewingHistory === entry.id ? 'ti-chevron-up' : 'ti-chevron-down'} text-xs text-gray-400`}/>
                    </div>
                  </button>
                  
                  {/* Expandable suggestions for history item */}
                  {viewingHistory === entry.id && (
                    <div className="px-5 pb-4 pt-0 space-y-2 animate-fade-in">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium pl-1">Suggestions given</p>
                      {entry.suggestions.map((sug, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 bg-gray-50 rounded-lg px-3 py-2.5">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${typeColor(sug.type)}`}>
                            <i className={`ti ${sug.icon} text-xs`}/>
                          </div>
                          <p className="text-[11px] text-navy-600 leading-relaxed">{sug.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )) : (
                <div className="px-5 py-8 text-center">
                  <i className="ti ti-mood-smile text-3xl text-gray-200 block mb-2"/>
                  <p className="text-sm text-gray-400">No symptoms logged yet</p>
                  <p className="text-xs text-gray-300 mt-1">Start typing above to check a symptom</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

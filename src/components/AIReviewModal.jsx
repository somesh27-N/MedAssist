import React, { useState, useEffect } from 'react';
import { Badge } from './UI';

export function AIReviewModal({ isOpen, onClose, extractedData, onApprove, imageSrc }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('medications');
  
  // Local state for extracted items so they can be edited/added/removed
  const [meds, setMeds] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [abnormalities, setAbnormalities] = useState('');
  const [suggestions, setSuggestions] = useState('');

  // Initialize fields on open
  useEffect(() => {
    if (extractedData) {
      setMeds(extractedData.medications || []);
      setDiseases(extractedData.diseases || []);
      setSurgeries(extractedData.surgeries || []);
      setAbnormalities(extractedData.abnormalities || '');
      setSuggestions(extractedData.suggestions || '');
    }
  }, [extractedData]);

  // Medications management
  const handleMedChange = (index, field, value) => {
    setMeds(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };
  const addMedRow = () => {
    setMeds(prev => [...prev, { name: '', dose: '', frequency: '', doctor: '', hospital: '', since: 'Today' }]);
  };
  const deleteMedRow = (index) => {
    setMeds(prev => prev.filter((_, idx) => idx !== index));
  };

  // Diseases management
  const handleDiseaseChange = (index, field, value) => {
    setDiseases(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };
  const addDiseaseRow = () => {
    setDiseases(prev => [...prev, { name: '', since: new Date().getFullYear().toString(), status: 'active', note: '' }]);
  };
  const deleteDiseaseRow = (index) => {
    setDiseases(prev => prev.filter((_, idx) => idx !== index));
  };

  // Surgeries management
  const handleSurgeryChange = (index, field, value) => {
    setSurgeries(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };
  const addSurgeryRow = () => {
    setSurgeries(prev => [...prev, { name: '', date: '', type: '', hospital: '', doctor: '', city: '' }]);
  };
  const deleteSurgeryRow = (index) => {
    setSurgeries(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    // Filter out rows without a name (empty rows)
    const finalMeds = meds.filter(m => m.name.trim());
    const finalDiseases = diseases.filter(d => d.name.trim());
    const finalSurgeries = surgeries.filter(s => s.name.trim());
    
    onApprove({
      medications: finalMeds,
      diseases: finalDiseases,
      surgeries: finalSurgeries,
      abnormalities: abnormalities,
      suggestions: suggestions
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] border border-gray-100">
        
        {/* Left Side: Scanned Image Preview */}
        <div className="w-full md:w-2/5 bg-gray-50 p-5 border-r border-gray-100 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 text-left w-full">Document Source</p>
          {imageSrc ? (
            <div className="w-full h-full max-h-[30vh] md:max-h-none border border-gray-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center bg-gray-100 p-2">
              <img src={imageSrc} alt="Scanned prescription source" className="max-w-full max-h-[300px] md:max-h-full object-contain rounded-lg" />
            </div>
          ) : (
            <div className="w-full h-48 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-100">
              <i className="ti ti-image-off text-3xl mb-1"/>
              <p className="text-xs">No image preview available</p>
            </div>
          )}
          <p className="text-[10px] text-gray-400 mt-3 text-center">Cross-reference AI fields with the uploaded prescription above.</p>
        </div>

        {/* Right Side: Verification Forms */}
        <div className="w-full md:w-3/5 flex flex-col h-full overflow-hidden">
          {/* Modal Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-lg text-navy-600 flex items-center gap-2">
                <i className="ti ti-sparkles text-teal-500 animate-pulse"/> AI Extraction Verification
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Please review, edit, or append the extracted medical records before saving.</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-navy-600 flex items-center justify-center border-none cursor-pointer transition-colors">
              <i className="ti ti-x text-lg"/>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            {[
              { id: 'medications', label: 'Medications', count: meds.length },
              { id: 'diseases', label: 'Conditions', count: diseases.length },
              { id: 'surgeries', label: 'Surgeries', count: surgeries.length },
              { id: 'abnormalities', label: 'Abnormalities & Recommendations', count: abnormalities || suggestions ? 'AI' : 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-5 py-3 text-xs font-semibold -mb-px flex items-center gap-1.5 border-l-0 border-r-0 border-t-0 bg-transparent cursor-pointer transition-colors"
                style={{
                  color: activeTab === tab.id ? '#00968A' : '#9ca3af',
                  borderBottom: activeTab === tab.id ? '2px solid #00B8A9' : '2px solid transparent'
                }}
              >
                {tab.label} <Badge variant={activeTab === tab.id ? 'teal' : 'gray'}>{tab.count}</Badge>
              </button>
            ))}
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[40vh] md:max-h-[45vh] scrollbar-thin bg-white">
            {activeTab === 'medications' && (
              <div className="space-y-4">
                {meds.map((med, idx) => (
                  <div key={idx} className="relative border border-gray-100 rounded-xl p-3 bg-gray-50/50 flex flex-col gap-3">
                    <button 
                      type="button"
                      onClick={() => deleteMedRow(idx)}
                      className="absolute top-2 right-2 text-gray-300 hover:text-red-500 bg-transparent border-none cursor-pointer"
                      title="Remove Row"
                    >
                      <i className="ti ti-trash text-base"/>
                    </button>
                    <div className="grid grid-cols-2 gap-3 pr-6">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Drug Name</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={med.name}
                          onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Dosage</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={med.dose}
                          onChange={(e) => handleMedChange(idx, 'dose', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Frequency</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={med.frequency}
                          onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Doctor</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={med.doctor}
                          onChange={(e) => handleMedChange(idx, 'doctor', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Hospital</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={med.hospital}
                          onChange={(e) => handleMedChange(idx, 'hospital', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Start Date</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={med.since}
                          onChange={(e) => handleMedChange(idx, 'since', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addMedRow} className="w-full py-2 border-2 border-dashed border-gray-200 text-gray-400 rounded-xl hover:border-teal-400 hover:text-teal-600 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors bg-white cursor-pointer">
                  <i className="ti ti-plus text-sm"/> Add Medication Row
                </button>
              </div>
            )}

            {activeTab === 'diseases' && (
              <div className="space-y-4">
                {diseases.map((dis, idx) => (
                  <div key={idx} className="relative border border-gray-100 rounded-xl p-3 bg-gray-50/50 flex flex-col gap-3">
                    <button 
                      type="button"
                      onClick={() => deleteDiseaseRow(idx)}
                      className="absolute top-2 right-2 text-gray-300 hover:text-red-500 bg-transparent border-none cursor-pointer"
                      title="Remove Row"
                    >
                      <i className="ti ti-trash text-base"/>
                    </button>
                    <div className="grid grid-cols-2 gap-3 pr-6">
                      <div className="col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Condition Name</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={dis.name}
                          onChange={(e) => handleDiseaseChange(idx, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Diagnosis Year</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={dis.since}
                          onChange={(e) => handleDiseaseChange(idx, 'since', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Status</label>
                        <select 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5 bg-white"
                          value={dis.status}
                          onChange={(e) => handleDiseaseChange(idx, 'status', e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Notes / Details</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={dis.note}
                          onChange={(e) => handleDiseaseChange(idx, 'note', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addDiseaseRow} className="w-full py-2 border-2 border-dashed border-gray-200 text-gray-400 rounded-xl hover:border-teal-400 hover:text-teal-600 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors bg-white cursor-pointer">
                  <i className="ti ti-plus text-sm"/> Add Condition Row
                </button>
              </div>
            )}

            {activeTab === 'surgeries' && (
              <div className="space-y-4">
                {surgeries.map((surg, idx) => (
                  <div key={idx} className="relative border border-gray-100 rounded-xl p-3 bg-gray-50/50 flex flex-col gap-3">
                    <button 
                      type="button"
                      onClick={() => deleteSurgeryRow(idx)}
                      className="absolute top-2 right-2 text-gray-300 hover:text-red-500 bg-transparent border-none cursor-pointer"
                      title="Remove Row"
                    >
                      <i className="ti ti-trash text-base"/>
                    </button>
                    <div className="grid grid-cols-2 gap-3 pr-6">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Surgery Name</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={surg.name}
                          onChange={(e) => handleSurgeryChange(idx, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Date</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={surg.date}
                          onChange={(e) => handleSurgeryChange(idx, 'date', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Type</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={surg.type}
                          onChange={(e) => handleSurgeryChange(idx, 'type', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Hospital</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={surg.hospital}
                          onChange={(e) => handleSurgeryChange(idx, 'hospital', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">Surgeon</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={surg.doctor}
                          onChange={(e) => handleSurgeryChange(idx, 'doctor', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">City</label>
                        <input 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-navy-600 mt-0.5"
                          value={surg.city}
                          onChange={(e) => handleSurgeryChange(idx, 'city', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addSurgeryRow} className="w-full py-2 border-2 border-dashed border-gray-200 text-gray-400 rounded-xl hover:border-teal-400 hover:text-teal-600 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors bg-white cursor-pointer">
                  <i className="ti ti-plus text-sm"/> Add Surgery Row
                </button>
              </div>
            )}

            {activeTab === 'abnormalities' && (
              <div className="space-y-4">
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Detected Lab Abnormalities</label>
                    <textarea 
                      rows={4}
                      className="w-full border border-gray-200 rounded p-2 text-xs text-navy-600 bg-white"
                      value={abnormalities}
                      onChange={(e) => setAbnormalities(e.target.value)}
                      placeholder="e.g. Fasting Blood Glucose: 145 mg/dL (Reference: 70-100 mg/dL) - HIGH"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">AI Actionable Recommendations</label>
                    <textarea 
                      rows={4}
                      className="w-full border border-gray-200 rounded p-2 text-xs text-navy-600 bg-white"
                      value={suggestions}
                      onChange={(e) => setSuggestions(e.target.value)}
                      placeholder="e.g. Reduce sugar intake, perform post-meal walks, and consult endocrinologist."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 bg-white text-gray-500 rounded-xl hover:bg-gray-100 text-sm font-semibold transition-colors cursor-pointer">
              Discard
            </button>
            <button type="button" onClick={handleSave} className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 animate-pulse-slow">
              <i className="ti ti-check-double text-base"/> Approve &amp; Save Records
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, Badge } from '../components/UI';

export function MedicationsView() {
  const { user, addMedication } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dose: '',
    frequency: '',
    doctor: '',
    hospital: '',
    since: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    addMedication(formData);
    setFormData({
      name: '',
      dose: '',
      frequency: '',
      doctor: '',
      hospital: '',
      since: ''
    });
    setShowAdd(false);
  };

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <Card noPad>
        <CardHeader title="Current medications" icon="ti-pill" action="+ Add medication" onAction={() => setShowAdd(!showAdd)}/>
        <div className="divide-y divide-gray-50">
          {user.medications.map(m => (
            <div key={m.id} className="px-5 py-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ti ti-pill text-teal-500 text-base"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-navy-600">{m.name}</p>
                  <Badge variant="teal">{m.dose}</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">{m.frequency} · Since {m.since}</p>
                <p className="text-xs text-teal-600 mt-0.5">{m.doctor} · {m.hospital}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showAdd && (
        <Card>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Add new medication</p>
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Drug name</label>
                <input 
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. Metformin"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Dosage</label>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. 500mg"
                  value={formData.dose}
                  onChange={(e) => handleChange('dose', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Frequency</label>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. Twice daily"
                  value={formData.frequency}
                  onChange={(e) => handleChange('frequency', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Prescribing doctor</label>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. Dr. S. Kapoor"
                  value={formData.doctor}
                  onChange={(e) => handleChange('doctor', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Hospital</label>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. AIIMS"
                  value={formData.hospital}
                  onChange={(e) => handleChange('hospital', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Start date</label>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. Jan 2020"
                  value={formData.since}
                  onChange={(e) => handleChange('since', e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition-colors cursor-pointer border-none font-semibold">Save medication</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border-none font-semibold">Cancel</button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, Badge } from '../components/UI';

export function SurgeriesView() {
  const { user, addSurgery } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: '',
    hospital: '',
    doctor: '',
    city: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    addSurgery(formData);
    setFormData({
      name: '',
      date: '',
      type: '',
      hospital: '',
      doctor: '',
      city: ''
    });
    setShowAdd(false);
  };

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <Card noPad>
        <CardHeader title="Surgical history" icon="ti-cut" action="+ Add surgery" onAction={() => setShowAdd(!showAdd)}/>
        <div className="divide-y divide-gray-50">
          {user.surgeries.map((s, i) => (
            <div key={s.id} className="px-5 py-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5 text-purple-600 font-display font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-navy-600">{s.name}</p>
                  <Badge variant="purple">{s.type}</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">{s.date}</p>
                <p className="text-xs text-teal-600 mt-0.5">
                  <i className="ti ti-building-hospital text-xs mr-1"/>{s.hospital}, {s.city}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  <i className="ti ti-stethoscope text-xs mr-1"/>{s.doctor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showAdd && (
        <Card>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Add new surgery</p>
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Surgery name</label>
                <input 
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. Appendectomy"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Date</label>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. Feb 2017"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Type / Indication</label>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. Laparoscopic"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Hospital</label>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. AIIMS New Delhi"
                  value={formData.hospital}
                  onChange={(e) => handleChange('hospital', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Surgeon name</label>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. Dr. Priya Rao"
                  value={formData.doctor}
                  onChange={(e) => handleChange('doctor', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">City</label>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. New Delhi"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition-colors cursor-pointer border-none font-semibold">Save surgery</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border-none font-semibold">Cancel</button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

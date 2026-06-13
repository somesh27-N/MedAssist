import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/UI';

export function EmergencyView() {
  const { user, addEmergencyContact } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relation: '',
    phone: '',
    primary: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    addEmergencyContact(formData);
    setFormData({
      name: '',
      relation: '',
      phone: '',
      primary: false
    });
    setShowAdd(false);
  };

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <Card noPad>
        <CardHeader title="Emergency contacts" icon="ti-phone-call" action="+ Add contact" onAction={() => setShowAdd(!showAdd)}/>
        <div className="px-5 py-4 space-y-3">
          {user.emergencyContacts.map(ec => (
            <div key={ec.id} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: '#FFFBF0', border: '1px solid #FEE5C0' }}>
              <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-sm text-white font-medium">
                {ec.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy-600">{ec.name}</p>
                <p className="text-xs text-gray-500">{ec.relation}{ec.primary ? ' · Primary contact' : ''}</p>
              </div>
              <span className="text-xs text-amber-600 font-mono bg-amber-100 px-2.5 py-1 rounded-lg">{ec.phone}</span>
            </div>
          ))}
        </div>
      </Card>

      {showAdd && (
        <Card>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Add new emergency contact</p>
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Contact name</label>
                <input 
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. Priya Sharma"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Relation</label>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. Spouse"
                  value={formData.relation}
                  onChange={(e) => handleChange('relation', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Phone number</label>
                <input 
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. +91 98100 XXXXX"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input 
                  type="checkbox"
                  id="primary-contact"
                  className="rounded border-gray-200 text-teal-500 focus:ring-teal-400"
                  checked={formData.primary}
                  onChange={(e) => handleChange('primary', e.target.checked)}
                />
                <label htmlFor="primary-contact" className="text-xs text-gray-400 select-none">Primary emergency contact</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition-colors cursor-pointer border-none font-semibold">Save contact</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border-none font-semibold">Cancel</button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

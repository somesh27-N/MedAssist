import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, Badge, StatusDot } from '../components/UI';

export function DiseasesView() {
  const { user, addDisease } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    since: '',
    status: 'active',
    note: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    addDisease(formData);
    setFormData({
      name: '',
      since: '',
      status: 'active',
      note: ''
    });
    setShowAdd(false);
  };

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <Card noPad>
        <CardHeader title="Disease history" icon="ti-virus" action="+ Add condition" onAction={() => setShowAdd(!showAdd)}/>
        <div className="divide-y divide-gray-50">
          {user.totalDiseases.map(d => (
            <div key={d.id} className="px-5 py-3.5 flex items-center gap-3">
              <StatusDot status={d.status}/>
              <div className="flex-1">
                <p className="text-sm font-medium text-navy-600">{d.name}</p>
                <p className="text-xs text-gray-400">Since {d.since} · {d.note}</p>
              </div>
              <Badge variant={d.status === 'active' ? 'red' : 'gray'}>
                {d.status === 'active' ? 'Active' : 'Resolved'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {showAdd && (
        <Card>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Add new condition</p>
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Condition name</label>
                <input 
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. Asthma"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Diagnosed in (year)</label>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. 2024"
                  value={formData.since}
                  onChange={(e) => handleChange('since', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Status</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 bg-white transition-colors"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Notes / Description</label>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-600 outline-none focus:border-teal-400 transition-colors" 
                  placeholder="e.g. Controlled with inhaler"
                  value={formData.note}
                  onChange={(e) => handleChange('note', e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition-colors cursor-pointer border-none font-semibold">Save condition</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border-none font-semibold">Cancel</button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

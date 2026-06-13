import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/UI';

export function InsuranceView() {
  const { user } = useApp();
  const { ayushman, private: pvt } = user.insurance;

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {[
        { title: 'Ayushman Bharat', data: [{ k: 'Status', v: 'Active', g: true }, { k: 'Card number', v: ayushman.cardNo, m: true }, { k: 'Coverage', v: ayushman.cover }, { k: 'Validity', v: ayushman.expiry }] },
        { title: pvt.provider, data: [{ k: 'Status', v: 'Active', g: true }, { k: 'Policy number', v: pvt.policyNo, m: true }, { k: 'Sum insured', v: pvt.cover }, { k: 'Expiry', v: pvt.expiry }] },
      ].map(({ title, data }) => (
        <Card noPad key={title}>
          <CardHeader title={title} icon="ti-shield-check" />
          <div className="px-5 py-4 space-y-1">
            {data.map(({ k, v, g, m }) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-400">{k}</span>
                <span className={`text-xs font-medium ${g ? 'text-green-600' : 'text-navy-600'} ${m ? 'font-mono' : ''}`}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

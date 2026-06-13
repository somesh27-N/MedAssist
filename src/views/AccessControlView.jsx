import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, Badge } from '../components/UI';

export function AccessControlView() {
  const { permissions, togglePermission, accessLogs, fetchAccessLogs, user } = useApp();
  const [dbLogs, setDbLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const data = await fetchAccessLogs();
        if (data && data.length > 0) {
          // Format DB logs to match the UI columns
          const formatted = data.map(log => {
            const isEmergency = log.emergency_bypass;
            let method = 'UID Search';
            if (log.action_type?.toLowerCase().includes('biometric')) {
              method = 'Biometric Scan';
            } else if (log.action_type?.toLowerCase().includes('otp')) {
              method = 'UID + OTP';
            } else if (log.action_type?.toLowerCase().includes('override')) {
              method = 'Emergency Override';
            } else if (log.action_type?.toLowerCase().includes('bypass')) {
              method = 'Emergency Override';
            }

            let status = 'Success';
            if (log.action_type?.toLowerCase().includes('failed') || log.action_type?.toLowerCase().includes('invalid')) {
              status = 'Failed';
            } else if (log.action_type?.toLowerCase().includes('blocked')) {
              status = 'Blocked';
            } else if (isEmergency) {
              status = 'Override Approved';
            }

            let reason = log.action_type || 'Clinical Access';
            if (isEmergency) {
              reason = 'Accident/Trauma Override';
            }

            return {
              id: log.id,
              viewer: log.accessor_name,
              time: new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
              method,
              status,
              reason
            };
          });
          setDbLogs(formatted);
        } else {
          setDbLogs([]);
        }
      } catch (err) {
        console.error('Failed to load DB access logs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, [user, accessLogs]); // Reload when context accessLogs change too

  // If DB logs are empty, use context mock logs
  const displayLogs = dbLogs.length > 0 ? dbLogs : accessLogs;

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-left">
      <div className="grid md:grid-cols-3 gap-5">
        
        {/* Left Column: Permissions Manager */}
        <div className="md:col-span-1 flex flex-col gap-5">
          <Card noPad>
            <CardHeader title="Access Permissions Manager" icon="ti-lock" />
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-400 leading-relaxed mb-2">
                Configure who can access your medical records. Any blocked doctor or hospital will be denied access in real-time.
              </p>
              <div className="divide-y divide-gray-50/10">
                {Object.values(permissions).map((perm) => (
                  <div key={perm.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0 pr-2 text-left">
                      <p className="text-sm font-medium text-navy-600 truncate">{perm.name}</p>
                      <p className="text-xs text-gray-400 truncate">{perm.hospital}</p>
                    </div>
                    <button
                      onClick={() => togglePermission(perm.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                        perm.status === 'authorized'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      }`}
                      style={{ borderStyle: 'solid' }}
                    >
                      {perm.status === 'authorized' ? 'Authorized' : 'Blocked'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Audit Logs */}
        <div className="md:col-span-2">
          <Card noPad>
            <CardHeader title="Access Audit Logs" icon="ti-history" />
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider bg-gray-50">
                      <th className="px-5 py-3">Viewer</th>
                      <th className="px-5 py-3">Time</th>
                      <th className="px-5 py-3">Method</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50/10">
                    {displayLogs.slice().reverse().map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-navy-600">{log.viewer}</td>
                        <td className="px-5 py-3.5 text-gray-400">{log.time}</td>
                        <td className="px-5 py-3.5 text-gray-400">{log.method}</td>
                        <td className="px-5 py-3.5">
                          <Badge
                            variant={
                              log.status === 'Success'
                                ? 'green'
                                : log.status.includes('Approved')
                                ? 'purple'
                                : 'red'
                            }
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400">{log.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
        
      </div>
    </div>
  );
}

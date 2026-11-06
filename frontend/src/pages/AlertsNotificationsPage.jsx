import React, { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import api from '../services/api';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Bell,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';

const AlertsNotificationsPage = () => {
  const { alerts, refreshQueueData, addNotification } = useQueue();
  const [allAlerts, setAllAlerts] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    fetchAllAlerts();
  }, [alerts]);

  const fetchAllAlerts = async () => {
    try {
      const res = await api.get('/api/alerts?limit=50');
      setAllAlerts(res.data);
    } catch (err) {
      console.error('Error fetching all alerts:', err);
    }
  };

  const handleResolve = async (alertId) => {
    setLoadingAction(`resolve-${alertId}`);
    try {
      await api.patch(`/api/alerts/${alertId}`);
      addNotification('Alert marked as resolved.', 'success');
      await refreshQueueData();
      await fetchAllAlerts();
    } catch (err) {
      addNotification('Failed to resolve alert.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const filtered = allAlerts.filter((a) => {
    if (filterSeverity === 'All') return true;
    return a.severity.toLowerCase() === filterSeverity.toLowerCase();
  });

  const activeAlerts = filtered.filter((a) => !a.is_resolved);
  const resolvedAlerts = filtered.filter((a) => a.is_resolved);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Congestion & Bottleneck Alerts
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Early overcrowding indicators, counter delay warnings, and automated action proposals.
              </p>
            </div>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Active Unresolved Alerts Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span>Active Unresolved Alerts</span>
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        </h2>

        {activeAlerts.length > 0 ? (
          <div className="space-y-3">
            {activeAlerts.map((a) => {
              const isCrit = a.severity === 'Critical';
              const isHigh = a.severity === 'High';

              return (
                <div
                  key={a.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 ${
                    isCrit
                      ? 'bg-rose-950/30 border-rose-500/50 shadow-lg shadow-rose-500/10'
                      : isHigh
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-500/5'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start space-x-3.5 max-w-2xl">
                    <div className="mt-0.5">
                      {isCrit ? (
                        <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isCrit ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                        }`}>
                          {a.severity}
                        </span>
                        <h3 className="text-sm font-bold text-white">{a.title}</h3>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{a.message}</p>
                      
                      {a.recommended_action && (
                        <div className="mt-2.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-cyan-300 flex items-center gap-2">
                          <strong className="text-white">Recommended Action:</strong>
                          <span>{a.recommended_action}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleResolve(a.id)}
                    disabled={loadingAction === `resolve-${a.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve Alert</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Active Congestion Alerts</h3>
            <p className="text-xs text-slate-400">Queue flow is within optimal limits across all active counters.</p>
          </div>
        )}
      </div>

      {/* Resolved History Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Resolved Alerts Log
        </h3>

        {resolvedAlerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-semibold">Severity</th>
                  <th className="pb-3 font-semibold">Incident</th>
                  <th className="pb-3 font-semibold">Resolution Proposal</th>
                  <th className="pb-3 font-semibold">Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {resolvedAlerts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/30 text-slate-400">
                    <td className="py-3 font-bold">{a.severity}</td>
                    <td className="py-3 font-medium text-slate-300">{a.title}</td>
                    <td className="py-3 text-slate-400">{a.recommended_action || 'Staff adjusted'}</td>
                    <td className="py-3 text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Resolved
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-3 text-center">No resolved alerts in history.</p>
        )}
      </div>

    </div>
  );
};

export default AlertsNotificationsPage;

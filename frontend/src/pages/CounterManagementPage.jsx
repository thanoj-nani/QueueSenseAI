import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import api from '../services/api';
import {
  Users,
  Power,
  Play,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Layers,
  Edit2
} from 'lucide-react';

const CATEGORIES = [
  "General Consultation",
  "Emergency",
  "Billing",
  "Registration",
  "Laboratory",
  "Other Services",
  "All"
];

const CounterManagementPage = () => {
  const { counters, refreshQueueData, addNotification } = useQueue();
  const [newCounterNum, setNewCounterNum] = useState('');
  const [newCounterName, setNewCounterName] = useState('');
  const [newCounterCat, setNewCounterCat] = useState('General Consultation');
  const [newCounterStaff, setNewCounterStaff] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  const handleToggleActive = async (counter) => {
    setLoadingAction(`toggle-${counter.id}`);
    try {
      await api.patch(`/api/counters/${counter.id}`, {
        is_active: !counter.is_active,
        is_busy: false
      });
      addNotification(`Counter ${counter.number} ${!counter.is_active ? 'opened' : 'closed'}.`, 'info');
      await refreshQueueData();
    } catch (err) {
      addNotification('Failed to toggle counter status.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCallNext = async (counterId) => {
    setLoadingAction(`call-${counterId}`);
    try {
      const res = await api.post(`/api/counters/${counterId}/call-next`);
      addNotification(`Called token ${res.data.token_number} to Counter!`, 'success');
      await refreshQueueData();
    } catch (err) {
      addNotification(err.response?.data?.detail || 'No waiting tokens found for this counter.', 'warning');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAddCounter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/counters', {
        number: parseInt(newCounterNum),
        name: newCounterName,
        service_category: newCounterCat,
        staff_name: newCounterStaff || 'Staff Member',
        is_active: true,
        avg_service_time: 8.0
      });
      addNotification(`Counter ${newCounterNum} created successfully!`, 'success');
      setShowAddForm(false);
      setNewCounterNum('');
      setNewCounterName('');
      setNewCounterStaff('');
      await refreshQueueData();
    } catch (err) {
      addNotification(err.response?.data?.detail || 'Failed to create counter.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Counter Fleet Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure desk allocations, toggle operational availability, and call waiting patients.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel Form' : 'Add New Desk'}</span>
        </button>
      </div>

      {/* Add New Desk Collapsible Form */}
      {showAddForm && (
        <form onSubmit={handleAddCounter} className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Deploy New Service Counter</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Counter Number</label>
              <input
                type="number"
                required
                value={newCounterNum}
                onChange={(e) => setNewCounterNum(e.target.value)}
                placeholder="e.g. 7"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Desk Name</label>
              <input
                type="text"
                required
                value={newCounterName}
                onChange={(e) => setNewCounterName(e.target.value)}
                placeholder="e.g. Pediatric Desk"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
              <select
                value={newCounterCat}
                onChange={(e) => setNewCounterCat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Staff In Charge</label>
              <input
                type="text"
                value={newCounterStaff}
                onChange={(e) => setNewCounterStaff(e.target.value)}
                placeholder="e.g. Dr. Emily Ray"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs"
          >
            Deploy Counter
          </button>
        </form>
      )}

      {/* Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {counters.map((c) => {
          const isBusy = c.is_busy;
          const isActive = c.is_active;

          return (
            <div
              key={c.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
                isActive
                  ? isBusy
                    ? 'bg-slate-900 border-amber-500/40 shadow-md'
                    : 'bg-slate-900 border-slate-800 shadow-md'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-70'
              }`}
            >
              <div>
                {/* Desk Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-cyan-400 text-base border border-slate-700">
                      {c.number}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{c.name}</h3>
                      <span className="text-xs text-cyan-400 font-medium">{c.service_category}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    !isActive ? 'bg-slate-800 text-slate-500' : (isBusy ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')
                  }`}>
                    {!isActive ? 'Closed' : (isBusy ? 'In Service' : 'Ready')}
                  </span>
                </div>

                {/* Staff & Workload Metrics */}
                <div className="mt-5 space-y-2 text-xs pt-4 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Staff Assigned:</span>
                    <span className="font-semibold text-slate-200">{c.staff_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Duration:</span>
                    <span className="font-semibold text-slate-200">{c.avg_service_time} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Served:</span>
                    <span className="font-semibold text-emerald-400">{c.total_served} patients</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(c)}
                  disabled={loadingAction === `toggle-${c.id}`}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border-slate-700 hover:border-rose-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isActive ? 'Close Desk' : 'Open Desk'}</span>
                </button>

                {isActive && (
                  <button
                    onClick={() => handleCallNext(c.id)}
                    disabled={loadingAction === `call-${c.id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Call Next</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default CounterManagementPage;

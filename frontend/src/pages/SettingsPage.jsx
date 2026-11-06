import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import {
  Settings,
  Sliders,
  Shield,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Save,
  Database
} from 'lucide-react';

const SettingsPage = () => {
  const { resetSimulation, addNotification } = useQueue();
  const [congestionThreshold, setCongestionThreshold] = useState(15);
  const [waitAlertMins, setWaitAlertMins] = useState(25);
  const [priorityPreemption, setPriorityPreemption] = useState(true);
  const [antiStarvationWindow, setAntiStarvationWindow] = useState(30);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addNotification('Queue governance rules and thresholds saved!', 'success');
    }, 600);
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all demo queue states, active tokens, and counter delays to default factory baseline?')) return;
    setResetting(true);
    try {
      await resetSimulation();
      addNotification('Demo queue environment reset to factory initial state.', 'info');
    } catch (err) {
      addNotification('Failed to reset simulation.', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              System Governance & Queue Policies
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Configure alert trigger boundaries, priority scheduling algorithms, and demo parameters.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Congestion & Surge Limits */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Congestion & Overcrowding Boundaries
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Queue Surge Warning Threshold
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={congestionThreshold}
                  onChange={(e) => setCongestionThreshold(e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-white text-center"
                />
                <span className="text-xs text-slate-400">waiting tokens triggers High Alert</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Maximum Wait Time Tolerance
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={waitAlertMins}
                  onChange={(e) => setWaitAlertMins(e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-white text-center"
                />
                <span className="text-xs text-slate-400">mins estimated delay triggers alert</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Priority & Fairness Policies */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Priority Dispatch & Anti-Starvation Rules
          </h2>

          <div className="space-y-4 text-xs">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={priorityPreemption}
                onChange={(e) => setPriorityPreemption(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
              />
              <div>
                <span className="font-bold text-white block">Emergency Triage Preemption</span>
                <span className="text-slate-400">
                  Allows critical emergency intake to bypass ordinary waiting queues and automatically allocate next idle desk.
                </span>
              </div>
            </label>

            <div className="pt-2">
              <label className="block font-semibold text-slate-300 mb-1">
                Anti-Starvation Aging Window: <span className="text-cyan-400 font-bold">{antiStarvationWindow} mins</span>
              </label>
              <p className="text-slate-400 text-[11px] mb-2">
                Guarantees regular queue tokens are not starved when high volumes of priority tokens arrive.
              </p>
              <input
                type="range"
                min="10"
                max="60"
                value={antiStarvationWindow}
                onChange={(e) => setAntiStarvationWindow(e.target.value)}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>

      </form>

      {/* Danger / Demo Reset Zone */}
      <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-4">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Demo Reset & Flush Zone</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Flushes active simulated queues, clears generated alerts, and restores the 6 standard demo counters and baseline tokens.
        </p>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{resetting ? 'Resetting...' : 'Reset Simulation & Database to Baseline'}</span>
        </button>
      </div>

    </div>
  );
};

export default SettingsPage;

import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import {
  Zap,
  Users,
  Clock,
  PowerOff,
  RotateCcw,
  X,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

const CrowdSimulatorBar = ({ isOpen, onClose }) => {
  const { simulateArrivals, simulateDelay, simulateCounterClosure, resetSimulation, counters } = useQueue();
  const [loadingAction, setLoadingAction] = useState(null);
  const [selectedCounter, setSelectedCounter] = useState('');
  const [delayMins, setDelayMins] = useState(15);

  if (!isOpen) return null;

  const handleArrivals = async (count) => {
    setLoadingAction(`arrivals-${count}`);
    try {
      await simulateArrivals(count);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelay = async () => {
    setLoadingAction('delay');
    try {
      await simulateDelay(selectedCounter ? parseInt(selectedCounter) : null, parseFloat(delayMins));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleClosure = async () => {
    setLoadingAction('closure');
    try {
      await simulateCounterClosure(selectedCounter ? parseInt(selectedCounter) : null);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReset = async () => {
    setLoadingAction('reset');
    try {
      await resetSimulation();
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 pointer-events-none flex justify-center animate-in slide-in-from-bottom duration-300">
      <div className="pointer-events-auto bg-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-2xl p-4 sm:p-5 text-slate-100 max-w-4xl w-full backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Live Crowd & Queue Stress Simulator
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-semibold">
                  Judges Demo Tool
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Inject sudden bursts of traffic, simulate counter outages, or introduce delays to observe AI adaptation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3.5">
          
          {/* Burst Arrivals */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Simulate Arrivals
            </span>
            <div className="flex gap-1.5">
              {[10, 25, 50].map((num) => (
                <button
                  key={num}
                  disabled={!!loadingAction}
                  onClick={() => handleArrivals(num)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  {loadingAction === `arrivals-${num}` ? '...' : `+${num}`}
                </button>
              ))}
            </div>
          </div>

          {/* Service Delay */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Simulate Delay
            </span>
            <div className="flex gap-1.5">
              <select
                value={delayMins}
                onChange={(e) => setDelayMins(e.target.value)}
                className="flex-1 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
              >
                <option value="10">+10 min</option>
                <option value="20">+20 min</option>
                <option value="30">+30 min</option>
              </select>
              <button
                disabled={!!loadingAction}
                onClick={handleDelay}
                className="py-1 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all disabled:opacity-50"
              >
                {loadingAction === 'delay' ? '...' : 'Apply'}
              </button>
            </div>
          </div>

          {/* Counter Closure */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <PowerOff className="w-3.5 h-3.5 text-rose-400" />
              Counter Closure
            </span>
            <div className="flex gap-1.5">
              <select
                value={selectedCounter}
                onChange={(e) => setSelectedCounter(e.target.value)}
                className="flex-1 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
              >
                <option value="">Any Active</option>
                {counters.map((c) => (
                  <option key={c.id} value={c.id}>
                    Counter {c.number}
                  </option>
                ))}
              </select>
              <button
                disabled={!!loadingAction}
                onClick={handleClosure}
                className="py-1 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all disabled:opacity-50"
              >
                {loadingAction === 'closure' ? '...' : 'Close'}
              </button>
            </div>
          </div>

          {/* Reset Baseline */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-end">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              Reset State
            </span>
            <button
              disabled={!!loadingAction}
              onClick={handleReset}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {loadingAction === 'reset' ? 'Resetting...' : 'Reset Queue'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CrowdSimulatorBar;

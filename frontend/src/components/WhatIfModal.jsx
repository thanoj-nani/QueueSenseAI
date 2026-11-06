import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Sparkles,
  TrendingDown,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Gauge
} from 'lucide-react';

const WhatIfModal = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchWhatIf();
    }
  }, [isOpen]);

  const fetchWhatIf = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/simulation/what-if');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching What-If analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                What-If Queue Capacity Simulation
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                  Predictive Modeling
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Comparative scenario analysis evaluating queue throughput and wait-time reduction.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-slate-400 font-medium">Running multi-scenario simulation algorithms...</p>
            </div>
          ) : data ? (
            <>
              {/* Recommendation Callout */}
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start space-x-3">
                <Gauge className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">AI Optimizer Recommendation</h4>
                  <p className="text-sm text-slate-200 font-medium mt-0.5 leading-relaxed">
                    {data.recommendation}
                  </p>
                </div>
              </div>

              {/* 3 Scenarios Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Scenario 1: Baseline */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Scenario 1</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-semibold">Current</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{data.baseline.scenario_name}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{data.baseline.description}</p>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-700/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Active Counters:</span>
                      <span className="font-bold text-white">{data.baseline.active_counters}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Est. Average Wait:</span>
                      <span className="font-bold text-amber-400">{data.baseline.estimated_avg_wait} min</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Throughput:</span>
                      <span className="font-bold text-slate-200">{data.baseline.throughput_per_hour}/hr</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Congestion Risk:</span>
                      <span className={`font-bold ${data.baseline.congestion_risk === 'High' ? 'text-rose-400' : 'text-amber-400'}`}>
                        {data.baseline.congestion_risk}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 text-center text-xs font-semibold text-slate-400 border border-slate-700/40">
                    Baseline Metric
                  </div>
                </div>

                {/* Scenario 2: +1 Counter */}
                <div className="p-5 rounded-2xl bg-slate-800/80 border border-blue-500/40 flex flex-col justify-between space-y-4 shadow-lg shadow-blue-500/5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Scenario 2</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">+1 Counter</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{data.scenario_additional_counter.scenario_name}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{data.scenario_additional_counter.description}</p>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-700/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Active Counters:</span>
                      <span className="font-bold text-white">{data.scenario_additional_counter.active_counters}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Est. Average Wait:</span>
                      <span className="font-bold text-cyan-400">{data.scenario_additional_counter.estimated_avg_wait} min</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Throughput:</span>
                      <span className="font-bold text-slate-200">{data.scenario_additional_counter.throughput_per_hour}/hr</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Congestion Risk:</span>
                      <span className="font-bold text-emerald-400">{data.scenario_additional_counter.congestion_risk}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-center text-xs font-bold text-blue-300 border border-blue-500/30 flex items-center justify-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    -{data.scenario_additional_counter.wait_time_reduction_percent}% Wait Time
                  </div>
                </div>

                {/* Scenario 3: AI Optimized Allocation */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-800 to-navy-900 border-2 border-cyan-500 flex flex-col justify-between space-y-4 shadow-xl shadow-cyan-500/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-[9px] font-black uppercase px-3 py-0.5 rounded-bl-xl tracking-wider">
                    Recommended
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Scenario 3</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">AI Orchestrated</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{data.scenario_optimized_allocation.scenario_name}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{data.scenario_optimized_allocation.description}</p>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-700/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Active Counters:</span>
                      <span className="font-bold text-white">{data.scenario_optimized_allocation.active_counters}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Est. Average Wait:</span>
                      <span className="font-bold text-emerald-400">{data.scenario_optimized_allocation.estimated_avg_wait} min</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Throughput:</span>
                      <span className="font-bold text-slate-200">{data.scenario_optimized_allocation.throughput_per_hour}/hr</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Congestion Risk:</span>
                      <span className="font-bold text-emerald-400">{data.scenario_optimized_allocation.congestion_risk}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 text-center text-xs font-black shadow-md shadow-cyan-500/30 flex items-center justify-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 stroke-[3]" />
                    -{data.scenario_optimized_allocation.wait_time_reduction_percent}% Max Wait Reduction
                  </div>
                </div>

              </div>

              {/* Disclaimer */}
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Transparency Notice:</strong> Scenario outcomes are computed using multi-server Poisson queuing approximations (\(M/M/c\)) combined with current empirical counter performance.
                </span>
              </div>
            </>
          ) : null}
        </div>

      </div>
    </div>
  );
};

export default WhatIfModal;

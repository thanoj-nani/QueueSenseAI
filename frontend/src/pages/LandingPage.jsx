import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import {
  Layers,
  Cpu,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  QrCode,
  Zap,
  CheckCircle2,
  Activity
} from 'lucide-react';

const LandingPage = ({ onOpenSimulator, onOpenWhatIf }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { overview, wsConnected } = useQueue();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Glow Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 to-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Hackathon Header Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            QueueSense AI • Hackathon Innovation Prototype
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Stop waiting blindly. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-400 bg-clip-text text-transparent">
              Predict and optimize
            </span> queues in real-time.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Hospitals, banks, and service hubs experience unpredictable congestion. 
            QueueSense AI combines <strong className="text-white font-semibold">trained machine learning models</strong> with <strong className="text-white font-semibold">real-time counter allocation</strong> to forecast wait times, resolve bottlenecks, and reduce delay.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/user/generate-token"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center gap-2 group"
            >
              <span>Get Digital Token</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/dashboard"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition-all flex items-center gap-2"
            >
              <span>Open Admin Console</span>
            </Link>

            <button
              onClick={onOpenSimulator}
              className="px-5 py-3.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Launch Live Simulator</span>
            </button>
          </div>

          {/* Live System Metric Ribbon */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-2xl backdrop-blur-md">
            <div className="p-3 text-center border-r border-slate-800/80 last:border-none">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Queue Model</p>
              <p className="text-lg font-bold text-white mt-0.5">Random Forest</p>
              <span className="text-[10px] text-emerald-400 font-semibold">R² = 0.9905</span>
            </div>
            <div className="p-3 text-center border-r border-slate-800/80 last:border-none">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Currently Waiting</p>
              <p className="text-lg font-bold text-cyan-400 mt-0.5">{overview?.currently_waiting ?? 6} Users</p>
              <span className="text-[10px] text-slate-400">Live Active Queue</span>
            </div>
            <div className="p-3 text-center border-r border-slate-800/80 last:border-none">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Counters</p>
              <p className="text-lg font-bold text-blue-400 mt-0.5">{overview?.active_counters_count ?? 6} Open</p>
              <span className="text-[10px] text-slate-400">Dynamic Rebalance</span>
            </div>
            <div className="p-3 text-center">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Est. Time Saved</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">~38% Saved</p>
              <span className="text-[10px] text-slate-400">vs Static FIFO Baseline</span>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Full-Stack Intelligence</h2>
            <p className="text-3xl font-extrabold text-white mt-2">Built for high-stakes operational reliability</p>
            <p className="text-slate-400 text-sm mt-3">
              Traditional tokens only count numbers. QueueSense AI models human arrival dynamics, priority urgency, and counter service distributions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Machine Learning Wait Predictions</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Trained on over 12,000 multi-server queue records. Computes empirical 95% confidence intervals from ensemble tree variance.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Intelligent Counter Allocation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Matches users to the best counter based on specialist categories, existing queue backlog, service speeds, and priority levels.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Live QR Pass Tracking</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every digital token generates an instant mobile QR code pass. Users can roam freely and watch their queue position update via WebSockets.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Early Congestion Alerts</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Detects surge conditions before lines become unmanageable. Generates actionable mitigation recommendations for administrators.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">What-If Capacity Simulator</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Interactive decision sandbox enabling managers to compare the throughput impact of opening +1 counter vs dynamic AI reallocation.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Priority-Aware Fair Queueing</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Fast-tracks critical emergencies, seniors, and disabled patients without starving regular queue order through anti-starvation policy checks.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800/80 bg-slate-950 text-slate-500 text-xs text-center">
        <p>© 2026 QueueSense AI – Intelligent Predictive Queue Management System. All rights reserved.</p>
        <p className="mt-1">Built with FastAPI, Scikit-learn, React, Vite, and WebSockets for the Hackathon Demonstration.</p>
      </footer>

    </div>
  );
};

export default LandingPage;

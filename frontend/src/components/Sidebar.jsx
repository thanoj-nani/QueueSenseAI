import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  BarChart3,
  AlertTriangle,
  Settings,
  Ticket,
  Users,
  Compass,
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';
import { useQueue } from '../context/QueueContext';

const Sidebar = ({ onOpenSimulator, onOpenWhatIf }) => {
  const { alerts, resetSimulation } = useQueue();
  const unresolvedAlerts = alerts?.filter(a => !a.is_resolved).length || 0;

  const adminNav = [
    { name: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Counters', to: '/admin/counters', icon: Users },
    { name: 'AI Predictions', to: '/admin/ai-predictions', icon: Cpu, badge: 'ML' },
    { name: 'Analytics & Reports', to: '/admin/analytics', icon: BarChart3 },
    { name: 'Alerts & Congestion', to: '/admin/alerts', icon: AlertTriangle, count: unresolvedAlerts },
    { name: 'System Settings', to: '/admin/settings', icon: Settings },
  ];

  const userNav = [
    { name: 'User Dashboard', to: '/user/dashboard', icon: Compass },
    { name: 'Generate Token', to: '/user/generate-token', icon: Ticket },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-slate-800 flex flex-col justify-between py-5 px-3 min-h-[calc(100vh-4rem)] text-slate-300">
      <div className="space-y-6">
        {/* Admin Navigation */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Operations & Control
          </div>
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                  {item.count > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                      {item.count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User View Navigation */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Public & Patient Portals
          </div>
          <nav className="space-y-1">
            {userNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-600/10 text-blue-400 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Simulator Shortcut Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-navy-800 border border-slate-700/80 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Hackathon Engine
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
            Active
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Simulate traffic bursts, service delays, and what-if scenarios in real time.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onOpenSimulator}
            className="flex-1 py-1.5 text-center text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm"
          >
            Simulate
          </button>
          <button
            onClick={resetSimulation}
            className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import {
  Layers,
  Activity,
  User,
  LogOut,
  Bell,
  Sparkles,
  Zap,
  BarChart3,
  Sliders,
  Radio
} from 'lucide-react';

const Navbar = ({ onOpenSimulator, onOpenWhatIf }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { wsConnected, alerts } = useQueue();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unresolvedAlerts = alerts?.filter(a => !a.is_resolved).length || 0;

  return (
    <nav className="glass-nav sticky top-0 z-40 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  QueueSense <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold tracking-wider uppercase">AI</span>
                </span>
                <p className="text-[10px] text-slate-400 hidden sm:block -mt-1 font-medium">Predictive Queue Intelligence</p>
              </div>
            </Link>

            {/* Live WebSocket Status Pill */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-800/80 border-slate-700/60 ml-3">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-slate-300 flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400" />
                {wsConnected ? 'Live Sync' : 'Polling'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Demo Simulator Buttons */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors shadow-sm"
              title="Open Live Crowd Simulator"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Crowd Simulator</span>
            </button>

            <button
              onClick={onOpenWhatIf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-colors shadow-sm"
              title="Open What-If Scenario Analysis"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">What-If Analysis</span>
            </button>

            {/* Alerts Bell */}
            <Link
              to={isAdmin ? "/admin/alerts" : "#"}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unresolvedAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unresolvedAlerts}
                </span>
              )}
            </Link>

            {/* Auth Buttons or User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 border-l border-slate-700/80 pl-3">
                <Link
                  to={isAdmin ? '/admin/dashboard' : '/user/dashboard'}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden md:inline">{user?.full_name?.split(' ')[0]}</span>
                  <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${isAdmin ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-600 text-slate-200'}`}>
                    {user?.role}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;

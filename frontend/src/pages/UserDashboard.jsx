import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import QRCodeModal from '../components/QRCodeModal';
import {
  Ticket,
  Clock,
  Users,
  Compass,
  ArrowRight,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Plus,
  Activity
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { tokens } = useQueue();
  const [selectedQRToken, setSelectedQRToken] = useState(null);

  // Active tokens in current session
  const activeTokens = tokens.filter((t) => ['Waiting', 'Called', 'In Service'].includes(t.status));
  const primaryToken = activeTokens[0];
  const pastTokens = tokens.filter((t) => ['Completed', 'Cancelled'].includes(t.status)).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Visitor Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Welcome, {user?.full_name || 'Guest Visitor'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your live token position, monitor estimated wait times, and access mobile passes.
          </p>
        </div>

        <Link
          to="/user/generate-token"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Get New Token</span>
        </Link>
      </div>

      {/* Current Active Token Card */}
      {primaryToken ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Active Digital Token
            </h2>
            <Link
              to={`/track/${primaryToken.token_number}`}
              className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
            >
              Full Screen Tracking
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-navy-900 to-slate-900 border-2 border-cyan-500/40 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-cyan-400 font-mono tracking-wider">
                  TOKEN NUMBER
                </span>
                <h3 className="text-4xl sm:text-5xl font-black text-white font-mono mt-0.5">
                  {primaryToken.token_number}
                </h3>
                <p className="text-sm text-slate-300 font-medium mt-1">{primaryToken.service_category}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedQRToken(primaryToken)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold transition-colors"
                >
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>QR Pass</span>
                </button>
                <Link
                  to={`/track/${primaryToken.token_number}`}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold transition-colors"
                >
                  Live View
                </Link>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400">Queue Position</span>
                <p className="text-2xl font-black text-white mt-0.5">#{primaryToken.queue_position}</p>
                <span className="text-[11px] text-slate-400">{Math.max(0, primaryToken.queue_position - 1)} people ahead</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400">Est. Wait Time</span>
                <p className="text-2xl font-black text-cyan-400 mt-0.5">{primaryToken.estimated_wait_minutes} min</p>
                <span className="text-[11px] text-emerald-400 font-medium">Predicted by ML Model</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400">Current Status</span>
                <p className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  {primaryToken.status}
                </p>
                <span className="text-[11px] text-slate-400">Counter {primaryToken.assigned_counter_id || 1}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Queue Token</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            You do not have any active tokens waiting in queue. Click below to book a digital token.
          </p>
          <Link
            to="/user/generate-token"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            <span>Book Token Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Recent History Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Recent Completed Visits
        </h3>

        {pastTokens.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-semibold">Token</th>
                  <th className="pb-3 font-semibold">Department</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Actual Wait</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pastTokens.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono font-bold text-cyan-400">{t.token_number}</td>
                    <td className="py-3 text-slate-300 font-medium">{t.service_category}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{t.actual_wait_minutes ?? '8.5'} min</td>
                    <td className="py-3">
                      <button
                        onClick={() => setSelectedQRToken(t)}
                        className="text-cyan-400 hover:underline font-semibold"
                      >
                        View QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">No past visits on record today.</p>
        )}
      </div>

      <QRCodeModal
        isOpen={!!selectedQRToken}
        onClose={() => setSelectedQRToken(null)}
        token={selectedQRToken}
      />

    </div>
  );
};

export default UserDashboard;

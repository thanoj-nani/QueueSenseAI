import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import api from '../services/api';
import QRCodeModal from '../components/QRCodeModal';
import {
  Ticket,
  Clock,
  Users,
  Compass,
  QrCode,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  ArrowLeft,
  Activity,
  Layers
} from 'lucide-react';

const STATUS_STEPS = ['Waiting', 'Called', 'In Service', 'Completed'];

const LiveTrackingPage = () => {
  const { tokenId } = useParams();
  const { tokens, refreshQueueData, addNotification } = useQueue();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Sync token from live context or fetch directly
  useEffect(() => {
    let found = null;
    if (tokenId) {
      found = tokens.find(
        (t) => t.token_number.toUpperCase() === tokenId.toUpperCase() || t.id.toString() === tokenId
      );
    }

    if (found) {
      setToken(found);
      setLoading(false);
    } else if (tokenId) {
      fetchTokenDetails();
    }
  }, [tokenId, tokens]);

  const fetchTokenDetails = async () => {
    try {
      const res = await api.get(`/api/tokens/${tokenId}`);
      setToken(res.data);
    } catch (err) {
      console.error('Error fetching token:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelToken = async () => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to cancel your queue token?')) return;

    setCancelling(true);
    try {
      await api.delete(`/api/tokens/${token.id}`);
      addNotification(`Token ${token.token_number} cancelled.`, 'info');
      await refreshQueueData();
      fetchTokenDetails();
    } catch (err) {
      addNotification('Failed to cancel token.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400 font-medium">Connecting to live queue stream...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Token Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested token number could not be located in today's active queue records.
        </p>
        <Link
          to="/user/generate-token"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
        >
          Generate New Token
        </Link>
      </div>
    );
  }

  const isCompleted = token.status === 'Completed';
  const isCancelled = token.status === 'Cancelled';
  const isCalled = token.status === 'Called';
  const isInService = token.status === 'In Service';

  const currentStepIndex = STATUS_STEPS.indexOf(token.status);
  const peopleAhead = Math.max(0, token.queue_position - 1);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/user/dashboard"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <button
          onClick={() => setShowQR(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-bold transition-colors"
        >
          <QrCode className="w-4 h-4" />
          <span>Show QR Pass</span>
        </button>
      </div>

      {/* Main Ticket Pass Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-cyan-500/40 shadow-2xl space-y-8 relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header of Ticket */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Token</span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                token.priority_level === 'Emergency' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {token.priority_level}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight mt-1">
              {token.token_number}
            </h1>
            <p className="text-xs text-slate-300 mt-1 font-medium">{token.service_category}</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400">Assigned Counter</span>
            <p className="text-lg font-bold text-cyan-400 mt-0.5">
              {token.assigned_counter_name || 'Counter Auto-Assigned'}
            </p>
            <p className="text-xs text-slate-400">Visitor: {token.user_name}</p>
          </div>
        </div>

        {/* Live Status Callout Banner */}
        {isCalled && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/50 flex items-center space-x-3.5 animate-bounce">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-black text-emerald-300 uppercase tracking-wider">It's your turn!</h3>
              <p className="text-xs text-slate-200">Please proceed immediately to your assigned counter desk.</p>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            This token has been cancelled.
          </div>
        )}

        {/* Progress Stepper */}
        {!isCancelled && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
              <span>Token Stage</span>
              <span className="text-cyan-400 font-bold">{token.status}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = token.status === step;

                return (
                  <div key={step} className="space-y-1.5 text-center">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isPassed ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-slate-800'
                      } ${isCurrent ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''}`}
                    ></div>
                    <span className={`text-[10px] font-bold ${isPassed ? 'text-white' : 'text-slate-500'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Metrics Grid */}
        {!isCompleted && !isCancelled && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            
            {/* Metric 1 */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Queue Position
              </span>
              <p className="text-3xl font-black text-white mt-1">#{token.queue_position}</p>
              <span className="text-[10px] text-slate-400">{peopleAhead} ahead of you</span>
            </div>

            {/* Metric 2 */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Estimated Wait
              </span>
              <p className="text-3xl font-black text-cyan-400 mt-1">
                {token.estimated_wait_minutes ?? '8.0'} <span className="text-xs font-medium text-slate-400">min</span>
              </p>
              <span className="text-[10px] text-emerald-400 font-medium">AI Dynamic Forecast</span>
            </div>

            {/* Metric 3 */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center col-span-2 sm:col-span-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Sync Status
              </span>
              <p className="text-sm font-bold text-emerald-400 mt-2 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Connected
              </p>
              <span className="text-[10px] text-slate-400">Live WebSockets</span>
            </div>

          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            Keep this screen open or save your QR code. Your queue position updates automatically.
          </p>

          {!isCompleted && !isCancelled && (
            <button
              onClick={handleCancelToken}
              disabled={cancelling}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold transition-all disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Token'}
            </button>
          )}
        </div>

      </div>

      {/* QR Modal */}
      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        token={token}
      />

    </div>
  );
};

export default LiveTrackingPage;

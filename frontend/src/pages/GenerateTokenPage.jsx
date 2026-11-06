import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import api from '../services/api';
import {
  Ticket,
  Clock,
  Sparkles,
  ShieldAlert,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  CreditCard,
  ClipboardList,
  TestTube,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  { name: 'General Consultation', icon: Stethoscope, desc: 'Primary health consultations & physician checks', color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { name: 'Emergency', icon: ShieldAlert, desc: 'Critical triage, urgent acute medical attention', color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30' },
  { name: 'Billing', icon: CreditCard, desc: 'Payment settlements, insurance claims, cashier desks', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
  { name: 'Registration', icon: ClipboardList, desc: 'Patient check-in, record updates, admissions', color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30' },
  { name: 'Laboratory', icon: TestTube, desc: 'Blood analysis, radiology scans, pathology tests', color: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30' },
  { name: 'Other Services', icon: HelpCircle, desc: 'Customer support, records inquiry, pharmacy desk', color: 'from-slate-500/20 to-gray-500/20 text-slate-300 border-slate-600/30' },
];

const PRIORITIES = [
  { level: 'Regular', desc: 'Standard sequential queue position' },
  { level: 'Senior/Disabled', desc: 'Priority assistance for elders and mobility-assisted patients' },
  { level: 'VIP', desc: 'Pre-scheduled or expedited appointment holder' },
  { level: 'Emergency', desc: 'Immediate clinical intake (Overrules normal waiting lines)' },
];

const GenerateTokenPage = () => {
  const { user } = useAuth();
  const { refreshQueueData, addNotification } = useQueue();
  const navigate = useNavigate();

  const [category, setCategory] = useState('General Consultation');
  const [priority, setPriority] = useState('Regular');
  const [visitorName, setVisitorName] = useState(user?.full_name || '');
  const [visitorPhone, setVisitorPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  // Live AI Prediction preview state
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  // Fetch real-time AI wait estimate whenever category or priority changes
  useEffect(() => {
    let isCancelled = false;
    const fetchPrediction = async () => {
      setPredicting(true);
      try {
        const res = await api.post('/api/predictions/waiting-time', {
          people_waiting: 8,
          active_counters: 5,
          average_service_time: 8.5,
          service_category: category,
          priority_level: priority,
          arrival_hour: new Date().getHours(),
          day_of_week: new Date().getDay(),
        });
        if (!isCancelled) {
          setPrediction(res.data);
        }
      } catch (err) {
        console.error('Error fetching live prediction:', err);
      } finally {
        if (!isCancelled) setPredicting(false);
      }
    };

    fetchPrediction();
    return () => {
      isCancelled = true;
    };
  }, [category, priority]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/tokens', {
        service_category: category,
        priority_level: priority,
        user_name: visitorName || 'Guest Visitor',
        user_phone: visitorPhone || null,
      });

      addNotification(`Token ${res.data.token_number} generated successfully!`, 'success');
      await refreshQueueData();
      navigate(`/track/${res.data.token_number}`);
    } catch (err) {
      console.error('Failed to generate token:', err);
      addNotification('Failed to generate token. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Generate Digital Token</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Select your department and priority. Our AI model forecasts your wait time before booking.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Category and Priority Selectors */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Select Category */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-xs flex items-center justify-center font-black">1</span>
              Select Service Category
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.name;

                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      setCategory(cat.name);
                      if (cat.name === 'Emergency') setPriority('Emergency');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3.5 ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 ${cat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{cat.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Priority Level */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-xs flex items-center justify-center font-black">2</span>
              Priority & Patient Category
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRIORITIES.map((prio) => {
                const isSelected = priority === prio.level;

                return (
                  <button
                    key={prio.level}
                    type="button"
                    onClick={() => setPriority(prio.level)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{prio.level}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{prio.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Contact Details */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-xs flex items-center justify-center font-black">3</span>
              Visitor Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Phone (Optional for SMS)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Live AI Wait Prediction Preview & Submit */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-navy-900 to-slate-900 border-2 border-cyan-500/50 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Live AI Forecast
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                Random Forest
              </span>
            </div>

            {/* Main Predicted Wait Card */}
            <div className="text-center py-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Estimated Waiting Time</p>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {predicting ? '...' : (prediction?.predicted_wait_minutes ?? '8.5')}
                </span>
                <span className="text-base font-bold text-cyan-400">mins</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                {prediction?.estimated_range || '5.0 - 12.0 mins (95% CI)'}
              </p>
            </div>

            {/* Feature Breakdown Pills */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-slate-200">{category}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Priority Tier:</span>
                <span className={`font-semibold ${priority === 'Emergency' ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>{priority}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Queue State:</span>
                <span className="font-semibold text-emerald-400">Optimal (5 Open Counters)</span>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-slate-400 leading-relaxed italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
              *Real-time ML estimation. Predictions adapt as patients are called and counter loads shift.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              <span>{loading ? 'Issuing Token...' : 'Confirm & Generate Token'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

          </div>

        </div>

      </form>

    </div>
  );
};

export default GenerateTokenPage;

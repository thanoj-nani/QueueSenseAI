import React, { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  Ticket,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  Play
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = ['#06B6D4', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const AdminDashboard = () => {
  const { overview, tokens, counters, alerts, refreshQueueData } = useQueue();
  const [hourlyData, setHourlyData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [waitDistData, setWaitDistData] = useState([]);
  const [loadingCharts, setLoadingCharts] = useState(true);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardCharts();
  }, []);

  const fetchDashboardCharts = async () => {
    setLoadingCharts(true);
    try {
      const [hourlyRes, deptRes, waitRes] = await Promise.all([
        api.get('/api/analytics/hourly'),
        api.get('/api/analytics/departments'),
        api.get('/api/analytics/waiting-times'),
      ]);
      setHourlyData(hourlyRes.data);
      setDeptData(deptRes.data);
      setWaitDistData(waitRes.data);
    } catch (err) {
      console.error('Error loading admin analytics:', err);
    } finally {
      setLoadingCharts(false);
    }
  };

  const handleCallNext = async (counterId) => {
    try {
      await api.post(`/api/counters/${counterId}/call-next`);
      await refreshQueueData();
    } catch (err) {
      console.error('Call next error:', err);
    }
  };

  // Filtered tokens
  const filteredTokens = tokens.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.service_category === selectedCategory;
    const matchesSearch =
      t.token_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Operational Queue Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time multi-counter telemetry, ML wait predictions, and active queue orchestration.
          </p>
        </div>

        <button
          onClick={() => {
            refreshQueueData();
            fetchDashboardCharts();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Tokens"
          value={overview?.total_tokens_today ?? 24}
          icon={Ticket}
          color="cyan"
          subtitle="Generated Today"
        />
        <StatCard
          title="Currently Waiting"
          value={overview?.currently_waiting ?? 6}
          icon={Users}
          color="amber"
          subtitle="Active Backlog"
        />
        <StatCard
          title="In Service"
          value={overview?.currently_in_service ?? 2}
          icon={RefreshCw}
          color="blue"
          subtitle="At Active Desks"
        />
        <StatCard
          title="Completed"
          value={overview?.completed_today ?? 18}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Total Served"
        />
        <StatCard
          title="Active Counters"
          value={`${overview?.active_counters_count ?? 5}/${overview?.total_counters_count ?? 6}`}
          icon={Layers}
          color="purple"
          subtitle="Staffed Desks"
        />
        <StatCard
          title="Avg Wait Time"
          value={overview?.avg_waiting_time_minutes ?? 7.8}
          unit="min"
          icon={Clock}
          color="rose"
          subtitle="Real-time ML Mean"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hourly Flow Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Hourly Arrival & Completion Throughput</h2>
              <p className="text-xs text-slate-400">Peak hour surges vs counter processing capacity.</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-semibold border border-slate-700">
              Today's Curve
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorArrived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorServed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="arrived" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorArrived)" name="Tokens Arrived" />
                <Area type="monotone" dataKey="served" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorServed)" name="Tokens Served" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution (1 col) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Department Traffic Share</h2>
            <p className="text-xs text-slate-400">Token distribution across clinical & admin services.</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="total_tokens"
                  nameKey="category"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
            {deptData.slice(0, 4).map((d, idx) => (
              <div key={d.category} className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate">{d.category}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Active Counters Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Active Counters Telemetry
          </h2>
          <span className="text-xs text-slate-400 font-medium">Click "Call Next" to advance queue</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {counters.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-2xl border transition-all ${
                c.is_active
                  ? c.is_busy
                    ? 'bg-slate-900 border-amber-500/40 shadow-sm'
                    : 'bg-slate-900 border-slate-800 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Counter {c.number}</span>
                    <span className={`w-2 h-2 rounded-full ${c.is_active ? (c.is_busy ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-slate-600'}`}></span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{c.name}</p>
                </div>

                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  !c.is_active ? 'bg-slate-800 text-slate-500' : (c.is_busy ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')
                }`}>
                  {!c.is_active ? 'Closed' : (c.is_busy ? 'Serving' : 'Idle')}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Assigned Specialist:</span>
                  <p className="text-slate-200 font-medium">{c.staff_name}</p>
                </div>

                {c.is_active && (
                  <button
                    onClick={() => handleCallNext(c.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm transition-all active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Call Next</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Tokens Table with Filters */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Live Tokens Queue</h2>
            <p className="text-xs text-slate-400">Total active and processed tokens for current session.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search token or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="All">All Departments</option>
              <option value="General Consultation">General Consultation</option>
              <option value="Emergency">Emergency</option>
              <option value="Billing">Billing</option>
              <option value="Registration">Registration</option>
              <option value="Laboratory">Laboratory</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">Token</th>
                <th className="pb-3 font-semibold">Visitor</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Priority</th>
                <th className="pb-3 font-semibold">Queue Pos</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Assigned Desk</th>
                <th className="pb-3 font-semibold">Est. Wait</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTokens.slice(0, 15).map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="py-3 font-mono font-bold text-cyan-400">{t.token_number}</td>
                  <td className="py-3 text-slate-200 font-medium">{t.user_name}</td>
                  <td className="py-3 text-slate-400">{t.service_category}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.priority_level === 'Emergency' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {t.priority_level}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-white">#{t.queue_position}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' :
                      t.status === 'Called' ? 'bg-cyan-500/20 text-cyan-300 animate-pulse' :
                      t.status === 'In Service' ? 'bg-blue-500/20 text-blue-300' :
                      t.status === 'Cancelled' ? 'bg-slate-800 text-slate-500' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">{t.assigned_counter_name || `Counter ${t.assigned_counter_id || 1}`}</td>
                  <td className="py-3 font-mono text-cyan-300 font-semibold">{t.estimated_wait_minutes} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;

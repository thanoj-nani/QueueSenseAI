import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Mail, Lock, LogIn, ArrowRight, ShieldCheck, User } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setEmail('admin@queuesense.ai');
    setPassword('Admin@123');
    setError('');
    setLoading(true);
    try {
      await login('admin@queuesense.ai', 'Admin@123');
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Failed to login with demo admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoUser = async () => {
    setEmail('user@queuesense.ai');
    setPassword('User@123');
    setError('');
    setLoading(true);
    try {
      await login('user@queuesense.ai', 'User@123');
      navigate('/user/dashboard');
    } catch (err) {
      setError('Failed to login with demo user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-6">
        
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/25">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sign in to QueueSense AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Intelligent queue monitoring, token tracking, and predictive management.
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Hackathon Demo Quick Access */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
              Hackathon Demo Quick Login (Click to Fill & Sign In)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoAdmin}
                className="py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Demo Admin</span>
              </button>

              <button
                type="button"
                onClick={handleDemoUser}
                className="py-2.5 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Demo Visitor</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
              Register now
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LoginPage;

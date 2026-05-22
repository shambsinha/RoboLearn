import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuthStore();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.role === 'ADMIN') navigate('/admin/overview');
      else                        navigate('/student');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="relative"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-glow-indigo">
              <Cpu size={26} className="text-white" />
            </div>
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 opacity-20 blur-xl -z-10 animate-pulse" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Sign in to <span className="text-gradient-cyan">RoboLearn</span>
            </h1>
            <p className="text-slate-600 text-sm mt-1 flex items-center justify-center gap-1.5">
              <Sparkles size={12} className="text-cyan-500/60" />
              Neural learning environment
            </p>
          </div>
        </div>

        {/* Form */}
        <motion.div
          className="electric-container electric-current rounded-2xl overflow-hidden"
          whileHover={{ boxShadow: '0 0 48px -8px rgba(6,182,212,0.3)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="stark-card p-8 border-none bg-[#0a1424]/90 backdrop-blur-xl">
            <form className="space-y-5" onSubmit={handleSubmit}>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/[0.06] border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-lg text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Username or Email
              </label>
              <input
                type="text"
                required
                className="input-glass"
                placeholder="admin or user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  className="input-glass pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <motion.button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw(!showPw)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </motion.button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="btn-electric btn-electric-primary w-full justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="btn-electric-glow" />
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </form>
          </div>
        </motion.div>

        <p className="text-center text-slate-600 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-500 hover:text-cyan-400 font-semibold transition-colors">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
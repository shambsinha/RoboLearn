import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const LEVELS = [
  { value: '1st Year',             label: 'Novice' },
  { value: '2nd Year',             label: 'Intermediate' },
  { value: '3rd Year',             label: 'Advanced' },
  { value: 'Working Professional', label: 'Professional' },
];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username:        '',
    email:           '',
    password:        '',
    role:            'STUDENT',
    onboardingStatus:'1st Year',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate     = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/student');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <div className="text-center mb-7 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-glow-indigo">
              <Cpu size={22} className="text-white" />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 opacity-20 blur-lg -z-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Join <span className="text-gradient-cyan">RoboLearn</span>
            </h1>
            <p className="text-slate-600 text-[13px] mt-1">Start your AI-powered learning journey</p>
          </div>
        </div>

        {/* Form */}
        <motion.div
          className="electric-container electric-current rounded-2xl overflow-hidden"
          whileHover={{ boxShadow: '0 0 48px -8px rgba(6,182,212,0.3)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="stark-card p-7 border-none bg-[#0a1424]/90 backdrop-blur-xl">
            <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-rose-500/[0.06] border border-rose-500/20 text-rose-400 px-3.5 py-2 rounded-md text-[13px] text-center"
              >
                {error}
              </motion.div>
            )}

            <Field label="Username">
              <input name="username" type="text" required className="input-glass" placeholder="johndoe" value={formData.username} onChange={handleChange} />
            </Field>

            <Field label="Email">
              <input name="email" type="email" required className="input-glass" placeholder="user@example.com" value={formData.email} onChange={handleChange} />
            </Field>

            <Field label="Password">
              <input name="password" type="password" required className="input-glass" placeholder="••••••••" value={formData.password} onChange={handleChange} />
            </Field>

            <Field label="Experience">
              <select
                name="onboardingStatus"
                value={formData.onboardingStatus}
                onChange={handleChange}
                className="input-glass cursor-pointer"
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value} className="bg-[#0F1219]">{l.label}</option>
                ))}
              </select>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="btn-electric btn-electric-primary w-full justify-center mt-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="btn-electric-glow" />
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Creating…</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
          </div>
        </motion.div>

        <p className="text-center text-slate-600 text-[13px] mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-500 hover:text-cyan-400 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

export default RegisterPage;
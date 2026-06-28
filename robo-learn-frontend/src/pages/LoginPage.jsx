import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, X, Mail, Hash, Lock, CheckCircle2, Save, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  
  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgotPw, setShowForgotPw] = useState(false);

  const { login, loginWithGoogle, preloadDashboard, forgotPassword, resetPassword } = useAuthStore();
  const navigate  = useNavigate();

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail);
      toast.success('Reset code sent to your email');
      setOtpSent(true);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to send reset code');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail, otp, newPassword);
      toast.success('Password reset successfully!');
      setShowForgotModal(false);
      // Reset state
      setOtpSent(false);
      setForgotEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLoginSuccess = (data) => {
    toast.dismiss();
    toast.success(`Welcome back, ${data.username}`);
    // Warm up caches while navigating
    preloadDashboard(data.role);
    if (data.role === 'ADMIN') navigate('/admin/overview');
    else if (data.role === 'INSTRUCTOR') navigate('/instructor/overview');
    else navigate('/student');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      handleLoginSuccess(data);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Invalid credentials or server error.');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      handleLoginSuccess(data);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Google authentication failed.');
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

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-rose-500/5 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-lg text-[13px] flex items-center gap-2 font-medium">
                    <AlertCircle size={14} className="shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[10px] font-bold text-cyan-500/80 hover:text-cyan-400 uppercase tracking-tighter transition-colors"
                >
                  Forgot Code?
                </button>
              </div>
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
                  <span>Authorizing…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-[#0a1424] px-3 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Sign-In was unsuccessful.')}
                theme="filled_black"
                shape="pill"
                width="100%"
                text="continue_with"
              />
            </div>
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

      {/* ══ FORGOT PASSWORD MODAL ══ */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="stark-card w-full max-w-md overflow-hidden bg-[#0a0e16]"
          >
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Lock size={16} className="text-cyan-400" /> Account Recovery
              </h3>
              <button 
                onClick={() => { setShowForgotModal(false); setOtpSent(false); }}
                className="p-2 hover:bg-white/[0.05] rounded-lg text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {!otpSent ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="text-center space-y-3 mb-6">
                    <div className="w-14 h-14 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20">
                      <Mail size={28} className="text-cyan-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-white font-bold text-xs uppercase tracking-widest">Lost Access?</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Enter your registered email to receive a recovery code.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="input-glass pl-10"
                        placeholder="user@example.com"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full btn-electric btn-electric-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                  >
                    <span className="btn-electric-glow" />
                    {forgotLoading ? <Loader2 size={16} className="animate-spin" /> : 'Request Recovery Code'}
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Recovery Code</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="input-glass pl-10 tracking-[0.5em] text-center font-bold"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                      <input
                        type={showForgotPw ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-glass pl-10 pr-10"
                        placeholder="Minimum 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPw(!showForgotPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      >
                        {showForgotPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                      <input
                        type={showForgotPw ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-glass pl-10 pr-10"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 btn-electric btn-electric-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                    >
                      <span className="btn-electric-glow" />
                      {forgotLoading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Reset Password</>}
                    </motion.button>
                  </div>
                  <div className="text-center">
                    <button 
                      type="button" 
                      onClick={() => setOtpSent(false)}
                      className="text-[9px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors"
                    >
                      Use a different email
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

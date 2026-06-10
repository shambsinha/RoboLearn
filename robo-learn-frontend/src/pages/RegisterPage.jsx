import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ArrowRight, CheckCircle2, Mail, Lock, User as UserIcon, ShieldCheck, Loader2, ArrowLeft, XCircle, Check, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../store/useAuthStore';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [step, setStep] = useState(1); // 1: Email/OTP, 2: Account Details
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    username:        '',
    password:        '',
    role:            'STUDENT',
  });

  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('idle'); 
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle, preloadDashboard } = useAuthStore();
  const navigate = useNavigate();

  const handleSuccess = (data) => {
    toast.dismiss();
    toast.success(`Welcome aboard, ${data.username}!`);
    preloadDashboard(data.role);
    if (data.role === 'ADMIN') navigate('/admin/overview');
    else navigate('/student');
  };

  // Username check
  const checkUsername = useCallback(async (name) => {
    if (name.length < 5) {
      setUsernameStatus('too-short');
      return;
    }
    setUsernameStatus('loading');
    try {
      const { data: isAvailable } = await apiClient.get(`/auth/check-username?username=${name}`);
      setUsernameStatus(isAvailable ? 'available' : 'taken');
    } catch (err) {
      setUsernameStatus('idle');
    }
  }, []);

  useEffect(() => {
    if (step === 2 && formData.username) {
      const timer = setTimeout(() => checkUsername(formData.username), 500);
      return () => clearTimeout(timer);
    }
  }, [formData.username, step, checkUsername]);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiClient.post(`/auth/send-otp?email=${email}`);
      setIsOtpSent(true);
      toast.dismiss();
      toast.success('OTP sent to your email!');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to send OTP.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Enter a 6-digit verification code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data: isValid } = await apiClient.post(`/auth/verify-otp?email=${email}&otp=${otp}`);
      if (isValid) {
        setIsVerified(true);
        setStep(2);
        toast.dismiss();
        toast.success('Email verified successfully!');
      } else {
        setError('Invalid or expired OTP');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (usernameStatus !== 'available') return;
    setLoading(true);
    try {
      const data = await register({ ...formData, email });
      handleSuccess(data);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Registration failed.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      handleSuccess(data);
    } catch (err) {
      setError('Google authentication failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px]"
      >
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <div className="relative group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-glow-indigo transition-transform group-hover:scale-110">
              <Cpu size={28} className="text-white" />
            </div>
            <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 opacity-20 blur-lg -z-10" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Create <span className="text-gradient-cyan">Account</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Step {step} of 2: {step === 1 ? 'Email Verification' : 'Account Details'}</p>
          </div>
        </div>

        <motion.div 
          layout
          className="stark-card border-white/5 bg-[#0a1424]/80 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-rose-500/5 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-lg text-[13px] flex items-center gap-2 font-medium mb-2">
                            <AlertCircle size={14} className="shrink-0" />
                            {error}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 block">Official Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="email" 
                          disabled={isOtpSent}
                          className="input-glass pl-10 h-12" 
                          placeholder="name@university.edu" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        {isOtpSent && !isVerified && (
                          <button 
                            onClick={() => { setIsOtpSent(false); setError(''); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>

                    {isOtpSent && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-2"
                      >
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 block">Verification Code</label>
                          <input 
                            type="text" 
                            maxLength={6}
                            className="input-glass h-12 text-center text-xl font-bold tracking-[0.5em] text-cyan-400" 
                            placeholder="000000" 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                          />
                          <p className="text-[10px] text-slate-600 mt-2 text-center">Didn't receive code? <button onClick={handleSendOtp} className="text-indigo-400 hover:underline">Resend</button></p>
                        </div>
                        <button
                          onClick={handleVerifyOtp}
                          disabled={loading}
                          className="btn-electric btn-electric-primary w-full h-12"
                        >
                          <span className="btn-electric-glow" />
                          {loading ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={18} /> <span>Verify Email</span></>}
                        </button>
                      </motion.div>
                    )}

                    {!isOtpSent && (
                      <button
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="btn-electric btn-electric-primary w-full h-12"
                      >
                        <span className="btn-electric-glow" />
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><span>Send OTP</span> <ArrowRight size={18} /></>}
                      </button>
                    )}
                  </div>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest"><span className="bg-[#0a1424] px-4 text-slate-600">Quick Access</span></div>
                  </div>

                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError('Google Sign-In failed')}
                      theme="filled_black"
                      shape="pill"
                      width="350px"
                      text="signup_with"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl mb-6">
                    <CheckCircle2 className="text-emerald-500" size={18} />
                    <div className="text-[11px] font-medium text-emerald-400/80">
                      Email verified: <span className="text-white font-bold">{email}</span>
                    </div>
                    <button onClick={() => { setStep(1); setError(''); }} className="ml-auto text-[10px] font-bold text-slate-500 hover:text-slate-300"><ArrowLeft size={12} /></button>
                  </div>

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-rose-500/5 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-lg text-[13px] flex items-center gap-2 font-medium mb-4">
                          <AlertCircle size={14} className="shrink-0" />
                          {error}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-end mb-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
                        {usernameStatus === 'taken' && <span className="text-[9px] font-bold text-rose-500 uppercase animate-pulse">Already Taken</span>}
                        {usernameStatus === 'available' && <span className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1"><Check size={10} /> Available</span>}
                        {usernameStatus === 'too-short' && <span className="text-[9px] font-bold text-slate-600 uppercase">Min 5 chars</span>}
                      </div>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input 
                          name="username" 
                          required 
                          className={`input-glass pl-10 h-11 transition-all ${
                            usernameStatus === 'taken' ? 'border-rose-500/50 focus:border-rose-500' : 
                            usernameStatus === 'available' ? 'border-emerald-500/50 focus:border-emerald-500' : ''
                          }`} 
                          placeholder="coder_42" 
                          value={formData.username} 
                          onChange={(e) => {
                             const val = e.target.value.toLowerCase().replace(/\s/g, '');
                             setFormData({...formData, username: val});
                             checkUsername(val);
                          }} 
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {usernameStatus === 'loading' && <Loader2 className="animate-spin text-slate-600" size={14} />}
                          {usernameStatus === 'taken' && <XCircle className="text-rose-500" size={14} />}
                          {usernameStatus === 'available' && <CheckCircle2 className="text-emerald-500" size={14} />}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input 
                          name="password" 
                          type="password" 
                          required 
                          className="input-glass pl-10 h-11" 
                          placeholder="••••••••" 
                          value={formData.password} 
                          onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || usernameStatus !== 'available'}
                      className="btn-electric btn-electric-primary w-full h-12 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="btn-electric-glow" />
                      {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : <><span>Finish Setup</span> <ArrowRight size={18} /></>}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="text-center text-slate-600 text-[13px] mt-8">
          Already verified?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

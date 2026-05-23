import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Camera, Edit2, Save, X, Trophy,
  Github, Linkedin, Globe, Calendar as CalendarIcon, Hash, Loader,
  Flame, Code2, BookOpen, Award, CheckCircle2, Zap, ArrowUpRight,
  Star, Briefcase, Trash2
} from 'lucide-react';
import { studentApi } from '../../api/studentApi';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { format, subDays, parseISO } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Cropper from 'react-easy-crop';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay: d, ease: [0.16, 1, 0.3, 1] },
});

/* ── Sparkle SVG inline ── */
const SparkleIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

/* ── Animated Stat counter ── */
const StatPill = ({ icon, value, label, color }) => (
  <motion.div
    whileHover={{ scale: 1.06, y: -2 }}
    className="flex flex-col items-center gap-1 px-5 py-4 rounded-2xl glass-card min-w-[90px]"
  >
    <div className={`mb-1 ${color}`}>{icon}</div>
    <span className="text-2xl font-extrabold text-white leading-none">{value}</span>
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
  </motion.div>
);

/* ── Difficulty progress bar ── */
const DiffBar = ({ label, solved, total, color, barColor }) => {
  const pct = total ? Math.min(100, Math.round((solved / total) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className={`text-xs font-bold ${color}`}>{label}</span>
        <span className="text-xs text-slate-400 font-semibold">{solved} <span className="text-slate-600">/ {total || '—'}</span></span>
      </div>
      <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className={`h-full rounded-full ${barColor}`}
          style={{ boxShadow: `0 0 8px currentColor` }}
        />
      </div>
    </div>
  );
};

/* ── Image Crop Utilities ── */
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg');
  });
};

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const [editForm, setEditForm] = useState({});

  // Cropping State
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const data = await studentApi.getUserProfile();
      setProfile(data);
      setEditForm({
        profilePictureUrl: data.profilePictureUrl || '',
        bio: data.bio || '',
        githubUrl: data.githubUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        portfolioUrl: data.portfolioUrl || '',
        onboardingStatus: data.onboardingStatus || ''
      });
      if (data.profilePictureUrl) {
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        if (currentUser.profilePictureUrl !== data.profilePictureUrl) {
          currentUser.profilePictureUrl = data.profilePictureUrl;
          localStorage.setItem('user', JSON.stringify(currentUser));
          useAuthStore.setState({ user: currentUser });
        }
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImageToCrop(reader.result);
      setShowCropper(true);
    };
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleUploadCroppedImage = async () => {
    try {
      setUploadingImage(true);
      setShowCropper(false);

      const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const file = new File([croppedImageBlob], "profile-picture.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append('image', file);

      const updatedProfile = await studentApi.uploadProfileImage(formData);
      setProfile(updatedProfile);
      setEditForm(prev => ({ ...prev, profilePictureUrl: updatedProfile.profilePictureUrl }));
      toast.success('Profile photo updated!');

      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      currentUser.profilePictureUrl = updatedProfile.profilePictureUrl;
      localStorage.setItem('user', JSON.stringify(currentUser));
      useAuthStore.setState({ user: currentUser });
    } catch (err) {
      console.error(err);
      toast.error('Failed to process image');
    } finally {
      setUploadingImage(false);
      setImageToCrop(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove your profile photo?")) return;
    setUploadingImage(true);
    try {
      const updatedProfile = await studentApi.deleteProfileImage();
      setProfile(updatedProfile);
      setEditForm(prev => ({ ...prev, profilePictureUrl: null }));
      toast.success('Profile photo removed!');

      // Update auth store user as well
      const currentUser = useAuthStore.getState().user;
      currentUser.profilePictureUrl = null;
      localStorage.setItem('user', JSON.stringify(currentUser));
      useAuthStore.setState({ user: currentUser });
    } catch {
      toast.error('Failed to remove image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      await studentApi.updateProfile(editForm);
      toast.success('Profile updated!');
      setIsEditing(false);
      fetchProfile();
    } catch {
      toast.error('Failed to update profile');
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
            <div className="absolute inset-0 rounded-full border border-transparent border-t-cyan-500 animate-spin" />
          </div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Loading Profile…</p>
        </div>
      </div>
    );
  }

  /* ── Data derivations ── */
  const pieData = [
    { name: 'Easy', value: profile.solvedEasy || 0, color: '#34d399' },
    { name: 'Medium', value: profile.solvedMedium || 0, color: '#fbbf24' },
    { name: 'Hard', value: profile.solvedHard || 0, color: '#f87171' },
  ].filter(d => d.value > 0);

  const today = new Date();
  const streakDatesStr = profile.streakDates || [];
  const attemptedDatesStr = profile.attemptedDates || [];

  const unlockedAchievements = [
    { id: 'bronze-solver', title: 'Bronze Solver', criteria: profile.totalSolved >= 50, icon: <Trophy size={20} />, color: 'text-orange-500' },
    { id: 'silver-solver', title: 'Silver Solver', criteria: profile.totalSolved >= 100, icon: <Trophy size={20} />, color: 'text-slate-300' },
    { id: 'gold-solver', title: 'Gold Solver', criteria: profile.totalSolved >= 150, icon: <Trophy size={20} />, color: 'text-yellow-400' },
    { id: 'xp-bronze', title: 'Knowledge Seeker', criteria: (profile.xp || 0) >= 1000, icon: <Star size={20} />, color: 'text-blue-400' },
    { id: 'xp-silver', title: 'Neural Architect', criteria: (profile.xp || 0) >= 5000, icon: <Award size={20} />, color: 'text-purple-400' },
    { id: 'xp-gold', title: 'Logic Legend', criteria: (profile.xp || 0) >= 10000, icon: <Zap size={20} />, color: 'text-cyan-400' },
  ].filter(a => a.criteria);

  const calendarDays = Array.from({ length: 56 }).map((_, i) => {
    const d = subDays(today, 55 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    return {
      date: d,
      hasSolved: streakDatesStr.includes(dateStr),
      hasAttempted: attemptedDatesStr.includes(dateStr),
    };
  });

  const initials = profile.username?.slice(0, 2).toUpperCase() || 'RL';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">

      {/* ══ HERO BANNER ══ */}
      <motion.div {...fadeUp(0)} className="relative rounded-3xl overflow-hidden">
        {/* Gradient banner bg */}
        <div
          className="h-48 w-full relative"
          style={{ background: 'linear-gradient(135deg, #020e1f 0%, #041929 50%, #020e1f 100%)' }}
        >
          {/* Polygon mesh overlay pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mesh" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 40 40 L 80 80" stroke="#0d6e9e" strokeWidth="0.5" fill="none" />
                <path d="M 0 0 L 40 40 L 0 80" stroke="#0d6e9e" strokeWidth="0.5" fill="none" />
                <path d="M 0 40 L 80 40" stroke="#0a4f72" strokeWidth="0.3" fill="none" />
                <path d="M 40 0 L 40 80" stroke="#0a4f72" strokeWidth="0.3" fill="none" />
                <circle cx="40" cy="40" r="1.5" fill="#1e7ea1" opacity="0.8" />
                <circle cx="0" cy="0" r="1" fill="#1e7ea1" opacity="0.5" />
                <circle cx="80" cy="80" r="1" fill="#1e7ea1" opacity="0.5" />
                <circle cx="80" cy="0" r="1" fill="#1e7ea1" opacity="0.5" />
                <circle cx="0" cy="80" r="1" fill="#1e7ea1" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mesh)" />
          </svg>
          {/* Animated glow edges */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-80 bg-cyan-500/[0.04] blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-500/[0.06] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        </div>

        {/* Profile card overlay */}
        <div
          className="border-0 px-8 pb-8"
          style={{ background: 'rgba(10,14,22,0.88)', backdropFilter: 'blur(24px)', borderRadius: '0 0 1.5rem 1.5rem' }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end gap-6 -mt-16">
          {/* Avatar with scan effect */}
            <div className="relative shrink-0 z-10 profile-scan-container">
              {/* Scan effect layers */}
              <div className="profile-scan-ring" />
              <div className="profile-scan-brackets" />
              {/* Avatar circle */}
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 shadow-2xl bg-gradient-to-br from-[#0a1628] to-[#0d2040] relative group" style={{ borderColor: 'rgba(6,182,212,0.6)', boxShadow: '0 0 0 3px rgba(6,182,212,0.15), 0 0 24px rgba(6,182,212,0.2)' }}>
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-cyan-400">
                    {initials}
                  </div>
                )}
                {/* Scan line overlay */}
                <div className="profile-scan-line" />
                {/* Holographic tint */}
                <div className="profile-scan-holo" />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-10">
                    <Loader className="animate-spin mb-1" size={20} />
                    <span className="text-[10px] font-bold">Uploading</span>
                  </div>
                )}
                {isEditing && (
                  <div
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform" onClick={() => fileInputRef.current?.click()}>
                        <Camera size={20} className="text-white mb-1" />
                        <span className="text-[10px] font-bold text-white">Change</span>
                      </div>
                      {profile.profilePictureUrl && (
                        <div className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform" onClick={handleRemoveImage}>
                          <Trash2 size={20} className="text-red-400 mb-1" />
                          <span className="text-[10px] font-bold text-red-400">Remove</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#020c18] z-20" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.6)' }} />
            </div>

            {/* Name, role, bio */}
            <div className="flex-1 min-w-0 pt-2 lg:pt-0">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                    {profile.username}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2.5 mt-2">
                    <span className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                      <Mail size={12} className="text-indigo-400" /> {profile.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Briefcase size={11} /> {profile.onboardingStatus || 'Learner'}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                      <CalendarIcon size={11} /> Joined {profile.joinedAt ? format(parseISO(profile.joinedAt), 'MMM yyyy') : '—'}
                    </span>
                  </div>
                  {!isEditing && (
                    <p className="text-slate-400 text-sm mt-2.5 max-w-lg leading-relaxed">
                      {profile.bio || 'No bio yet — click Edit Profile to add one.'}
                    </p>
                  )}
                </div>

                {/* Edit / Save buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                        onClick={handleSave}
                        className="btn-electric btn-electric-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest"
                      >
                        <span className="btn-electric-glow" />
                        <Save size={14} /> Save
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setIsEditing(false)}
                        className="btn-electric flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08] transition-all"
                      >
                        <span className="btn-electric-glow" />
                        <X size={14} /> Cancel
                      </motion.button>
                    </>
                  ) : (
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setIsEditing(true)}
                      className="btn-electric btn-electric-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest"
                    >
                      <span className="btn-electric-glow" />
                      <Edit2 size={14} /> Edit Profile
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Social links */}
              {!isEditing && (
                <div className="flex items-center gap-2.5 mt-3">
                  {profile.githubUrl && (
                    <a href={profile.githubUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:border-white/20 transition-all text-xs font-semibold group">
                      <Github size={14} /> GitHub <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all text-xs font-semibold group">
                      <Linkedin size={14} /> LinkedIn <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a href={profile.portfolioUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all text-xs font-semibold group">
                      <Globe size={14} /> Portfolio <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Edit form */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <div className="md:col-span-2">
                <textarea
                  placeholder="Write a short bio about yourself..."
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  className="input-glass min-h-[80px] resize-none"
                />
              </div>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                <input type="text" placeholder="GitHub URL" value={editForm.githubUrl}
                  onChange={e => setEditForm({ ...editForm, githubUrl: e.target.value })}
                  className="input-glass pl-9" />
              </div>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                <input type="text" placeholder="LinkedIn URL" value={editForm.linkedinUrl}
                  onChange={e => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                  className="input-glass pl-9" />
              </div>
              <div className="relative md:col-span-2">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                <input type="text" placeholder="Portfolio URL" value={editForm.portfolioUrl}
                  onChange={e => setEditForm({ ...editForm, portfolioUrl: e.target.value })}
                  className="input-glass pl-9" />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ══ QUICK STATS ROW ══ */}
      <motion.div {...fadeUp(0.08)} className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        <StatPill icon={<Award size={18} />} value={`#${profile.rank || '—'}`} label="Global Rank" color="text-amber-400" />
        <StatPill icon={<SparkleIcon size={18} className="text-indigo-400" />} value={profile.xp || 0} label="Total XP" color="text-indigo-400" />
        <StatPill icon={<Flame size={18} />} value={`${profile.dailyStreak || 0}d`} label="Daily Streak" color="text-orange-400" />
        <StatPill icon={<CheckCircle2 size={18} />} value={profile.totalSolved || 0} label="Solved" color="text-emerald-400" />
        <StatPill icon={<BookOpen size={18} />} value={profile.coursesEnrolled || 0} label="Courses" color="text-cyan-400" />
        <StatPill icon={<Zap size={18} />} value={profile.streakDates?.length || 0} label="Active Days" color="text-purple-400" />
      </motion.div>

      {/* ══ MAIN GRID ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-1 space-y-5">

          {/* Problem Solving */}
          <motion.div {...fadeUp(0.14)} className="glass-card p-5" style={{ background: 'rgba(12,18,30,0.9)' }}>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Code2 size={13} className="text-indigo-400" /> Problem Solving
            </h3>

            <div className="flex items-center gap-5 mb-6">
              {/* Donut chart */}
              <div className="w-28 h-28 shrink-0 relative">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={34} outerRadius={52} stroke="none" dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full rounded-full border-4 border-white/[0.06] border-dashed flex items-center justify-center">
                    <span className="text-slate-600 text-[10px] font-bold">No Data</span>
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-white">{profile.totalSolved || 0}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">solved</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <DiffBar
                  label="Easy" solved={profile.solvedEasy || 0} total={profile.totalSystemEasy}
                  color="text-emerald-400" barColor="bg-emerald-400"
                />
                <DiffBar
                  label="Medium" solved={profile.solvedMedium || 0} total={profile.totalSystemMedium}
                  color="text-amber-400" barColor="bg-amber-400"
                />
                <DiffBar
                  label="Hard" solved={profile.solvedHard || 0} total={profile.totalSystemHard}
                  color="text-rose-400" barColor="bg-rose-400"
                />
              </div>
            </div>
          </motion.div>

          {/* Global Rank card */}
          <motion.div {...fadeUp(0.18)} className="glass-card p-5 relative overflow-hidden group" style={{ background: 'rgba(12,18,30,0.9)' }}>
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700" />
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Hash size={13} className="text-amber-400" /> Global Rank
              </h3>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-5xl font-black text-white">#{profile.rank || '—'}</span>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">overall</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-black text-amber-400 flex items-center gap-1.5">
                  <SparkleIcon size={12} className="text-amber-400" /> {profile.xp || 0} XP Earned
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Activity Heatmap — Compact */}
          <motion.div {...fadeUp(0.2)} className="glass-card p-5" style={{ background: 'rgba(12,18,30,0.9)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <CalendarIcon size={12} className="text-cyan-400" /> Activity — Last 8 Weeks
              </h3>
              <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Solved</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> Attempted</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-white/[0.06] inline-block" /> None</span>
              </div>
            </div>

            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
              {Array.from({ length: 8 }).map((_, week) => (
                <div key={week} className="flex flex-col gap-1">
                  {calendarDays.slice(week * 7, week * 7 + 7).map((day, i) => {
                    let cls = 'bg-white/[0.04] hover:bg-white/[0.08]';
                    if (day.hasSolved) cls = 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)] hover:bg-emerald-400';
                    else if (day.hasAttempted) cls = 'bg-rose-500/70 shadow-[0_0_4px_rgba(244,63,94,0.2)] hover:bg-rose-500';
                    return (
                      <div key={i} title={format(day.date, 'MMM dd, yyyy')}
                        className={`w-full rounded transition-all cursor-pointer ${cls}`}
                        style={{ aspectRatio: '1', maxHeight: '24px' }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-3 px-3 py-2.5 bg-cyan-500/[0.04] border border-cyan-500/10 rounded-lg">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Solved problems on <strong className="text-cyan-400 font-black">{profile.streakDates?.length || 0}</strong> unique days.
                Consistency compounds into mastery.
              </p>
            </div>
          </motion.div>

          {/* Enrolled Courses */}
          <motion.div {...fadeUp(0.24)} className="glass-card p-5" style={{ background: 'rgba(12,18,30,0.9)' }}>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <BookOpen size={13} className="text-indigo-400" /> Enrolled Courses
            </h3>
            {profile.coursesEnrolled > 0 ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-indigo-500/20 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                      <BookOpen size={16} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">Loading course data…</p>
                      <p className="text-[10px] text-slate-500 font-medium">Progress data loading</p>
                    </div>
                    <div className="shrink-0 w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full w-1/3 bg-indigo-500 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 border border-dashed border-white/[0.06] rounded-xl">
                <BookOpen size={28} className="text-slate-700 mb-3" />
                <p className="text-sm font-bold text-slate-500">No courses enrolled yet</p>
                <a href="/student/courses" className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 font-black uppercase tracking-widest transition-colors">
                  Browse Catalog →
                </a>
              </div>
            )}
          </motion.div>

          {/* ── ACHIEVEMENTS (UNLOCKED ONLY) ── */}
          <motion.div {...fadeUp(0.28)} className="glass-card p-6" style={{ background: 'rgba(12,18,30,0.9)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Trophy size={13} className="text-amber-400" /> Unlocked Trophies
              </h3>
              <a href="/student/achievements" className="text-[9px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors">
                View All →
              </a>
            </div>

            {unlockedAchievements.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {unlockedAchievements.map((ach) => (
                  <motion.div 
                    key={ach.id} 
                    whileHover={{ y: -5, rotateY: 12, rotateX: 10, scale: 1.05 }}
                    className={`p-3.5 rounded-2xl electric-card-hover ${ach.color} flex items-center gap-3.5 group transition-all relative overflow-hidden animate-robotic-shock cursor-default shadow-2xl perspective-1000 preserve-3d bg-white/[0.03] border border-white/[0.1] backdrop-blur-md`}
                  >
                    <div className="shrink-0 drop-shadow-[0_0_12px_currentColor] relative z-10 scale-110" style={{ transform: "translateZ(30px)" }}>
                      {ach.icon}
                    </div>
                    <div className="pr-1 relative z-10" style={{ transform: "translateZ(15px)" }}>
                      <p className="text-[11px] font-black uppercase tracking-tight text-white drop-shadow-md">{ach.title}</p>
                    </div>
                    
                    {/* Multi-layered surge background */}
                    <div className="absolute inset-0 bg-current opacity-[0.05] animate-pulse z-0" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.1] via-transparent to-transparent pointer-events-none" />
                    
                    {/* Scanning glint */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center border border-dashed border-white/[0.05] rounded-xl">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No trophies unlocked yet</p>
                <a href="/student/achievements" className="mt-2 inline-block text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">
                   Check Requirements
                </a>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ══ IMAGE CROP MODAL ══ */}
      {showCropper && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="stark-card w-full max-w-xl overflow-hidden bg-[#0a0e16]"
          >
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Camera size={16} className="text-indigo-400" /> Adjust Profile Photo
              </h3>
              <button 
                onClick={() => setShowCropper(false)}
                className="p-2 hover:bg-white/[0.05] rounded-lg text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative h-80 bg-black">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Zoom Level</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/[0.05] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUploadCroppedImage}
                  className="flex-1 btn-electric btn-electric-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <span className="btn-electric-glow" />
                  Save Changes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCropper(false)}
                  className="px-6 py-3 btn-electric bg-white/[0.04] text-slate-400 border border-white/[0.06] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/[0.08]"
                >
                  <span className="btn-electric-glow" />
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;

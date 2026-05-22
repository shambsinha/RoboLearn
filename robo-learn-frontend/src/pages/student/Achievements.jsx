import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Star, Award, Zap, Linkedin, Lock, Hash, 
  Rocket, Crown, Search
} from 'lucide-react';
import { studentApi } from '../../api/studentApi';
import toast from 'react-hot-toast';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d, ease: [0.16, 1, 0.3, 1] },
});

const Achievements = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentApi.getUserProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile for achievements:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const achievements = profile ? [
    { id: 'bronze-solver', title: 'Bronze Solver', desc: 'Solved 50 problems', criteria: profile.totalSolved >= 50, icon: <Trophy size={28} />, color: 'text-orange-500', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]', category: 'Problem Solving' },
    { id: 'silver-solver', title: 'Silver Solver', desc: 'Solved 100 problems', criteria: profile.totalSolved >= 100, icon: <Trophy size={28} />, color: 'text-slate-300', glow: 'shadow-[0_0_20px_rgba(203,213,225,0.3)]', category: 'Problem Solving' },
    { id: 'gold-solver', title: 'Gold Solver', desc: 'Solved 150 problems', criteria: profile.totalSolved >= 150, icon: <Trophy size={28} />, color: 'text-yellow-400', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.3)]', category: 'Problem Solving' },
    { id: 'xp-bronze', title: 'Knowledge Seeker', desc: 'Earned 1,000 XP', criteria: (profile.xp || 0) >= 1000, icon: <Star size={28} />, color: 'text-blue-400', glow: 'shadow-[0_0_20px_rgba(96,165,250,0.3)]', category: 'Experience' },
    { id: 'xp-silver', title: 'Neural Architect', desc: 'Earned 5,000 XP', criteria: (profile.xp || 0) >= 5000, icon: <Award size={28} />, color: 'text-purple-400', glow: 'shadow-[0_0_20px_rgba(192,132,252,0.3)]', category: 'Experience' },
    { id: 'xp-gold', title: 'Logic Legend', desc: 'Earned 10,000 XP', criteria: (profile.xp || 0) >= 10000, icon: <Zap size={28} />, color: 'text-cyan-400', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]', category: 'Experience' },
    { id: 'consistency-1', title: 'Daily Driver', desc: 'Maintain a 7-day streak', criteria: (profile.dailyStreak || 0) >= 7, icon: <Rocket size={28} />, color: 'text-rose-400', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]', category: 'Consistency' },
    { id: 'course-master', title: 'Scholar', desc: 'Enroll in 5 courses', criteria: (profile.coursesEnrolled || 0) >= 5, icon: <Crown size={28} />, color: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]', category: 'Education' },
  ] : [];

  const handleShareAchievement = (achievement) => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`;
    window.open(shareUrl, '_blank');
    toast.success(`Opening LinkedIn to share your "${achievement.title}" achievement!`);
  };

  const filteredAchievements = achievements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
            <div className="absolute inset-0 rounded-full border border-transparent border-t-cyan-500 animate-spin" />
          </div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Decoding Achievements…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6">
      
      {/* ── HEADER ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Trophy className="text-amber-400" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Neural Hall of Fame</h1>
              <p className="text-slate-500 text-sm font-medium mt-1">Track your evolution and unlock prestigious logical markers.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Filter achievements..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass pl-9 pr-4 py-2 w-full md:w-64 text-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* ── SUMMARY STATS ── */}
      <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stark-card p-5 border-white/[0.04]">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Unlocked</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{achievements.filter(a => a.criteria).length}</span>
            <span className="text-slate-600 text-xs font-bold">/ {achievements.length}</span>
          </div>
        </div>
        <div className="stark-card p-5 border-white/[0.04]">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total XP</p>
          <p className="text-2xl font-black text-indigo-400">{profile.xp?.toLocaleString() || 0}</p>
        </div>
        <div className="stark-card p-5 border-white/[0.04]">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Logic Units</p>
          <p className="text-2xl font-black text-emerald-400">{profile.totalSolved || 0}</p>
        </div>
        <div className="stark-card p-5 border-white/[0.04]">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Streak</p>
          <p className="text-2xl font-black text-orange-400">{profile.dailyStreak || 0} Days</p>
        </div>
      </motion.div>

      {/* ── ACHIEVEMENT GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredAchievements.map((ach, idx) => (
          <motion.div 
            key={ach.id}
            {...fadeUp(0.15 + (idx * 0.05))}
            className="group relative"
          >
            <div className={`stark-card p-8 flex flex-col items-center text-center h-full transition-all duration-500 
              ${ach.criteria 
                ? `bg-white/[0.02] border-white/[0.08] ${ach.glow}` 
                : 'bg-black/40 border-white/[0.04] opacity-80'}`}
            >
              {/* Trophy Icon Container */}
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-700
                ${ach.criteria 
                  ? 'bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.1] scale-110' 
                  : 'bg-black/60 border border-dashed border-white/[0.05] scale-100 overflow-hidden'}`}
              >
                {/* Visual Icon (Masked if locked) */}
                <div className={`transition-all duration-1000 ${
                  ach.criteria 
                    ? ach.color 
                    : 'text-white/5 blur-[12px] scale-75 select-none'
                }`}>
                  {ach.icon}
                </div>

                {/* Mystery Overlay */}
                {!ach.criteria && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.95, 1.05, 0.95] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Lock size={20} className="text-slate-600" />
                    </motion.div>
                  </div>
                )}
                
                {/* Glow ring for unlocked */}
                {ach.criteria && (
                  <div className="absolute inset-0 rounded-full animate-pulse-slow opacity-20 bg-current pointer-events-none" />
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 block ${ach.criteria ? 'text-indigo-400' : 'text-slate-600'}`}>
                  {ach.category}
                </span>
                <h3 className={`text-base font-black uppercase tracking-tight mb-2 ${ach.criteria ? 'text-white' : 'text-slate-600'}`}>
                  {ach.criteria ? ach.title : 'Mystery Reward'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed px-2">
                  {ach.criteria ? ach.desc : 'Required parameters not yet achieved.'}
                </p>
              </div>

              {/* Share / Locked Status */}
              <div className="mt-8 w-full">
                {ach.criteria ? (
                  <button 
                    onClick={() => handleShareAchievement(ach)}
                    className="btn-electric btn-electric-primary w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em]"
                  >
                    <span className="btn-electric-glow" />
                    <Linkedin size={12} /> Share Trophy
                  </button>
                ) : (
                  <div className="py-2.5 px-4 rounded-xl border border-white/[0.04] bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center justify-center gap-2">
                    <Hash size={10} /> Locked Marker
                  </div>
                )}
              </div>
            </div>
            
            {/* Tooltip on hover for locked */}
            {!ach.criteria && (
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none p-4">
                 <div className="bg-black/90 border border-white/[0.1] backdrop-blur-md p-4 rounded-2xl shadow-2xl text-center transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Criteria</p>
                    <p className="text-xs font-bold text-white leading-snug">{ach.desc}</p>
                 </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

    </div>
  );
};

export default Achievements;

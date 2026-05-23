import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Trophy, Star, Award, Zap, Linkedin, Lock, Hash, 
  Rocket, Crown, Search, Sparkles
} from 'lucide-react';
import { studentApi } from '../../api/studentApi';
import toast from 'react-hot-toast';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d, ease: [0.16, 1, 0.3, 1] },
});

// ── 3D TILT TROPHY CARD COMPONENT ──
const TrophyCard = ({ ach, onShare, idx }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      {...fadeUp(0.15 + (idx * 0.05))}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative electric-card-hover rounded-3xl perspective-1000"
    >
      <div className={`stark-card p-8 border-none flex flex-col items-center text-center h-full transition-all duration-500 rounded-3xl
        ${ach.criteria 
          ? `bg-[#0a1424]/80 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]` 
          : 'bg-white/[0.02] backdrop-blur-md opacity-90'}`}
      >
        {/* 3D Pedestal & Trophy */}
        <div 
          style={{ transform: "translateZ(60px)" }}
          className={`relative w-32 h-32 rounded-3xl flex items-center justify-center mb-8 transition-all duration-700
          ${ach.criteria 
            ? `bg-gradient-to-br from-white/[0.15] to-transparent border border-white/[0.2] animate-robotic-shock shadow-2xl ${ach.color}` 
            : 'bg-white/[0.03] border border-white/[0.1] scale-100 overflow-hidden'}`}
        >
          {/* Internal Glow for depth */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/[0.05] to-transparent pointer-events-none" />

          {/* Visual Icon (Masked if locked) */}
          <div className={`transition-all duration-1000 z-10 ${
            ach.criteria 
              ? `drop-shadow-[0_0_20px_currentColor] scale-110` 
              : 'text-white/10 blur-[4px] scale-90 select-none grayscale'
          }`}>
            {ach.icon}
          </div>

          {/* Neural Laser Scan for locked trophies */}
          {!ach.criteria && (
            <>
              {/* Vertical Laser Line */}
              <div className="absolute left-0 right-0 h-px bg-cyan-500/50 shadow-[0_0_10px_#06b6d4] z-20 animate-laser" />

              {/* Central Lock Indicator */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                <motion.div
                  animate={{ 
                    opacity: [0.4, 0.8, 0.4], 
                    scale: [0.95, 1.05, 0.95]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Lock size={20} className="text-slate-400 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                </motion.div>
              </div>
            </>
          )}

          {/* Unlocked Radiant Effects */}
          {ach.criteria && (
            <>
              {/* Multi-layered surge rings */}
              <div className="absolute inset-[-8px] rounded-3xl border border-current opacity-20 animate-surge" />
              <div className="absolute inset-[-15px] rounded-3xl border border-current opacity-10 animate-surge [animation-delay:0.7s]" />

              {/* Pulsing Core Glow */}
              <div className="absolute inset-4 rounded-full bg-current opacity-[0.1] blur-xl animate-pulse" />

              {/* Floating glints */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [0.4, 1, 0.4],
                  rotate: [0, 180, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-1 -right-1 text-white drop-shadow-[0_0_8px_white]"
              >
                <Sparkles size={16} />
              </motion.div>
            </>
          )}
        </div>

        {/* Text Info */}
        <div className="flex-1" style={{ transform: "translateZ(40px)" }}>
          <span className={`text-[10px] font-black uppercase tracking-[0.25em] mb-3 block transition-colors ${ach.criteria ? 'text-cyan-400' : 'text-slate-500'}`}>
            {ach.category}
          </span>
          <h3 className={`text-lg font-black uppercase tracking-tight mb-3 transition-colors ${ach.criteria ? 'text-white' : 'text-slate-500'}`}>
            {ach.criteria ? ach.title : 'Neural Marker'}
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed px-4 font-medium italic">
            {ach.criteria ? ach.desc : 'Access restricted. Parameters unmet.'}
          </p>
        </div>

        {/* Share / Locked Status */}
        <div className="mt-10 w-full" style={{ transform: "translateZ(30px)" }}>
          {ach.criteria ? (
            <button 
              onClick={() => onShare(ach)}
              className="btn-electric btn-electric-primary w-full py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg"
            >
              <span className="btn-electric-glow" />
              <Linkedin size={14} /> Transmit Achievement
            </button>
          ) : (
            <div className="py-3 px-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center justify-center gap-2">
              <Hash size={12} /> Data Encrypted
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
  );
};

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
        {filteredAchievements.map((ach, idx) => (
          <TrophyCard 
            key={ach.id}
            ach={ach}
            idx={idx}
            onShare={handleShareAchievement}
          />
        ))}
      </div>

    </div>
  );
};

export default Achievements;

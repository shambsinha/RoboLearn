import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, BookOpen, ChevronRight, Layers, Play, Terminal,
  Award, Zap, Flame, CheckCircle2, Trophy, Star, Rocket, Users,
  BrainCircuit, Code2, ShieldCheck, ArrowRight, Globe, Cpu, Timer,
  Activity, ZapOff
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { studentApi } from '../../api/studentApi';
import toast from 'react-hot-toast';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, scale: 0.95, filter: 'blur(8px)', x: -10 },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)', x: 0 },
  transition: { type: 'spring', stiffness: 200, damping: 15, delay: d },
});

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const username = useMemo(() => {
    return user?.username || JSON.parse(localStorage.getItem('user'))?.username || "Learner";
  }, [user]);

  const [data, setData] = useState({
    coursesEnrolled: 0, problemsSolved: 0, activeAiSequences: 0,
    xpPoints: 0, dailyStreak: 0, recentActivity: [],
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [metrics, enrolledCourses] = await Promise.all([
        studentApi.getDashboardMetrics(), studentApi.getEnrolledCourses(),
      ]);
      setData(metrics);
      setCourses(enrolledCourses);
    } catch (error) {
      console.error('Error fetching student dashboard:', error);
      toast.error('Failed to synchronize learning node');
    } finally { setLoading(false); }
  };

  const charVariants = {
    initial: { opacity: 0, scale: 0.5, filter: 'blur(10px)' },
    animate: { 
      opacity: 1, 
      scale: 1, 
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 200, damping: 12 }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] scanline-container">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
            <div className="absolute inset-0 rounded-full border border-transparent border-t-cyan-500 animate-spin" />
            <div className="absolute inset-[4px] rounded-full border border-transparent border-t-indigo-400 animate-spin [animation-duration:1.4s] [animation-direction:reverse]" />
          </div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] animate-pulse">Synchronizing Node…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 max-w-7xl mx-auto py-8">

      {/* ── Welcome Header (Enhanced) ── */}
      <div className="relative">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 relative z-10">
          <div className="space-y-2">
            <motion.div initial={{ width: 0 }} animate={{ width: 40 }} className="h-1 bg-indigo-500 rounded-full mb-4" />
            
            <div className="flex flex-col">
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-2 block">
                Access Protocol Established
              </motion.span>
              
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter flex flex-wrap items-center gap-x-4">
                <span className="text-zinc-700">Welcome,</span>
                <span className="relative inline-flex flex-wrap items-center">
                  {username.split("").map((char, i) => (
                    <motion.span 
                      key={i} 
                      variants={charVariants}
                      initial="initial"
                      animate="animate"
                      className="text-gradient-cyan drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]"
                    >
                      {char}
                    </motion.span>
                  ))}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 md:w-3 h-8 md:h-12 bg-cyan-500 ml-2 shadow-glow-cyan"
                  />
                </span>
              </h1>
            </div>
            
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-sm text-slate-500 max-w-md">
              Your neural learning environment is fully operational.
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, type: 'spring' }} className="flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06]">
            <Zap size={13} className="text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Neural Link Active</span>
          </motion.div>
        </div>
      </div>

      {/* ── Live Ticker Marquee ── */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5">
        <div className="marquee-track">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="marquee-content">
              {[
                { icon: <Rocket size={12} />, text: '🚀 New Course: Advanced System Design — Enroll Now!' },
                { icon: <Trophy size={12} />, text: '🏆 Weekly Sprint #42 starts in 2 days — Register today' },
                { icon: <Star size={12} />, text: '⭐ 50,000+ problems solved this week across the platform' },
                { icon: <Zap size={12} />, text: '⚡ AI Tutor v3.0 released — 2x faster sequence generation' },
                { icon: <Globe size={12} />, text: '🌍 12,400+ engineers from 85 countries learning right now' },
                { icon: <Award size={12} />, text: '🎖️ Neural Logic Cup 2026 — $50,000 prize pool announced' },
              ].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-400 mx-8 whitespace-nowrap">
                  <span className="text-cyan-400">{item.icon}</span> {item.text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <motion.div {...fadeUp(0.08)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Course Load', value: data.coursesEnrolled, icon: <BookOpen size={20} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'hover:border-indigo-500/30' },
          { label: 'Logic Units', value: data.problemsSolved, icon: <CheckCircle2 size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/30' },
          { label: 'Daily Streak', value: `${data.dailyStreak}d`, icon: <Flame size={20} />, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'hover:border-orange-500/30' },
          { label: 'Total XP', value: data.xpPoints.toLocaleString(), icon: <Award size={20} />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'hover:border-purple-500/30' },
        ].map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`stark-card p-5 flex items-center gap-4 ${s.border}`}
          >
            <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">{s.label}</p>
              <p className="text-2xl font-extrabold text-white">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Hero Banner Ad — Pro Upgrade ── */}
      <motion.div {...fadeUp(0.12)}>
        <motion.div
          whileHover={{ scale: 1.005 }}
          className="relative rounded-2xl overflow-hidden border border-indigo-500/20"
          style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.4) 0%, rgba(124,58,237,0.3) 50%, rgba(6,182,212,0.2) 100%)' }}
        >
          {/* Floating animated orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/[0.04] rounded-full blur-3xl -mr-36 -mt-36 pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-cyan-500/[0.08] rounded-full blur-3xl -ml-28 -mb-28 pointer-events-none" style={{ animation: 'driftOrb 20s ease-in-out infinite alternate' }} />

          <div className="relative z-10 p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shrink-0"
              >
                <Rocket size={32} className="text-white" />
              </motion.div>
              <div>
                <h3 className="text-xl font-extrabold text-white">Unlock Neural Path Pro</h3>
                <p className="text-indigo-100/60 text-sm max-w-md mt-1">Unlimited AI tutoring, advanced system design blueprints, priority contest queue, and exclusive mentorship.</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-electric btn-electric-primary px-8 py-3 rounded-full font-extrabold text-xs uppercase tracking-[0.1em] shadow-xl whitespace-nowrap cursor-pointer"
            >
              <span className="btn-electric-glow" />
              Upgrade to Pro
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Enrolled Courses */}
        <motion.div {...fadeUp(0.16)} className="lg:col-span-2">
          <div className="stark-card overflow-hidden">
            <div className="p-5 border-b border-white/[0.05] flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-400" /> Assigned Curriculums
              </h3>
              <Link to="/student/courses" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center gap-1">
                Registry <ChevronRight size={12} />
              </Link>
            </div>
            <div className="p-5">
              {courses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {courses.slice(0, 4).map(course => (
                    <Link key={course.courseId} to={`/student/courses/${course.courseId}`}>
                      <motion.div whileHover={{ y: -3, scale: 1.01 }} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-indigo-500/25 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 rounded-lg bg-white/[0.04] text-slate-500 group-hover:text-indigo-400 transition-colors">
                            <Play size={13} className="fill-current" />
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                            course.difficulty === 'HARD' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            course.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>{course.difficulty === 'EASY' ? 'Easy' : course.difficulty === 'MEDIUM' ? 'Medium' : 'Hard'}</span>
                        </div>
                        {course.imageUrl && (
                          <div className="h-24 w-full mb-3 rounded-lg overflow-hidden border border-white/[0.04]">
                            <img src={course.imageUrl} alt={course.title} loading="lazy" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                        <h4 className="text-sm font-bold text-white mb-1 truncate group-hover:text-cyan-300 transition-colors">{course.title}</h4>
                        <p className="text-[11px] text-slate-600">{course.instructorName || 'Academy Instructor'}</p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/[0.06] rounded-xl h-48">
                  <BookOpen size={28} className="mb-3 text-slate-700" />
                  <p className="text-sm font-medium text-slate-600">No curriculums in current node.</p>
                  <Link to="/student/courses" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 mt-2 block uppercase tracking-widest">
                    Enroll Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right column: Activity + Coding Arena */}
        <motion.div {...fadeUp(0.2)} className="space-y-6">
          {/* Activity Logs */}
          <div className="stark-card overflow-hidden">
            <div className="p-4 border-b border-white/[0.05]">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Activity Logs</h3>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {data.recentActivity?.length > 0 ? (
                data.recentActivity.map((a, i) => (
                  <motion.div key={i} whileHover={{ x: 4 }} className="p-4 hover:bg-white/[0.02] transition-colors group cursor-default">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${a.type === 'COURSE' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-300 group-hover:text-white truncate transition-colors">{a.title}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{a.status} • {a.timestamp}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-700 text-xs italic">No activity detected.</div>
              )}
            </div>
          </div>

          {/* Coding Arena CTA */}
          <motion.div whileHover={{ scale: 1.02 }} className="stark-card p-6 relative overflow-hidden group cursor-pointer">
            <div className="absolute -right-6 -bottom-6 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
              <Terminal size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-2">Algorithmic Arena</h3>
              <p className="text-xs text-slate-500 mb-5">Execute logic units and monitor throughput.</p>
              <Link to="/student/problems" className="btn-electric btn-electric-primary w-full justify-center py-2.5 text-xs rounded-lg font-black uppercase tracking-widest">
                <span className="btn-electric-glow" />
                <Zap size={13} />
                Enter Sandbox <ChevronRight size={13} />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── RoboLearn Enterprise Advertisement ── */}
      <motion.div {...fadeUp(0.22)}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="glass-card p-10 relative overflow-hidden group flex flex-col md:flex-row items-center justify-between gap-8 border-cyan-500/20"
        >
          <div className="absolute -left-32 -top-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />
          <div className="absolute -right-32 -bottom-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center border border-white/10 shrink-0 shadow-lg">
              <Globe size={32} className="text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[9px] font-black uppercase tracking-widest border border-cyan-500/20">Enterprise</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                Bring <span className="text-gradient-cyan">RoboLearn</span> to your Team
              </h3>
              <p className="text-slate-400 text-sm max-w-xl mt-2 leading-relaxed">
                Empower your entire engineering department with custom neural learning sequences, organization-wide telemetry, and private algorithmic arenas.
              </p>
            </div>
          </div>
          
          <div className="relative z-10 shrink-0">
            <Link to="/enterprise" className="btn-electric btn-electric-primary py-3 px-8 text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] bg-gradient-to-r from-cyan-500 to-indigo-500 border-none">
              <span className="btn-electric-glow" />
              Explore Enterprise <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Animated Feature Showcase ── */}
      <motion.div {...fadeUp(0.24)}>
        <h2 className="text-xl font-bold text-white mb-5">Why Engineers Choose RoboLearn</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: <BrainCircuit size={24} />, color: 'text-cyan-400', bg: 'bg-cyan-500/[0.08] border-cyan-500/20', title: 'AI-Powered Tutoring', desc: 'Real-time neural feedback adapts to your learning style and pace.', delay: 0 },
            { icon: <Code2 size={24} />, color: 'text-indigo-400', bg: 'bg-indigo-500/[0.08] border-indigo-500/20', title: 'Live Code Execution', desc: 'Full-stack sandbox with 15+ language runtimes and test suites.', delay: 0.08 },
            { icon: <ShieldCheck size={24} />, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.08] border-emerald-500/20', title: 'Industry Verified', desc: 'Curriculum designed by FAANG engineers and academic researchers.', delay: 0.16 },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: f.delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="stark-card p-6 group"
            >
              <motion.div
                className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${f.bg} ${f.color}`}
              >
                {f.icon}
              </motion.div>
              <h4 className="text-base font-bold text-white mb-1.5">{f.title}</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Contest + AI Tutor Promo Row ── */}
      <motion.div {...fadeUp(0.28)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contest Ad */}
        <motion.div whileHover={{ scale: 1.01 }} className="stark-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/[0.06] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-500/[0.12] transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-amber-400" />
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Live Contest</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Weekly Sprint #42</h3>
            <p className="text-xs text-slate-500 mb-4">Compete with 1,200+ engineers. Top 10 earn premium badges.</p>
            <div className="flex items-center gap-4 text-[10px] text-slate-600 font-bold mb-5">
              <span className="flex items-center gap-1"><Users size={11} /> 1.2k joined</span>
              <span className="flex items-center gap-1"><Award size={11} /> 500 XP</span>
              <span className="flex items-center gap-1"><Timer size={11} /> 2 days left</span>
            </div>
            <Link to="/student/contests" className="btn-electric btn-electric-primary py-2 px-5 text-xs rounded-lg font-black uppercase tracking-widest">
              <span className="btn-electric-glow" />
              Join Contest <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>

        {/* AI Tutor Ad */}
        <motion.div whileHover={{ scale: 1.01 }} className="stark-card p-6 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/[0.06] rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none group-hover:bg-purple-500/[0.12] transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <motion.div whileHover={{ scale: 1.1 }}>
                <Sparkles size={18} className="text-purple-400" />
              </motion.div>
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">AI Tutor v3.0</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Neural Learning Sequences</h3>
            <p className="text-xs text-slate-500 mb-4">Generate personalized study paths powered by advanced language models.</p>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">2x Faster</span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Multi-Modal</span>
            </div>
            <Link to="/student/ai-tutor" className="btn-electric py-2 px-5 text-xs rounded-lg font-black uppercase tracking-widest border-purple-500/20">
              <span className="btn-electric-glow" />
              Open AI Tutor <Sparkles size={13} />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Recommended for You ── */}
      <motion.div {...fadeUp(0.32)}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Star size={18} className="text-amber-400" /> Recommended for You
          </h2>
          <Link to="/student/courses" className="text-xs font-bold text-slate-600 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors">
            Explore <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: 'System Design Interview', cat: 'Architecture', level: 'HARD', accent: 'from-rose-500/15' },
            { title: 'Python for Data Science', cat: 'Data Science', level: 'MEDIUM', accent: 'from-amber-500/15' },
            { title: 'Rust Performance Engineering', cat: 'Systems', level: 'HARD', accent: 'from-indigo-500/15' },
          ].map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5 }}
              className="stark-card p-5 group cursor-pointer"
            >
              <div className={`h-28 rounded-xl mb-4 relative overflow-hidden border border-white/[0.05] bg-gradient-to-br ${c.accent} to-transparent`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 bg-white/90 text-void rounded-full flex items-center justify-center shadow-lg">
                    <Play size={14} className="fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                c.level === 'HARD' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>{c.level}</span>
              <h4 className="text-sm font-bold text-white mt-2 mb-1 group-hover:text-cyan-300 transition-colors">{c.title}</h4>
              <p className="text-[11px] text-slate-600">{c.cat}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Platform Stats Marquee ── */}
      <motion.div {...fadeUp(0.36)} className="stark-card p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: '12,400+', label: 'Active Engineers', icon: <Users size={18} className="text-cyan-400" /> },
            { val: '850+', label: 'Premium Courses', icon: <BookOpen size={18} className="text-indigo-400" /> },
            { val: '5M+', label: 'Problems Solved', icon: <CheckCircle2 size={18} className="text-emerald-400" /> },
            { val: '85', label: 'Countries', icon: <Globe size={18} className="text-purple-400" /> },
          ].map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="flex justify-center mb-2">{s.icon}</div>
              <p className="text-2xl font-extrabold text-white">{s.val}</p>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
};

export default StudentDashboard;

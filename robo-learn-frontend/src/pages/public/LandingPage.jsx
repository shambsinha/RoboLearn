import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket, Code2, BrainCircuit, Terminal, ShieldCheck,
  ChevronRight, Trophy, Star, Zap, Play, Users, Clock, Cpu, ArrowRight,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import Footer from '../../components/layout/Footer';

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
});

const LandingPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/student');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen relative overflow-x-hidden text-slate-300"
    >
      {/* ── Nav ── */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-glow-indigo"
          >
            <Cpu size={16} className="text-white" />
          </motion.div>
          <span className="text-sm font-bold text-white">
            Robo<span className="text-gradient-cyan">Learn</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-[13px] font-medium text-slate-500 hover:text-white transition-colors hidden sm:block">
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
            <Link to="/register" className="btn-primary py-2 px-5 text-[13px] rounded-full">
              Get Started <ChevronRight size={13} />
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[72vh] px-4 text-center mt-4">
        <motion.div {...fadeUp(0.05)} className="max-w-4xl">

          {/* Badge */}
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px -4px rgba(6,182,212,0.3)' }}
            className="inline-flex items-center gap-2 border border-white/[0.08] rounded-full px-4 py-1.5 mb-8 bg-white/[0.02] cursor-default"
          >
            <BrainCircuit size={13} className="text-cyan-400" />
            <span className="text-[11px] font-semibold text-slate-400">Neural AI Paths 2.0</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </motion.div>

          <h1 className="text-5xl sm:text-[4.5rem] font-extrabold tracking-tight mb-6 leading-[1.05]">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50">
              The Engineering Standard
              <br />for Spatial Learning.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Elevate your logic with AI-driven tutoring, structured premium curriculums,
            and an interactive algorithmic sandbox designed for top-tier engineers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="btn-primary rounded-full px-8 py-3.5">
                Start Building <Rocket size={15} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login" className="btn-ghost rounded-full px-8 py-3.5">
                View Documentation <ChevronRight size={15} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* ── Bento Grid ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Bento delay={0.08} className="md:col-span-2" icon={<Terminal size={20} className="text-indigo-400" />} iconBg="bg-indigo-500/[0.08] border-indigo-500/20"
            title="Algorithmic Sandbox" titleClass="text-gradient-indigo" accentColor="indigo"
            desc="Execute high-performance logic directly in the browser with production-grade verification suites." />
          <Bento delay={0.14} icon={<BrainCircuit size={20} className="text-cyan-400" />} iconBg="bg-cyan-500/[0.08] border-cyan-500/20"
            title="Adaptive Intelligence" accentColor="cyan"
            desc="Neural sequence generation tailors the curriculum entirely to your goals." compact />
          <Bento delay={0.2} icon={<ShieldCheck size={20} className="text-emerald-400" />} iconBg="bg-emerald-500/[0.08] border-emerald-500/20"
            title="Enterprise Grade" accentColor="emerald"
            desc="Built with the same strict standards used by top tech companies." compact />
          <Bento delay={0.26} className="md:col-span-2" icon={<Code2 size={20} className="text-purple-400" />} iconBg="bg-purple-500/[0.08] border-purple-500/20"
            title="Integrated Courses" titleClass="text-gradient-indigo" accentColor="purple"
            desc="From beginner syntax to advanced system design — carefully curated for maximum retention." />
        </div>
      </section>

      {/* ── Courses ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-white/[0.04]">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Premium Curriculums</h2>
            <p className="text-slate-600 text-sm">Deep dives into critical engineering domains.</p>
          </div>
          <motion.div whileHover={{ x: 3 }}>
            <Link to="/register" className="flex items-center gap-1.5 text-cyan-500 hover:text-cyan-400 text-sm font-semibold transition-colors">
              View All <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Advanced React Patterns',      level: 'Hard',   hours: '12', accent: 'from-indigo-500/20' },
            { title: 'Distributed Systems 101',      level: 'Medium', hours: '24', accent: 'from-cyan-500/20' },
            { title: 'Neural Network Architectures', level: 'Hard',   hours: '40', accent: 'from-purple-500/20' },
          ].map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="stark-card p-6 group overflow-hidden cursor-pointer"
            >
              <div className="h-36 bg-void rounded-xl mb-5 relative overflow-hidden border border-white/[0.05]">
                <div className={`absolute inset-0 bg-gradient-to-br ${c.accent} to-transparent`} />
                {/* Play button on hover */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1 }}
                    className="w-12 h-12 bg-white/90 text-void rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <Play size={18} className="fill-current ml-0.5" />
                  </motion.div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  c.level === 'Hard' ? 'bg-rose-500/[0.08] text-rose-400 border-rose-500/20' :
                  'bg-amber-500/[0.08] text-amber-400 border-amber-500/20'
                }`}>{c.level}</span>
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{c.hours} Hours</span>
              </div>
              <h4 className="text-base font-bold text-white mb-1.5 group-hover:text-gradient-cyan transition-all">{c.title}</h4>
              <p className="text-[12px] text-slate-600 mb-5">Master modern engineering with industry experts.</p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  {[1,2,3].map(j => (
                    <div key={j} className="w-6 h-6 rounded-full border-2 border-void bg-gradient-to-br from-indigo-500/20 to-cyan-500/20" />
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-slate-500">800+ Students</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Contest CTA ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-white/[0.04]">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden p-12 border border-indigo-500/20"
          style={{
            background: 'linear-gradient(135deg, rgba(79,70,229,0.35) 0%, rgba(124,58,237,0.25) 50%, rgba(6,182,212,0.15) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 80px -20px rgba(99,102,241,0.3)',
          }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/[0.04] rounded-full blur-3xl -mr-36 -mt-36 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-cyan-500/[0.06] rounded-full blur-3xl -ml-28 -mb-28 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/[0.08] rounded-full px-4 py-1.5 mb-5 border border-white/[0.1]">
                <Trophy size={13} className="text-amber-400" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Global Contest Series</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-5 leading-tight">
                Neural Logic Cup 2026
              </h2>
              <p className="text-indigo-100/60 text-base mb-7 max-w-md leading-relaxed">
                Join 10,000+ engineers in a high-stakes algorithmic battle.
                Win premium hardware, job offers, and eternal glory.
              </p>
              <div className="flex flex-wrap gap-3">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <button className="btn-primary rounded-full px-7 py-2.5 text-sm">Register Now</button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <button className="btn-ghost rounded-full px-7 py-2.5 text-sm">View Rules</button>
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Prize Pool',  value: '$50,000', icon: <Star  className="text-amber-400"  size={22} /> },
                { label: 'Participants',       value: '12.4k',   icon: <Users className="text-blue-400"   size={22} /> },
                { label: 'Time Remaining',     value: '04d 12h', icon: <Clock className="text-rose-400"   size={22} /> },
                { label: 'Difficulty',         value: 'Insane',  icon: <Zap   className="text-purple-400" size={22} /> },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className="glass border border-white/[0.08] p-5 rounded-2xl cursor-default"
                >
                  <div className="mb-3">{item.icon}</div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-2xl font-black text-white">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative z-10 py-28 text-center border-t border-white/[0.04]">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto px-6"
        >
          <h2 className="text-4xl font-bold text-white mb-5">
            Ready to redefine your{' '}
            <span className="text-gradient-cyan">engineering vector?</span>
          </h2>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed">
            Join the elite circle of engineers leveraging AI-driven spatial learning
            to master complex architectures and algorithms.
          </p>
          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link to="/register" className="btn-primary rounded-full px-10 py-4 text-base inline-flex">
              Create Free Account <Rocket size={18} />
            </Link>
          </motion.div>
          <p className="text-slate-700 text-xs mt-6 uppercase tracking-[0.2em] font-medium">
            No credit card required • Instant access
          </p>
        </motion.div>
      </section>

      <Footer />
    </motion.div>
  );
};

// ── Bento card ───────────────────────────────────────────────────────────────
const ACCENT_MAP = {
  indigo:  'rgba(99,102,241,0.08)',
  cyan:    'rgba(6,182,212,0.08)',
  emerald: 'rgba(52,211,153,0.08)',
  purple:  'rgba(168,85,247,0.08)',
};

const Bento = ({ delay, className = '', icon, iconBg, title, titleClass = '', desc, compact, accentColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -4, transition: { duration: 0.25 } }}
    className={`stark-card p-7 relative overflow-hidden group cursor-default ${className}`}
  >
    {/* Hover accent glow */}
    <div
      className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{ background: ACCENT_MAP[accentColor] || ACCENT_MAP.indigo }}
    />

    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 ${iconBg} transition-all duration-300`}
    >
      {icon}
    </motion.div>

    <h3 className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-white mb-2 ${titleClass}`}>{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export default LandingPage;
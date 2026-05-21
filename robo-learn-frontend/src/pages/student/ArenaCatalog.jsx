import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Code2,
  ChevronRight,
  Terminal,
  Activity,
  Trophy,
  CheckCircle2,
  Zap,
  Flame,
  SlidersHorizontal,
} from 'lucide-react';
import { studentApi } from '../../api/studentApi';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 18, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.5, delay: d, ease: [0.16, 1, 0.3, 1] },
});

/* ── Electric Solve Button ── */
const ElectricSolveBtn = ({ to }) => (
  <Link to={to} className="btn-electric btn-electric-solve rounded-lg px-5 py-2 text-xs font-black uppercase tracking-widest">
    <span className="btn-electric-glow" />
    <Zap size={13} />
    Solve
    <ChevronRight size={14} />
  </Link>
);

/* ── Stat Card ── */
const StatCard = ({ label, value, icon, color, bg, delay }) => (
  <motion.div
    {...fadeUp(delay)}
    whileHover={{ y: -3, scale: 1.01 }}
    className="stark-card p-5 flex items-center gap-4 group"
  >
    <div className={`p-3 rounded-xl ${bg} ${color} transition-all group-hover:scale-110 group-hover:shadow-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-2xl font-extrabold text-white">{value}</p>
    </div>
  </motion.div>
);

/* ── Difficulty Badge ── */
const DiffBadge = ({ difficulty }) => {
  const cfg = {
    EASY:   { label: 'Easy',   cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    MEDIUM: { label: 'Medium', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    HARD:   { label: 'Hard',   cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  };
  const c = cfg[difficulty] || cfg.EASY;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${c.cls}`}>
      {c.label}
    </span>
  );
};

const ArenaCatalog = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiff, setFilterDiff] = useState('ALL');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await studentApi.getAvailableProblems();
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const filteredProblems = problems.filter(p => {
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.id && p.id.toString() === searchTerm.trim()) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchDiff = filterDiff === 'ALL' || p.difficulty === filterDiff;
    return matchSearch && matchDiff;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* ══ HEADER ══ */}
      <motion.div {...fadeUp(0)} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Terminal className="text-emerald-400" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Algorithmic Arena
              </h1>
              <p className="text-slate-500 text-xs font-medium mt-0.5">Test your logic against our verification suites</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass pl-9 pr-4 py-2 w-full md:w-64 text-sm"
            />
          </div>

          {/* Difficulty filter pills */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-lg border border-white/[0.06] bg-white/[0.02]">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(d => (
              <button
                key={d}
                onClick={() => setFilterDiff(d)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  filterDiff === d
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                {d === 'ALL' ? 'All' : d.charAt(0) + d.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Mobile filter */}
          <button className="md:hidden btn-electric rounded-lg p-2.5">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </motion.div>

      {/* ══ STATS BANNER ══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Global Rank" value="#1,248"
          icon={<Trophy size={20} />} color="text-amber-400" bg="bg-amber-500/10"
          delay={0.06}
        />
        <StatCard
          label="Challenges Solved" value="42"
          icon={<CheckCircle2 size={20} />} color="text-emerald-400" bg="bg-emerald-500/10"
          delay={0.1}
        />
        <StatCard
          label="Current Streak" value="7 Days"
          icon={<Flame size={20} />} color="text-rose-400" bg="bg-rose-500/10"
          delay={0.14}
        />
      </div>

      {/* ══ PROBLEM LIST ══ */}
      <motion.div {...fadeUp(0.18)} className="stark-card overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Code2 size={13} className="text-indigo-400" /> Active Challenges
          </h3>
          <span className="text-[10px] font-bold text-slate-600">
            {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <div className="relative w-10 h-10 mb-4">
              <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
              <div className="absolute inset-0 rounded-full border border-transparent border-t-emerald-500 animate-spin" />
              <div className="absolute inset-[4px] rounded-full border border-transparent border-t-cyan-400 animate-spin [animation-duration:1.4s] [animation-direction:reverse]" />
            </div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Loading Challenges…</p>
          </div>
        ) : filteredProblems.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {filteredProblems.map((problem, idx) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="problem-row px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left: title + tags */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    {/* Problem number */}
                    <span className="text-[10px] font-black text-slate-600 w-8 shrink-0">
                      {problem.id ? `#${problem.id}` : ''}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {problem.title}
                    </h4>
                    <DiffBadge difficulty={problem.difficulty} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-[2.25rem]">
                    {problem.tags && problem.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-400 bg-white/[0.04] border border-white/[0.06] hover:border-cyan-500/20 hover:text-cyan-400 transition-all cursor-default"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: acceptance + solve button */}
                <div className="flex items-center gap-5 justify-between sm:justify-end w-full sm:w-auto">
                  <div className="text-center">
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Accept</p>
                    <p className="text-xs font-bold text-slate-400">54.2%</p>
                  </div>

                  <ElectricSolveBtn to={`/student/problems/${problem.id}`} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <Code2 size={28} className="text-slate-600" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No Challenges Found</h3>
            <p className="text-xs text-slate-500">Check back later or adjust your filters.</p>
          </div>
        )}
      </motion.div>

      {/* ══ BOTTOM CTA ══ */}
      <motion.div {...fadeUp(0.24)} className="flex justify-center">
        <button className="btn-electric btn-electric-primary rounded-xl px-8 py-3 text-xs font-black uppercase tracking-[0.15em]">
          <span className="btn-electric-glow" />
          <Zap size={14} />
          Load More Challenges
        </button>
      </motion.div>
    </div>
  );
};

export default ArenaCatalog;
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, Code2, TrendingUp, Terminal, Settings, 
  Activity, ChevronRight, Database, Cpu, ShieldAlert, Zap
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay: d }
});

const StatCard = ({ title, value, icon, trend, trendLabel }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="stark-card p-6 flex flex-col justify-between h-32 group"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-white">{value}</h3>
      </div>
      <div className="p-2 bg-white/[0.04] rounded-xl text-slate-400 group-hover:text-cyan-400 transition-colors">
        {icon}
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-2 text-[10px] font-bold">
        <span className="text-emerald-400 flex items-center gap-1">
          <TrendingUp size={12}/> {trend}
        </span>
        <span className="text-slate-500 uppercase tracking-wider">{trendLabel}</span>
      </div>
    )}
  </motion.div>
);

const QuickActionCard = ({ title, description, icon, to, buttonText }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="stark-card p-6 flex flex-col h-full hover:border-indigo-500/30 transition-all group"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
    <p className="text-xs text-slate-400 leading-relaxed mb-6 flex-1">{description}</p>
    <Link 
      to={to} 
      className="btn-electric btn-electric-primary w-full justify-center py-2.5 text-xs rounded-lg"
    >
      <span className="btn-electric-glow" />
      {buttonText} <ChevronRight size={14} />
    </Link>
  </motion.div>
);

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const username = useMemo(() => {
    return user?.username || JSON.parse(localStorage.getItem('user'))?.username || "Administrator";
  }, [user]);

  const [data, setData] = useState({
    totalStudents: 0, activeCourses: 0, totalProblems: 0, recentActivity: []
  });
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminApi.getDashboardMetrics();
      setData(response);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics', err);
      toast.error('Failed to load real-time metrics');
    } finally { setLoading(false); }
  };

  const containerVariants = {
    animate: { transition: { staggerChildren: 0.05 } }
  };

  const charVariants = {
    initial: { opacity: 0, scale: 0.5, filter: 'blur(8px)' },
    animate: { 
      opacity: 1, scale: 1, filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 200, damping: 12 }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
            <div className="absolute inset-0 rounded-full border border-transparent border-t-indigo-500 animate-spin" />
            <div className="absolute inset-[4px] rounded-full border border-transparent border-t-cyan-400 animate-spin [animation-duration:1.4s] [animation-direction:reverse]" />
            <ShieldAlert className="absolute inset-0 m-auto text-indigo-500/50" size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] animate-pulse">Synchronizing Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8">
      {/* Page Header with Animated Greeting */}
      <div className="relative">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
          <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-2"
          >
            <motion.div initial={{ width: 0 }} animate={{ width: 40 }} className="h-1 bg-indigo-500 rounded-full mb-4" />
            <div className="flex flex-col">
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-2 block">
                Administrative Protocol Active
              </motion.span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter flex flex-wrap items-center gap-x-4">
                <span className="text-zinc-700 font-bold uppercase tracking-widest text-xs">Administrative Matrix /</span>
                <span className="relative inline-flex flex-wrap items-center">
                  {username.split("").map((char, i) => (
                    <motion.span key={i} variants={charVariants} className="text-gradient-indigo drop-shadow-[0_0_20px_rgba(129,140,248,0.4)]">
                      {char}
                    </motion.span>
                  ))}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="w-1 md:w-2 h-8 md:h-12 bg-indigo-500 ml-2 shadow-glow-indigo"
                  />
                </span>
              </h1>
            </div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-sm text-slate-500 max-w-md">
              Real-time engagement telemetry and system orchestration operational.
            </motion.p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, type: 'spring' }} className="flex items-center gap-4 p-4 rounded-2xl glass-card border-white/[0.05]">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/[0.06] text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20 text-emerald-400 shadow-glow-emerald">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Live Connection
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={data.totalStudents.toLocaleString()} icon={<Users size={20} />} trend="+12%" trendLabel="vs last epoch" />
        <StatCard title="Curriculum Assets" value={data.activeCourses} icon={<BookOpen size={20} />} trend={data.activeCourses > 0 ? "Operational" : "Idle"} trendLabel="registry status" />
        <StatCard title="Problem Units" value={data.totalProblems} icon={<Code2 size={20} />} trend={`+${data.totalProblems}`} trendLabel="active challenges" />
        <StatCard title="System Latency" value="14ms" icon={<Activity size={20} />} trend="Stable" trendLabel="optimization active" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Management Studio & Activity */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div {...fadeUp(0.2)}>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Terminal size={18} className="text-indigo-400" /> Administrative Protocol Suites
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickActionCard title="Curriculum Studio" description="Design hierarchical learning vectors, orchestrate modules, and deploy technical chapters." icon={<BookOpen size={20} />} to="/admin/courses" buttonText="Manage Registry" />
              <QuickActionCard title="Challenge Forge" description="Engineer algorithmic challenges, configure validation suites, and monitor unit performance." icon={<Code2 size={20} />} to="/admin/problems" buttonText="Enter Forge" />
            </div>
          </motion.div>

          {/* Advertisement Section: RoboLearn Enterprise */}
          <motion.div {...fadeUp(0.25)} whileHover={{ scale: 1.01 }} className="stark-card p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.08] rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-all duration-500 group-hover:bg-indigo-500/[0.15]" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                  <ShieldAlert size={32} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    RoboLearn <span className="text-gradient-indigo">Enterprise</span>
                  </h3>
                  <p className="text-slate-400 text-xs max-w-md mt-2 leading-relaxed">
                    Unlock advanced organizational telemetry, custom SSO integrations, dedicated support, and multi-tenant architectures for large-scale deployments.
                  </p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-electric btn-electric-primary px-6 py-3 rounded-xl font-extrabold text-[10px] uppercase tracking-widest whitespace-nowrap">
                <span className="btn-electric-glow" />
                Upgrade Organization
              </motion.button>
            </div>
          </motion.div>

          {/* Recent Registry Activity */}
          <motion.div {...fadeUp(0.3)} className="stark-card overflow-hidden">
             <div className="p-5 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                   <Activity size={16} className="text-indigo-400" /> Recent Registry Events
                </h3>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logs</span>
             </div>
             <div className="divide-y divide-white/[0.04]">
                {data.recentActivity && data.recentActivity.length > 0 ? (
                   data.recentActivity.map((activity, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors group">
                         <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl border ${activity.type === 'COURSE' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                               {activity.type === 'COURSE' ? <BookOpen size={14} /> : <Code2 size={14} />}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{activity.title}</p>
                               <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mt-1">{activity.type} DEPLOYMENT RECOGNIZED</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xs text-slate-500 font-medium">{activity.timestamp}</p>
                         </div>
                      </div>
                   ))
                ) : (
                   <div className="flex flex-col items-center justify-center py-16 px-4">
                      <Database size={32} className="mb-4 text-slate-700" />
                      <p className="text-xs font-bold text-slate-500">No recent registry events detected in current epoch.</p>
                   </div>
                )}
             </div>
             <div className="p-3 bg-white/[0.01] border-t border-white/[0.04] text-center">
                <button className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors">
                   View Audit Trail
                </button>
             </div>
          </motion.div>
        </div>

        {/* Right Column: Analytics & Telemetry */}
        <div className="space-y-6">
           <motion.div {...fadeUp(0.35)} className="stark-card p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                 <Cpu size={120} />
              </div>
              <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-xs uppercase tracking-widest relative z-10">
                 <Settings size={16} className="text-slate-400" /> Telemetry Matrix
              </h3>
              <div className="space-y-6 relative z-10">
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Database Pressure</span>
                       <span className="text-xs font-black text-cyan-400">12%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                       <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] w-[12%]" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Heap Allocation</span>
                       <span className="text-xs font-black text-purple-400">42%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                       <div className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] w-[42%]" />
                    </div>
                 </div>
                 <div className="pt-6 border-t border-white/[0.05] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Uptime</span>
                       <span className="text-[11px] font-black text-emerald-400">99.998%</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gateway</span>
                       <span className="text-[11px] font-black text-indigo-400">14ms AVG</span>
                    </div>
                 </div>
              </div>
           </motion.div>

           <motion.div {...fadeUp(0.4)} whileHover={{ scale: 1.02 }} className="stark-card p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] transform group-hover:scale-110 transition-transform">
                 <Users size={100} />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={18} className="text-amber-400" />
                <h3 className="font-bold text-white text-sm uppercase tracking-widest">User Telemetry</h3>
              </div>
              <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">
                Access granular engagement matrices, learning velocities, and authentication logs for all nodes.
              </p>
              <Link to="/admin/students" className="btn-ghost w-full justify-center py-2.5 text-xs rounded-lg border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10">
                 View Nodes <ChevronRight size={14} />
              </Link>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
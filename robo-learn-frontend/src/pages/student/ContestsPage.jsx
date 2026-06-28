import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Users, ChevronRight, Zap, Target, Star, Calendar, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

const ContestsPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await apiClient.get('/api/contests');
      setContests(res.data);
    } catch (err) {
      toast.error('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      await apiClient.post(`/api/contests/${id}/enroll`);
      toast.success('Successfully joined contest!');
      fetchContests(); // refresh
    } catch (err) {
      toast.error('Failed to join contest');
    }
  };

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 glass-strong border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-6">
              <Trophy size={16} />
              <span>Weekly Tournaments</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Compete, Code, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Conquer.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Join global coding contests to test your algorithms against the best. Solve complex problems under pressure, climb the leaderboard, and earn exclusive ranks.
            </p>
            <button className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
              <Zap size={18} />
              <span>View Upcoming Matches</span>
            </button>
          </div>
          <div className="hidden md:flex relative w-64 h-64 items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-3xl opacity-20 animate-pulse" />
            <Trophy className="w-32 h-32 text-indigo-400 drop-shadow-[0_0_30px_rgba(99,102,241,0.6)]" />
          </div>
        </div>
      </div>

      {/* Contests List */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="text-cyan-400" />
          <span>Active & Upcoming Contests</span>
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
        ) : contests.length === 0 ? (
          <div className="stark-card p-12 text-center flex flex-col items-center">
            <Calendar className="w-16 h-16 text-slate-600 mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">No Contests Scheduled</h3>
            <p className="text-slate-400">Instructors and Admins haven't scheduled any upcoming contests yet. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contests.map((contest, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={contest.id} 
                className="stark-card p-6 group hover:border-indigo-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{contest.title}</h3>
                    {contest.isEnrolled ? (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">Enrolled</span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 text-xs font-bold rounded-full">Open</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-6 line-clamp-2">{contest.description}</p>
                  
                  <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                      <Clock size={14} className="text-indigo-400" />
                      {new Date(contest.startTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                      <Code2 size={14} className="text-cyan-400" />
                      {contest.problemIds?.length || 0} Problems
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                      <Users size={14} className="text-emerald-400" />
                      {contest.enrolledCount || 0} Participants
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  {contest.isEnrolled ? (
                    <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                      <span>Enter Arena</span>
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button onClick={() => handleJoin(contest.id)} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition-colors">
                      Join Contest
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestsPage;

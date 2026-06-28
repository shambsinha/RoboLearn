import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Code, Shield } from 'lucide-react';
import { studentApi } from '../../api/studentApi';
import toast from 'react-hot-toast';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await studentApi.getLeaderboard();
      setLeaders(data);
    } catch (error) {
      toast.error('Failed to load leaderboard data.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.8)]" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.8)]" />;
    return <span className="text-slate-400 font-black font-mono text-lg">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up px-4 md:px-0">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/5 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Global Leaderboard</h1>
            <p className="text-sm text-slate-400">Compete with top developers around the world.</p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium (Optional extra flair) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 pb-10 border-b border-white/5">
        {[1, 0, 2].map(idx => {
          const user = leaders[idx];
          if (!user) return null;
          const isFirst = idx === 0;
          return (
            <div key={user.username} className={`flex flex-col items-center p-6 rounded-2xl border ${isFirst ? 'bg-gradient-to-b from-yellow-500/10 to-transparent border-yellow-500/30 md:-translate-y-6' : 'bg-white/[0.02] border-white/[0.05]'} relative`}>
              {isFirst && <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.5)]">Champion</div>}
              
              <div className="relative mb-4">
                <img src={user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.username}&background=0A0E16&color=fff`} alt={user.username} className={`w-20 h-20 rounded-full object-cover border-4 ${isFirst ? 'border-yellow-500/50' : 'border-white/10'}`} />
                <div className="absolute -bottom-2 -right-2 bg-[#0A0E16] rounded-full p-1 border border-white/10">
                  {getRankIcon(user.rank)}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1">{user.username}</h3>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-cyan-400 text-sm font-medium">
                <Star className="w-4 h-4" />
                {user.xp} XP
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <div className="stark-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500 bg-white/[0.02]">
                <th className="px-6 py-4 font-semibold">Rank</th>
                <th className="px-6 py-4 font-semibold">Developer</th>
                <th className="px-6 py-4 font-semibold text-center">Easy</th>
                <th className="px-6 py-4 font-semibold text-center">Medium</th>
                <th className="px-6 py-4 font-semibold text-center">Hard</th>
                <th className="px-6 py-4 font-semibold text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {leaders.slice(3).map((user) => (
                <tr key={user.username} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:border-cyan-500/30 transition-colors">
                      <span className="text-slate-400 font-mono text-sm font-bold">{user.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img src={user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.username}&background=0A0E16&color=fff`} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-cyan-500/20 transition-all" alt="" />
                      <span className="font-medium text-slate-200 group-hover:text-white transition-colors">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-emerald-400/80 font-mono text-sm">{user.solvedEasy || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-yellow-400/80 font-mono text-sm">{user.solvedMedium || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-red-400/80 font-mono text-sm">{user.solvedHard || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1.5 text-cyan-400 font-bold">
                      <Star className="w-4 h-4 opacity-50" />
                      {user.xp}
                    </div>
                  </td>
                </tr>
              ))}
              
              {leaders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No users have earned XP yet. Be the first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

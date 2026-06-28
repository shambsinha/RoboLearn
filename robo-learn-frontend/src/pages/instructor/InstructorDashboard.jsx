import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Users, FolderEdit, Database, Code2, BookOpen, Clock, Activity, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstructorDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalProblems: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Use existing admin metrics for now (since APIs are unified), 
      // or we can just fetch courses and problems to show counts.
      const res = await adminApi.getDashboardMetrics();
      setStats(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'My Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'My Problems', value: stats.totalProblems, icon: Code2, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { title: 'Enrolled Students', value: stats.totalUsers, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { title: 'Platform Activity', value: stats.activeUsers, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/5 border border-indigo-500/20">
          <LayoutDashboard className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Instructor Dashboard</h1>
          <p className="text-sm text-slate-400">Manage your courses, problems, and students.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="stark-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="stark-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Recent Courses</h2>
            <Link to="/instructor/courses" className="text-sm text-cyan-400 hover:text-cyan-300">View All</Link>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-slate-500 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
            <FolderEdit className="w-8 h-8 mb-3 opacity-20" />
            <p>Manage your curriculum</p>
            <Link to="/instructor/courses" className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors">
              Go to Courses
            </Link>
          </div>
        </div>

        <div className="stark-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Recent Problems</h2>
            <Link to="/instructor/problems" className="text-sm text-cyan-400 hover:text-cyan-300">View All</Link>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-slate-500 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
            <Database className="w-8 h-8 mb-3 opacity-20" />
            <p>Manage your coding challenges</p>
            <Link to="/instructor/problems" className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors">
              Go to Problems
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;

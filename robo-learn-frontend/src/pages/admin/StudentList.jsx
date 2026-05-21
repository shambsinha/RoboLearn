import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, Search, Filter, ShieldAlert, Users, X, Activity, BookOpen, CheckCircle2, Trophy } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await adminApi.getUsers();
      setStudents(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
      toast.error('Failed to load student directory');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (userId) => {
    try {
      await adminApi.toggleSuspendUser(userId);
      toast.success('User status updated successfully');
      fetchStudents(); // Refresh the list
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleViewProfile = async (userId) => {
    try {
      const data = await adminApi.getUserProfile(userId);
      setSelectedStudent(data);
      setShowModal(true);
    } catch (err) {
      toast.error('Failed to load user profile');
    }
  };

  const filteredStudents = students.filter(student => 
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Student Directory</h2>
          <p className="text-slate-400 text-sm mt-1">Manage user accounts and monitor platform engagement.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm font-medium text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600"
              />
           </div>
           <button className="flex items-center space-x-2 px-4 py-2 border border-slate-800 rounded-lg text-sm font-medium text-slate-400 bg-slate-950 hover:bg-slate-800 hover:text-slate-200 transition-colors w-full sm:w-auto">
              <Filter size={16} />
              <span>Filter</span>
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                    Loading directory...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <Users size={32} className="mx-auto mb-2 text-slate-600" />
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0">
                          {student.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">{student.username}</div>
                          <div className="text-xs text-slate-500 flex items-center mt-0.5">
                            <Mail size={12} className="mr-1" />
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-400">
                        {new Date(student.joinedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] font-semibold rounded border ${
                        !student.suspended 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {!student.suspended ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-32">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-500">Completion</span>
                          <span className="text-xs font-medium text-slate-300">{student.progressPercentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              student.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${student.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleViewProfile(student.id)}
                          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors" 
                          title="View Profile & Progress"
                        >
                          <ShieldCheck size={16} />
                        </button>
                        <button 
                          onClick={() => handleToggleSuspend(student.id)}
                          className={`p-2 rounded-md transition-colors ${
                            student.suspended 
                              ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20' 
                              : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                          }`}
                          title={student.suspended ? "Restore User" : "Suspend User"}
                        >
                          <ShieldAlert size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Profile Modal */}
      <AnimatePresence>
        {showModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setShowModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-700/50 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/50">
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Users size={18} className="text-indigo-400" />
                  Student Profile
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-2xl shrink-0">
                    {selectedStudent.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-100">{selectedStudent.username}</h4>
                    <p className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail size={14} /> {selectedStudent.email}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold rounded border ${
                        !selectedStudent.suspended 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {!selectedStudent.suspended ? 'ACTIVE ACCOUNT' : 'ACCOUNT SUSPENDED'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen size={16} className="text-indigo-400" />
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Courses</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-100">{selectedStudent.coursesEnrolled}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Solved</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-100">{selectedStudent.problemsSolved}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy size={16} className="text-amber-400" />
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">XP Points</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-100">{selectedStudent.xpPoints}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity size={16} className="text-rose-400" />
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Streak</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-100">{selectedStudent.dailyStreak} Days</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentList;
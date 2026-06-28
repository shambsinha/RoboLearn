import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Code2, Trophy, Medal, User,
  LayoutDashboard, FolderEdit, Database, Users, Settings,
  LogOut, Sparkles,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Sidebar = ({ role }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { name: 'Courses',      path: '/student/courses',      icon: BookOpen },
    { name: 'Problems',     path: '/student/problems',     icon: Code2 },
    { name: 'Leaderboard',  path: '/student/leaderboard',  icon: Trophy },
    { name: 'Contests',     path: '/student/contests',     icon: Trophy },
    { name: 'Achievements', path: '/student/achievements', icon: Medal },
    { name: 'AI Tutor',     path: '/student/ai-tutor',     icon: Sparkles },
    { name: 'Profile',      path: '/student/profile',      icon: User },
  ];

  const instructorLinks = [
    { name: 'Dashboard', path: '/instructor/overview', icon: LayoutDashboard },
    { name: 'My Courses', path: '/instructor/courses', icon: FolderEdit },
    { name: 'Problems',  path: '/instructor/problems', icon: Database },
    { name: 'Profile',   path: '/instructor/profile',  icon: User },
  ];

  const adminLinks = [
    { name: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
    { name: 'Courses',  path: '/admin/courses',  icon: FolderEdit },
    { name: 'Problems', path: '/admin/problems', icon: Database },
    { name: 'Users',    path: '/admin/users',    icon: Users },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  let links = studentLinks;
  if (role === 'ADMIN') links = adminLinks;
  else if (role === 'INSTRUCTOR') links = instructorLinks;

  return (
    <aside className="w-56 fixed top-14 bottom-0 left-0 z-40 glass-strong border-r border-white/[0.05] flex flex-col hidden lg:flex">
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <nav className="flex-1 py-4 px-2.5 space-y-0.5 overflow-y-auto">
        {links.map((link, i) => (
          <motion.div
            key={link.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25, ease: 'easeOut' }}
          >
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `sidebar-link group ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Animated left bar */}
                  <motion.span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-gradient-to-b from-cyan-400 to-indigo-500"
                    initial={{ height: 0, opacity: 0 }}
                    animate={isActive ? { height: 18, opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                  <link.icon
                    size={15}
                    className={`transition-all duration-200 ${
                      isActive ? 'text-cyan-400' : 'text-slate-600 group-hover:text-cyan-400'
                    }`}
                  />
                  <span className={`transition-colors duration-200 ${
                    isActive ? 'text-white' : 'group-hover:text-slate-200'
                  }`}>
                    {link.name}
                  </span>
                  {/* Hover glow background */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 to-indigo-500/0 group-hover:from-cyan-500/[0.04] group-hover:to-indigo-500/[0.04] transition-all duration-300" />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

      {/* Logout */}
      <div className="p-2.5">
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-slate-600 hover:text-rose-400 hover:bg-rose-400/[0.06] border border-transparent hover:border-rose-500/[0.12] transition-all duration-200 group"
        >
          <LogOut size={14} className="group-hover:text-rose-400 transition-colors" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </aside>
  );
};

export default Sidebar;
import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ChevronDown, Settings, CreditCard, LogOut,
  BookOpen, Code2, Trophy, Medal, LayoutDashboard,
  FolderEdit, Database, Users, Cpu, Sparkles,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  // Close dropdown on route change
  useEffect(() => { setIsDropdownOpen(false); }, [location.pathname]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const studentLinks = [
    { name: 'Dashboard',    path: '/student',              icon: LayoutDashboard, end: true },
    { name: 'Courses',      path: '/student/courses',      icon: BookOpen },
    { name: 'Problems',     path: '/student/problems',     icon: Code2 },
    { name: 'Contests',     path: '/student/contests',     icon: Trophy },
    { name: 'Achievements', path: '/student/achievements', icon: Medal },
  ];

  const adminLinks = [
    { name: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
    { name: 'Courses',  path: '/admin/courses',  icon: FolderEdit },
    { name: 'Problems', path: '/admin/problems', icon: Database },
    { name: 'Users',    path: '/admin/users',    icon: Users },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : studentLinks;
  const home  = user?.role === 'ADMIN' ? '/admin' : '/student';

  return (
    <header
      className={`
        h-14 fixed top-0 inset-x-0 z-50
        flex items-center justify-between px-5
        transition-all duration-300
        ${scrolled
          ? 'glass-strong border-b border-white/[0.05] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.6)]'
          : 'bg-transparent border-b border-white/[0.03]'}
      `}
    >
      {/* ── Left: Logo + Nav ── */}
      <div className="flex items-center gap-6 h-full">
        {/* Logo with hover glow */}
        <Link to={user ? home : '/'} className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-glow-indigo relative overflow-hidden"
          >
            <Cpu size={15} className="text-white relative z-10" />
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </motion.div>
          <span className="text-sm font-bold text-white tracking-tight hidden md:block">
            Robo<span className="text-gradient-cyan">Learn</span>
          </span>
        </Link>

        {/* Nav links with hover pill effect */}
        <nav className="hidden lg:flex items-center gap-1 h-full border-l border-white/[0.05] pl-5">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.end}
              className={({ isActive }) =>
                `nav-pill group ${isActive ? 'nav-pill-active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon size={14} className={isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300 transition-colors duration-200'} />
                  <span>{link.name}</span>
                  {/* Animated underline on hover */}
                  {!isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-cyan-500 to-indigo-500 group-hover:w-3/4 transition-all duration-300 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ── Right: User Profile ── */}
      <div className="relative" ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] transition-all group cursor-pointer"
        >
          <div className="flex flex-col items-end text-right hidden sm:flex">
            <span className="text-[12px] font-semibold text-slate-300 group-hover:text-white leading-tight transition-colors">
              {user?.username || 'User'}
            </span>
            <span className="text-[10px] text-slate-600 capitalize leading-tight">
              {user?.role?.toLowerCase() || 'Learner'}
            </span>
          </div>

          {/* Avatar ring with gradient border on hover */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center group-hover:border-transparent transition-colors overflow-hidden">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover relative z-10" />
              ) : (
                <User size={14} className="text-slate-400 group-hover:text-cyan-400 transition-colors relative z-10" />
              )}
            </div>
            {/* Gradient border ring on hover */}
            <div className="absolute -inset-[1px] rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            {/* Online dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0A0E16] shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
          </div>

          <ChevronDown
            size={12}
            className={`text-slate-600 group-hover:text-slate-400 transition-all duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </motion.button>

        {/* Dropdown */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-[calc(100%+0.5rem)] w-56 rounded-xl overflow-hidden frosted-dropdown border border-white/[0.08]"
            >
              {/* User header */}
              <div className="px-4 py-3 border-b border-white/[0.05] bg-gradient-to-r from-indigo-500/[0.04] to-cyan-500/[0.04]">
                <p className="text-[12px] font-bold text-white truncate">{user?.username}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <DropLink to={user?.role === 'ADMIN' ? '/admin/settings' : '/student/profile'} icon={User} label="My Profile" onClick={() => setIsDropdownOpen(false)} />
                <DropLink to="#" icon={Settings} label="Account Settings" onClick={() => setIsDropdownOpen(false)} />
                {user?.role === 'STUDENT' && (
                  <DropLink to="#" icon={CreditCard} label="Billing" onClick={() => setIsDropdownOpen(false)} />
                )}

                <div className="mx-3 my-1 border-t border-white/[0.05]" />

                <button
                  onClick={handleLogout}
                  className="drop-item text-rose-400/80 hover:bg-rose-500/[0.06] hover:text-rose-400"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

// ── Dropdown link ─────────────────────────────────────────────
const DropLink = ({ to, icon: Icon, label, onClick }) => (
  <Link to={to} onClick={onClick} className="drop-item text-slate-400 hover:bg-white/[0.04] hover:text-white">
    <Icon size={14} />
    <span>{label}</span>
  </Link>
);

export default Navbar;
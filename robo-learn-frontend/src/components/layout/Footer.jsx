import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Code2, Send, Users, Mail } from 'lucide-react';

const Footer = () => (
  <footer className="mt-12 frosted-footer pt-10 pb-6 px-6 relative overflow-hidden">
    {/* Subtle top edge glow */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
    {/* Frosted ambient orb */}
    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/[0.04] rounded-full blur-3xl pointer-events-none" />
    <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/[0.04] rounded-full blur-3xl pointer-events-none" />

    <div className="max-w-6xl mx-auto relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4 group">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-glow-indigo group-hover:scale-105 transition-transform">
              <Cpu size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">
              Robo<span className="text-gradient-cyan">Learn</span>
            </span>
          </Link>
          <p className="text-slate-500 text-[13px] leading-relaxed mb-4">
            AI-driven tutoring and premium curriculums for top-tier engineers.
          </p>
          <div className="flex items-center gap-2">
            {[Code2, Send, Users, Mail].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-lg border border-white/[0.06] bg-white/[0.03] flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/25 hover:bg-cyan-500/[0.06] transition-all backdrop-blur-sm">
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>

        <Col title="Platform" items={[
          { label: 'Courses',    to: '/student/courses' },
          { label: 'Problems',   to: '/student/problems' },
          { label: 'AI Tutor',   to: '/student/ai-tutor' },
          { label: 'Contests',   to: '/student/contests' },
        ]} />
        <Col title="Resources" items={[
          { label: 'Docs' },
          { label: 'API' },
          { label: 'Community' },
          { label: 'Open Source' },
        ]} />
        <Col title="Legal" items={[
          { label: 'Privacy' },
          { label: 'Terms' },
          { label: 'Cookies' },
          { label: 'Contact' },
        ]} />
      </div>

      <div className="pt-5 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-slate-600 text-xs">&copy; 2026 RoboLearn Inc.</p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(52,211,153,0.7)]" />
          <span className="text-slate-600 text-[10px] font-semibold uppercase tracking-[0.12em]">
            All Systems Operational
          </span>
        </div>
      </div>
    </div>
  </footer>
);

const Col = ({ title, items }) => (
  <div>
    <h4 className="text-slate-400 font-semibold mb-4 text-[11px] uppercase tracking-[0.1em]">{title}</h4>
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label}>
          {item.to ? (
            <Link to={item.to} className="text-slate-500 hover:text-cyan-400 text-[13px] transition-colors">{item.label}</Link>
          ) : (
            <a href="#" className="text-slate-500 hover:text-cyan-400 text-[13px] transition-colors">{item.label}</a>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;

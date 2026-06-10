import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Star,
  Users,
  Play,
  ChevronLeft,
  CheckCircle,
  Award
} from 'lucide-react';
import { studentApi } from '../../api/studentApi';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const data = await studentApi.getCourseDetails(courseId);
        setCourse(data);
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-8">
          <div className="h-72 bg-white/[0.02] rounded-3xl border border-white/[0.05]"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-white/[0.02] rounded-2xl border border-white/[0.05]"></div>
              <div className="h-64 bg-white/[0.02] rounded-2xl border border-white/[0.05]"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-white/[0.02] rounded-2xl border border-white/[0.05]"></div>
              <div className="h-32 bg-white/[0.02] rounded-2xl border border-white/[0.05]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto text-center py-32">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
           <BookOpen size={40} className="text-rose-500 opacity-40" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Node Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm font-medium">The curriculum you are attempting to access does not exist in the current registry.</p>
        <Link to="/student/courses" className="btn-electric btn-electric-primary px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
          <span className="btn-electric-glow" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-8 px-4 animate-fade-up">
      {/* Back Button */}
      <Link to="/student/courses" className="inline-flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-indigo-400 transition-colors">
        <ChevronLeft size={14} />
        Exit to Registry
      </Link>

      {/* Course Hero */}
      <div className="stark-card overflow-hidden border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="relative h-72 overflow-hidden bg-void">
          <img 
            src={course.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'} 
            className="w-full h-full object-cover opacity-40 grayscale-[0.5] contrast-125" 
            alt={course.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
          
          <div className="absolute bottom-8 left-8 flex flex-col gap-4">
            <div className="flex gap-2">
              {course.difficulty && (
                <span className="px-3 py-1 bg-white/5 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-md border border-white/10">
                  {course.difficulty}
                </span>
              )}
              <span className="px-3 py-1 bg-indigo-500/20 backdrop-blur-md text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-indigo-500/30">
                {course.category || 'General'}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
              {course.title}
            </h1>
          </div>
        </div>

        <div className="p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 overflow-hidden">
                    <span className="text-[10px] font-black text-slate-400 uppercase">AC</span>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lead Instructor</p>
                    <p className="text-sm font-bold text-white uppercase tracking-tight">{course.instructorName || 'Academy Instructor'}</p>
                 </div>
              </div>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">
                {course.description}
              </p>
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={16} className="text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">{course.estimatedHours || 12} Hours</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Users size={16} className="text-cyan-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">{course.enrolledCount || 840} Enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Award size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">Certified</span>
                </div>
              </div>
            </div>

            <button className="btn-electric btn-electric-primary px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-glow-indigo shrink-0 self-start lg:self-center">
              <span className="btn-electric-glow" />
              <Play size={16} className="fill-current" /> Initialize Module
            </button>
          </div>
        </div>
      </div>

      {/* Course Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Objectives */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-500" /> Competency Outcomes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(course.learningObjectives || [
                'Neural Circuit Architecture',
                'Algorithmic Pattern Recognition',
                'Advanced Logic Structures',
                'Full-Stack Neural Implementation'
              ]).map((objective, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400">
                     <CheckCircle size={14} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{objective}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
              <Layers size={20} className="text-indigo-500" /> Module Hierarchy
            </h2>
            <div className="space-y-3">
              {(course.modules || [
                { title: 'Initialization & Handshake', duration: '2h', lessons: 5 },
                { title: 'Core Processing Unit', duration: '4h', lessons: 8 },
                { title: 'Advanced Neural Layers', duration: '3h', lessons: 6 },
                { title: 'Final System Deployment', duration: '3h', lessons: 4 }
              ]).map((module, index) => (
                <div key={index} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-indigo-500/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-400 text-xs shadow-lg group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="font-bold text-white uppercase tracking-tight text-sm group-hover:text-indigo-400 transition-colors">{module.title}</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{module.lessons} Sub-Sequences</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white/[0.04] px-3 py-1 rounded-md border border-white/5">
                    {module.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="stark-card p-6 border-white/5 bg-gradient-to-br from-indigo-500/[0.03] to-transparent">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Unit Telemetry</h3>
            <div className="space-y-5">
              {[
                { label: 'Transmission', val: course.estimatedHours + 'h', icon: <Clock size={12} />, color: 'text-indigo-400' },
                { label: 'Complexity', val: course.difficulty, icon: <Activity size={12} />, color: 'text-rose-400' },
                { label: 'Rating', val: '4.9/5.0', icon: <Star size={12} />, color: 'text-amber-400' },
                { label: 'Enrolled', val: course.enrolledCount || 840, icon: <Users size={12} />, color: 'text-cyan-400' },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/[0.03] pb-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    {stat.icon}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-tighter ${stat.color}`}>{stat.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stark-card p-6 border-emerald-500/10 bg-emerald-500/[0.02]">
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-5">Prerequisites</h3>
            <div className="space-y-3">
              {(course.prerequisites || ['Basic computer knowledge', 'Analytical Mindset', 'Logic Principles']).map((prereq, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle size={14} className="text-emerald-500/40" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{prereq}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

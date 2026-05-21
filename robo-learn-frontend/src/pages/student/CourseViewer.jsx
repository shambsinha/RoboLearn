import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/studentApi';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronDown,
  Video,
  Code2,
  FileText,
  AlertCircle,
  LayoutTemplate,
  Play,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeItem, setActiveItem] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [completedItems, setCompletedItems] = useState(new Set());
  const [markingLoading, setMarkingLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    try {
      const progress = await studentApi.getCourseProgress(courseId);
      setCompletedItems(new Set(progress));
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  }, [courseId]);

  const fetchCourseDetails = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      // Use individual try-catches within Promise.all to ensure one failure doesn't block everything
      const [courseData, progressData] = await Promise.all([
        studentApi.getCourseDetails(courseId).catch(err => {
          console.error('Course details fetch failed', err);
          return null;
        }),
        studentApi.getCourseProgress(courseId).catch(err => {
          console.error('Progress fetch failed', err);
          return [];
        })
      ]);

      if (!courseData) {
        toast.error('Failed to load course content');
        return;
      }

      setCourse(courseData);
      setCompletedItems(new Set(progressData || []));

      if (courseData.modules && courseData.modules.length > 0) {
        const firstModule = courseData.modules[0];
        setExpandedModules({ [firstModule.moduleId]: true });
        
        if (firstModule.items?.length > 0) {
          setActiveItem(firstModule.items[0]);
        }
      }
    } catch (error) {
      console.error('Critical error in CourseViewer:', error);
      toast.error('A critical error occurred while initializing workspace');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const handleMarkComplete = async () => {
    if (!activeItem || markingLoading) return;
    
    // Find current moduleId
    let currentModuleId = null;
    for (const m of course.modules) {
      if (m.items?.some(i => i.order === activeItem.order && i.title === activeItem.title)) {
        currentModuleId = m.moduleId;
        break;
      }
    }

    if (!currentModuleId) return;

    setMarkingLoading(true);
    try {
      await studentApi.markItemComplete(courseId, currentModuleId, activeItem.order, activeItem.type);
      setCompletedItems(prev => new Set([...prev, `${currentModuleId}-${activeItem.order}`]));
      toast.success('Lesson completed!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as complete');
    } finally {
      setMarkingLoading(false);
    }
  };

  const isCompleted = (moduleId, itemOrder) => {
    return completedItems.has(`${moduleId}-${itemOrder}`);
  };

  const calculateOverallProgress = useMemo(() => {
    if (!course?.modules) return 0;
    let totalItems = 0;
    course.modules.forEach(m => totalItems += (m.items?.length || 0));
    if (totalItems === 0) return 0;
    return Math.round((completedItems.size / totalItems) * 100);
  }, [course?.modules, completedItems]);

  const sortedModules = useMemo(() => {
    if (!course?.modules) return [];
    return [...course.modules].sort((a, b) => (a.serialOrder || 0) - (b.serialOrder || 0))
      .map(m => ({
        ...m,
        items: [...(m.items || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
      }));
  }, [course?.modules]);

  const toggleModule = useCallback((moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  }, []);

  const handleStartChallenge = useCallback((problemId) => {
    navigate(`/student/problems/${problemId}`);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-4">
        <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Initializing Workspace</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400">
        <AlertCircle size={48} className="mb-4 text-zinc-600" />
        <h2 className="text-xl font-bold text-zinc-200 mb-6">Course Unavailable</h2>
        <Link to="/student/courses" className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 bg-zinc-900 border border-white/5 px-6 py-2.5 rounded-xl transition-all">
          <ChevronLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans flex flex-col">
      {/* Header Bar */}
      <header className="h-16 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <Link to="/student/courses" className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all">
            <ChevronLeft size={20} />
          </Link>
          <div className="h-6 w-px bg-white/5"></div>
          <div>
            <h1 className="font-bold text-sm text-zinc-100 truncate max-w-[200px] sm:max-w-md">{course.title}</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{course.level || 'Professional'} Track</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 bg-zinc-950/50 px-4 py-2 rounded-xl border border-white/5">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Overall Progress</span>
              <span className="text-xs font-bold text-indigo-400">{calculateOverallProgress}% Complete</span>
           </div>
           <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${calculateOverallProgress}%` }}
                className="bg-indigo-500 h-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
              />
           </div>
        </div>
      </header>

      {/* Split Screen Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Accordion Curriculum Navigation */}
        <aside className="w-80 bg-zinc-900/30 backdrop-blur-sm border-r border-white/5 overflow-y-auto hidden lg:block flex-shrink-0 custom-scrollbar">
          <div className="p-6">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6 px-2">Course Modules</h2>
            <div className="space-y-3">
              {sortedModules.map((module, mIndex) => (
                <div key={module.moduleId} className="rounded-xl overflow-hidden border border-white/5 bg-zinc-900/20 shadow-sm">
                  <button
                    onClick={() => toggleModule(module.moduleId)}
                    className={`w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all focus:outline-none ${expandedModules[module.moduleId] ? 'bg-white/5' : ''}`}
                  >
                    <div className="flex items-center gap-3 text-left min-w-0">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border ${expandedModules[module.moduleId] ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-zinc-800 border-white/5 text-zinc-500'}`}>
                        {mIndex + 1}
                      </div>
                      <span className="font-bold text-xs text-zinc-300 truncate">{module.title}</span>
                    </div>
                    <motion.div animate={{ rotate: expandedModules[module.moduleId] ? 180 : 0 }}>
                      <ChevronDown size={14} className="text-zinc-500 shrink-0" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedModules[module.moduleId] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-zinc-950/40 border-t border-white/5 overflow-hidden"
                      >
                        <div className="p-2 space-y-1">
                          {module.items && module.items.length > 0 ? (
                            module.items.map((item, idx) => {
                              const isActive = item.order === activeItem?.order && item.title === activeItem?.title;
                              const completed = isCompleted(module.moduleId, item.order);
                              return (
                                <button
                                  key={idx}
                                  onClick={() => setActiveItem(item)}
                                  className={`w-full group flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all ${
                                    isActive 
                                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                                      : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
                                  }`}
                                >
                                  <div className={`${isActive ? 'text-white' : (completed ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-indigo-400')} transition-colors`}>
                                    {item.type === 'VIDEO' ? (
                                      <Video size={14} className="shrink-0" />
                                    ) : item.type === 'THEORY' ? (
                                      <FileText size={14} className="shrink-0" />
                                    ) : (
                                      <Code2 size={14} className="shrink-0" />
                                    )}
                                  </div>
                                  <span className={`text-xs font-bold truncate tracking-tight ${completed && !isActive ? 'text-zinc-500 line-through decoration-emerald-500/30' : ''}`}>{item.title}</span>
                                  {completed && !isActive && <CheckCircle2 size={12} className="ml-auto text-emerald-500" />}
                                  {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-white animate-pulse" />}
                                </button>
                              );
                            })
                          ) : (
                            <div className="p-4 text-[10px] text-zinc-600 font-medium italic text-center">No content available</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 bg-zinc-950 overflow-y-auto p-4 lg:p-12 flex justify-center custom-scrollbar">
          <div className="w-full max-w-4xl">
            {activeItem ? (
              <motion.div 
                key={activeItem.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      {activeItem.type === 'VIDEO' ? (
                        <div className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Play size={10} fill="currentColor" /> Video Lecture
                        </div>
                      ) : activeItem.type === 'THEORY' ? (
                        <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                          <FileText size={10} /> Theory Lesson
                        </div>
                      ) : (
                        <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Code2 size={10} /> Interactive Lab
                        </div>
                      )}
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">{activeItem.title}</h2>
                  </div>
                  
                  {/* Mark as Complete Button */}
                  {activeItem.type !== 'PROBLEM' && (
                    <button
                      onClick={handleMarkComplete}
                      disabled={markingLoading || isCompleted(course.modules.find(m => m.items?.some(i => i.order === activeItem.order))?.moduleId, activeItem.order)}
                      className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${
                        isCompleted(course.modules.find(m => m.items?.some(i => i.order === activeItem.order))?.moduleId, activeItem.order)
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <CheckCircle2 size={12} className={isCompleted(course.modules.find(m => m.items?.some(i => i.order === activeItem.order))?.moduleId, activeItem.order) ? 'text-emerald-400' : 'text-zinc-600'} /> 
                      {markingLoading ? 'Syncing...' : (isCompleted(course.modules.find(m => m.items?.some(i => i.order === activeItem.order))?.moduleId, activeItem.order) ? 'Completed' : 'Mark as Complete')}
                    </button>
                  )}
                </div>

                <div className="content-container">
                  {activeItem.type === 'VIDEO' ? (
                    <div className="bg-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl ring-1 ring-white/5 aspect-video group relative">
                      <iframe
                        src={(activeItem.contentPayload || activeItem.content)?.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={activeItem.title}
                      />
                    </div>
                  ) : activeItem.type === 'THEORY' ? (
                    <div className="bg-zinc-900/30 rounded-3xl border border-white/5 p-8 lg:p-12 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                      <div
                        className="theory-content text-zinc-300 leading-loose font-medium text-base lg:text-lg max-w-none relative z-10 selection:bg-indigo-500/30 selection:text-indigo-200"
                        dangerouslySetInnerHTML={{ __html: activeItem.contentPayload || activeItem.content || '' }}
                      />
                    </div>
                  ) : (
                    <div className="bg-zinc-900/40 backdrop-blur-sm rounded-3xl border border-white/5 p-12 lg:p-20 text-center shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
                      <div className="relative z-10">
                        <div className="w-20 h-20 mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-8 shadow-inner shadow-emerald-500/10">
                          <Code2 size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Technical Challenge Engagement</h3>
                        <p className="text-zinc-400 text-sm max-w-md mx-auto mb-10 leading-relaxed font-medium">
                          You are about to enter a production-grade coding environment. Your solution will be analyzed against high-concurrency test clusters.
                        </p>
                        <button
                          onClick={() => handleStartChallenge(activeItem.contentPayload || activeItem.content)}
                          className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-sm font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
                        >
                          Initialize Lab Workspace
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-6 pt-20">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-700">
                  <LayoutTemplate size={32} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Awaiting Selection</p>
                  <p className="text-xs text-zinc-600 mt-1 font-medium italic">Select a module component to begin your session</p>
                </div>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
};

export default CourseViewer;
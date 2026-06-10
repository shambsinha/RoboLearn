import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  Clock, 
  History,
  AlertCircle,
  Loader2,
  Terminal,
  ChevronRight,
  MessageSquare,
  Compass,
  ArrowUpRight,
  BookOpen,
  Code2,
  User,
  Cpu,
  Database
} from 'lucide-react';
import { studentApi } from '../../api/studentApi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: d, ease: [0.16, 1, 0.3, 1] },
});

const AiTutor = () => {
  const [activeTab, setActiveTab] = useState('path'); // 'path' or 'chat'
  const [learningGoal, setLearningGoal] = useState('');
  const [loadingPath, setLoadingPath] = useState(false);
  const [currentPath, setCurrentPath] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am RoboLearn GPT. How can I help you with your coding journey today?' }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async () => {
    try {
      const paths = await studentApi.getAiPaths();
      setHistory(paths);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleGeneratePath = async (e) => {
    e.preventDefault();
    if (!learningGoal.trim()) return;

    setLoadingPath(true);
    try {
      const response = await studentApi.generateAiPath(learningGoal);
      setCurrentPath(response);
      setLearningGoal('');
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate path");
    } finally {
      setLoadingPath(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    try {
      const data = await studentApi.aiChat(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error processing your request." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const parseJsonContent = (rawJson) => {
    try {
      const cleanJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      return null;
    }
  };

  const renderPathTasks = (path) => {
    const data = parseJsonContent(path.rawJsonResponse);
    if (!data || !data.tasks) return null;

    return (
      <div className="space-y-4">
        {data.tasks.map((task, idx) => (
          <motion.div 
            key={idx} 
            {...fadeUp(idx * 0.05)}
            className="p-5 stark-card border-white/[0.04] bg-white/[0.01] group hover:bg-white/[0.03] transition-all"
          >
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-black text-xs">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-white text-base truncate">{task.title}</h4>
                  <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.05] text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                    <Clock size={10} /> {task.estimatedHours}h
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{task.description}</p>
                
                {/* Internal Suggestions */}
                {task.suggestions && task.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.03]">
                    {task.suggestions.map((s, sIdx) => (
                      <Link 
                        key={sIdx}
                        to={s.type === 'COURSE' ? `/student/courses/${s.id}` : `/student/arena/problems/${s.id}`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all group/link"
                      >
                        {s.type === 'COURSE' ? <BookOpen size={12} /> : <Code2 size={12} />}
                        <span className="text-[10px] font-black uppercase tracking-wider">{s.title}</span>
                        <ArrowUpRight size={10} className="opacity-40 group-hover/link:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      
      {/* ── TOP NAVIGATION ── */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex bg-white/[0.03] border border-white/[0.06] p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('path')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'path' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <Compass size={14} /> Path Navigator
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <MessageSquare size={14} /> RoboLearn GPT
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/[0.05] border border-indigo-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">
          <Sparkles size={12} className="animate-pulse" /> Neural Engine Online
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* ── LEFT SIDE: MAIN ENGINE ── */}
        <div className="flex-1 flex flex-col min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'path' ? (
              /* PATH NAVIGATOR TAB */
              <motion.div 
                key="path" 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="flex flex-col h-full space-y-6"
              >
                {/* Input Area */}
                <div className="stark-card p-6 bg-[#0a1424]/90 backdrop-blur-xl shrink-0">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Terminal size={16} className="text-indigo-400" /> Define Target Vectors
                  </h3>
                  <form onSubmit={handleGeneratePath} className="relative">
                    <input 
                      type="text" 
                      value={learningGoal}
                      onChange={(e) => setLearningGoal(e.target.value)}
                      placeholder="What do you want to master today? (e.g. Java Concurrency, Dynamic Programming)"
                      className="input-glass w-full py-4 pl-5 pr-20 text-sm font-medium"
                    />
                    <button 
                      type="submit" 
                      disabled={loadingPath || !learningGoal.trim()}
                      className="absolute right-2 top-2 bottom-2 px-6 btn-electric btn-electric-primary rounded-xl"
                    >
                      <span className="btn-electric-glow" />
                      {loadingPath ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={20} />}
                    </button>
                  </form>
                </div>

                {/* Path Display */}
                <div className="flex-1 stark-card border-white/[0.03] overflow-y-auto p-6 custom-scrollbar bg-black/20">
                  {loadingPath ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                        <div className="absolute inset-4 bg-indigo-500/10 rounded-lg blur-xl animate-pulse" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Synthesizing Path Nodes...</p>
                    </div>
                  ) : currentPath ? (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                         <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">{currentPath.learningGoal}</h2>
                            <p className="text-xs text-slate-500 mt-1">Personalized Curriculum Deployment</p>
                         </div>
                      </div>
                      {renderPathTasks(currentPath)}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-40">
                      <Compass size={64} className="mb-4" />
                      <p className="text-sm font-black uppercase tracking-[0.2em]">Ready for Input Transmission</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* ROBOLEARN GPT TAB */
              <motion.div 
                key="chat" 
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="flex flex-col h-full stark-card border-white/[0.03] bg-black/40 overflow-hidden"
              >
                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${msg.role === 'user' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                          {msg.role === 'user' ? <User size={16} /> : <Cpu size={16} />}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/[0.03] border border-white/[0.05] text-slate-300'}`}>
                          {msg.content.split('\n').map((line, i) => (
                            <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                          <Loader2 size={16} className="animate-spin" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Processing Stream...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-white/[0.05] bg-black/20">
                  <form onSubmit={handleChat} className="relative">
                    <textarea 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(e); } }}
                      placeholder="Ask RoboLearn GPT anything..."
                      className="input-glass w-full py-4 pl-5 pr-14 text-sm font-medium resize-none min-h-[56px] max-h-32"
                      rows="1"
                    />
                    <button 
                      type="submit" 
                      disabled={chatLoading || !chatInput.trim()}
                      className="absolute right-2 bottom-2 p-2.5 btn-electric btn-electric-primary rounded-xl"
                    >
                      <span className="btn-electric-glow" />
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT SIDE: PERSISTENT HISTORY ── */}
        <div className="w-80 shrink-0 flex flex-col h-full hidden xl:flex">
          <div className="stark-card border-white/[0.03] bg-black/20 flex flex-col h-full overflow-hidden p-5">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <History size={13} className="text-indigo-400" /> Vector Logs
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {history.map((path) => (
                <button 
                  key={path.id}
                  onClick={() => { setActiveTab('path'); setCurrentPath(path); }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all group ${currentPath?.id === path.id ? 'bg-indigo-600/10 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.1]'}`}
                >
                  <p className={`text-xs font-bold leading-tight line-clamp-2 transition-colors ${currentPath?.id === path.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {path.learningGoal}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                      {new Date(path.createdAt).toLocaleDateString()}
                    </span>
                    <ChevronRight size={10} className={`transition-transform ${currentPath?.id === path.id ? 'text-indigo-400 translate-x-1' : 'text-slate-700'}`} />
                  </div>
                </button>
              ))}
              {history.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                  <Database size={32} className="mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">No vector history detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AiTutor;

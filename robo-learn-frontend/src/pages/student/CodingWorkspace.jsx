import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play,
  Terminal,
  Loader2,
  CheckCircle2,
  XCircle,
  Send,
  Code2,
  ChevronRight,
  Database,
  Tag,
  Circle,
  AlertCircle,
  RefreshCw,
  Clock3
} from 'lucide-react';
import { arenaApi } from '../../api/arenaApi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BOILERPLATE = {
  java: `public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n        System.out.println("Hello, RoboLearn!");\n    }\n}`,
  python: `# Write your solution here\nprint("Hello, RoboLearn!")`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    cout << "Hello, RoboLearn!" << endl;\n    return 0;\n}`
};

const CodingWorkspace = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState(BOILERPLATE.java);

  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const [consoleTab, setConsoleTab] = useState('testcase'); // 'testcase' or 'result'
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);

  const stompClientRef = useRef(null);

  const fetchSubmissionHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const history = await arenaApi.getProblemSubmissions(problemId);
      setSubmissionHistory(history);
    } catch (err) {
      console.error('Failed to fetch submission history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [problemId]);

  const handleExecutionFinished = useCallback((status) => {
    setSubmissionResult(status);
    setIsExecuting(false);
    setShowConsole(true);
    setConsoleTab('result');
    setSelectedCaseIdx(0);

    // Update global user state with new XP if present
    if (status.userXp !== undefined && status.userXp !== null) {
       const currentUser = JSON.parse(localStorage.getItem('user'));
       if (currentUser) {
         const updatedUser = { ...currentUser, xp: status.userXp };
         localStorage.setItem('user', JSON.stringify(updatedUser));
         useAuthStore.setState({ user: updatedUser });
       }
    }

    // LIVE UPDATE: Find the pending entry and update it with real results
    if (status.submissionId && !status.submissionId.startsWith('RUN_')) {
      setSubmissionHistory(prev => {
        // Find the first pending entry
        const pendingIdx = prev.findIndex(s => s.status === 'PENDING' || s.submissionId.startsWith('pending-'));
        if (pendingIdx !== -1) {
          const newHistory = [...prev];
          newHistory[pendingIdx] = {
            ...newHistory[pendingIdx],
            submissionId: status.submissionId,
            status: status.status,
            executionTimeMs: status.executionTimeMs,
            passedTestCases: status.passedTestCases,
            totalTestCases: status.totalTestCases,
            runtimePercentile: status.runtimePercentile,
            memoryPercentile: status.memoryPercentile,
            memoryUsageMb: status.memoryUsageMb,
            submittedAt: status.submittedAt || new Date().toISOString()
          };
          return newHistory;
        } else {
          // Fallback: If no pending entry, just refresh the whole list
          fetchSubmissionHistory();
          return prev;
        }
      });
    }

    if (status.status === 'PASS') {
      toast.success(`Accepted: All ${status.totalTestCases} test cases passed.`);
    } else if (status.status === 'COMPILATION_ERROR') {
      toast.error('Compilation Error');
    } else if (status.status === 'SYSTEM_ERROR') {
      toast.error('System Error: Check logs');
    } else {
      toast.error(`Wrong Answer: ${status.passedTestCases}/${status.totalTestCases} passed.`);
    }
  }, [fetchSubmissionHistory]);

  const setupWebSocket = useCallback(() => {
    if (!user?.id) {
      console.warn('[PIPELINE-DEBUG] WebSocket setup skipped: User ID missing');
      return;
    }
    const token = localStorage.getItem('token');
    const socket = new SockJS('http://127.0.0.1:8080/ws-arena');
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        const destination = `/topic/submissions/${user.id}`;
        console.log('[PIPELINE-DEBUG] STOMP Connected. Subscribing to:', destination);
        setWsConnected(true);
        client.subscribe(destination, (message) => {
          console.log('[PIPELINE-DEBUG] WebSocket Message Received:', message.body);
          try {
            const result = JSON.parse(message.body);
            handleExecutionFinished(result);
          } catch (e) {
            console.error('[PIPELINE-DEBUG] Failed to parse WebSocket message:', e);
          }
        });
      },
      onDisconnect: () => {
        console.warn('[PIPELINE-DEBUG] STOMP Disconnected');
        setWsConnected(false);
      },
      onStompError: (frame) => {
        console.error('[PIPELINE-DEBUG] STOMP Error:', frame.headers['message']);
        console.error('[PIPELINE-DEBUG] STOMP Frame Body:', frame.body);
      },
      debug: (str) => console.log('STOMP: ' + str)
    });
    client.activate();
    stompClientRef.current = client;
  }, [user?.id, handleExecutionFinished]);

  const disconnectWebSocket = useCallback(() => {
    if (stompClientRef.current) stompClientRef.current.deactivate();
  }, []);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(BOILERPLATE[newLang] || '');
  };

  const handleSubmit = async (isRunOnly = false) => {
    if (!wsConnected) {
      toast.error('Connection lost. Reconnecting...');
      setupWebSocket();
      return;
    }

    if (!isRunOnly) {
      setActiveTab('submissions');
      // Add temporary pending entry
      const pendingSub = {
        submissionId: 'pending-' + Date.now(),
        status: 'PENDING',
        executionTimeMs: 0,
        passedTestCases: 0,
        totalTestCases: visibleTestCases.length,
        submittedAt: new Date().toISOString()
      };
      setSubmissionHistory(prev => [pendingSub, ...prev]);
    }

    setIsExecuting(true);
    setSubmissionResult(null);
    setShowConsole(true);
    setConsoleTab('result');
    try {
      await arenaApi.submitCode({ 
        problemId, 
        language: language.toUpperCase(), 
        code,
        runOnly: isRunOnly
      });
    } catch (error) {
      setIsExecuting(false);
      toast.error('Submission failed. Server might be down.');
      if (!isRunOnly) {
        setSubmissionHistory(prev => prev.filter(s => !s.submissionId.startsWith('pending-')));
      }
    }
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const data = await arenaApi.getProblemDetails(problemId);
        setProblem(data);
        if (data.boilerplateCode) setCode(data.boilerplateCode);
      } catch (err) {
        toast.error('Failed to load problem details');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
    setupWebSocket();
    fetchSubmissionHistory();
    return () => disconnectWebSocket();
  }, [problemId, setupWebSocket, disconnectWebSocket, fetchSubmissionHistory]);

  const visibleTestCases = useMemo(() => problem?.testCases?.filter(tc => !tc.isHidden) || [], [problem]);

  if (loading) return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-zinc-950">
      <Loader2 className="animate-spin text-indigo-500 mr-2" />
      <span className="text-zinc-500 font-medium">Preparing Workspace...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0B0F19] overflow-hidden text-zinc-300 font-sans">
      {/* Workspace Header */}
      <div className="h-10 border-b border-white/5 bg-zinc-900/50 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Link to="/student/problems" className="text-zinc-500 hover:text-zinc-300">Arena</Link>
          <ChevronRight size={12} className="text-zinc-700" />
          <span className="text-zinc-300">{problem?.title}</span>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1.5">
             <div className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
             <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
               {wsConnected ? 'Node Active' : 'Node Offline'}
             </span>
           </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Problem Details */}
        <div className="w-full lg:w-[42%] flex flex-col bg-zinc-950 border-r border-white/10 overflow-hidden">
          <div className="flex items-center border-b border-white/5 bg-zinc-900/30 shrink-0">
            {['description', 'editorial', 'submissions'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === t ? 'border-indigo-500 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl font-bold text-zinc-50 tracking-tight">{problem?.title}</h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${problem?.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : problem?.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                    {problem?.difficulty === 'EASY' ? 'Easy' : problem?.difficulty === 'MEDIUM' ? 'Medium' : 'Hard'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                   <Tag size={12} />
                   <span>{problem?.tags?.join(', ')}</span>
                </div>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">{problem?.description}</p>
              </div>
            )}
            {activeTab === 'editorial' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 text-zinc-600">
                <Code2 size={48} className="mb-4 opacity-10" />
                <p className="text-sm italic">The official solution is locked.</p>
              </div>
            )}
            {activeTab === 'submissions' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-zinc-200">Your Submissions</h3>
                  <button onClick={fetchSubmissionHistory} disabled={loadingHistory} className={`p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-300 transition-colors ${loadingHistory ? 'animate-spin' : ''}`}>
                    <RefreshCw size={14} />
                  </button>
                </div>
                
                {loadingHistory && submissionHistory.length === 0 ? (
                   <div className="py-10 flex justify-center">
                     <Loader2 size={20} className="animate-spin text-zinc-700" />
                   </div>
                ) : submissionHistory.length > 0 ? (
                  <div className="space-y-2">
                    {submissionHistory.map((sub) => (
                      <div key={sub.submissionId} className="bg-zinc-900/40 border border-white/5 rounded-lg p-3 hover:bg-zinc-900/60 transition-colors group">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            sub.status === 'PASS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            sub.status === 'COMPILATION_ERROR' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {sub.status === 'PASS' ? 'ACCEPTED' : sub.status}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
                            <Clock3 size={10} />
                            {sub.executionTimeMs ? `${sub.executionTimeMs.toFixed(0)}ms` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-zinc-500">
                            {sub.passedTestCases}/{sub.totalTestCases} Test Cases Passed
                          </div>
                          <div className="text-[9px] text-zinc-700 group-hover:text-zinc-500 transition-colors">
                             {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-zinc-600 border border-dashed border-white/10 rounded-xl">
                    <p className="text-xs italic">No submissions yet. Solve this challenge!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Code Editor & Console */}
        <div className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden">
          {/* Editor Header */}
          <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-zinc-900/50 shrink-0">
             <div className="flex items-center gap-2">
                <Code2 size={16} className="text-indigo-400" />
                <select value={language} onChange={(e) => handleLanguageChange(e.target.value)} className="bg-transparent text-xs font-bold text-zinc-100 outline-none cursor-pointer">
                  <option value="java" className="bg-zinc-900">Java 17</option>
                  <option value="python" className="bg-zinc-900">Python 3.10</option>
                  <option value="cpp" className="bg-zinc-900">C++ 17</option>
                </select>
             </div>
             <div className="flex gap-2">
                <button onClick={() => handleSubmit(true)} disabled={isExecuting} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all disabled:opacity-50">
                  {isExecuting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} className="fill-current" />} 
                  Run
                </button>
                <button onClick={() => handleSubmit(false)} disabled={isExecuting} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                  <Send size={14} /> 
                  Submit
                </button>
             </div>
          </div>

          {/* Editor View */}
          <div className="flex-1 bg-[#0d1117]">
            <Editor 
              height="100%" 
              theme="vs-dark" 
              language={language === 'cpp' ? 'cpp' : language} 
              value={code} 
              onChange={setCode} 
              options={{ 
                minimap: { enabled: false }, 
                fontSize: 14, 
                padding: { top: 20 },
                fontFamily: "'JetBrains Mono', monospace",
                scrollBeyondLastLine: false,
                automaticLayout: true
              }} 
            />
          </div>

          {/* Multi-Tab Console */}
          <div className={`border-t border-white/10 bg-[#0a0a0a] flex flex-col transition-all duration-300 ${showConsole ? 'h-80' : 'h-10'}`}>
            <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#1a1a1a] shrink-0 cursor-pointer" onClick={() => setShowConsole(!showConsole)}>
               <div className="flex h-full items-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setConsoleTab('testcase'); setShowConsole(true); }} 
                    className={`px-6 h-full text-[10px] font-bold uppercase tracking-widest border-t-2 transition-all ${consoleTab === 'testcase' ? 'border-indigo-500 text-indigo-400 bg-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Testcase
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setConsoleTab('result'); setShowConsole(true); }} 
                    className={`px-6 h-full text-[10px] font-bold uppercase tracking-widest border-t-2 transition-all ${consoleTab === 'result' ? 'border-indigo-500 text-indigo-400 bg-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Result {isExecuting && <Loader2 size={10} className="animate-spin inline ml-1" />}
                  </button>
               </div>
               <div className="flex items-center gap-4">
                 {submissionResult && !isExecuting && (
                   <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${submissionResult.status === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {submissionResult.status === 'PASS' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                     {submissionResult.status === 'PASS' ? 'Accepted' : submissionResult.status}
                   </span>
                 )}
                 <div className="text-zinc-600 hover:text-zinc-400 transition-colors">
                    {showConsole ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                 </div>
               </div>
            </div>

            {showConsole && (
              <div className="flex-1 overflow-hidden flex flex-col p-5">
                {consoleTab === 'testcase' ? (
                  <div className="flex flex-col h-full animate-in fade-in duration-300">
                    <div className="flex gap-3 mb-5 overflow-x-auto pb-2 shrink-0 custom-scrollbar">
                      {visibleTestCases.map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => setSelectedCaseIdx(i)} 
                          className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all shadow-sm ${selectedCaseIdx === i ? 'bg-zinc-800 text-zinc-100 ring-1 ring-white/10' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                        >
                          Case {i + 1}
                        </button>
                      ))}
                    </div>
                    {visibleTestCases[selectedCaseIdx] && (
                      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        <div>
                          <div className="text-[10px] font-bold text-zinc-600 uppercase mb-2 tracking-widest">Input</div>
                          <pre className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 font-mono text-[13px] text-zinc-300 whitespace-pre-wrap">{visibleTestCases[selectedCaseIdx].input}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
                    {isExecuting ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-zinc-500 font-mono italic">
                        <div className="relative">
                          <Loader2 size={32} className="animate-spin text-indigo-500" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Code2 size={14} className="text-indigo-400" />
                          </div>
                        </div>
                        <span className="text-xs font-bold tracking-widest uppercase opacity-50">Executing Sandbox...</span>
                      </div>
                    ) : submissionResult ? (
                      <div className="flex flex-col h-full">
                        {/* Performance Metrics Header */}
                        {submissionResult.status === 'PASS' && (
                          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top duration-500">
                             <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                   <div className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest mb-1">Runtime</div>
                                   <div className="flex items-baseline gap-1">
                                      <span className="text-xl font-bold text-emerald-400">{submissionResult.executionTimeMs?.toFixed(0) || 0}</span>
                                      <span className="text-xs font-medium text-emerald-500/70">ms</span>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <div className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest mb-1">Beats</div>
                                   <div className="text-lg font-black text-emerald-400">{submissionResult.runtimePercentile?.toFixed(2) || '99.00'}%</div>
                                </div>
                             </div>
                             <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                   <div className="text-[10px] font-bold text-indigo-500/50 uppercase tracking-widest mb-1">Memory</div>
                                   <div className="flex items-baseline gap-1">
                                      <span className="text-xl font-bold text-indigo-400">{submissionResult.memoryUsageMb?.toFixed(2) || 0}</span>
                                      <span className="text-xs font-medium text-indigo-500/70">MB</span>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <div className="text-[10px] font-bold text-indigo-500/50 uppercase tracking-widest mb-1">Beats</div>
                                   <div className="text-lg font-black text-indigo-400">{submissionResult.memoryPercentile?.toFixed(2) || '99.00'}%</div>
                                </div>
                             </div>
                          </div>
                        )}

                        <div className="flex gap-3 mb-5 overflow-x-auto pb-2 shrink-0 custom-scrollbar">
                          {submissionResult.testCaseResults?.filter(r => !r.isHidden).map((r, i) => (
                            <button 
                              key={r.id || i} 
                              onClick={() => setSelectedCaseIdx(i)} 
                              className={`px-4 py-2 rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all shadow-sm ${selectedCaseIdx === i ? 'bg-zinc-800 text-zinc-100 ring-1 ring-white/10' : 'text-zinc-500 hover:bg-white/5'}`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${r.status === 'PASS' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              Case {i + 1}
                            </button>
                          ))}
                        </div>
                        {submissionResult.testCaseResults?.[selectedCaseIdx] && (
                          <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar font-mono">
                            <div>
                              <div className="text-[10px] font-bold text-zinc-600 uppercase mb-2 tracking-widest">Input</div>
                              <pre className="bg-zinc-900/30 p-4 rounded-xl border border-white/5 text-zinc-300 text-[13px] whitespace-pre-wrap">
                                {visibleTestCases[selectedCaseIdx]?.input || 'N/A'}
                              </pre>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                <div className="text-[10px] font-bold text-emerald-500/60 uppercase mb-2 tracking-widest">Expected Output</div>
                                <pre className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 text-emerald-400/90 text-[13px] whitespace-pre-wrap">
                                  {visibleTestCases[selectedCaseIdx]?.expectedOutput || 'N/A'}
                                </pre>
                              </div>
                              <div>
                                <div className={`text-[10px] font-bold uppercase mb-2 tracking-widest ${submissionResult.testCaseResults[selectedCaseIdx].status === 'PASS' ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>Your Output</div>
                                <pre className={`p-4 rounded-xl border text-[13px] whitespace-pre-wrap ${submissionResult.testCaseResults[selectedCaseIdx].status === 'PASS' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/90' : 'bg-rose-500/5 border-rose-500/10 text-rose-400/90'}`}>
                                  {submissionResult.testCaseResults[selectedCaseIdx].status === 'ERROR' 
                                    ? <span className="text-rose-400/70 italic">Execution Error: Check Details Below</span>
                                    : (submissionResult.testCaseResults[selectedCaseIdx].actualOutput || <span className="italic opacity-30">no output</span>)
                                  }
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}
                        {submissionResult.logs && (
                          <div className="mt-5 p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-rose-400 uppercase mb-3 tracking-widest">
                               <AlertCircle size={14} />
                               Runtime / Error Details
                            </div>
                            <pre className="text-xs text-rose-300/70 whitespace-pre-wrap font-mono leading-relaxed">{submissionResult.logs}</pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 italic">
                        <Terminal size={40} className="mb-3 opacity-5" />
                        <p className="text-sm tracking-wide">Run your code to initialize execution engine.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChevronUp = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
);

const ChevronDown = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

export default CodingWorkspace;
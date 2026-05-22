import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Clock, 
  History,
  AlertCircle,
  Loader2,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { studentApi } from '../../api/studentApi';

const AiTutor = () => {
  const [learningGoal, setLearningGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const paths = await studentApi.getAiPaths();
      setHistory(paths);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!learningGoal.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await studentApi.generateAiPath(learningGoal);
      setCurrentPath(response);
      setLearningGoal('');
      fetchHistory();
    } catch (err) {
      setError('Failed to generate learning sequence. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const parseJsonContent = (rawJson) => {
    try {
      const cleanJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error('JSON parsing failed:', e);
      return null;
    }
  };

  const renderPathTasks = (path) => {
    const tasks = parseJsonContent(path.rawJsonResponse);
    
    if (!tasks || !Array.isArray(tasks)) {
      return (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="font-medium text-sm">Error: Unable to parse sequence logic.</span>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div key={index} className="flex gap-4 p-5 bg-gray-950 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded bg-gray-800 text-indigo-400 font-bold text-sm border border-gray-700">
              {index + 1}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-bold text-gray-200 text-base">{task.title || task.topic}</h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs font-medium border border-gray-700">
                  <Clock size={12} />
                  {task.estimatedHours || task.duration}h
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{task.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)] text-gray-300 font-sans">
      {/* Main Content */}
      <div className="lg:col-span-3 flex flex-col h-full space-y-6">
        {/* Input Section */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
            <Terminal className="text-indigo-400" size={20} />
            Define Target Knowledge
          </h2>
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              placeholder="e.g., Learn to build scalable Node.js microservices"
              className="w-full pl-4 pr-16 py-3 bg-gray-950 border border-gray-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm text-gray-200 placeholder-gray-600"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !learningGoal.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 btn-electric btn-electric-primary rounded-md font-medium disabled:opacity-50 transition-colors flex items-center"
            >
              <span className="btn-electric-glow" />
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </button>
          </form>
          {error && <p className="mt-2 text-sm font-medium text-rose-400">{error}</p>}
        </div>

        {/* Results Section */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
              <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Compiling Curriculum...</p>
            </div>
          ) : currentPath ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <h3 className="text-lg font-bold text-gray-100">Generated Sequence</h3>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-xs font-semibold">
                  Verified
                </span>
              </div>
              <div className="bg-indigo-500/5 border border-indigo-500/10 py-3 px-4 rounded-lg text-sm text-indigo-300 font-medium">
                Goal: {currentPath.learningGoal}
              </div>
              {renderPathTasks(currentPath)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3 opacity-60">
              <Sparkles size={40} className="mb-2" />
              <h3 className="text-lg font-bold text-gray-400">Sequence Buffer Empty</h3>
              <p className="text-sm">Input a target above to generate a learning path.</p>
            </div>
          )}
        </div>
      </div>

      {/* History Sidebar */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col h-full overflow-hidden hidden lg:flex">
        <h3 className="font-bold text-gray-200 text-sm mb-4 flex items-center gap-2 px-2">
          <History size={16} className="text-gray-400" />
          Previous Sequences
        </h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {history.length > 0 ? (
            history.map((path) => (
              <button
                key={path.id}
                onClick={() => setCurrentPath(path)}
                className={`w-full text-left p-3 rounded-lg border transition-colors flex flex-col gap-1.5 ${
                  currentPath?.id === path.id
                    ? 'border-indigo-500/50 bg-indigo-500/10'
                    : 'border-gray-800 hover:border-gray-700 bg-gray-950/50'
                }`}
              >
                <div className={`font-semibold text-sm line-clamp-2 ${currentPath?.id === path.id ? 'text-indigo-300' : 'text-gray-300'}`}>
                   {path.learningGoal}
                </div>
                <div className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                  <Clock size={10} /> {new Date(path.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-10 text-gray-600">
               <p className="text-xs font-medium">No history found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiTutor;
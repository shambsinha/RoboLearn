import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Settings, 
  Code2, 
  TestTube2, 
  Cpu, 
  Plus, 
  Trash2, 
  Save, 
  ChevronRight,
  Info,
  Layers,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProblemBuilder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('metadata');
  
  // Tab 1: Metadata
  const [metadata, setMetadata] = useState({
    title: '',
    slug: '',
    difficulty: 'EASY',
    tags: [],
    statement: '',
  });
  const [tagInput, setTagInput] = useState('');

  // Tab 2: Code Architecture
  const [architecture, setArchitecture] = useState({
    language: 'java',
    userBoilerplate: '// Write your solution here\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}',
    hiddenDriver: '// Hidden driver code to execute user solution\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        // ... driver logic\n    }\n}',
    referenceSolution: '// Reference solution for validation\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // ... optimized implementation\n        return new int[]{0, 1};\n    }\n}'
  });

  // Tab 3: Test Cases
  const [testCases, setTestCases] = useState([
    { id: Date.now(), input: '', expectedOutput: '', isHidden: false }
  ]);

  // Tab 4: Constraints
  const [constraints, setConstraints] = useState({
    timeLimit: 2,
    memoryLimit: 256
  });

  const tabs = [
    { id: 'metadata', label: 'Problem Metadata', icon: Settings },
    { id: 'architecture', label: 'Code Architecture', icon: Code2 },
    { id: 'testcases', label: 'Test Case Management', icon: TestTube2 },
    { id: 'constraints', label: 'Execution Constraints', icon: Cpu },
  ];

  // Helper: Add Tag
  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!metadata.tags.includes(tagInput.trim())) {
        setMetadata({ ...metadata, tags: [...metadata.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setMetadata({ ...metadata, tags: metadata.tags.filter(t => t !== tagToRemove) });
  };

  // Helper: Test Cases
  const addTestCase = () => {
    setTestCases([...testCases, { id: Date.now(), input: '', expectedOutput: '', isHidden: false }]);
  };

  const removeTestCase = (id) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter(tc => tc.id !== id));
    }
  };

  const updateTestCase = (id, field, value) => {
    setTestCases(testCases.map(tc => tc.id === id ? { ...tc, [field]: value } : tc));
  };

  const handleSave = () => {
    const payload = {
      ...metadata,
      ...architecture,
      testCases,
      ...constraints,
      updatedAt: new Date().toISOString()
    };
    
    console.log('Final Problem Payload:', payload);
    toast.success('Problem configuration compiled! Check console for JSON.');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/problems')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all border border-slate-700/50"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Problem Builder</h1>
            <p className="text-slate-500 text-sm mt-1">Design sophisticated coding challenges with hidden drivers.</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="btn-primary group"
        >
          <Save size={18} />
          <span>Save Problem</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/50 border border-slate-700/50 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-indigo-500 text-white shadow-glow-indigo' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === 'metadata' && (
            <motion.div
              key="metadata"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title & Slug */}
                <div className="glass-card p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2 text-indigo-400">
                    <Info size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Basic Info</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">Problem Title</label>
                    <input 
                      type="text" 
                      className="input-glass"
                      placeholder="e.g. Robust Two Sum"
                      value={metadata.title}
                      onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">URL Slug</label>
                    <input 
                      type="text" 
                      className="input-glass"
                      placeholder="robust-two-sum"
                      value={metadata.slug}
                      onChange={(e) => setMetadata({ ...metadata, slug: e.target.value })}
                    />
                  </div>
                </div>

                {/* Difficulty & Tags */}
                <div className="glass-card p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2 text-cyan-400">
                    <Layers size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Classification</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">Difficulty</label>
                    <select 
                      className="input-glass appearance-none"
                      value={metadata.difficulty}
                      onChange={(e) => setMetadata({ ...metadata, difficulty: e.target.value })}
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">Tags</label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 min-h-[32px]">
                        {metadata.tags.map(tag => (
                          <span key={tag} className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-md text-[11px] font-medium">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="hover:text-white"><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                      <input 
                        type="text" 
                        className="input-glass"
                        placeholder="Add tag and press Enter..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={addTag}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Problem Statement */}
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Problem Statement & Constraints</span>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                  </div>
                </div>
                <div className="quill-dark-wrapper">
                  <ReactQuill 
                    theme="snow"
                    value={metadata.statement}
                    onChange={(val) => setMetadata({ ...metadata, statement: val })}
                    placeholder="Write detailed problem description, examples, and constraints using Markdown/Rich Text..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'architecture' && (
            <motion.div
              key="architecture"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between bg-slate-900/50 p-4 border border-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Code2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Language Context</p>
                    <p className="text-xs text-slate-500">Select the primary language for this challenge template.</p>
                  </div>
                </div>
                <select 
                  className="bg-slate-950 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  value={architecture.language}
                  onChange={(e) => setArchitecture({ ...architecture, language: e.target.value })}
                >
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Boilerplate */}
                <div className="glass-card flex flex-col h-[500px]">
                  <div className="p-3 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">User Boilerplate</span>
                    <span className="text-[10px] text-slate-500">Visible to students</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <Editor
                      height="100%"
                      defaultLanguage={architecture.language}
                      theme="vs-dark"
                      value={architecture.userBoilerplate}
                      onChange={(val) => setArchitecture({ ...architecture, userBoilerplate: val })}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        padding: { top: 16 },
                        backgroundColor: '#0A0E16'
                      }}
                    />
                  </div>
                </div>

                {/* Hidden Driver */}
                <div className="glass-card flex flex-col h-[500px]">
                  <div className="p-3 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Hidden Driver Code</span>
                    <span className="text-[10px] text-slate-500">Wraps user submission</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <Editor
                      height="100%"
                      defaultLanguage={architecture.language}
                      theme="vs-dark"
                      value={architecture.hiddenDriver}
                      onChange={(val) => setArchitecture({ ...architecture, hiddenDriver: val })}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        padding: { top: 16 }
                      }}
                    />
                  </div>
                </div>

                {/* Reference Solution */}
                <div className="glass-card lg:col-span-2 flex flex-col h-[400px]">
                  <div className="p-3 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Reference Solution</span>
                    <span className="text-[10px] text-slate-500">For testing infrastructure</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <Editor
                      height="100%"
                      defaultLanguage={architecture.language}
                      theme="vs-dark"
                      value={architecture.referenceSolution}
                      onChange={(val) => setArchitecture({ ...architecture, referenceSolution: val })}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        padding: { top: 16 }
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'testcases' && (
            <motion.div
              key="testcases"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Test Case Validation</h3>
                <button 
                  onClick={addTestCase}
                  className="btn-ghost py-2"
                >
                  <Plus size={16} />
                  <span>Add Test Case</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testCases.map((tc, index) => (
                  <div key={tc.id} className="stark-card p-5 space-y-4 group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-slate-300">Test Case #{index + 1}</span>
                      </div>
                      <button 
                        onClick={() => removeTestCase(tc.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Input</label>
                        <textarea 
                          className="input-glass font-mono text-xs h-20 resize-none"
                          placeholder="Raw input data..."
                          value={tc.input}
                          onChange={(e) => updateTestCase(tc.id, 'input', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Expected Output</label>
                        <textarea 
                          className="input-glass font-mono text-xs h-20 resize-none border-emerald-500/20"
                          placeholder="Expected output data..."
                          value={tc.expectedOutput}
                          onChange={(e) => updateTestCase(tc.id, 'expectedOutput', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          tc.isHidden ? 'bg-indigo-500 border-indigo-400' : 'bg-slate-900 border-slate-700'
                        }`}>
                          <input 
                            type="checkbox" 
                            className="hidden"
                            checked={tc.isHidden}
                            onChange={(e) => updateTestCase(tc.id, 'isHidden', e.target.checked)}
                          />
                          {tc.isHidden && <CheckCircle2 size={10} className="text-white" />}
                        </div>
                        <span className="text-xs text-slate-400">Hidden System Test Case</span>
                      </label>
                      {index < 2 && (
                        <span className="text-[10px] text-indigo-400/60 font-medium">Public Example</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'constraints' && (
            <motion.div
              key="constraints"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass-card p-8 space-y-8">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-4">
                    <Cpu size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Execution Constraints</h3>
                  <p className="text-sm text-slate-500">Define the sandbox boundaries for this challenge.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-slate-300">Time Limit</label>
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{constraints.timeLimit} Seconds</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="10" 
                      step="0.5"
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      value={constraints.timeLimit}
                      onChange={(e) => setConstraints({ ...constraints, timeLimit: parseFloat(e.target.value) })}
                    />
                    <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                      <span>0.5s</span>
                      <span>5s</span>
                      <span>10s</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-slate-300">Memory Limit</label>
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">{constraints.memoryLimit} MB</span>
                    </div>
                    <input 
                      type="range" 
                      min="64" 
                      max="1024" 
                      step="64"
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      value={constraints.memoryLimit}
                      onChange={(e) => setConstraints({ ...constraints, memoryLimit: parseInt(e.target.value) })}
                    />
                    <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                      <span>64MB</span>
                      <span>512MB</span>
                      <span>1024MB</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3">
                  <Info className="text-amber-400 shrink-0" size={18} />
                  <p className="text-xs text-amber-200/60 leading-relaxed">
                    Higher limits may impact system stability during heavy load. Reference solution should execute within 50% of these limits.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProblemBuilder;

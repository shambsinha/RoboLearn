import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { 
  Plus, 
  Code2, 
  Trash2, 
  Edit3, 
  X, 
  Search,
  Filter,
  Loader,
  Rocket
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProblemBank = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProblemId, setCurrentProblemId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    courseId: '',
    tags: '',
    boilerplateCode: '',
    driverCode: ''
  });

  const [testCases, setTestCases] = useState([
    { input: '', expectedOutput: '', isHidden: false }
  ]);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const data = await adminApi.getProblems();
      setProblems(data);
    } catch (err) {
      console.error('Failed to fetch problems', err);
      toast.error('Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (problem = null) => {
    if (problem) {
      setEditMode(true);
      setCurrentProblemId(problem.id);
      setFormData({
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        courseId: problem.courseId || '',
        tags: problem.tags ? problem.tags.join(', ') : '',
        boilerplateCode: problem.boilerplateCode || '',
        driverCode: problem.driverCode || ''
      });
      setTestCases(problem.testCases && problem.testCases.length > 0 
        ? problem.testCases 
        : [{ input: '', expectedOutput: '', isHidden: false }]
      );
    } else {
      setEditMode(false);
      setCurrentProblemId(null);
      setFormData({ title: '', description: '', difficulty: 'EASY', courseId: '', tags: '', boilerplateCode: '', driverCode: '' });
      setTestCases([{ input: '', expectedOutput: '', isHidden: false }]);
    }
    setShowForm(true);
  };

  const addTestCaseRow = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: false }]);
  };

  const removeTestCaseRow = (index) => {
    if (testCases.length > 1) {
      const updated = testCases.filter((_, i) => i !== index);
      setTestCases(updated);
    }
  };

  const updateTestCase = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const payload = {
        ...formData,
        courseId: formData.courseId ? parseInt(formData.courseId) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };

      let problemId = currentProblemId;
      if (editMode) {
        await adminApi.updateProblem(currentProblemId, payload);
        toast.success('Problem updated successfully!');
      } else {
        const newProblem = await adminApi.createProblem(payload);
        problemId = newProblem.id;
        toast.success('Problem created successfully!');
      }
      
      // Save test cases
      for (const tc of testCases) {
        if (tc.input && tc.expectedOutput) {
           await adminApi.addTestCase(problemId, tc);
        }
      }

      setShowForm(false);
      fetchProblems();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save problem or test cases');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await adminApi.deleteProblem(id);
        fetchProblems();
        toast.success('Problem deleted successfully!');
      } catch (err) {
        toast.error('Failed to delete problem');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-300">
      {/* Page Header - Enterprise */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">Problem Bank</h2>
          <p className="text-slate-500 text-sm mt-1">Create and manage algorithmic challenges with test cases.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('builder')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 px-4 py-2 rounded-lg text-sm font-medium transition-all group"
          >
            <Rocket size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>Launch Advanced Builder</span>
          </button>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]"
          >
            <Plus size={16} />
            <span>New Challenge</span>
          </button>
        </div>
      </div>

      {/* Enterprise Table Container */}
      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search challenges..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder-slate-600"
              />
           </div>
           <button className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-300 hover:border-slate-600/50 transition-all w-full sm:w-auto">
              <Filter size={14} />
              <span>Filter</span>
           </button>
        </div>

        <table className="min-w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Challenge</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Difficulty</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tags</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Test Cases</th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-sm">Loading challenges...</td></tr>
            ) : problems.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center">
                <Code2 className="mx-auto text-slate-600 mb-3" size={28} />
                <p className="text-slate-300 text-sm font-medium">No challenges found</p>
                <p className="text-xs text-slate-500 mt-1">Create your first challenge to get started.</p>
              </td></tr>
            ) : (
              problems.map((problem) => (
                <tr key={problem.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-400 shrink-0">
                        <Code2 size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">{problem.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                           {problem.courseId ? `Course #${problem.courseId}` : 'Global Challenge'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                      problem.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      problem.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {problem.tags && problem.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 bg-slate-900/50 border border-slate-700/50 text-slate-400 rounded text-[10px] font-medium">{tag}</span>
                      ))}
                      {problem.tags && problem.tags.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-500">+{problem.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-400">{problem.testCases ? problem.testCases.length : 0} cases</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handleOpenForm(problem)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-all"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(problem.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Slide-out - Enterprise */}
      {showForm && (
        <div className="fixed inset-0 z-[100] overflow-hidden flex justify-end">
          <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="h-full w-full max-w-2xl bg-slate-900 border-l border-slate-700/50 shadow-2xl flex flex-col relative z-10">
            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/50">
              <h3 className="text-base font-semibold text-slate-100">{editMode ? 'Edit Challenge' : 'New Challenge'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Challenge Title</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/50 rounded-lg focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none text-sm text-slate-200 placeholder-slate-600 transition-all"
                    placeholder="e.g. Two Sum Problem"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Difficulty</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/50 rounded-lg focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none text-sm text-slate-200 transition-all"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Course (Optional)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/50 rounded-lg focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none text-sm text-slate-200 placeholder-slate-600 transition-all"
                    placeholder="Course ID"
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/50 rounded-lg focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none text-sm text-slate-200 placeholder-slate-600 transition-all"
                  placeholder="e.g. Arrays, Hash Table, Two Pointers"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Problem Description</label>
                <textarea
                  required
                  rows="4"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/50 rounded-lg focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none text-sm text-slate-300 resize-none placeholder-slate-600 transition-all"
                  placeholder="Describe the problem, constraints, and examples..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                 <label className="block text-xs font-medium text-slate-400 mb-1.5">Boilerplate Code</label>
                 <textarea
                    rows="5"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/50 rounded-lg focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none font-mono text-sm text-indigo-300 resize-none placeholder-slate-700 transition-all"
                    placeholder="function solution(nums, target) {&#10;  // Write your code here&#10;}"
                    value={formData.boilerplateCode}
                    onChange={(e) => setFormData({ ...formData, boilerplateCode: e.target.value })}
                 />
              </div>

              <div>
                 <label className="block text-xs font-medium text-slate-400 mb-1.5">Hidden Driver Code</label>
                 <textarea
                    rows="5"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/50 rounded-lg focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none font-mono text-sm text-rose-300 resize-none placeholder-slate-700 transition-all"
                    placeholder="// Driver code to execute user solution..."
                    value={formData.driverCode}
                    onChange={(e) => setFormData({ ...formData, driverCode: e.target.value })}
                 />
              </div>

              <div className="pt-2 border-t border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-200">Test Cases</h4>
                  <button 
                    type="button" 
                    onClick={addTestCaseRow}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    + Add Test Case
                  </button>
                </div>
                
                <div className="space-y-3">
                  {testCases.map((tc, index) => (
                    <div key={index} className="bg-slate-950 p-3 rounded-lg border border-slate-700/50 relative">
                       <button 
                          type="button" 
                          onClick={() => removeTestCaseRow(index)}
                          className="absolute -right-1.5 -top-1.5 p-1 bg-slate-800 text-rose-400 hover:text-rose-300 rounded border border-slate-700/50 transition-all"
                       >
                          <X size={12} />
                       </button>
                       <div className="grid grid-cols-2 gap-3">
                          <div>
                             <label className="block text-[10px] font-medium text-slate-500 mb-1">Input</label>
                             <textarea
                                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700/50 rounded-md focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none font-mono text-xs text-slate-300 resize-none transition-all"
                                rows="2"
                                placeholder="[2, 7, 11, 15]"
                                value={tc.input}
                                onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                             />
                          </div>
                          <div>
                             <label className="block text-[10px] font-medium text-slate-500 mb-1">Expected Output</label>
                             <textarea
                                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700/50 rounded-md focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none font-mono text-xs text-slate-300 resize-none transition-all"
                                rows="2"
                                placeholder="[0, 1]"
                                value={tc.expectedOutput}
                                onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                             />
                          </div>
                       </div>
                       <label className="flex items-center gap-2 mt-2 cursor-pointer">
                          <input 
                             type="checkbox" 
                             className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500/50"
                             checked={tc.isHidden}
                             onChange={(e) => updateTestCase(index, 'isHidden', e.target.checked)}
                          />
                          <span className="text-xs font-medium text-slate-400">Hidden test case</span>
                       </label>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/50 flex gap-3">
               <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600/50 rounded-lg text-sm font-medium text-slate-300 transition-all">Cancel</button>
               <button onClick={handleSubmit} disabled={submitLoading} className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] disabled:opacity-50">
                  {submitLoading ? <Loader size={16} className="animate-spin mx-auto" /> : (editMode ? 'Save Changes' : 'Create Challenge')}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemBank;
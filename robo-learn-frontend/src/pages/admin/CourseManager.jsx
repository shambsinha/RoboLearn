import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Book, 
  Trash2, 
  Edit3, 
  X, 
  Search,
  Settings,
  Loader,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    level: '',
    category: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await adminApi.getCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses', err);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditMode(true);
      setCurrentCourseId(course.courseId);
      setFormData({
        title: course.title,
        description: course.description,
        level: course.level || course.difficulty || '',
        category: course.category || '',
        imageUrl: course.imageUrl || ''
      });
    } else {
      setEditMode(false);
      setCurrentCourseId(null);
      setFormData({ title: '', description: '', level: '', category: '', imageUrl: '' });
    }
    setShowModal(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (editMode) {
        await adminApi.updateCourse(currentCourseId, formData);
        toast.success('Course updated successfully!');
      } else {
        await adminApi.createCourse(formData);
        toast.success('Course created successfully!');
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      toast.error(editMode ? 'Failed to update course' : 'Failed to create course');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course? This will also delete all associated modules.')) {
      try {
        await adminApi.deleteCourse(id);
        fetchCourses();
        toast.success('Course deleted successfully!');
      } catch (err) {
        toast.error('Failed to delete course');
      }
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 font-sans text-slate-300 relative"
    >
      {/* Page Header - Enterprise */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-50">
            Course Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Create, edit, and manage your educational content catalog.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]"
        >
          <Plus size={16} />
          <span>New Course</span>
        </motion.button>
      </div>

      {/* Enterprise Table Container */}
      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
        {/* Table Controls - Enterprise */}
        <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search courses..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder-slate-500"
              />
           </div>
           <div className="flex items-center gap-2 w-full sm:w-auto">
             <button className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-300 hover:border-slate-600/50 transition-all">
               <Filter size={14} />
               <span>Filter</span>
             </button>
             <button className="p-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-slate-300 hover:border-slate-600/50 transition-all">
               <MoreHorizontal size={16} />
             </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-5 h-5 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                      <p className="text-sm text-slate-500">Loading courses...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <Book className="mx-auto text-slate-600 mb-3" size={28} />
                    <p className="text-slate-300 text-sm font-medium">No courses found</p>
                    <p className="text-xs text-slate-500 mt-1">Create a new course to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.courseId} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-400 shrink-0 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                          <Book size={16} />
                        </div>
                        <div className="min-w-0">
                          <Link 
                            to={`/admin/courses/${course.courseId}`}
                            className="text-sm font-medium text-slate-200 truncate hover:text-indigo-400 transition-colors cursor-pointer"
                          >
                            {course.title}
                          </Link>
                          <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px] sm:max-w-xs">{course.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {course.category && (
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-900/50 border border-slate-700/50 px-2.5 py-1 rounded-md uppercase tracking-wide">
                          {course.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/admin/courses/${course.courseId}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-all"
                          title="Manage Content"
                        >
                          <Settings size={16} />
                        </Link>
                        <button 
                          onClick={() => handleOpenModal(course)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-all"
                          title="Edit Course"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(course.courseId)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all"
                          title="Delete Course"
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
        
        {/* Table Footer - Enterprise */}
        <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-md transition-all border border-slate-700/50 disabled:opacity-50" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-md transition-all border border-slate-700/50 disabled:opacity-50" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Enterprise */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0B0F19]/90 backdrop-blur-sm" 
              onClick={() => setShowModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-slate-900 border border-slate-700/50 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/50">
                <h3 className="text-base font-semibold text-slate-100">
                  {editMode ? 'Edit Course' : 'New Course'}
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Course Title</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/50 rounded-lg focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none text-sm text-slate-200 placeholder-slate-600 transition-all"
                    placeholder="e.g. Advanced React Patterns"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Category (Optional)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/50 rounded-lg focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none text-sm text-slate-200 placeholder-slate-600 transition-all"
                      placeholder="e.g. Programming"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Difficulty Level (Optional)</label>
                    <select
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/50 rounded-lg focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none text-sm text-slate-200 appearance-none transition-all"
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    >
                      <option className="bg-slate-900" value="">None / Multiple</option>
                      <option className="bg-slate-900" value="EASY">Easy</option>
                      <option className="bg-slate-900" value="MEDIUM">Medium</option>
                      <option className="bg-slate-900" value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                  <textarea
                    required
                    rows="3"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/50 rounded-lg focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none text-sm text-slate-300 resize-none placeholder-slate-600 transition-all"
                    placeholder="Describe the course content and learning outcomes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Course Image URL</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/50 rounded-lg focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none text-sm text-slate-200 placeholder-slate-600 transition-all"
                    placeholder="https://example.com/image.png"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                  {formData.imageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-slate-700/50 h-32 bg-slate-950">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL'}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-3">
                   <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:border-slate-600/50 transition-all"
                   >
                      Cancel
                   </button>
                   <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitLoading}
                      className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] disabled:opacity-50"
                   >
                      {submitLoading ? <Loader size={16} className="animate-spin mx-auto" /> : (editMode ? 'Save Changes' : 'Create Course')}
                   </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CourseManager;
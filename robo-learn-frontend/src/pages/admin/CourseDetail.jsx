import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { adminApi } from '../../api/adminApi';
import {
  BookOpen,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layers,
  Video,
  Code2,
  FileText,
  AlertCircle,
  Loader,
  GripVertical,
  X,
  Search,
  ExternalLink,
  Pencil,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableProblems, setAvailableProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI State
  const [expandedModules, setExpandedModules] = useState({});
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Add Content Forms State
  const [activeAddForm, setActiveAddForm] = useState(null); // { moduleId, type: 'VIDEO' | 'PROBLEM' | 'THEORY' }
  const [videoForm, setVideoForm] = useState({ title: '', url: '' });
  const [theoryForm, setTheoryForm] = useState({ title: '', content: '' });

  // Edit Content State
  const [editingItem, setEditingItem] = useState(null); // { moduleId, index, title, content, type }

  // ReactQuill rich editor ref + config
  const quillRef = useRef(null);

  // Image resize overlay ref
  const resizeOverlayRef = useRef(null);

  // Cleanup resize overlay
  const clearResizeOverlay = useCallback(() => {
    if (resizeOverlayRef.current) {
      resizeOverlayRef.current.remove();
      resizeOverlayRef.current = null;
    }
  }, []);

  // Create resize handles around an image (overlay on document.body with fixed pos)
  const showResizeHandles = useCallback((img) => {
    clearResizeOverlay();

    const overlay = document.createElement('div');
    overlay.className = 'img-resize-overlay';
    resizeOverlayRef.current = overlay;

    // Size label
    const sizeLabel = document.createElement('div');
    sizeLabel.className = 'img-resize-size-label';
    sizeLabel.textContent = `${Math.round(img.offsetWidth)} × ${Math.round(img.offsetHeight)}`;
    overlay.appendChild(sizeLabel);

    // Position overlay using fixed positioning from bounding rect
    const positionOverlay = () => {
      const rect = img.getBoundingClientRect();
      overlay.style.left = rect.left + 'px';
      overlay.style.top = rect.top + 'px';
      overlay.style.width = rect.width + 'px';
      overlay.style.height = rect.height + 'px';
    };

    // Corners + edges
    const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
    handles.forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `img-resize-handle img-resize-handle-${pos}`;

      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startW = img.offsetWidth;
        const startH = img.offsetHeight;

        const onMove = (ev) => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          let newW = startW;
          let newH = startH;

          if (pos.includes('e')) newW = Math.max(30, startW + dx);
          if (pos.includes('w')) newW = Math.max(30, startW - dx);
          if (pos.includes('s')) newH = Math.max(30, startH + dy);
          if (pos.includes('n')) newH = Math.max(30, startH - dy);

          img.style.width = newW + 'px';
          img.style.height = newH + 'px';
          img.setAttribute('width', Math.round(newW));
          img.setAttribute('height', Math.round(newH));

          // Update overlay position & size
          positionOverlay();
          sizeLabel.textContent = `${Math.round(newW)} × ${Math.round(newH)}`;
        };

        const onUp = () => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      overlay.appendChild(handle);
    });

    positionOverlay();
    document.body.appendChild(overlay);
  }, [clearResizeOverlay]);

  // Detect image clicks in Quill editors
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.tagName === 'IMG' && e.target.closest('.ql-editor')) {
        showResizeHandles(e.target);
      } else if (!e.target.closest('.img-resize-handle') && !e.target.closest('.img-resize-overlay')) {
        clearResizeOverlay();
      }
    };
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      clearResizeOverlay();
    };
  }, [showResizeHandles, clearResizeOverlay]);

  const handleQuillImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        toast.loading('Uploading image…', { id: 'img-upload' });
        const data = await adminApi.uploadContentImage(file);
        toast.success('Image uploaded', { id: 'img-upload' });
        const editor = quillRef.current?.getEditor();
        if (editor) {
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, 'image', data.url);
          editor.setSelection(range.index + 1);
        }
      } catch (err) {
        console.error('Image upload failed:', err);
        toast.error('Image upload failed', { id: 'img-upload' });
      }
    };
  }, []);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: {
        image: handleQuillImageUpload,
      },
    },
    clipboard: { matchVisual: false },
  }), [handleQuillImageUpload]);

  const quillFormats = useMemo(() => [
    'font', 'size', 'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video',
    'width', 'height', 'style',
  ], []);

  useEffect(() => {
    fetchCourseDetails();
    fetchAvailableProblems();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const data = await adminApi.getCourseDetails(courseId);
      if (data.modules) {
        // Sort modules by serialOrder
        data.modules = data.modules.sort((a, b) => (a.serialOrder || 0) - (b.serialOrder || 0));
        // Normalize items using the new 'items' and 'order' fields
        data.modules = data.modules.map(m => ({ 
          ...m, 
          items: (m.items || []).sort((a, b) => (a.order || 0) - (b.order || 0))
        }));
      }
      setCourse(data);
      // Auto-expand first module if available
      if (data.modules?.length > 0 && Object.keys(expandedModules).length === 0) {
        setExpandedModules({ [data.modules[0].moduleId]: true });
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
      navigate('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProblems = async () => {
    try {
      const data = await adminApi.getProblems();
      setAvailableProblems(data);
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const nextOrder = (course.modules?.length || 0) + 1;
      await adminApi.addModule(courseId, { title: moduleTitle, serialOrder: nextOrder });
      setModuleTitle('');
      setShowModuleForm(false);
      fetchCourseDetails();
      toast.success('Module added');
    } catch (error) {
      toast.error('Failed to add module');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module and all its content?')) return;
    try {
      await adminApi.deleteModule(moduleId);
      toast.success('Module deleted');
      fetchCourseDetails();
    } catch (error) {
      toast.error('Failed to delete module');
    }
  };

  const syncModuleItems = async (moduleId, items) => {
    try {
      const requests = items.map((item, idx) => ({
        order: idx + 1,
        type: item.type,
        contentPayload: item.contentPayload,
        title: item.title
      }));
      await adminApi.updateModuleItems(moduleId, requests);
      toast.success('Saved successfully');
    } catch (error) {
      toast.error('Failed to sync changes');
    }
  };

  const handleAddVideo = async (moduleId) => {
    if (!videoForm.title || !videoForm.url) return toast.error('Title and URL required');
    
    const module = course.modules.find(m => m.moduleId === moduleId);
    const newItems = [...module.items];
    newItems.push({
      order: newItems.length + 1,
      type: 'VIDEO',
      contentPayload: videoForm.url,
      title: videoForm.title
    });

    const updatedCourse = { ...course };
    updatedCourse.modules = updatedCourse.modules.map(m => m.moduleId === moduleId ? { ...m, items: newItems } : m);
    setCourse(updatedCourse);
    
    setVideoForm({ title: '', url: '' });
    setActiveAddForm(null);
    await syncModuleItems(moduleId, newItems);
  };

  const handleAddTheory = async (moduleId) => {
    if (!theoryForm.title || !theoryForm.content) return toast.error('Title and Content required');
    
    const module = course.modules.find(m => m.moduleId === moduleId);
    const newItems = [...module.items];
    newItems.push({
      order: newItems.length + 1,
      type: 'THEORY',
      contentPayload: theoryForm.content,
      title: theoryForm.title
    });

    const updatedCourse = { ...course };
    updatedCourse.modules = updatedCourse.modules.map(m => m.moduleId === moduleId ? { ...m, items: newItems } : m);
    setCourse(updatedCourse);
    
    setTheoryForm({ title: '', content: '' });
    setActiveAddForm(null);
    await syncModuleItems(moduleId, newItems);
  };

  const handleAddProblem = async (moduleId, problem) => {
    const module = course.modules.find(m => m.moduleId === moduleId);
    const newItems = [...module.items];
    newItems.push({
      order: newItems.length + 1,
      type: 'PROBLEM',
      contentPayload: problem.id.toString(),
      title: problem.title
    });

    const updatedCourse = { ...course };
    updatedCourse.modules = updatedCourse.modules.map(m => m.moduleId === moduleId ? { ...m, items: newItems } : m);
    setCourse(updatedCourse);
    
    setActiveAddForm(null);
    
    try {
      await adminApi.addProblemToCourse(courseId, problem.id);
    } catch(e) { /* ignore if already exists */ }
    
    await syncModuleItems(moduleId, newItems);
  };

  const handleRemoveItem = async (moduleId, indexToRemove) => {
    const module = course.modules.find(m => m.moduleId === moduleId);
    let newItems = [...module.items];
    newItems.splice(indexToRemove, 1);
    
    // Re-sequence
    newItems = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));

    const updatedCourse = { ...course };
    updatedCourse.modules = updatedCourse.modules.map(m => m.moduleId === moduleId ? { ...m, items: newItems } : m);
    setCourse(updatedCourse);
    setEditingItem(null);
    
    await syncModuleItems(moduleId, newItems);
  };

  const filteredProblems = availableProblems.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3"></div>
        <p className="text-sm font-medium">Loading curriculum builder...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 text-zinc-400">
        <AlertCircle size={48} className="mx-auto mb-4" />
        <h2 className="text-xl font-bold text-zinc-200 mb-2">Course Not Found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-zinc-300 max-w-5xl mx-auto pb-20">
      {/* Course Header */}
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-8 shadow-sm backdrop-blur-sm bg-opacity-50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-2xl font-bold text-zinc-100">{course.title}</h1>
               <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                 {course.level || 'Professional'}
               </span>
            </div>
            <p className="text-sm text-zinc-400">Curriculum Architecture • {course.modules?.length || 0} Modules</p>
          </div>
          <div className="flex gap-2">
            {course.tags?.map((tag, i) => (
              <span key={i} className="px-2 py-1 text-[10px] bg-zinc-800 border border-zinc-700 rounded text-zinc-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
          {course.description}
        </p>
      </div>

      {/* Curriculum Builder */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Curriculum Builder</h2>
              <p className="text-xs text-zinc-500">Manage modules and curriculum items</p>
            </div>
          </div>
          <button
            onClick={() => setShowModuleForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/10"
          >
            <Plus size={16} />
            New Module
          </button>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {course.modules && course.modules.length > 0 ? (
            course.modules.map((module, mIndex) => (
              <div key={module.moduleId} className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-sm">
                {/* Module Header */}
                <div 
                  className={`w-full flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors ${expandedModules[module.moduleId] ? 'bg-white/5 border-b border-white/5' : ''}`}
                  onClick={() => toggleModule(module.moduleId)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-xs border border-white/5">
                      {mIndex + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">{module.title}</h3>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-tighter font-semibold">
                        {module.items?.length || 0} Content Items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleDeleteModule(module.moduleId)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className={`p-1 text-zinc-500 transition-transform duration-200 ${expandedModules[module.moduleId] ? 'rotate-180' : ''}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* Module Content */}
                <AnimatePresence>
                  {expandedModules[module.moduleId] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden bg-zinc-950/20"
                    >
                      <div className="p-4 space-y-4">
                        {/* Items */}
                        <div className="space-y-2">
                          {module.items && module.items.length > 0 ? (
                            module.items.map((item, idx) => {
                              const isEditing = editingItem?.moduleId === module.moduleId && editingItem?.index === idx;
                              return (
                                <div key={idx}>
                                  {/* Item row */}
                                  <div className={`flex items-center justify-between p-3 bg-zinc-900 border rounded-lg group transition-colors ${isEditing ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 hover:border-white/10'}`}>
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      <GripVertical className="text-zinc-700 cursor-grab shrink-0" size={14} />
                                      {item.type === 'VIDEO' ? (
                                        <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                                          <Video size={14} />
                                        </div>
                                      ) : item.type === 'THEORY' ? (
                                        <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                          <FileText size={14} />
                                        </div>
                                      ) : (
                                        <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                          <Code2 size={14} />
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <span className="text-sm font-medium text-zinc-200 truncate block">{item.title}</span>
                                        {item.type === 'VIDEO' && (
                                          <span className="text-[10px] text-zinc-500 truncate max-w-[150px] block">
                                            {item.contentPayload}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                      {item.type !== 'PROBLEM' && (
                                        <button
                                          onClick={() => {
                                            if (isEditing) {
                                              setEditingItem(null);
                                            } else {
                                              setEditingItem({
                                                moduleId: module.moduleId,
                                                index: idx,
                                                title: item.title,
                                                content: item.contentPayload || '',
                                                type: item.type,
                                              });
                                            }
                                          }}
                                          className={`p-1.5 rounded-md transition-all ${isEditing ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 opacity-0 group-hover:opacity-100'}`}
                                        >
                                          <Pencil size={14} />
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => handleRemoveItem(module.moduleId, idx)}
                                        className="p-1.5 text-zinc-600 hover:text-rose-400 rounded-md hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Inline Edit Form */}
                                  <AnimatePresence>
                                    {isEditing && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="mt-2 p-4 bg-zinc-900 border border-indigo-500/20 rounded-xl space-y-3">
                                          <input
                                            type="text"
                                            value={editingItem.title}
                                            onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                            className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 outline-none transition-colors"
                                            placeholder="Title"
                                          />
                                          {editingItem.type === 'VIDEO' ? (
                                            <input
                                              type="url"
                                              value={editingItem.content}
                                              onChange={e => setEditingItem({ ...editingItem, content: e.target.value })}
                                              className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 outline-none transition-colors"
                                              placeholder="YouTube URL"
                                            />
                                          ) : editingItem.type === 'THEORY' ? (
                                            <div className="quill-dark-wrapper rounded-lg overflow-hidden border border-white/10">
                                              <ReactQuill
                                                ref={quillRef}
                                                theme="snow"
                                                value={editingItem.content}
                                                onChange={(val) => setEditingItem({ ...editingItem, content: val })}
                                                modules={quillModules}
                                                formats={quillFormats}
                                                placeholder="Edit theory content…"
                                                style={{ minHeight: '250px' }}
                                              />
                                            </div>
                                          ) : null}
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => setEditingItem(null)}
                                              className="flex-1 py-2 text-sm font-bold text-zinc-400 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={async () => {
                                                if (!editingItem.title) return toast.error('Title is required');
                                                const mod = course.modules.find(m => m.moduleId === editingItem.moduleId);
                                                const updatedItems = mod.items.map((it, i) => 
                                                  i === editingItem.index
                                                    ? { ...it, title: editingItem.title, contentPayload: editingItem.content }
                                                    : it
                                                );
                                                const updatedCourse = { ...course };
                                                updatedCourse.modules = updatedCourse.modules.map(m =>
                                                  m.moduleId === editingItem.moduleId ? { ...m, items: updatedItems } : m
                                                );
                                                setCourse(updatedCourse);
                                                setEditingItem(null);
                                                await syncModuleItems(editingItem.moduleId, updatedItems);
                                              }}
                                              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                                            >
                                              <Check size={14} /> Save Changes
                                            </button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-zinc-500 border border-dashed border-white/10 rounded-xl bg-zinc-900/50">
                              <BookOpen size={24} className="mb-2 opacity-20" />
                              <p className="text-xs font-medium italic">This module is currently empty</p>
                            </div>
                          )}
                        </div>

                        {/* Add Content Control */}
                        <div className="pt-2">
                          <AnimatePresence mode="wait">
                            {activeAddForm?.moduleId === module.moduleId ? (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                className="bg-zinc-900 border border-indigo-500/20 rounded-xl p-5 shadow-xl"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    {activeAddForm.type === 'VIDEO' ? <Video size={16} className="text-indigo-400" /> : activeAddForm.type === 'THEORY' ? <FileText size={16} className="text-amber-400" /> : <Code2 size={16} className="text-emerald-400" />}
                                    <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                                      Add {activeAddForm.type}
                                    </h4>
                                  </div>
                                  <button onClick={() => setActiveAddForm(null)} className="text-zinc-500 hover:text-white transition-colors">
                                    <X size={16} />
                                  </button>
                                </div>
                                
                                {activeAddForm.type === 'VIDEO' ? (
                                  <div className="space-y-3">
                                    <input 
                                      type="text" 
                                      placeholder="Lesson Title (e.g. Setting up the Environment)" 
                                      className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 outline-none transition-colors"
                                      value={videoForm.title}
                                      onChange={e => setVideoForm({...videoForm, title: e.target.value})}
                                    />
                                    <input 
                                      type="url" 
                                      placeholder="YouTube URL (https://youtube.com/watch?v=...)" 
                                      className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 outline-none transition-colors"
                                      value={videoForm.url}
                                      onChange={e => setVideoForm({...videoForm, url: e.target.value})}
                                    />
                                    <button 
                                      onClick={() => handleAddVideo(module.moduleId)}
                                      className="w-full bg-zinc-100 text-zinc-950 py-2 rounded-lg text-sm font-bold hover:bg-white transition-colors"
                                    >
                                      Add Video Lesson
                                    </button>
                                  </div>
                                ) : activeAddForm.type === 'THEORY' ? (
                                  <div className="space-y-3">
                                    <input 
                                      type="text" 
                                      placeholder="Chapter Title" 
                                      className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 outline-none transition-colors"
                                      value={theoryForm.title}
                                      onChange={e => setTheoryForm({...theoryForm, title: e.target.value})}
                                    />
                                    <div className="quill-dark-wrapper rounded-lg overflow-hidden border border-white/10">
                                      <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={theoryForm.content}
                                        onChange={(val) => setTheoryForm({...theoryForm, content: val})}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        placeholder="Write your theory content here… Use the toolbar for formatting, images, code blocks, and more."
                                        style={{ minHeight: '300px' }}
                                      />
                                    </div>
                                    <button 
                                      onClick={() => handleAddTheory(module.moduleId)}
                                      className="w-full bg-zinc-100 text-zinc-950 py-2 rounded-lg text-sm font-bold hover:bg-white transition-colors"
                                    >
                                      Add Theory Content
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <div className="relative">
                                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                      <input 
                                        type="text" 
                                        placeholder="Search problem bank..." 
                                        className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 outline-none transition-colors"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                      {filteredProblems.length > 0 ? filteredProblems.map(p => (
                                        <button 
                                          key={p.id}
                                          onClick={() => handleAddProblem(module.moduleId, p)}
                                          className="flex items-center justify-between p-3 bg-zinc-950 border border-white/5 rounded-lg hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-left"
                                        >
                                          <div>
                                            <span className="text-xs font-bold text-zinc-300 block">{p.title}</span>
                                            <span className="text-[10px] text-zinc-500 uppercase font-medium">{p.difficulty} • ID: {p.id}</span>
                                          </div>
                                          <Plus size={14} className="text-zinc-600" />
                                        </button>
                                      )) : (
                                        <p className="text-center py-4 text-xs text-zinc-500">No problems found</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            ) : (
                              <div className="flex gap-3">
                                <button 
                                  onClick={() => setActiveAddForm({ moduleId: module.moduleId, type: 'VIDEO' })}
                                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-white/10 transition-all"
                                >
                                  <Video size={14} className="text-indigo-400" /> + Video
                                </button>
                                <button 
                                  onClick={() => setActiveAddForm({ moduleId: module.moduleId, type: 'THEORY' })}
                                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-white/10 transition-all"
                                >
                                  <FileText size={14} className="text-amber-400" /> + Theory
                                </button>
                                <button 
                                  onClick={() => setActiveAddForm({ moduleId: module.moduleId, type: 'PROBLEM' })}
                                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-white/10 transition-all"
                                >
                                  <Code2 size={14} className="text-emerald-400" /> + Problem
                                </button>
                              </div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-zinc-900/50 border border-dashed border-white/10 rounded-2xl">
              <Layers size={40} className="mx-auto mb-4 text-zinc-700 opacity-50" />
              <h3 className="text-zinc-300 font-bold mb-1">No Modules Yet</h3>
              <p className="text-zinc-500 text-sm mb-6">Start building your curriculum by adding the first module</p>
              <button
                onClick={() => setShowModuleForm(true)}
                className="inline-flex items-center gap-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-500/20 transition-all"
              >
                <Plus size={16} /> Create Module
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Module Modal */}
      <AnimatePresence>
        {showModuleForm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModuleForm(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">Add New Module</h3>
                  <p className="text-xs text-zinc-500">Define a logical section of your course</p>
                </div>
                <button onClick={() => setShowModuleForm(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                   <X size={20} className="text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleAddModule} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Module Title</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-zinc-100 transition-all"
                    placeholder="e.g. Master the Fundamentals"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModuleForm(false)}
                    className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                  >
                    {submitLoading ? <Loader size={18} className="animate-spin mx-auto" /> : 'Create Module'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CourseDetail;
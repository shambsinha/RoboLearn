import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Search, Filter, Clock, Play, Plus, ArrowRight
} from 'lucide-react';
import { studentApi } from '../../api/studentApi';
import toast from 'react-hot-toast';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        const [allCourses, enrolledCourses] = await Promise.all([
          studentApi.getAvailableCourses().catch(() => []),
          studentApi.getEnrolledCourses().catch(() => [])
        ]);
        setCourses(allCourses || []);
        const enrolledIds = new Set((enrolledCourses || []).map(c => c.courseId));
        setEnrolledCourseIds(enrolledIds);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesData();
  }, []);

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      await studentApi.enrollInCourse(courseId);
      setEnrolledCourseIds(prev => new Set([...prev, courseId]));
      toast.success('Successfully enrolled!');
    } catch (err) {
      toast.error('Failed to enroll in course');
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans text-gray-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <BookOpen className="text-indigo-400" size={24} />
            Course Catalog
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Browse and enroll in available learning modules.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none w-full md:w-72 text-sm text-gray-200 placeholder-gray-500"
            />
          </div>
          <button className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-gray-900 rounded-xl h-64 border border-gray-800 animate-pulse"></div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div 
              key={course.courseId}
              {...fadeUp}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass-card flex flex-col overflow-hidden group relative"
            >
              {/* Course Image & Preview Hover */}
              <div className="relative h-48 overflow-hidden bg-void">
                <img 
                  src={course.imageUrl || `https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80`} 
                  alt={course.title}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E16] via-transparent to-transparent" />
                
                {/* Play Preview Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:scale-110 hover:bg-white/20 transition-all shadow-lg">
                    <Play size={20} className="text-white fill-current ml-1" />
                  </button>
                </div>
                {course.category && (
                  <div className="absolute top-4 left-4">
                    <span className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-lg">
                      {course.category}
                    </span>
                  </div>
                )}
                
                {/* Conditional Arrow for Enrolled Users */}
                {enrolledCourseIds.has(course.courseId) && (
                  <Link 
                    to={`/student/courses/${course.courseId}`}
                    className="absolute bottom-4 right-4 p-2 bg-indigo-500 text-white rounded-full shadow-xl hover:bg-indigo-400 transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 z-10"
                    title="View Course Details"
                  >
                    <ArrowRight size={18} />
                  </Link>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] text-gray-500 flex items-center gap-1 font-bold uppercase tracking-widest">
                    <Clock size={12} className="text-indigo-400" />
                    {course.estimatedHours || '12 HOURS'}
                  </div>
                  {course.difficulty && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border transition-all ${
                      course.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      course.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {course.difficulty === 'EASY' ? 'Easy' : course.difficulty === 'MEDIUM' ? 'Medium' : 'Hard'}
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-100 mb-2 leading-tight group-hover:text-indigo-400 transition-colors">
                  {course.title}
                </h3>
                
                <p className="text-sm text-gray-400 line-clamp-2 mb-6 flex-1 italic">
                  {course.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                    <div className="pl-3 text-[10px] text-gray-500 font-bold self-center">
                      +840 enrolled
                    </div>
                  </div>
                  
                  {enrolledCourseIds.has(course.courseId) ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Enrolled
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.courseId)}
                      disabled={enrollingId === course.courseId}
                      className="btn-primary py-2 px-5 text-[10px] uppercase tracking-widest disabled:opacity-50"
                    >
                      {enrollingId === course.courseId ? 'Processing...' : 'Enroll Now'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 p-12 rounded-xl text-center">
          <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-200 mb-1">No courses found</h3>
          <p className="text-sm text-gray-500">Adjust your search parameters to find more content.</p>
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
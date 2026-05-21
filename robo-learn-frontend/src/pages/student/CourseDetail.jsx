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
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
        <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
        <Link to="/student/courses" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
          Back to Course Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link to="/student/courses" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 mb-6">
        <ChevronLeft size={20} />
        Back to Course Catalog
      </Link>

      {/* Course Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="h-64 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
          <div className="absolute inset-0 opacity-20 flex items-center justify-center">
            <BookOpen size={120} className="text-white transform -rotate-12" />
          </div>
          <div className="absolute bottom-6 left-6">
            {course.difficulty && (
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-sm font-bold rounded-full border border-white/30">
                {course.difficulty === 'EASY' ? 'Easy' : course.difficulty === 'MEDIUM' ? 'Medium' : 'Hard'}
              </span>
            )}
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-lg text-gray-600">by {course.instructorName}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-yellow-500 gap-1">
                <Star size={20} fill="currentColor" />
                <span className="text-lg font-bold text-gray-700">4.8</span>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Users size={16} />
                {course.enrolledCount || 0} enrolled
              </div>
            </div>
          </div>

          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            {course.description}
          </p>

          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={18} />
              <span className="font-medium">{course.estimatedHours || 12} hours</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Award size={18} />
              <span className="font-medium">Certificate included</span>
            </div>
          </div>

          <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Play size={20} />
            Start Course
          </button>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* What You'll Learn */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(course.learningObjectives || [
                'Master fundamental concepts',
                'Build real-world projects',
                'Learn best practices',
                'Get hands-on experience'
              ]).map((objective, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{objective}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Modules */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Content</h2>
            <div className="space-y-3">
              {(course.modules || [
                { title: 'Introduction and Setup', duration: '2h', lessons: 5 },
                { title: 'Core Concepts', duration: '4h', lessons: 8 },
                { title: 'Advanced Topics', duration: '3h', lessons: 6 },
                { title: 'Final Project', duration: '3h', lessons: 4 }
              ]).map((module, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{module.title}</h3>
                      <p className="text-sm text-gray-600">{module.lessons} lessons</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 font-medium">{module.duration}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Stats */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Course Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold">{course.estimatedHours || 12}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty</span>
                <span className={`font-semibold ${
                  course.difficulty === 'EASY' ? 'text-green-600' :
                  course.difficulty === 'MEDIUM' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {course.difficulty === 'EASY' ? 'Easy' : course.difficulty === 'MEDIUM' ? 'Medium' : 'Hard'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rating</span>
                <span className="font-semibold">4.8/5.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Students</span>
                <span className="font-semibold">{course.enrolledCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Prerequisites</h3>
            <div className="space-y-2">
              {(course.prerequisites || ['Basic computer knowledge']).map((prereq, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm text-gray-700">{prereq}</span>
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

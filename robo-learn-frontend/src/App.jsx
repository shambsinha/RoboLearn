import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';

/*  ╔══════════════════════════════════════════════════════════════════╗
 *  ║  LAZY-LOAD STRATEGY                                            ║
 *  ║  • NeuralBackground (R3F canvas) loaded AFTER first DOM paint  ║
 *  ║  • All page components lazy-loaded as before                   ║
 *  ║  • The 3D canvas is wrapped in its own Suspense boundary so    ║
 *  ║    it never blocks the route-level Suspense                    ║
 *  ╚══════════════════════════════════════════════════════════════════╝ */

// ── Lazy: 3D canvas (deferred — never blocks first paint) ────────────────────
const Background3D = lazy(() => import('./components/three/Background3D'));

// ── Lazy: Page components ────────────────────────────────────────────────────
const LoginPage        = lazy(() => import('./pages/LoginPage'));
const RegisterPage     = lazy(() => import('./pages/RegisterPage'));
const LandingPage      = lazy(() => import('./pages/public/LandingPage'));
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'));
const CourseManager    = lazy(() => import('./pages/admin/CourseManager'));
const ProblemBank      = lazy(() => import('./pages/admin/ProblemBank'));
const ProblemBuilder   = lazy(() => import('./pages/admin/ProblemBuilder'));
const StudentList      = lazy(() => import('./pages/admin/StudentList'));
const CourseDetail     = lazy(() => import('./pages/admin/CourseDetail'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const AiTutor          = lazy(() => import('./pages/student/AiTutor'));
const CourseCatalog    = lazy(() => import('./pages/student/CourseCatalog'));
const ArenaCatalog     = lazy(() => import('./pages/student/ArenaCatalog'));
const CodingWorkspace  = lazy(() => import('./pages/student/CodingWorkspace'));
const CourseViewer     = lazy(() => import('./pages/student/CourseViewer'));
const UserProfile      = lazy(() => import('./pages/student/UserProfile'));
const Achievements     = lazy(() => import('./pages/student/Achievements'));
const Leaderboard      = lazy(() => import('./pages/student/Leaderboard'));

// ── Route-level loading state ────────────────────────────────────────────────
const RouteLoading = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-5">
    <div className="relative w-11 h-11">
      <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
      <div className="absolute inset-0 rounded-full border border-transparent border-t-cyan-500 animate-spin" />
      <div className="absolute inset-[4px] rounded-full border border-transparent border-t-indigo-400 animate-spin [animation-duration:1.4s] [animation-direction:reverse]" />
    </div>
    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
      Initialising Environment
    </p>
  </div>
);

// ── Toast theme ──────────────────────────────────────────────────────────────
const TOAST_OPTS = {
  duration: 4000,
  style: {
    background: 'rgba(10,14,22,0.94)',
    backdropFilter: 'blur(20px)',
    color: '#e2e8f0',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.625rem',
    boxShadow: '0 8px 32px -8px rgba(0,0,0,0.7)',
    fontSize: '0.8125rem',
    fontWeight: 500,
  },
  success: { iconTheme: { primary: '#06b6d4', secondary: '#0A0E16' } },
  error:   { iconTheme: { primary: '#f43f5e', secondary: '#0A0E16' } },
};

// ═════════════════════════════════════════════════════════════════════════════
//  ROOT
// ═════════════════════════════════════════════════════════════════════════════
function App() {
  return (
    <div className="relative min-h-screen bg-[#061220] text-slate-300 antialiased selection:bg-indigo-500/20">

      {/* ── 3D canvas — own Suspense, never blocks page routes ── */}
      <Suspense fallback={null}>
        <Background3D />
      </Suspense>

      {/* Ambient lighting now handled by Canvas neural environment */}

      // ── Application shell (z-10 above canvas) ──
            <div className="relative z-10">
              <Router>
                <Suspense fallback={<RouteLoading />}>
                  <Routes>
              {/* Public */}
              <Route path="/"         element={<LandingPage />} />
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Student */}
              <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                <Route path="/student" element={<StudentLayout />}>
                  <Route index                     element={<StudentDashboard />} />
                  <Route path="courses"            element={<CourseCatalog />} />
                  <Route path="courses/:courseId"   element={<CourseViewer />} />
                  <Route path="problems"           element={<ArenaCatalog />} />
                  <Route path="problems/:problemId" element={<CodingWorkspace />} />
                  <Route path="contests"           element={<PlaceholderPage title="Contests"     desc="Weekly coding challenges and tournaments." />} />
                  <Route path="achievements"       element={<Achievements />} />
                  <Route path="leaderboard"        element={<Leaderboard />} />
                  <Route path="profile"            element={<UserProfile />} />
                  <Route path="ai-tutor"           element={<AiTutor />} />
                </Route>
              </Route>

              {/* Admin */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index                    element={<Navigate to="overview" replace />} />
                  <Route path="overview"          element={<AdminDashboard />} />
                  <Route path="courses"           element={<CourseManager />} />
                  <Route path="courses/:courseId"  element={<CourseDetail />} />
                  <Route path="problems"          element={<ProblemBank />} />
                  <Route path="problems/builder"  element={<ProblemBuilder />} />
                  <Route path="users"             element={<StudentList />} />
                  <Route path="settings"          element={<PlaceholderPage title="System Settings" desc="Configure global platform parameters." />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </div>
    </div>
  );
}

// ── Placeholder for stub routes ──────────────────────────────────────────────
function PlaceholderPage({ title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
      <div className="stark-card p-10 max-w-md">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-500 text-sm">{desc}</p>
      </div>
    </div>
  );
}

export default App;
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ExamPage } from './pages/ExamPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicLayout } from './components/layouts/PublicLayout';
import { useAuthStore } from './store/auth.store';

// Admin imports
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import CreateExam from './pages/admin/CreateExam';
import ExamDetails from './pages/admin/ExamDetails';
import ProtectedAdminRoute from './components/auth/ProtectedAdminRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AccessRestricted() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Access Restricted
        </h1>
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Please open this exam in Safe Exam Browser.
          </p>
          <p className="text-gray-600 text-center">
            If you are using SEB, please ensure that the URL is correct.
          </p>
          <p className="text-gray-600 text-center">
            If you are not using SEB, please download and install it from the official website.
          </p>
          <div className="text-center pt-4">
            <a
              href="https://safeexambrowser.org/"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download SEB
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isLoading } = useAuthStore();
  const [isSEB, setIsSEB] = useState(true);

  // useEffect(() => {
  //   const userAgent = navigator.userAgent;
  //   if (userAgent.includes("SEB/")) {
  //     setIsSEB(true);
  //   } else {
  //     setIsSEB(false);
  //   }
  // }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  // Allow admin routes without SEB
  if (isAdminRoute) {
    return (
      <Routes>
        {/* Admin Public Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Protected Routes */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/exams/create" element={<CreateExam />} />
          <Route path="/admin/exams/:examId" element={<ExamDetails />} />
        </Route>

        {/* Redirect admin root to dashboard */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    );
  }

  // Student routes require SEB
  return isSEB ? (
    <Routes>
      {/* Student Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/exam/:examId" element={<ExamPage />} />
      </Route>

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Catch all other routes and redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  ) : (
    <Routes>
      <Route path="*" element={<AccessRestricted />} />
    </Routes>
  );
}

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';

// Lazy loading page chunks for optimal web application bundle splits and fast first-contentful-paint
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Leads = lazy(() => import('../pages/Leads'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const NotFound = lazy(() => import('../pages/NotFound'));

/**
 * ProtectedRoute Component
 * Restricts access to authenticated sessions. If the token is missing,
 * redirects the user to the login screen.
 */
function ProtectedRoute() {
  const { token, isLoading } = useAuth();

  // Show a standard loading screen while the session token is being verified
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-bg-canvas text-text-main">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-sm text-text-sub font-medium">Verifying credentials...</span>
      </div>
    );
  }

  // Redirect to login if token is missing
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/**
 * AppRoutes Component
 * Houses layout configuration and paths mappings.
 */
export default function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-bg-canvas text-text-main">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-text-sub font-medium">Resolving components...</span>
        </div>
      }
    >
      <Routes>
        {/* Protected Area: User must be signed in to see Layout & inner workspace pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            {/* Default route displaying the Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Lead management page */}
            <Route path="leads" element={<Leads />} />

            {/* Dynamic analytics dashboards */}
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Route>

        {/* Public Area: Register and Login views are full-screen forms */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Fallback wildcard handler displaying custom 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

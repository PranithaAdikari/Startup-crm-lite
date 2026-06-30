import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/common/Layout';

// Lazy loading page chunks for optimal web application bundle splits and fast first-contentful-paint
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Leads = lazy(() => import('../pages/Leads'));
const Analytics = lazy(() => import('../pages/Analytics'));
const NotFound = lazy(() => import('../pages/NotFound'));

/**
 * AppRoutes Component
 * Houses layout configuration and paths mappings.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Wrapper Layout wrapper applying sidebar context and core design canvas */}
      <Route path="/" element={<Layout />}>
        {/* Default route displaying the Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Lead management page */}
        <Route path="leads" element={<Leads />} />

        {/* Dynamic analytics dashboards */}
        <Route path="analytics" element={<Analytics />} />

        {/* Fallback wildcard handler displaying custom 404 page */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

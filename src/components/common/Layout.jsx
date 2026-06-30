import { Suspense, useState, useCallback } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Users, BarChart3, TrendingUp } from 'lucide-react';
import Sidebar from './Sidebar';
import DarkModeToggle from './DarkModeToggle';

const NAVIGATION_ITEMS = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Leads', to: '/leads', icon: Users },
  { name: 'Analytics', to: '/analytics', icon: BarChart3 },
];

/**
 * Layout Component
 * Structure representing the application frame. Houses the Sidebar and routes container
 * wrapped with a Suspense boundary for lazy chunk resolution.
 */
export default function Layout() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleCloseDrawer = useCallback(() => setIsMobileDrawerOpen(false), []);
  const handleOpenDrawer = useCallback(() => setIsMobileDrawerOpen(true), []);

  return (
    <div className="flex min-h-screen bg-bg-canvas text-text-main font-sans">
      {/* Persistent Left Sidebar Navigation for Tablet+ */}
      <Sidebar />

      {/* Slide-out Drawer Navigation Overlay for Mobile */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          {/* Backdrop mask */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={handleCloseDrawer}
          />
          {/* Drawer container */}
          <div className="relative w-64 max-w-xs bg-bg-card flex flex-col h-full z-10 shadow-2xl animate-scale-in">
            {/* Close button inside drawer */}
            <div className="absolute top-2 right-2 z-20">
              <button
                type="button"
                onClick={handleCloseDrawer}
                aria-label="Close menu"
                className="w-11 h-11 flex items-center justify-center hover:bg-bg-canvas text-text-sub hover:text-text-main rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Sidebar content customized for mobile drawer */}
            <Sidebar isMobileDrawer={true} onClose={handleCloseDrawer} />
          </div>
        </div>
      )}

      {/* Main viewport area */}
      <main className="flex-1 min-h-screen overflow-y-auto pb-24 md:pb-8">
        {/* Mobile Top Header */}
        <header className="flex md:hidden h-16 border-b border-border-accent bg-bg-card/45 backdrop-blur-sm sticky top-0 z-30 items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenDrawer}
              aria-label="Open menu"
              className="w-11 h-11 flex items-center justify-center hover:bg-bg-canvas text-text-sub hover:text-text-main rounded-xl border border-transparent transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-primary/10 rounded-md text-primary shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-text-main tracking-tight">CRM Lite</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <div className="text-[10px] text-text-sub font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse block" />
              <span className="text-success font-bold">Online</span>
            </div>
          </div>
        </header>

        {/* Tablet/Desktop Top Header */}
        <header className="hidden md:flex h-16 border-b border-border-accent bg-bg-card/40 dark:bg-bg-card/60 backdrop-blur-sm sticky top-0 z-10 items-center px-8 justify-end gap-6">
          <DarkModeToggle />
          <div className="text-xs text-text-sub font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse block" />
            Status: <span className="text-success font-bold">Online</span>
          </div>
        </header>

        {/* Dynamic page container */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Suspense boundary for handling lazy route chunk fallback loaders */}
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                {/* Visual loading spinner */}
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-sm text-text-sub font-medium">Resolving components...</span>
              </div>
            }
          >
            {/* Renders matching child route components */}
            <Outlet />
          </Suspense>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-card border-t border-border-accent flex items-center justify-around z-40 pb-safe shadow-lg">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                  isActive ? 'text-primary bg-primary/5' : 'text-text-sub hover:text-text-main'
                }`
              }
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-xl">
                <Icon className="w-5.5 h-5.5" />
              </div>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

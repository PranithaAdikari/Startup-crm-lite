import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAVIGATION_ITEMS = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard, subLabel: 'Overview & Metrics' },
  { name: 'Leads', to: '/leads', icon: Users, subLabel: 'Manage Pipeline' },
  { name: 'Analytics', to: '/analytics', icon: BarChart3, subLabel: 'Insights & Reports' },
];

/**
 * Sidebar Component
 * Left-side navigation bar with responsive layout features and active route state styling.
 * Supports a persistent responsive layout (tablet/desktop) and a mobile drawer layout.
 */
export default function Sidebar({ isMobileDrawer = false, onClose }) {
  const { user, logout } = useAuth();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  // Determine user initials for the avatar badge
  const userInitial = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'F';

  // Determine outer class depending on whether it's persistent or rendered inside drawer
  const asideClass = isMobileDrawer
    ? 'w-full bg-bg-card flex flex-col h-full pt-14' // mobile drawer
    : 'hidden md:flex flex-col h-screen sticky top-0 bg-bg-card border-r border-border-accent transition-all duration-300 md:w-20 lg:w-64';

  return (
    <aside className={asideClass}>
      {/* Brand Identity / Header logo section (Hidden on Tablet persistent sidebar) */}
      <div className={`h-16 flex items-center border-b border-border-accent gap-2.5 transition-all duration-300 px-6 ${
        isMobileDrawer ? 'px-6 justify-start' : 'md:justify-center lg:justify-start lg:px-6'
      }`}>
        <div className="p-1.5 bg-primary/10 rounded-lg text-primary shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <span className={`font-bold text-lg text-text-main tracking-tight transition-opacity duration-300 ${
          isMobileDrawer ? 'block' : 'md:hidden lg:block'
        }`}>
          CRM Lite
        </span>
      </div>

      {/* Navigation links loop */}
      <nav className={`flex-1 py-6 space-y-2 transition-all duration-300 ${
        isMobileDrawer ? 'px-4' : 'px-2 lg:px-4'
      }`}>
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={handleLinkClick}
              className={({ isActive }) => {
                const baseStyles = 'flex items-center transition-all duration-200 cursor-pointer select-none';
                const activeStyles = isActive
                  ? 'bg-primary/10 text-primary border-l-4 border-primary dark:bg-primary/15 dark:shadow-md md:border-l-0 md:bg-primary/10 lg:border-l-4'
                  : 'text-text-sub hover:text-text-main hover:bg-bg-canvas/50 dark:hover:bg-gray-800/50 border-l-4 border-transparent md:border-l-0 lg:border-l-4';

                if (isMobileDrawer) {
                  return `${baseStyles} ${activeStyles} gap-3 px-4 py-3.5 text-sm font-semibold rounded-xl`;
                }

                // Tablet (md) narrow vertical layout vs Desktop (lg) wide layout
                return `${baseStyles} ${activeStyles} flex-col justify-center text-center p-2.5 text-[10px] md:flex-col md:justify-center md:items-center md:p-2 lg:flex-row lg:justify-start lg:text-left lg:gap-3 lg:px-4 lg:py-3 lg:text-sm font-semibold rounded-xl`;
              }}
            >
              <Icon className={`shrink-0 transition-transform duration-200 ${
                isMobileDrawer ? 'w-5 h-5' : 'w-5.5 h-5.5 md:w-5 md:h-5 lg:w-4.5 lg:h-4.5'
              }`} />
              <div className={`flex flex-col min-w-0 ${
                isMobileDrawer ? 'items-start text-left' : 'md:items-center lg:items-start lg:text-left'
              }`}>
                <span className="font-semibold block truncate leading-tight">{item.name}</span>
                {/* Sub-label visible only on desktop and mobile drawer */}
                {item.subLabel && (
                  <span className={`text-[10px] text-text-sub/80 font-normal mt-0.5 leading-none transition-all ${
                    isMobileDrawer ? 'block' : 'hidden lg:block'
                  }`}>
                    {item.subLabel}
                  </span>
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile section */}
      <div className={`border-t border-border-accent transition-all duration-300 ${
        isMobileDrawer ? 'p-4' : 'p-2 lg:p-4'
      } mt-auto`}>
        <div className={`flex flex-col gap-3 ${
          isMobileDrawer ? 'px-2' : 'md:items-center lg:items-stretch lg:px-2'
        }`}>
          {/* User profile summary details */}
          <div className="flex items-center gap-3 py-1.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0 shadow-inner select-none">
              {userInitial}
            </div>
            <div className={`min-w-0 transition-opacity duration-300 ${
              isMobileDrawer ? 'block' : 'md:hidden lg:block'
            }`}>
              <span className="text-xs font-bold text-text-main block truncate" title={user?.name}>
                {user?.name || 'Founder'}
              </span>
              <span className="text-[10px] text-text-sub block truncate" title={user?.email}>
                {user?.email || 'v1.0.0 (Beta)'}
              </span>
            </div>
          </div>

          {/* Action Sign Out Button */}
          <button
            type="button"
            onClick={logout}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-danger hover:bg-danger/10 rounded-xl transition-all duration-200 cursor-pointer ${
              isMobileDrawer 
                ? 'justify-start w-full' 
                : 'md:justify-center lg:justify-start md:w-11 lg:w-full md:p-2 lg:px-3 lg:py-2'
            }`}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            <span className={`transition-opacity duration-300 ${
              isMobileDrawer ? 'block' : 'md:hidden lg:block'
            }`}>
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

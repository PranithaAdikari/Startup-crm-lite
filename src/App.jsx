import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import { LeadProvider } from './context/LeadContext';
import './App.css';

/**
 * App Component
 * Root React application component wrapping the app with BrowserRouter, AuthProvider,
 * and LeadProvider to enable global routing, authentication, and CRM states.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LeadProvider>
          {/* Global toast notification renderer for all contexts */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-accent)',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
              },
            }}
          />
          {/* Root routing mapping element containing all paths configurations */}
          <AppRoutes />
        </LeadProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Export App component as default
export default App;

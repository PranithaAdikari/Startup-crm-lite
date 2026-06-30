import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import './App.css';

/**
 * App Component
 * Root React application component wrapping the app with BrowserRouter to enable Client-side routing.
 */
function App() {
  return (
    <BrowserRouter>
      {/* Root routing mapping element containing all paths configurations */}
      <AppRoutes />
    </BrowserRouter>
  );
}

// Export App component as default
export default App;

import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

/**
 * NotFound Component
 * Simple, elegant 404 fallback page.
 */
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
      <div className="p-4 bg-danger/10 rounded-2xl text-danger mb-6">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-text-main">404 - Page Not Found</h1>
      <p className="text-text-sub mt-2 max-w-md mx-auto">
        The page you are looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/95 transition-all duration-200 shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}

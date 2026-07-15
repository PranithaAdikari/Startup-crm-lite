import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

/**
 * Login Page Component
 * Renders a full-screen, high-fidelity auth portal using the application design tokens.
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form state parameters
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // Submit form handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim() || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      // Success redirection is handled by AuthContext but fall back to navigate('/') if needed
      navigate('/');
    } catch (error) {
      // Extract error message returned by API validator or server
      const errMsg = error.response?.data?.message || error.message || 'Incorrect email or password.';
      setLocalError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, login, navigate]);

  return (
    <div className="min-h-screen bg-bg-canvas flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Visual background glass gradients for modern aesthetics */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-success/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card container */}
      <div className="w-full max-w-md bg-bg-card border border-border-accent rounded-3xl p-6 sm:p-10 shadow-lg relative z-10 animate-scale-in">
        {/* Brand identity header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-3.5 shadow-inner">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">Welcome Back</h2>
          <p className="text-sm text-text-sub mt-1.5 text-center">
            Sign in to manage your startup prospects and pipeline.
          </p>
        </div>

        {/* Local validation/error alert */}
        {localError && (
          <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold leading-relaxed animate-fade-in flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-danger block shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold text-text-main tracking-wide uppercase">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-sub">
                <Mail className="w-5 h-5" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@startup.com"
                disabled={isSubmitting}
                className="block w-full pl-11 pr-4 py-3 bg-bg-canvas/50 border border-border-accent rounded-xl text-text-main placeholder:text-text-sub/65 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-bold text-text-main tracking-wide uppercase">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-sub">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                className="block w-full pl-11 pr-4 py-3 bg-bg-canvas/50 border border-border-accent rounded-xl text-text-main placeholder:text-text-sub/65 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:shadow-lg disabled:opacity-75 disabled:pointer-events-none hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer mt-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>

        {/* Links to registration page */}
        <div className="border-t border-border-accent/40 mt-8 pt-6 text-center">
          <p className="text-sm text-text-sub">
            New to CRM Lite?{' '}
            <Link
              to="/register"
              className="font-bold text-primary hover:underline transition-colors focus:outline-none"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * EmptyAnalyticsState Component
 * Shown when the lead database is empty and no analytics can be computed.
 * Provides a clear call-to-action to add the first lead.
 *
 * @returns {React.ReactElement}
 */
export default function EmptyAnalyticsState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Icon container */}
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
        <BarChart3 className="w-10 h-10 text-primary" />
      </div>

      {/* Headline */}
      <h2 className="text-2xl font-bold text-text-main mb-2 tracking-tight">
        No analytics available yet
      </h2>

      {/* Subtext */}
      <p className="text-text-sub text-sm max-w-sm mb-8 leading-relaxed">
        Add your first lead to start tracking business performance, pipeline health,
        and revenue trends.
      </p>

      {/* CTA */}
      <button
        id="empty-analytics-add-lead-btn"
        onClick={() => navigate('/leads')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
      >
        <BarChart3 className="w-4 h-4" />
        Add Lead
      </button>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>
    </div>
  );
}

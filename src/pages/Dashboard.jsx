import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Target, TrendingUp } from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { parseNumericValue, formatCurrency } from '../utils/helpers';

// Import custom dashboard widgets
import StatsCard from '../components/dashboard/StatsCard';
import PipelineOverview from '../components/dashboard/PipelineOverview';
import RecentLeads from '../components/dashboard/RecentLeads';
import QuickActions from '../components/dashboard/QuickActions';

/**
 * Dashboard Component
 * The main landing area of Startup CRM Lite assembling all metric indicators,
 * visual pipeline segments, quick operation actions, and tabular prospect listings.
 *
 * @returns {React.ReactElement} The rendered Dashboard page.
 */
export default function Dashboard() {
  const navigate = useNavigate();

  const { leads } = useLeads();

  // Compute dynamic stats metrics from current leads state
  const totalLeadsCount = leads.length;

  const totalPipelineValue = useMemo(() => {
    return leads.reduce((sum, lead) => sum + parseNumericValue(lead.value), 0);
  }, [leads]);

  const activeDealsCount = useMemo(() => {
    return leads.filter((lead) => !['Won', 'Lost'].includes(lead.status)).length;
  }, [leads]);
  
  // Calculate Conversion Rate: (Won leads / Total leads) * 100
  const conversionRate = useMemo(() => {
    const wonCount = leads.filter((lead) => lead.status === 'Won').length;
    return leads.length > 0
      ? ((wonCount / leads.length) * 100).toFixed(1) + '%'
      : '0.0%';
  }, [leads]);

  // Dynamic values configured for the metric cards
  const statsMetrics = useMemo(() => [
    {
      title: 'Total Leads',
      value: String(totalLeadsCount),
      change: '+12.5%',
      icon: Users,
      color: 'primary',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(totalPipelineValue),
      change: '+8.2%',
      icon: DollarSign,
      color: 'success',
    },
    {
      title: 'Conversion Rate',
      value: conversionRate,
      change: '-1.5%',
      icon: Target,
      color: 'warning',
    },
    {
      title: 'Active Deals',
      value: String(activeDealsCount),
      change: '+18.4%',
      icon: TrendingUp,
      color: 'danger',
    },
  ], [totalLeadsCount, totalPipelineValue, conversionRate, activeDealsCount]);

  // Handler for opening the Add Lead dialog (redirects with context)
  const handleAddLead = useCallback(() => {
    navigate('/leads', { state: { openAddModal: true } });
  }, [navigate]);

  // Handler for viewing all leads
  const handleViewLeads = useCallback(() => {
    navigate('/leads');
  }, [navigate]);

  // Handler for data exports (mocked with simple browser download notification)
  const handleExportData = useCallback(() => {
    alert('Data export initiated successfully! Your CSV report is packaging for download.');
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-main">Dashboard</h1>
        <p className="text-text-sub mt-1">Here is a summary of your startup's pipeline and growth metrics.</p>
      </div>

      {/* Metric/KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsMetrics.map((stat, idx) => (
          <StatsCard
            key={idx}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Main sections: Pipeline visualization, quick actions panel, recent prospects table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stacked pipeline overview segment bar */}
        <div className="h-full">
          <PipelineOverview leads={leads} />
        </div>

        {/* Quick shortcuts and data downloads operations wrapper */}
        <div className="h-full">
          <QuickActions
            onAddLead={handleAddLead}
            onViewLeads={handleViewLeads}
            onExport={handleExportData}
          />
        </div>

        {/* Clean table displaying recent CRM additions (spans 2 columns on desktop) */}
        <div className="lg:col-span-2">
          <RecentLeads leads={leads} />
        </div>
      </div>
    </div>
  );
}

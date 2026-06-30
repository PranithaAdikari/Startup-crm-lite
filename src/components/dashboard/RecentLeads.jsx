import { memo, useMemo } from 'react';
import { Mail, Building2, Calendar } from 'lucide-react';
import { formatDate, getInitials } from '../../utils/helpers';

/**
 * @typedef {Object} Lead
 * @property {string|number} id - Unique identifier for the lead.
 * @property {string} name - Name of the contact.
 * @property {string} company - Associated company name.
 * @property {string} email - Contact email.
 * @property {string|number} value - Estimated budget/value of the lead.
 * @property {string} [stage] - The pipeline stage (e.g. "New Lead", "Contacted").
 * @property {string} [status] - Alternative stage identifier or quality tier.
 * @property {string} [dateAdded] - ISO date string of when the lead was added.
 */

/**
 * @typedef {Object} RecentLeadsProps
 * @property {Lead[]} leads - List of lead objects to display.
 */

/**
 * Resolves Tailwind badge classes for a given status/stage value.
 * Defined at module level to avoid re-creation on every render.
 *
 * @param {string} statusVal
 * @param {string} stageVal
 * @returns {string} Tailwind class string for the badge.
 */
function getBadgeStyle(statusVal, stageVal) {
  const val = String(statusVal || stageVal || '').toLowerCase();
  if (val.includes('hot')) return 'bg-danger/10 text-danger border-danger/25';
  if (val.includes('warm')) return 'bg-warning/10 text-warning border-warning/25';
  if (val.includes('cold')) return 'bg-primary/10 text-primary border-primary/25';
  if (val.includes('negotiat')) return 'bg-danger/10 text-danger border-danger/25';
  if (val.includes('proposal')) return 'bg-warning/10 text-warning border-warning/25';
  if (val.includes('contact')) return 'bg-primary/10 text-primary border-primary/25';
  if (val.includes('new')) return 'bg-success/10 text-success border-success/25';
  return 'bg-text-sub/10 text-text-sub border-text-sub/20';
}

/**
 * RecentLeads Component
 * Renders a clean table highlighting the last 5 leads added, using responsive details.
 */
const RecentLeads = memo(function RecentLeads({ leads = [] }) {
  // Memoize expensive sort + slice so it only runs when leads array changes
  const recentLeadsList = useMemo(() => {
    return [...leads]
      .sort((a, b) => {
        const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        if (dateA !== dateB) return dateB - dateA;
        return Number(b.id) - Number(a.id);
      })
      .slice(0, 5);
  }, [leads]);

  return (
    <div className="bg-bg-card rounded-2xl border border-border-accent overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-border-accent/40">
        <h2 className="text-lg font-semibold text-text-main">Recent Prospects</h2>
        <p className="text-xs text-text-sub mt-0.5">Summary of the last 5 leads added to CRM</p>
      </div>

      <div className="overflow-x-auto flex-1">
        {recentLeadsList.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-accent/40 bg-bg-canvas/30 text-xs font-semibold uppercase tracking-wider text-text-sub">
                <th className="px-6 py-4">Lead Name</th>
                <th className="px-6 py-4 hidden sm:table-cell">Company</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-accent/30 text-sm">
              {recentLeadsList.map((lead) => (
                <tr key={lead.id} className="hover:bg-bg-canvas/20 transition-colors duration-150">
                  {/* Lead Name with Initials Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                        {getInitials(lead.name)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-text-main block truncate">{lead.name}</span>
                        {lead.email && (
                          <span className="text-xs text-text-sub flex items-center gap-1 mt-0.5 truncate">
                            <Mail className="w-3 h-3 shrink-0" />
                            {lead.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Company Info (Hidden on Mobile) */}
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-text-main font-medium flex items-center gap-1.5 truncate">
                      <Building2 className="w-4 h-4 text-text-sub shrink-0" />
                      {lead.company}
                    </span>
                  </td>

                  {/* Status/Stage Badge */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getBadgeStyle(
                        lead.status,
                        lead.stage
                      )}`}
                    >
                      {lead.status || lead.stage || 'New'}
                    </span>
                  </td>

                  {/* Date Added (Right-aligned) */}
                  <td className="px-6 py-4 text-right whitespace-nowrap text-xs text-text-sub font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-text-sub/50" />
                      {formatDate(lead.dateAdded)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-sm text-text-sub/60 font-medium">
            No prospects registered in the system yet.
          </div>
        )}
      </div>
    </div>
  );
});

export default RecentLeads;

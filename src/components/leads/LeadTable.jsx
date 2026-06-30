import { memo } from 'react';
import { Pencil, Trash2, Mail, Building2, Calendar, Share2 } from 'lucide-react';
import { formatDate, getInitials } from '../../utils/helpers';
import StatusBadge from './StatusBadge';

/**
 * @typedef {Object} Lead
 * @property {string|number} id - Unique identifier.
 * @property {string} name - Contact name.
 * @property {string} company - Company name.
 * @property {string} email - Contact email.
 * @property {string} [phone] - Contact phone number.
 * @property {string} status - Pipeline status.
 * @property {string} source - Lead source.
 * @property {string} [dateAdded] - Date when the lead was registered.
 */

/**
 * @typedef {Object} LeadTableProps
 * @property {Lead[]} leads - List of leads to display.
 * @property {(lead: Lead) => void} onEdit - Callback triggered when editing a lead.
 * @property {(id: string|number) => void} onDelete - Callback triggered when deleting a lead.
 */

/**
 * LeadTable Component
 * Displays CRM leads in a structured tabular format optimized for desktop viewports.
 */
const LeadTable = memo(function LeadTable({ leads = [], onEdit, onDelete }) {
  if (leads.length === 0) {
    return (
      <div className="bg-bg-card border border-border-accent rounded-2xl p-12 text-center shadow-sm">
        <p className="text-text-sub font-semibold text-sm">No leads found matching current data.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-2xl border border-border-accent overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-full">
          <thead>
            <tr className="border-b border-border-accent bg-bg-canvas/40 text-xs font-semibold uppercase tracking-wider text-text-sub">
              <th className="px-6 py-4">Lead Name</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 hidden lg:table-cell">Email</th>
              <th className="px-6 py-4 hidden lg:table-cell">Source</th>
              <th className="px-6 py-4 hidden lg:table-cell">Date Added</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-accent/40 text-sm">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-bg-canvas/20 transition-colors duration-150">
                {/* Lead Name column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                      {getInitials(lead.name)}
                    </div>
                    <span className="font-semibold text-text-main block truncate max-w-[150px]">
                      {lead.name}
                    </span>
                  </div>
                </td>

                {/* Company info column */}
                <td className="px-6 py-4">
                  <span className="text-text-main font-medium flex items-center gap-1.5 truncate max-w-[150px]">
                    <Building2 className="w-4 h-4 text-text-sub shrink-0" />
                    {lead.company}
                  </span>
                </td>

                {/* Status Badge column */}
                <td className="px-6 py-4">
                  <StatusBadge status={lead.status} />
                </td>

                {/* Email link column */}
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-xs text-text-sub flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                    <Mail className="w-3.5 h-3.5 text-text-sub/60 shrink-0" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-text-sub hover:text-primary hover:underline font-medium"
                    >
                      {lead.email}
                    </a>
                  </span>
                </td>

                {/* Acquisition Source column */}
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-xs text-text-sub flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-text-sub/50 shrink-0" />
                    <span>{lead.source || 'Other'}</span>
                  </span>
                </td>

                {/* Date Added column */}
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-xs text-text-sub font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-text-sub/40 shrink-0" />
                    {formatDate(lead.dateAdded)}
                  </span>
                </td>

                {/* Actions column */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(lead)}
                      aria-label={`Edit ${lead.name}`}
                      className="p-1.5 hover:bg-bg-canvas text-text-sub hover:text-primary rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(lead.id)}
                      aria-label={`Delete ${lead.name}`}
                      className="p-1.5 hover:bg-bg-canvas text-text-sub hover:text-danger rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default LeadTable;

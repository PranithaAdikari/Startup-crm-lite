import { memo } from 'react';
import { Pencil, Trash2, Mail, Phone, Building2, Share2 } from 'lucide-react';
import { getInitials } from '../../utils/helpers';
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
 * @property {string|number} [value] - Estimated budget/value of the lead.
 */

/**
 * @typedef {Object} LeadCardProps
 * @property {Lead} lead - The lead data object.
 * @property {(lead: Lead) => void} onEdit - Callback triggered when edit button is clicked.
 * @property {(id: string|number) => void} onDelete - Callback triggered when delete button is clicked.
 */

/**
 * LeadCard Component
 * Renders a visual card containing lead profile details, status indicators, and actions.
 */
const LeadCard = memo(function LeadCard({ lead, onEdit, onDelete }) {
  return (
    <div className="bg-bg-card p-5 rounded-2xl border border-border-accent shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 relative flex flex-col justify-between h-full">
      {/* Header section with initials avatar and edit/delete buttons */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase shrink-0">
            {getInitials(lead.name)}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-text-main text-base truncate tracking-tight">{lead.name}</h3>
            <span className="text-xs text-text-sub flex items-center gap-1 mt-0.5 font-medium truncate">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              {lead.company}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(lead)}
            aria-label={`Edit ${lead.name}`}
            className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center hover:bg-bg-canvas text-text-sub hover:text-primary rounded-xl border border-transparent hover:border-border-accent transition-all duration-200 cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(lead.id)}
            aria-label={`Delete ${lead.name}`}
            className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center hover:bg-bg-canvas text-text-sub hover:text-danger rounded-xl border border-transparent hover:border-border-accent transition-all duration-200 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Contact Details section */}
      <div className="my-4.5 space-y-2 border-t border-b border-border-accent/30 py-3.5 flex-1">
        {/* Email Address */}
        <div className="flex items-center gap-2 text-xs">
          <Mail className="w-4 h-4 text-text-sub/70 shrink-0" />
          <a
            href={`mailto:${lead.email}`}
            className="text-text-main hover:text-primary hover:underline font-medium truncate"
          >
            {lead.email}
          </a>
        </div>

        {/* Phone Number */}
        <div className="flex items-center gap-2 text-xs">
          <Phone className="w-4 h-4 text-text-sub/70 shrink-0" />
          {lead.phone ? (
            <a
              href={`tel:${lead.phone}`}
              className="text-text-main hover:text-primary hover:underline font-medium truncate"
            >
              {lead.phone}
            </a>
          ) : (
            <span className="text-text-sub/50 italic">No phone provided</span>
          )}
        </div>

        {/* Lead Source */}
        <div className="flex items-center gap-2 text-xs text-text-sub">
          <Share2 className="w-4 h-4 text-text-sub/70 shrink-0" />
          <span className="font-semibold text-text-main/80 truncate">
            Source: <span className="font-medium text-text-sub">{lead.source || 'Other'}</span>
          </span>
        </div>
      </div>

      {/* Footer containing Status and Value */}
      <div className="flex items-center justify-between mt-1">
        <StatusBadge status={lead.status} />
        {lead.value && (
          <span className="text-sm font-bold text-text-main tracking-tight">
            {lead.value}
          </span>
        )}
      </div>
    </div>
  );
});

export default LeadCard;

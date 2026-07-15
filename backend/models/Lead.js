import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/** Regex that covers the vast majority of valid RFC-5321 email addresses */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @typedef {Object} LeadDocument
 * @property {string}         name      - Full name of the lead contact.
 * @property {string}         company   - Company the lead belongs to.
 * @property {string}         email     - Contact email for the lead.
 * @property {string}         [phone]   - Optional contact phone number.
 * @property {string}         status    - Current pipeline stage of the lead.
 * @property {string}         source    - Marketing/sales channel the lead came from.
 * @property {string}         [notes]   - Free-form notes about the lead.
 * @property {mongoose.Types.ObjectId} owner - Reference to the User who owns this lead.
 * @property {Date}           createdAt - Auto-managed by Mongoose timestamps.
 * @property {Date}           updatedAt - Auto-managed by Mongoose timestamps.
 */
const leadSchema = new Schema(
  {
    /**
     * Full name of the lead or primary contact person.
     * Must be between 2 and 100 characters after whitespace trimming.
     */
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },

    /**
     * Name of the company or organization the lead is associated with.
     * Required to provide meaningful business context for the lead.
     */
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },

    /**
     * Primary contact email for the lead.
     * Validated against a standard email regex to catch typos early.
     * Not required to be unique at the collection level — the same person
     * may appear as a lead under multiple owners.
     */
    email: {
      type: String,
      required: [true, 'Lead email address is required'],
      trim: true,
      validate: {
        validator: (value) => EMAIL_REGEX.test(value),
        message: 'Email must be a valid email address',
      },
    },

    /**
     * Optional phone number for the lead contact.
     * Stored as a string to accommodate international formats, extensions,
     * and formatting characters (e.g. "+1 (555) 000-0000").
     */
    phone: {
      type: String,
      trim: true,
      default: null,
    },

    /**
     * Current stage of the lead in the sales pipeline.
     * Must exactly match one of the values used on the frontend Kanban board:
     *  - 'New'                : Lead just entered the system.
     *  - 'Contacted'          : Initial outreach has been made.
     *  - 'Meeting Scheduled'  : A discovery or demo call is booked.
     *  - 'Proposal Sent'      : A formal proposal or quote has been delivered.
     *  - 'Won'                : Deal successfully closed.
     *  - 'Lost'               : Lead did not convert.
     */
    status: {
      type: String,
      enum: {
        values: [
          'New',
          'Contacted',
          'Meeting Scheduled',
          'Proposal Sent',
          'Won',
          'Lost',
        ],
        message:
          "Status must be one of: 'New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'",
      },
      default: 'New',
    },

    /**
     * The acquisition channel through which this lead was generated.
     * Must exactly match one of the values available in the frontend dropdowns:
     *  - 'Website'        : Inbound from the company website.
     *  - 'Referral'       : Referred by an existing customer or partner.
     *  - 'LinkedIn'       : Sourced via LinkedIn outreach or ads.
     *  - 'Cold Call'      : Outbound phone prospecting.
     *  - 'Email Campaign' : Generated through a marketing email campaign.
     *  - 'Other'          : Any channel not covered by the above options.
     */
    source: {
      type: String,
      enum: {
        values: [
          'Website',
          'Referral',
          'LinkedIn',
          'Cold Call',
          'Email Campaign',
          'Other',
        ],
        message:
          "Source must be one of: 'Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'",
      },
      default: 'Website',
    },

    /**
     * Free-form internal notes about the lead — call summaries, requirements,
     * objections, follow-up reminders, etc.
     * Capped at 1000 characters to prevent abuse while allowing rich context.
     */
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must not exceed 1000 characters'],
      default: null,
    },

    /**
     * Reference to the User document that owns (created / is responsible for)
     * this lead. Used to scope queries so users only see their own leads,
     * while admins can query across all owners.
     *
     * @type {mongoose.Types.ObjectId}
     */
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead must be assigned to an owner'],
    },
  },
  {
    /**
     * Automatically adds `createdAt` and `updatedAt` Date fields,
     * both managed by Mongoose on every save.
     * `createdAt` is also used by the `age` virtual field below.
     */
    timestamps: true,

    /**
     * Include virtual fields (e.g. `age`) when converting to JSON or plain objects.
     * Required so that `res.json(lead)` and `lead.toObject()` expose virtuals.
     */
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

/**
 * Compound index on (owner, status).
 * Optimises the most common filtered query pattern:
 *   Lead.find({ owner: userId, status: 'New' })
 * Allows MongoDB to satisfy both predicates with a single index scan.
 */
leadSchema.index({ owner: 1, status: 1 });

/**
 * Index on email.
 * Speeds up duplicate-detection lookups and cross-owner searches by email.
 */
leadSchema.index({ email: 1 });

/**
 * Compound index on (owner, createdAt).
 * Required for efficient date-range filtering in getLeads (dateFrom/dateTo)
 * and for the monthly aggregation pipeline which scans by owner + createdAt window.
 * Covers patterns like:
 *   Lead.find({ owner: userId, createdAt: { $gte: start, $lte: end } })
 */
leadSchema.index({ owner: 1, createdAt: -1 });

/**
 * Compound index on (owner, source).
 * Supports fast grouping in the getLeadStats aggregation sourceBreakdown facet
 * and allows filtering by source in getLeads without a collection scan.
 */
leadSchema.index({ owner: 1, source: 1 });

/**
 * Compound indexes for autocomplete / search endpoint.
 * Each field is paired with owner so MongoDB can use the index to scope the
 * regex scan to a single user's data instead of the entire collection.
 * Used by the searchLeads handler: GET /api/leads/search?q=&limit=
 */
leadSchema.index({ owner: 1, name: 1 });
leadSchema.index({ owner: 1, company: 1 });
leadSchema.index({ owner: 1, email: 1 });

// ---------------------------------------------------------------------------
// Virtual fields
// ---------------------------------------------------------------------------

/**
 * Computed `age` virtual — number of full days elapsed since the lead was created.
 * Useful for analytics (e.g. "leads older than 30 days with status 'New'").
 *
 * Not stored in the database; recalculated on every access.
 *
 * @returns {number} Integer number of days since `createdAt`.
 *
 * @example
 * const lead = await Lead.findById(id);
 * console.log(`This lead is ${lead.age} day(s) old`);
 */
leadSchema.virtual('age').get(function computeAge() {
  if (!this.createdAt) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((Date.now() - this.createdAt.getTime()) / msPerDay);
});

// ---------------------------------------------------------------------------
// Model & schema exports
// ---------------------------------------------------------------------------

/** Compiled Mongoose model for the `leads` collection. */
const Lead = model('Lead', leadSchema);

export { leadSchema };
export default Lead;

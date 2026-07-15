import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';

/**
 * Checks if the application is running in development mode to toggle logging.
 *
 * @returns {boolean} True if NODE_ENV is development.
 */
const isDev = () => process.env.NODE_ENV === 'development';

// ---------------------------------------------------------------------------
// getLeads — paginated, sorted, multi-filter list
// ---------------------------------------------------------------------------

/**
 * Fetches a paginated, sorted, and filtered list of leads for the authenticated owner.
 *
 * Supported query parameters:
 * @param {string}  [req.query.page=1]        - Page number (1-based).
 * @param {string}  [req.query.limit=20]       - Records per page (capped at 100).
 * @param {string}  [req.query.sortBy=createdAt] - Field name to sort on.
 * @param {string}  [req.query.sortOrder=desc]   - 'asc' or 'desc'.
 * @param {string}  [req.query.status]          - Exact match on pipeline status (e.g. 'New').
 * @param {string}  [req.query.source]          - Exact match on acquisition source (e.g. 'LinkedIn').
 * @param {string}  [req.query.search]          - Case-insensitive regex against name, company, email.
 * @param {string}  [req.query.dateFrom]        - ISO date string; filters createdAt >= dateFrom.
 * @param {string}  [req.query.dateTo]          - ISO date string; filters createdAt <= dateTo.
 *
 * @async
 * @function getLeads
 * @param {Object}   req  - Express request object.
 * @param {Object}   res  - Express response object.
 * @param {Function} next - Express next middleware.
 * @returns {Promise<Object>} Paginated JSON response:
 *   {
 *     success: true,
 *     data: Lead[],
 *     pagination: { total, page, limit, pages, hasNext, hasPrev }
 *   }
 */
export const getLeads = async (req, res, next) => {
  try {
    const {
      status,
      source,
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    if (isDev()) {
      console.log(`[getLeads] Query parameters received:`, req.query);
    }

    // -----------------------------------------------------------------------
    // 1. Base filter — always scope to the authenticated owner
    // -----------------------------------------------------------------------
    const filter = { owner: req.user._id };

    // -----------------------------------------------------------------------
    // 2. Dynamic filter construction — only add a predicate when the caller
    //    supplies that parameter, keeping queries as selective as possible.
    // -----------------------------------------------------------------------

    // Exact status match (skip if caller sends 'All' or empty string)
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Exact source match
    if (source && source !== 'All') {
      filter.source = source;
    }

    // Date-range filter on createdAt — build the sub-object incrementally
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (!isNaN(from.getTime())) {
          filter.createdAt.$gte = from;
        }
      }
      if (dateTo) {
        const to = new Date(dateTo);
        if (!isNaN(to.getTime())) {
          // Include the entire dateTo day by advancing to end-of-day
          to.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = to;
        }
      }
    }

    // Full-text style search — case-insensitive regex across key identifiable fields
    if (search) {
      filter.$or = [
        { name:    { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email:   { $regex: search, $options: 'i' } },
      ];
    }

    // -----------------------------------------------------------------------
    // 3. Pagination & sorting
    // -----------------------------------------------------------------------
    const pageNum  = Math.max(parseInt(page,  10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100); // hard cap at 100
    const skip     = (pageNum - 1) * limitNum;
    const sort     = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    if (isDev()) {
      console.log(`[getLeads] Final filter:`, JSON.stringify(filter));
    }

    // -----------------------------------------------------------------------
    // 4. Execute count + find in parallel for minimal latency
    // -----------------------------------------------------------------------
    const [leads, total] = await Promise.all([
      Lead.find(filter).sort(sort).skip(skip).limit(limitNum),
      Lead.countDocuments(filter),
    ]);

    return paginatedResponse(res, leads, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// createLead
// ---------------------------------------------------------------------------

/**
 * Creates a new lead document.
 * Automatically associates the lead to the current authenticated owner.
 *
 * @async
 * @function createLead
 * @param {Object}   req  - Express request object.
 * @param {Object}   res  - Express response object.
 * @param {Function} next - Express next middleware.
 * @returns {Promise<Object>} Standard success response with the new lead payload.
 */
export const createLead = async (req, res, next) => {
  try {
    const { name, company, email, phone, status, source, notes } = req.body;

    if (isDev()) {
      console.log(`[createLead] Creating lead for owner ID: ${req.user._id} with data:`, req.body);
    }

    // Explicitly build payload to prevent injection of unallowed parameters
    const lead = await Lead.create({
      name,
      company,
      email,
      phone,
      status,
      source,
      notes,
      owner: req.user._id, // Enforce current authenticated user as owner
    });

    return successResponse(res, lead, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// getLeadById
// ---------------------------------------------------------------------------

/**
 * Retrieves a single lead by its ID.
 * Enforces ownership boundary.
 *
 * @async
 * @function getLeadById
 * @param {Object}   req  - Express request object.
 * @param {Object}   res  - Express response object.
 * @param {Function} next - Express next middleware.
 * @returns {Promise<Object>} Standard success response containing the lead object.
 */
export const getLeadById = async (req, res, next) => {
  try {
    const leadId = req.params.id;

    if (isDev()) {
      console.log(`[getLeadById] Fetching lead: ${leadId} for owner: ${req.user._id}`);
    }

    // Ensure lead matches both the ID and the authenticated user's ID (owner isolation)
    const lead = await Lead.findOne({ _id: leadId, owner: req.user._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// updateLead
// ---------------------------------------------------------------------------

/**
 * Updates an existing lead by ID.
 * Enforces ownership boundary and explicitly blocks attempts to mutate the owner.
 *
 * @async
 * @function updateLead
 * @param {Object}   req  - Express request object.
 * @param {Object}   res  - Express response object.
 * @param {Function} next - Express next middleware.
 * @returns {Promise<Object>} Standard success response with the updated lead payload.
 */
export const updateLead = async (req, res, next) => {
  try {
    const leadId = req.params.id;
    const { name, company, email, phone, status, source, notes } = req.body;

    if (isDev()) {
      console.log(`[updateLead] Updating lead: ${leadId} for owner: ${req.user._id} with data:`, req.body);
    }

    // Do NOT permit mutating the owner field. Set up the dynamic updates explicitly
    const updatePayload = {};
    if (name    !== undefined) updatePayload.name    = name;
    if (company !== undefined) updatePayload.company = company;
    if (email   !== undefined) updatePayload.email   = email;
    if (phone   !== undefined) updatePayload.phone   = phone;
    if (status  !== undefined) updatePayload.status  = status;
    if (source  !== undefined) updatePayload.source  = source;
    if (notes   !== undefined) updatePayload.notes   = notes;

    const lead = await Lead.findOneAndUpdate(
      { _id: leadId, owner: req.user._id },
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// updateLeadStatus
// ---------------------------------------------------------------------------

/**
 * Updates ONLY the status field of a lead.
 * Enforces ownership boundary.
 *
 * @async
 * @function updateLeadStatus
 * @param {Object}   req  - Express request object.
 * @param {Object}   res  - Express response object.
 * @param {Function} next - Express next middleware.
 * @returns {Promise<Object>} Standard success response with the updated lead payload.
 */
export const updateLeadStatus = async (req, res, next) => {
  try {
    const leadId = req.params.id;
    const { status } = req.body;

    if (isDev()) {
      console.log(`[updateLeadStatus] Updating status of lead: ${leadId} to '${status}' for owner: ${req.user._id}`);
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: leadId, owner: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead status updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// deleteLead
// ---------------------------------------------------------------------------

/**
 * Deletes a lead by ID.
 * Enforces ownership boundary.
 *
 * @async
 * @function deleteLead
 * @param {Object}   req  - Express request object.
 * @param {Object}   res  - Express response object.
 * @param {Function} next - Express next middleware.
 * @returns {Promise<Object>} Standard success response with removal message.
 */
export const deleteLead = async (req, res, next) => {
  try {
    const leadId = req.params.id;

    if (isDev()) {
      console.log(`[deleteLead] Deleting lead: ${leadId} for owner: ${req.user._id}`);
    }

    const lead = await Lead.findOne({ _id: leadId, owner: req.user._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    // Call deleteOne() to trigger Mongoose middleware hooks if any exist
    await lead.deleteOne();

    return successResponse(res, null, 'Lead deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// getLeadStats — single-query $facet aggregation
// ---------------------------------------------------------------------------

/**
 * Returns comprehensive lead statistics for the authenticated user in a SINGLE
 * MongoDB aggregation using $facet, so the entire stats page is served with
 * one database round-trip.
 *
 * The pipeline fans out into five independent facets:
 *   • totalFacet        — overall document count.
 *   • statusFacet       — count grouped by status.
 *   • sourceFacet       — count grouped by source.
 *   • thisMonthFacet    — count of leads created in the current calendar month.
 *   • lastMonthFacet    — count of leads created in the previous calendar month.
 *
 * Derived metrics computed in JS (after the single DB call):
 *   • conversionRate  = (Won / total) × 100, rounded to 1 decimal.
 *   • growthRate      = ((thisMonth − lastMonth) / lastMonth) × 100.
 *   Both are safely guarded against division by zero (returns 0 when denominator is 0).
 *
 * @async
 * @function getLeadStats
 * @param {Object}   req  - Express request object.
 * @param {Object}   res  - Express response object.
 * @param {Function} next - Express next middleware.
 * @returns {Promise<Object>} Standard success response with shape:
 *   {
 *     totalLeads:       number,
 *     conversionRate:   number,   // e.g. 33.3
 *     lostRate:         number,
 *     activeLeads:      number,
 *     wonLeads:         number,
 *     lostLeads:        number,
 *     statusBreakdown:  { New: n, Contacted: n, ... },
 *     sourceBreakdown:  { Website: n, LinkedIn: n, ... },
 *     thisMonthLeads:   number,
 *     lastMonthLeads:   number,
 *     growthRate:       number,   // e.g. 50.0  (or 0 when lastMonth is 0)
 *   }
 */
export const getLeadStats = async (req, res, next) => {
  try {
    if (isDev()) {
      console.log(`[getLeadStats] Compiling statistics for owner ID: ${req.user._id}`);
    }

    // -----------------------------------------------------------------------
    // Build date boundaries for the current and previous calendar months
    // -----------------------------------------------------------------------
    const now = new Date();

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const thisMonthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(),     0, 23, 59, 59, 999);

    // -----------------------------------------------------------------------
    // Single aggregation with $facet — all five sub-pipelines run in parallel
    // inside one MongoDB command.
    // -----------------------------------------------------------------------
    const [result] = await Lead.aggregate([
      // Gate every facet to the current owner up-front
      { $match: { owner: req.user._id } },

      {
        $facet: {
          // ── Total count ──────────────────────────────────────────────────
          totalFacet: [
            { $count: 'count' },
          ],

          // ── Status breakdown ─────────────────────────────────────────────
          statusFacet: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],

          // ── Source breakdown ─────────────────────────────────────────────
          sourceFacet: [
            { $group: { _id: '$source', count: { $sum: 1 } } },
          ],

          // ── This-month count ─────────────────────────────────────────────
          thisMonthFacet: [
            {
              $match: {
                createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
              },
            },
            { $count: 'count' },
          ],

          // ── Last-month count ─────────────────────────────────────────────
          lastMonthFacet: [
            {
              $match: {
                createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
              },
            },
            { $count: 'count' },
          ],
        },
      },
    ]);

    // -----------------------------------------------------------------------
    // Unpack facet arrays — each $count facet returns [] when there are no
    // documents, so we default to 0 safely.
    // -----------------------------------------------------------------------
    const totalLeads    = result.totalFacet[0]?.count     ?? 0;
    const thisMonthLeads = result.thisMonthFacet[0]?.count ?? 0;
    const lastMonthLeads = result.lastMonthFacet[0]?.count ?? 0;

    // ── Status breakdown ────────────────────────────────────────────────────
    // Pre-seed all known statuses at 0 so the frontend always receives a
    // consistent object shape regardless of which statuses have data.
    const statusBreakdown = {
      'New':               0,
      'Contacted':         0,
      'Meeting Scheduled': 0,
      'Proposal Sent':     0,
      'Won':               0,
      'Lost':              0,
    };
    result.statusFacet.forEach(({ _id, count }) => {
      if (_id in statusBreakdown) statusBreakdown[_id] = count;
    });

    // ── Source breakdown ─────────────────────────────────────────────────────
    const sourceBreakdown = {
      'Website':        0,
      'Referral':       0,
      'LinkedIn':       0,
      'Cold Call':      0,
      'Email Campaign': 0,
      'Other':          0,
    };
    result.sourceFacet.forEach(({ _id, count }) => {
      if (_id in sourceBreakdown) sourceBreakdown[_id] = count;
    });

    // ── Derived scalar metrics ───────────────────────────────────────────────
    const wonLeads  = statusBreakdown['Won'];
    const lostLeads = statusBreakdown['Lost'];
    const activeLeads = totalLeads - wonLeads - lostLeads;

    // Guard against division-by-zero on all rate calculations
    const conversionRate = totalLeads > 0
      ? parseFloat(((wonLeads  / totalLeads) * 100).toFixed(1))
      : 0;

    const lostRate = totalLeads > 0
      ? parseFloat(((lostLeads / totalLeads) * 100).toFixed(1))
      : 0;

    // growthRate: percentage change vs previous month.
    // Returns 0 (not Infinity) when lastMonth is 0 to keep the response clean.
    const growthRate = lastMonthLeads > 0
      ? parseFloat((((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100).toFixed(1))
      : 0;

    const statsPayload = {
      totalLeads,
      conversionRate,
      lostRate,
      activeLeads,
      wonLeads,
      lostLeads,
      statusBreakdown,
      sourceBreakdown,
      thisMonthLeads,
      lastMonthLeads,
      growthRate,
    };

    if (isDev()) {
      console.log(`[getLeadStats] Computed stats payload:`, statsPayload);
    }

    return successResponse(res, statsPayload, 'Lead statistics compiled successfully', 200);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// getMonthlyStats — last 6 months with zero-fill and per-month conversionRate
// ---------------------------------------------------------------------------

/**
 * Aggregates monthly lead activity for the last 6 calendar months (inclusive of
 * the current month) and returns the data in chronological order (oldest → newest)
 * so charts render left-to-right without client-side sorting.
 *
 * Months with zero leads are always included in the response array (zero-filled)
 * so the chart always shows a fixed 6-point X-axis.
 *
 * Each entry also carries a per-month conversionRate and a lost count so the
 * frontend can render a full funnel breakdown per time period.
 *
 * @async
 * @function getMonthlyStats
 * @param {Object}   req  - Express request object.
 * @param {Object}   res  - Express response object.
 * @param {Function} next - Express next middleware.
 * @returns {Promise<Object>} Standard success response containing a 6-element array:
 *   [
 *     {
 *       month:          string,  // e.g. 'Jan 2025'
 *       total:          number,
 *       won:            number,
 *       lost:           number,
 *       conversionRate: number,  // (won / total) × 100, 1 decimal; 0 when total is 0
 *     },
 *     ...
 *   ]
 */
export const getMonthlyStats = async (req, res, next) => {
  try {
    if (isDev()) {
      console.log(`[getMonthlyStats] Compiling monthly metrics for owner ID: ${req.user._id}`);
    }

    // -----------------------------------------------------------------------
    // 1. Establish the window: start of the month 5 months ago → now
    //    e.g. if today is July 2025, window covers Feb–Jul 2025 (6 months).
    // -----------------------------------------------------------------------
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);

    // -----------------------------------------------------------------------
    // 2. Aggregation — group by (year, month) and count total / won / lost
    // -----------------------------------------------------------------------
    const statsResult = await Lead.aggregate([
      {
        $match: {
          owner: req.user._id,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          won: {
            $sum: { $cond: [{ $eq: ['$status', 'Won']  }, 1, 0] },
          },
          lost: {
            $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] },
          },
        },
      },
      // Sort oldest → newest so the merge step below is deterministic
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // -----------------------------------------------------------------------
    // 3. Build the 6-slot chronological scaffold (guaranteed zero values)
    // -----------------------------------------------------------------------
    const MONTH_NAMES = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const scaffold = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      scaffold.push({
        year:     d.getFullYear(),
        monthNum: d.getMonth() + 1,         // 1-indexed to match $month output
        label:    `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
        total: 0,
        won:   0,
        lost:  0,
      });
    }

    // -----------------------------------------------------------------------
    // 4. Merge aggregation results into the scaffold
    // -----------------------------------------------------------------------
    statsResult.forEach(({ _id, total, won, lost }) => {
      const slot = scaffold.find(
        (s) => s.year === _id.year && s.monthNum === _id.month
      );
      if (slot) {
        slot.total = total;
        slot.won   = won;
        slot.lost  = lost;
      }
    });

    // -----------------------------------------------------------------------
    // 5. Build final payload — compute per-month conversionRate here so
    //    the frontend receives a ready-to-render value.
    // -----------------------------------------------------------------------
    const monthlyStatsPayload = scaffold.map(({ label, total, won, lost }) => ({
      month:          label,
      total,
      won,
      lost,
      // Guard: returns 0 when there are no leads in that month
      conversionRate: total > 0
        ? parseFloat(((won / total) * 100).toFixed(1))
        : 0,
    }));

    if (isDev()) {
      console.log(`[getMonthlyStats] Compiled monthly stats payload:`, monthlyStatsPayload);
    }

    return successResponse(res, monthlyStatsPayload, 'Monthly statistics compiled successfully', 200);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// searchLeads — lightweight autocomplete endpoint
// ---------------------------------------------------------------------------

/**
 * Quick-search endpoint designed for autocomplete / SearchBar debounce usage.
 * Returns only the minimal projection needed by the UI to keep payload tiny and
 * latency low. Hard-capped at 5 results (or the caller-supplied limit, max 10).
 *
 * Route: GET /api/leads/search?q=ali&limit=5
 *
 * @param {string}  req.query.q      - Search term (required, min 1 char).
 * @param {string}  [req.query.limit=5] - Max results to return (capped at 10).
 *
 * @async
 * @function searchLeads
 * @param {Object}   req  - Express request object.
 * @param {Object}   res  - Express response object.
 * @param {Function} next - Express next middleware.
 * @returns {Promise<Object>} Standard success response with shape:
 *   {
 *     success: true,
 *     data: Array<{ _id, name, company, email, status }>
 *   }
 */
export const searchLeads = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;

    // Require at least one character to prevent returning the whole collection
    if (!q || q.trim().length === 0) {
      return successResponse(res, [], 'Search results', 200);
    }

    if (isDev()) {
      console.log(`[searchLeads] Autocomplete query '${q}' for owner: ${req.user._id}`);
    }

    // Hard cap: autocomplete should never return more than 10 results
    const limitNum = Math.min(parseInt(limit, 10) || 5, 10);

    const leads = await Lead.find(
      {
        owner: req.user._id,
        $or: [
          { name:    { $regex: q, $options: 'i' } },
          { company: { $regex: q, $options: 'i' } },
          { email:   { $regex: q, $options: 'i' } },
        ],
      },
      // Projection — only fields needed by the SearchBar dropdown
      { _id: 1, name: 1, company: 1, email: 1, status: 1 }
    )
      .limit(limitNum)
      .lean(); // Return plain JS objects for speed (no Mongoose overhead)

    return successResponse(res, leads, 'Search results', 200);
  } catch (error) {
    next(error);
  }
};

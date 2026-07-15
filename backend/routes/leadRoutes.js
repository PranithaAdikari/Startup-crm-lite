import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getMonthlyStats,
  searchLeads,
} from '../controllers/leadController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ---------------------------------------------------------------------------
// Route Guard — Secure ALL routes in this router with protection middleware
// ---------------------------------------------------------------------------
router.use(protect);

// ---------------------------------------------------------------------------
// Input Validation Schemas
// ---------------------------------------------------------------------------

const leadValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'])
    .withMessage("Status must be one of: 'New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'"),
  body('source')
    .optional()
    .isIn(['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'])
    .withMessage("Source must be one of: 'Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'"),
  body('phone')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
];

const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'])
    .withMessage("Status must be one of: 'New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'"),
];

const idParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID format'),
];

// ---------------------------------------------------------------------------
// Route Mappings (Static routes registered BEFORE dynamic parameter routes)
// ---------------------------------------------------------------------------

// 1. GET /stats/summary (Retrieve aggregate totals and KPI stats)
router.get('/stats/summary', getLeadStats);

// 2. GET /monthly-stats (Retrieve monthly metrics for analytics charts)
router.get('/monthly-stats', getMonthlyStats);

// 3. GET /search (Quick autocomplete — must be BEFORE /:id to avoid ObjectId coercion)
// Usage: GET /api/leads/search?q=ali&limit=5
router.get('/search', searchLeads);

// 4. GET / (List/search leads for current owner)
router.get('/', getLeads);

// 5. POST / (Create a new lead)
router.post('/', validate(leadValidation), createLead);

// 6. GET /:id (Retrieve details of a specific owned lead)
router.get('/:id', validate(idParamValidation), getLeadById);

// 7. PUT /:id (Update details of an owned lead)
router.put('/:id', validate([...idParamValidation, ...leadValidation]), updateLead);

// 8. PATCH /:id/status (Partially update ONLY the status of an owned lead)
router.patch('/:id/status', validate([...idParamValidation, ...updateStatusValidation]), updateLeadStatus);

// 9. DELETE /:id (Delete a specific owned lead)
router.delete('/:id', validate(idParamValidation), deleteLead);

export default router;

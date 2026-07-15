import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  updateProfile,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ---------------------------------------------------------------------------
// Validation Rules Schemas
// ---------------------------------------------------------------------------

const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters long'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters long'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('currentPassword')
    .optional()
    .notEmpty()
    .withMessage('Current password is required to set a new password'),
];

// ---------------------------------------------------------------------------
// Route Mapping Configuration
// ---------------------------------------------------------------------------

/*
 * PRODUCTION NOTE:
 * Consider placing a global or auth-route specific rate-limiter middleware here.
 * For example:
 * router.post('/login', loginRateLimiter, validate(loginValidation), login);
 */

// 1. POST /register (Public Registration Route)
router.post('/register', validate(registerValidation), register);

// 2. POST /login (Public Login Route)
router.post('/login', validate(loginValidation), login);

// 3. GET /profile (Protected Profile Retrieval Route)
router.get('/profile', protect, getProfile);

// 4. PUT /profile (Protected Profile Update Route)
router.put('/profile', protect, validate(updateProfileValidation), updateProfile);

// 5. PATCH /profile (Protected Profile Partial Update Route Alias)
router.patch('/profile', protect, validate(updateProfileValidation), updateProfile);

// 6. POST /logout (Public Session Termination Route)
router.post('/logout', logout);

export default router;

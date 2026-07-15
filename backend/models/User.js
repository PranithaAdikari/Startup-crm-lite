import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;

/** Number of bcrypt salt rounds — 10 is a good balance of security vs. CPU cost */
const SALT_ROUNDS = 10;

/** Regex that covers the vast majority of valid RFC-5321 email addresses */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @typedef {Object} UserDocument
 * @property {string}  name      - The user's display name.
 * @property {string}  email     - Unique login email address (stored lowercase).
 * @property {string}  password  - bcrypt-hashed password (never stored in plain text).
 * @property {string}  role      - Authorization role: 'admin' | 'user'.
 * @property {boolean} isActive  - Soft-delete / account suspension flag.
 * @property {Date}    createdAt - Auto-managed by Mongoose timestamps.
 * @property {Date}    updatedAt - Auto-managed by Mongoose timestamps.
 */
const userSchema = new Schema(
  {
    /**
     * Full display name of the user.
     * Must be between 2 and 50 characters after whitespace trimming.
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name must not exceed 50 characters'],
    },

    /**
     * Primary email address used for authentication.
     * Stored in lowercase to ensure case-insensitive uniqueness.
     * Validated against a standard email regex.
     */
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => EMAIL_REGEX.test(value),
        message: 'Email must be a valid email address',
      },
    },

    /**
     * bcrypt-hashed password.
     * Plain-text passwords are NEVER persisted — hashing is enforced via
     * the pre-save middleware below. Minimum 6 characters before hashing.
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },

    /**
     * Authorization role that controls what the user can access.
     * - 'admin' : full CRUD over all leads and user management.
     * - 'user'  : can only manage their own leads.
     */
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: "Role must be either 'admin' or 'user'",
      },
      default: 'user',
    },

    /**
     * Whether the account is active.
     * Set to false to soft-delete or suspend a user without removing their data.
     */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    /**
     * Automatically adds `createdAt` and `updatedAt` Date fields,
     * both managed by Mongoose on every save.
     */
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// `email` already has a unique index declared on the field itself.
// Adding an explicit index on `role` helps admin dashboards filter by role.
userSchema.index({ role: 1 });

// ---------------------------------------------------------------------------
// Pre-save middleware — password hashing
// ---------------------------------------------------------------------------

/**
 * Automatically hashes the password field before any save operation.
 * Skips hashing if the password has not been modified, preventing
 * double-hashing on unrelated document updates (e.g. name change).
 *
 * @param {Function} next - Mongoose next middleware callback.
 */
userSchema.pre('save', async function hashPassword() {
  // `this` refers to the document being saved
  // Skip hashing if password was not modified (e.g. name-only updates)
  if (!this.isModified('password')) return;

  // In Mongoose v9+, async pre hooks must throw errors instead of calling next(error)
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

// ---------------------------------------------------------------------------
// Instance methods
// ---------------------------------------------------------------------------

/**
 * Compares a plain-text candidate password against the stored bcrypt hash.
 *
 * @param {string} candidatePassword - The plain-text password provided by the user at login.
 * @returns {Promise<boolean>} Resolves to `true` if passwords match, `false` otherwise.
 *
 * @example
 * const isMatch = await user.comparePassword(req.body.password);
 * if (!isMatch) throw new Error('Invalid credentials');
 */
userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ---------------------------------------------------------------------------
// JSON serialization — strip sensitive fields
// ---------------------------------------------------------------------------

/**
 * Overrides the default toJSON serialization to remove the `password` field
 * before any document is returned in an API response.
 * This is a safety net — never rely solely on this; also use field projection
 * in queries (e.g. `.select('-password')`) for defense in depth.
 *
 * @returns {Object} Plain JavaScript object representation without `password`.
 */
userSchema.methods.toJSON = function toJSON() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// ---------------------------------------------------------------------------
// Model & schema exports
// ---------------------------------------------------------------------------

/** Compiled Mongoose model for the `users` collection. */
const User = model('User', userSchema);

export { userSchema };
export default User;

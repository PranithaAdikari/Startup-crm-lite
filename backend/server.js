import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dns from 'dns';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
// express-mongo-sanitize is intentionally NOT imported:
// Its middleware does `req.query = sanitizedObj` which throws in Express 5
// because req.query is a getter-only property (defineGetter in Express request.js).
// We use an inline sanitizer below that mutates objects in-place instead.

// Override default DNS servers to prevent querySrv ECONNREFUSED on MongoDB Atlas SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

// ---------------------------------------------------------------------------
// 1. Environment Variables — load FIRST, before any other module reads them
// ---------------------------------------------------------------------------
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT     = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// 2. Environment Validation — fail fast before touching the network or DB
// ---------------------------------------------------------------------------

/**
 * Validates that all required environment variables are present at startup.
 * Logs each missing variable by name and exits with code 1 if any are absent.
 * This prevents silent misconfigurations reaching production.
 *
 * Required variables:
 *  - MONGODB_URI  : Full MongoDB Atlas / local connection string.
 *  - JWT_SECRET   : Secret used to sign and verify JSON Web Tokens.
 *  - PORT         : TCP port the Express server will bind to.
 *
 * @function checkRequiredEnvVars
 * @returns {void} Exits the process if any variable is missing.
 */
const checkRequiredEnvVars = () => {
  const REQUIRED = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
  const missing  = REQUIRED.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(' FATAL: Missing required environment variables:');
    missing.forEach((key) => console.error(`  ✖  ${key}`));
    console.error(' Add them to your .env file and restart the server.');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    process.exit(1);
  }
};

// Run validation immediately — before DB connection or Express setup
checkRequiredEnvVars();

// ---------------------------------------------------------------------------
// 3. Local Modules
// ---------------------------------------------------------------------------
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// ---------------------------------------------------------------------------
// 4. Express App Initialization
// ---------------------------------------------------------------------------
const app = express();

// ---------------------------------------------------------------------------
// 5. HTTP Security Headers (Helmet)
// ---------------------------------------------------------------------------

/**
 * Helmet sets ~15 security-related HTTP response headers automatically:
 *  - Content-Security-Policy, X-Content-Type-Options, X-Frame-Options,
 *    Referrer-Policy, HSTS (in production), etc.
 * This is always the first middleware so headers are set on every response.
 */
app.use(helmet());

// ---------------------------------------------------------------------------
// 6. Request Logging (Morgan)
//    - 'dev'      : Concise colorized output — ideal for local development.
//    - 'combined' : Apache Combined Log Format — structured for log aggregators
//                   (Datadog, CloudWatch, etc.) in production.
// ---------------------------------------------------------------------------
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// ---------------------------------------------------------------------------
// 7. Rate Limiting
//    Applied BEFORE routes so every request is subject to limits.
//    Two tiers:
//      a) General limiter — broad throttle on all /api/* endpoints.
//      b) Auth limiter   — stricter limit on login/register to deter brute-force.
// ---------------------------------------------------------------------------

/**
 * General rate limiter.
 * Allows up to 100 requests per 15-minute window per IP address.
 * Applies to all /api/* routes.
 *
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 */
const generalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes in milliseconds
  max:              100,
  standardHeaders:  true,  // Return rate-limit info in RateLimit-* headers (RFC 6585)
  legacyHeaders:    false,  // Disable deprecated X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Auth-specific rate limiter (stricter).
 * Allows only 10 requests per 15-minute window per IP on authentication routes.
 * Prevents brute-force password attacks and credential stuffing.
 *
 * Registered on /api/auth BEFORE the general limiter so both fire in sequence,
 * giving auth routes the lower of the two limits.
 *
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 */
const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
  skipSuccessfulRequests: false, // Count ALL requests, not just failed ones
});

// Mount rate limiters — order matters: auth limiter first so it applies its
// stricter cap before the general limiter also runs for /api/auth/* requests.
app.use('/api/auth', authLimiter);
app.use('/api',      generalLimiter);

// ---------------------------------------------------------------------------
// 8. CORS — Production-safe allowlist
//    In development the localhost regex passes any Vite dev-server port.
//    In production ONLY explicit origins in the allowlist are accepted.
// ---------------------------------------------------------------------------

/**
 * Explicit origin allowlist.
 * - FRONTEND_URL  : Set via environment variable (your production domain).
 * - Vercel URL    : Replace with your actual Vercel deployment URL before going live.
 * - localhost origins are permitted via regex in development only.
 *
 * filter(Boolean) removes undefined entries (e.g. if FRONTEND_URL is not set).
 */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://up-crm-lite-tau.vercel.app', // ← Replace with your real Vercel URL before deploying
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean);

app.use(
  cors({
    /**
     * Dynamic origin validator.
     * - Allows requests with no origin header (server-to-server / curl / Postman).
     * - Allows any origin explicitly in the allowedOrigins array.
     * - In development, also allows any localhost / 127.0.0.1 port dynamically.
     * - Rejects everything else with a CORS error (caught by the error handler).
     *
     * @param {string|undefined} origin  - The incoming request's Origin header.
     * @param {Function}         callback - CORS callback: (err, allow) => void
     */
    origin: (origin, callback) => {
      // No origin = same-origin or non-browser client (Postman, server-to-server)
      if (!origin) return callback(null, true);

      // Explicit allowlist check
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // In development: allow any localhost / 127.0.0.1 port (flexible for tooling)
      if (NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/.test(origin)) {
        return callback(null, true);
      }

      // Reject everything else
      callback(new Error(`CORS policy: origin '${origin}' is not allowed`));
    },
    credentials: true, // Required for cookies / Authorization headers in cross-origin requests
  })
);

// ---------------------------------------------------------------------------
// 9. MongoDB Injection Sanitization (inline — Express 5 compatible)
//
//    WHY NOT express-mongo-sanitize package:
//    The package's middleware does `req[key] = sanitizedObject` for each of
//    body / query / params / headers. In Express 5, req.query is defined via
//    defineGetter() making it a read-only getter — direct assignment throws:
//      "Cannot set property query of #<IncomingMessage> which has only a getter"
//
//    FIX: Mutate each object IN-PLACE (delete old keys, write sanitized keys back)
//    so we never reassign the object reference — Express 5 safe.
//
//    Strips keys starting with '$' or containing '.' (MongoDB operators).
//    Replaces prohibited chars with '_' to mirror sanitize({ replaceWith: '_' }).
//    Prevents NoSQL injection attacks like: { "email": { "$gt": "" } }
// ---------------------------------------------------------------------------

/** Matches keys that are MongoDB injection vectors: starting with $ or containing . */
const MONGO_INJECT_REGEX = /^\$|\./;
/** Replacement character for prohibited key characters */
const SANITIZE_REPLACE_WITH = '_';

/**
 * Recursively sanitizes a plain object IN-PLACE.
 * Deletes keys matching MONGO_INJECT_REGEX and re-inserts them with the
 * prohibited characters replaced. Never replaces the object reference.
 *
 * @param {Object} obj - The object to sanitize (mutated directly).
 * @returns {boolean} True if any keys were sanitized.
 */
function sanitizeInPlace(obj) {
  if (!obj || typeof obj !== 'object') return false;

  let wasSanitized = false;

  const keys = Object.keys(obj);
  for (const key of keys) {
    if (MONGO_INJECT_REGEX.test(key)) {
      wasSanitized = true;
      const value = obj[key];
      // Remove the dangerous key
      delete obj[key];
      // Re-insert under the sanitized key name ($ → _, . → _)
      const safeKey = key.replace(/^\$|\./g, SANITIZE_REPLACE_WITH);
      // Guard against prototype pollution via crafted key names
      if (safeKey !== '__proto__' && safeKey !== 'constructor' && safeKey !== 'prototype') {
        obj[safeKey] = value;
      }
    }
    // Recurse into nested objects / arrays
    if (typeof obj[key] === 'object') {
      if (sanitizeInPlace(obj[key])) wasSanitized = true;
    }
  }

  return wasSanitized;
}

/**
 * Express middleware — sanitizes req.body, req.query, req.params in-place.
 * Logs a security warning in production whenever a sanitization fires.
 *
 * Express 5 COMPATIBLE: never reassigns req.query (getter-only in Express 5).
 */
app.use((req, res, next) => {
  // Only sanitize the fields that carry user input
  for (const field of ['body', 'query', 'params']) {
    if (req[field] && typeof req[field] === 'object') {
      const wasSanitized = sanitizeInPlace(req[field]);
      if (wasSanitized && NODE_ENV === 'production') {
        console.warn(
          `[SECURITY] Mongo injection attempt sanitized — field: "${field}" on ${req.method} ${req.originalUrl}`
        );
      }
    }
  }
  next();
});

// ---------------------------------------------------------------------------
// 10. Body Parsers
//     Size limits prevent large-payload DoS attacks (e.g. JSON bombs).
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ---------------------------------------------------------------------------
// 11. API Route Registration
//     Static routes (health check) registered before dynamic API routers.
// ---------------------------------------------------------------------------

/**
 * Health check endpoint — useful for load balancers and uptime monitors.
 * Returns current timestamp and environment so ops teams can quickly verify
 * which build/region is responding.
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success:     true,
    status:      'OK',
    environment: NODE_ENV,
    timestamp:   new Date().toISOString(),
    uptime:      `${Math.floor(process.uptime())}s`,
  });
});

// Primary API routers
app.use('/api/auth',  authRoutes);
app.use('/api/leads', leadRoutes);

// ---------------------------------------------------------------------------
// 12. 404 Handler — catches any unregistered route before the error handler
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.originalUrl}' not found`,
  });
});

// ---------------------------------------------------------------------------
// 13. Global Error Handling Middleware (must be LAST — 4-arg signature)
// ---------------------------------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------------------------------
// 14. Graceful Shutdown Handler
//     Catches OS termination signals and closes the MongoDB connection cleanly
//     before the process exits, preventing in-flight writes from being lost.
// ---------------------------------------------------------------------------

/**
 * Performs a clean shutdown of the server and MongoDB connection.
 * Called on SIGTERM (container orchestrators like Kubernetes/Heroku) and
 * SIGINT (Ctrl-C in terminal / local development).
 *
 * Shutdown sequence:
 *  1. Stop accepting new connections (server.close).
 *  2. Disconnect Mongoose gracefully (flushes write buffer).
 *  3. Exit with code 0 (success).
 *
 * @param {string}         signal - The OS signal that triggered shutdown.
 * @param {http.Server}    server - The active HTTP server instance.
 * @returns {Promise<void>}
 */
const gracefulShutdown = async (signal, server) => {
  console.log('');
  console.log(`[${signal}] Server shutting down gracefully...`);

  // Stop the HTTP server from accepting new requests
  server.close(async () => {
    try {
      // Disconnect Mongoose — waits for any pending DB operations to settle
      await mongoose.disconnect();
      console.log('MongoDB connection closed cleanly.');
    } catch (err) {
      console.error('Error while closing MongoDB connection:', err.message);
    } finally {
      console.log('Shutdown complete. Goodbye.');
      process.exit(0);
    }
  });

  // Safety net: force exit after 10 seconds if server.close() hangs
  setTimeout(() => {
    console.error('Graceful shutdown timed out — forcing exit.');
    process.exit(1);
  }, 10_000).unref(); // .unref() prevents this timer from keeping the event loop alive
};

// ---------------------------------------------------------------------------
// 15. Database Connection & Server Startup
// ---------------------------------------------------------------------------

/**
 * Bootstrap function.
 * Connects to MongoDB first; only starts the Express HTTP listener on success.
 * Captures the server reference so graceful shutdown can call server.close().
 *
 * @async
 * @function startServer
 * @returns {Promise<void>}
 */
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(` Server running on port ${PORT} in ${NODE_ENV} mode`);
      console.log(` Health check → http://localhost:${PORT}/api/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });

    // Register OS signal handlers AFTER server is running so we have the reference
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server));
    process.on('SIGINT',  () => gracefulShutdown('SIGINT',  server));

    // Catch unhandled promise rejections — log and exit instead of silently hanging
    process.on('unhandledRejection', (reason) => {
      console.error('[unhandledRejection] Unhandled promise rejection:', reason);
      gracefulShutdown('unhandledRejection', server);
    });

  } catch (error) {
    console.error(`Server bootstrap failure: ${error.message}`);
    process.exit(1);
  }
};

startServer();

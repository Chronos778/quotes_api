const rateLimit = require('express-rate-limit');

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isReadOnlyMode = process.env.READ_ONLY_MODE === 'true';
const isFreePlanMode = process.env.FREE_PLAN_MODE !== 'false';

const writeLimiter = rateLimit({
  windowMs: parsePositiveInt(process.env.WRITE_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000),
  limit: parsePositiveInt(process.env.WRITE_RATE_LIMIT_MAX, isFreePlanMode ? 20 : 60),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Write limit exceeded. Please try again later.'
  }
});

const svgLimiter = rateLimit({
  windowMs: parsePositiveInt(process.env.SVG_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  limit: parsePositiveInt(process.env.SVG_RATE_LIMIT_MAX, isFreePlanMode ? 30 : 100),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'SVG request limit exceeded. Please try again later.'
  }
});

const readOnlyGuard = (req, res, next) => {
  if (!isReadOnlyMode) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'API is running in read-only mode. Write operations are disabled.'
  });
};

module.exports = {
  isFreePlanMode,
  isReadOnlyMode,
  readOnlyGuard,
  svgLimiter,
  writeLimiter
};

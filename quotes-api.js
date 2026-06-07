require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const quotesRoutes = require('./src/routes/quotesRoutes');
const pushRoutes = require('./src/routes/pushRoutes');
const { initializeDatabase, client } = require('./src/db/database');
const { isFreePlanMode, isReadOnlyMode } = require('./src/middleware/planProtectionMiddleware');

const app = express();
const port = process.env.PORT || 3000;
const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const parseTrustProxy = (value) => {
  if (value === undefined || value === null || value === '') {
    return 1;
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  const hopCount = Number.parseInt(normalized, 10);
  if (Number.isFinite(hopCount) && hopCount >= 0) {
    return hopCount;
  }

  return 1;
};
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions = allowedOrigins.length === 0
  ? undefined
  : {
      origin(origin, callback) {
        // Allow non-browser clients and configured browser origins.
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
      }
    };

// Trust proxy is configurable for non-Vercel deployments.
app.set('trust proxy', parseTrustProxy(process.env.TRUST_PROXY));

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rate limiting
const rateLimitWindowMs = parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const defaultGlobalLimit = isFreePlanMode ? 100 : 200;
const rateLimitMax = parsePositiveInt(process.env.RATE_LIMIT_MAX, defaultGlobalLimit);

const limiter = rateLimit({
  windowMs: rateLimitWindowMs,
  limit: rateLimitMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests, please try again later.'
  }
});

// Apply rate limiting to all requests
app.use(limiter);

// Root route
app.get('/', async (req, res) => {
  try {
    const result = await client.execute('SELECT COUNT(*) as count FROM quotes');
    const count = result.rows[0].count || result.rows[0][0];

    res.json({
      message: "Welcome to the Quotes API! (Turso/LibSQL Edition)",
      endpoints: {
        "GET /quotes": "Get all quotes",
        "GET /quotes/:id": "Get a specific quote by ID",
        "GET /quotes/random": "Get a random quote",
        "GET /quotes/qod": "Get the Quote of the Day",
        "GET /quotes/search?q=query": "Search quotes by text or author",
        "GET /quotes/random/svg": "Get a random quote as SVG image",
        "GET /quotes/:id/svg": "Get a specific quote as SVG image",
        "POST /quotes": "Add a new quote (Protected - requires password)",
        "PUT /quotes/:id": "Update a quote by ID (Protected - requires password)",
        "DELETE /quotes/:id": "Delete a quote by ID (Protected - requires password)",
        "POST /push/subscribe": "Subscribe to push notifications",
        "POST /push/unsubscribe": "Unsubscribe from push notifications",
        "GET /push/vapid-public-key": "Get the VAPID public key",
        "GET /push/send-daily": "Send daily quote push notification (cron)"
      },
      svgOptions: {
        themes: ["light", "dark", "gradient", "ocean", "sunset", "forest", "purple"],
        queryParams: "?theme=dark&width=800&height=400",
        examples: [
          "/quotes/random/svg?theme=ocean",
          "/quotes/1/svg?theme=gradient&width=1200&height=600"
        ]
      },
      authentication: {
        note: "POST, PUT, and DELETE operations require authentication",
        method: "Header: api-password: your_password"
      },
      modes: {
        freePlanMode: isFreePlanMode,
        readOnlyMode: isReadOnlyMode
      },
      totalQuotes: count,
      persistence: "Turso/LibSQL"
    });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// Mount quotes routes
app.use('/quotes', quotesRoutes);
app.use('/push', pushRoutes);

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`Quotes API listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

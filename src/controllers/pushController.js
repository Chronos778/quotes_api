const webpush = require('web-push');
const { client } = require('../db/database');

// Configure web-push with VAPID keys (only if keys are set)
const vapidConfigured =
  process.env.VAPID_SUBJECT &&
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY;

if (vapidConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('⚠️  VAPID keys not configured. Push notifications will not work.');
}

// ─── POST /push/subscribe ───────────────────────────────────────────────────
exports.subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;

    // Validate subscription object
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription object. Must include endpoint and keys.',
      });
    }

    // Validate keys contain required fields
    if (!subscription.keys.p256dh || !subscription.keys.auth) {
      return res.status(400).json({
        success: false,
        error: 'Subscription keys must include p256dh and auth.',
      });
    }

    // Validate endpoint is a proper HTTPS push service URL
    try {
      const url = new URL(subscription.endpoint);
      if (url.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription endpoint URL.',
      });
    }

    // Upsert into push_subscriptions
    await client.execute({
      sql: `INSERT INTO push_subscriptions (endpoint, keys_p256dh, keys_auth, created_at, updated_at)
            VALUES (?, ?, ?, datetime('now'), datetime('now'))
            ON CONFLICT(endpoint) DO UPDATE SET
              keys_p256dh = excluded.keys_p256dh,
              keys_auth   = excluded.keys_auth,
              updated_at  = datetime('now')`,
      args: [subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth],
    });

    return res.status(201).json({ success: true, message: 'Subscription stored.' });
  } catch (error) {
    console.error('[push/subscribe]', error);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ─── POST /push/unsubscribe ─────────────────────────────────────────────────
exports.unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Missing endpoint.',
      });
    }

    const result = await client.execute({
      sql: 'DELETE FROM push_subscriptions WHERE endpoint = ?',
      args: [endpoint],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found.',
      });
    }

    return res.status(200).json({ success: true, message: 'Unsubscribed.' });
  } catch (error) {
    console.error('[push/unsubscribe]', error);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ─── GET /push/send-daily ───────────────────────────────────────────────────
exports.sendDaily = async (req, res) => {
  // Optional auth: only enforce if CRON_SECRET is set
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }
  }

  if (!vapidConfigured) {
    return res.status(503).json({
      success: false,
      error: 'VAPID keys not configured. Cannot send push notifications.',
    });
  }

  try {
    // 1. Get Quote of the Day (same logic as quotesController.getQuoteOfTheDay)
    const countResult = await client.execute('SELECT COUNT(*) as count FROM quotes');
    const count = Number(countResult.rows[0].count || countResult.rows[0][0] || 0);

    if (count === 0) {
      return res.status(500).json({
        success: false,
        error: 'No quotes available for Quote of the Day.',
      });
    }

    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const index = dayOfYear % count;

    const quoteResult = await client.execute({
      sql: 'SELECT * FROM quotes LIMIT 1 OFFSET ?',
      args: [index],
    });

    const quote = quoteResult.rows[0];
    const quoteText = quote.text || '';
    const quoteAuthor = quote.author || 'Unknown';

    // 2. Build notification payload
    const payload = JSON.stringify({
      title: 'Quote of the Day ✨',
      body:
        quoteText.length > 120
          ? quoteText.substring(0, 117) + '...'
          : quoteText,
      author: quoteAuthor,
      icon: '/assets/icons/icon-192.png',
      badge: '/assets/icons/icon-192.png',
      url: 'https://chronos778.github.io/Quote.Web/',
      tag: `qod-${today.toISOString().split('T')[0]}`,
    });

    // 3. Get all subscriptions
    const subsResult = await client.execute('SELECT * FROM push_subscriptions');
    const subscriptions = subsResult.rows;

    // 4. Send to all subscribers
    let sent = 0;
    let failed = 0;
    const expiredEndpoints = [];

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys_p256dh,
                auth: sub.keys_auth,
              },
            },
            payload
          );
          sent++;
        } catch (error) {
          failed++;
          // 410 Gone or 404 = subscription expired, mark for cleanup
          if (error.statusCode === 410 || error.statusCode === 404) {
            expiredEndpoints.push(sub.endpoint);
          }
          console.error(
            `[push/send-daily] Failed for ${sub.endpoint}:`,
            error.statusCode || error.message
          );
        }
      })
    );

    // 5. Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      const placeholders = expiredEndpoints.map(() => '?').join(', ');
      await client.execute({
        sql: `DELETE FROM push_subscriptions WHERE endpoint IN (${placeholders})`,
        args: expiredEndpoints,
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        total: subscriptions.length,
        sent,
        failed,
        expired_cleaned: expiredEndpoints.length,
      },
    });
  } catch (error) {
    console.error('[push/send-daily]', error);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ─── GET /push/vapid-public-key ─────────────────────────────────────────────
// Public endpoint so the client can fetch the VAPID public key dynamically
exports.getVapidPublicKey = async (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(503).json({
      success: false,
      error: 'VAPID public key not configured.',
    });
  }

  return res.status(200).json({ success: true, publicKey });
};

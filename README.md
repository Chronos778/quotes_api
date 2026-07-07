# Quotes API

A robust REST API serving **10,000+ inspirational and educational quotes** from history's greatest minds. Powered by **Turso/LibSQL** for reliable cloud persistence with **daily push notifications** support.

**Live API:** [https://quotes-api-ruddy.vercel.app](https://quotes-api-ruddy.vercel.app)

---

## Features

- **Turso/LibSQL Persistence** — Cloud-hosted SQLite for reliable data storage.
- **Push Notifications** — Daily "Quote of the Day" push notifications via Web Push API.
- **Advanced Search** — Find quotes by text or author.
- **Quote of the Day** — Deterministic daily quote endpoint.
- **SVG Quote Generation** — Beautiful quote images with 7 themes (light, dark, gradient, ocean, sunset, forest, purple).
- **Rate Limiting** — Fair usage policy (100 requests / 15 min).
- **Pagination & Filtering** — Scalable `GET /quotes` with page, limit, author, search, and sorting.
- **Free Plan Protection** — Optional read-only mode + stricter write/SVG throttling.
- **10,000+ Curated Quotes** — Philosophy, Science, Leadership, Education & more.
- **Secure API** — Password-protected modifications (POST, PUT, DELETE).
- **MVC Architecture** — Clean code structure with separate Routes, Controllers, and Utils.

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Chronos778/Quotes_api.git
    cd Quotes_api
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Configure Environment:**
    Create a `.env` file in the root directory (see `.env.example`):

    ```env
    PORT=3000
    API_PASSWORD=your_secure_password
    TURSO_DATABASE_URL=libsql://your-database.turso.io
    TURSO_AUTH_TOKEN=your-auth-token

    # Push Notifications (generate with: npx web-push generate-vapid-keys)
    VAPID_PUBLIC_KEY=your-vapid-public-key
    VAPID_PRIVATE_KEY=your-vapid-private-key
    VAPID_SUBJECT=mailto:your-email@example.com

    # Optional
    CORS_ORIGINS=https://your-frontend.vercel.app
    CRON_SECRET=
    ```

4. **Start the Server:**

    ```bash
    npm start
    ```

    *The database tables will be automatically created and seeded on the first run.*

---

## API Documentation

### Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP.
- **Headers:** `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`.
- **Free Plan Defaults:** Global `100` requests / 15 min, Writes (`POST`, `PUT`, `DELETE`) `20` requests / hour, SVG endpoints `30` requests / 15 min.

### Public Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API info, total quotes, available endpoints |
| `GET` | `/health` | Liveness health check |
| `GET` | `/quotes` | Get quotes (paginated/filterable) |
| `GET` | `/quotes/:id` | Get a specific quote by ID |
| `GET` | `/quotes/random` | Get a random quote |
| `GET` | `/quotes/qod` | Get the Quote of the Day |
| `GET` | `/quotes/search?q=query` | Search quotes by text or author |
| `GET` | `/quotes/:id/svg` | Get quote as SVG image |
| `GET` | `/quotes/random/svg` | Get random quote as SVG |

#### GET /quotes Query Parameters

- `page` (default: `1`) — Page number.
- `limit` (default: `20`, max from `MAX_QUOTES_LIMIT`) — Items per page.
- `author` — Filter by author (partial match).
- `q` — Search in quote text and author.
- `sort` — One of `id`, `author`, `text`.
- `order` — `asc` or `desc`.

Example:

```http
GET /quotes?page=2&limit=20&author=einstein&sort=id&order=desc
```

### Protected Endpoints

> **Note:** These endpoints require the `api-password` header. If `READ_ONLY_MODE=true`, all protected endpoints return `403`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/quotes` | Add a new quote |
| `PUT` | `/quotes/:id` | Update an existing quote |
| `DELETE` | `/quotes/:id` | Delete a quote |

**Header Example:**

```json
{
  "api-password": "your_secure_password"
}
```

---

### Push Notification Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/push/subscribe` | Store a browser push subscription |
| `POST` | `/push/unsubscribe` | Remove a push subscription |
| `GET` | `/push/vapid-public-key` | Get the VAPID public key for client-side use |
| `GET` | `/push/send-daily` | Send Quote of the Day to all subscribers (cron) |

#### POST /push/subscribe

```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BNcRdre...",
      "auth": "tBHItJc..."
    }
  }
}
```

The `subscription` object is exactly what the browser's `PushManager.subscribe()` returns — send it as-is.

#### POST /push/unsubscribe

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

#### GET /push/send-daily

Triggered automatically by a cron job at **8:00 AM IST** daily. Fetches the Quote of the Day, sends a push notification to all stored subscriptions, and cleans up expired ones.

If `CRON_SECRET` is set, this endpoint requires an `Authorization: Bearer <CRON_SECRET>` header.

**Notification payload sent to browsers:**

```json
{
  "title": "Quote of the Day ✨",
  "body": "The only way to do great work is to love what you do.",
  "author": "Steve Jobs",
  "icon": "/assets/icons/icon-192.png",
  "badge": "/assets/icons/icon-192.png",
  "url": "https://chronos778.github.io/Quote.Web/",
  "tag": "qod-2026-06-07"
}
```

---

## Push Notification Setup

### 1. Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

### 2. Set Environment Variables

Add to Vercel (Settings → Environment Variables) and your local `.env`:

| Variable | Description |
| :--- | :--- |
| `VAPID_PUBLIC_KEY` | Your generated public key |
| `VAPID_PRIVATE_KEY` | Your generated private key (keep secret!) |
| `VAPID_SUBJECT` | `mailto:your-email@example.com` |
| `CRON_SECRET` | (Optional) Secret to protect the send-daily endpoint |

### 3. Set Up Daily Cron

Using [cron-job.org](https://cron-job.org) (free) or similar service, schedule a daily GET request to:

```
https://quotes-api-ruddy.vercel.app/push/send-daily
```

Set the time to **8:00 AM IST** (2:30 AM UTC).

---

## Project Structure

```text
quotes-api/
├── src/
│   ├── controllers/
│   │   ├── quotesController.js   # Quotes CRUD logic
│   │   └── pushController.js     # Push notification handlers
│   ├── db/
│   │   └── database.js           # Turso/LibSQL connection & schema
│   ├── middleware/
│   │   ├── authMiddleware.js     # API password authentication
│   │   └── planProtectionMiddleware.js  # Free plan guards
│   ├── routes/
│   │   ├── quotesRoutes.js       # /quotes route definitions
│   │   └── pushRoutes.js         # /push route definitions
│   └── utils/
│       └── svgGenerator.js       # SVG quote image generator
├── quotes-api.js                 # Express entry point
├── quotes-data.js                # 10,000+ seed quotes
├── vercel.json                   # Vercel config + cron schedule
├── .env.example                  # Environment variable template
└── package.json
```

---

## Deployment

This API is deployed on **Vercel** with **Turso (LibSQL)** for cloud persistence.

### To Deploy on Vercel

1. **Sign up** at [Turso.tech](https://turso.tech).
2. **Create a database** and get the `Database URL` and `Auth Token`.
3. **Add Environment Variables** in Vercel:
    - `TURSO_DATABASE_URL` — `libsql://your-db.turso.io`
    - `TURSO_AUTH_TOKEN` — your auth token
    - `VAPID_PUBLIC_KEY` — your VAPID public key
    - `VAPID_PRIVATE_KEY` — your VAPID private key
    - `VAPID_SUBJECT` — `mailto:your-email@example.com`

Without Turso variables, the API falls back to a local `quotes.db` file (New changes won't show on vercel).

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** Turso / LibSQL (cloud SQLite)
- **Push Notifications:** web-push (VAPID / Web Push Protocol)
- **Hosting:** Vercel (Serverless)
- **Cron:** cron-job.org

## License

This project is open source and available under the [MIT License](LICENSE).

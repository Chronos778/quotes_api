# Quotes API

A robust REST API serving **10,000+ inspirational and educational quotes** from history's greatest minds. Now powered by **SQLite** for reliable data persistence.

**Live API:** [https://quotes-api-ruddy.vercel.app](https://quotes-api-ruddy.vercel.app)

---

## Features

- **SQLite Persistence** - All data is stored in a `quotes.db` file (no more data loss on restart!).
- **Advanced Search** - Find quotes by text or author.
- **Quote of the Day** - specific endpoint for a daily quote.
- **SVG Quote Generation** - Beautiful quote images with 7 themes (light, dark, gradient, etc.).
- **Rate Limiting** - Fair usage policy (100 requests / 15 min).
- **10,000+ Curated Quotes** - Philosophy, Science, Leadership, Education & more.
- **Secure API** - Password-protected modifications (POST, PUT, DELETE).
- **MVC Architecture** - Clean Code structure with separate Routes, Controllers, and Utils.

---

## Getting Started

### Prerequisites

- Node.js (v14 or higher)

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/quotes-api.git
    cd quotes-api
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Configure Environment:**
    Create a `.env` file in the root directory:

    ```env
    PORT=3000
    API_PASSWORD=your_secure_password
    ```

4. **Start the Server:**

    ```bash
    npm start
    ```

    *The database (`quotes.db`) will be automatically created and seeded on the first run.*

---

## API Documentation

### Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP.
- **Headers:** `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`.

### Public Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/quotes` | Get all quotes |
| `GET` | `/quotes/:id` | Get a specific quote by ID |
| `GET` | `/quotes/random` | Get a random quote |
| `GET` | `/quotes/qod` | **NEW** Get the Quote of the Day |
| `GET` | `/quotes/search?q=query` | **NEW** Search quotes by text or author |
| `GET` | `/quotes/:id/svg` | Get quote as SVG image |
| `GET` | `/quotes/random/svg` | Get random quote as SVG |

### Protected Endpoints

**Note:** These endpoints require the `api-password` header.

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

## Project Structure

```text
quotes-api/
├── src/
│   ├── controllers/  # Business logic (Quotes CRUD)
│   ├── db/           # Database connection & init
│   ├── routes/       # API Route definitions
│   └── utils/        # Helper functions (SVG Generator)
├── quotes.db         # SQLite Database (Created on start)
├── quotes-api.js     # Entry point
└── ...
```

## Deployment Note

This API is configured to use **Turso (LibSQL)** for cloud persistence.

### To Deploy on Vercel with Persistence

1. **Sign up** at [Turso.tech](https://turso.tech).
2. **Create a database** and get the `Database URL` and `Auth Token`.
3. **Add Environment Variables** in Vercel:
    - `TURSO_DATABASE_URL`: `libsql://your-db.turso.io`
    - `TURSO_AUTH_TOKEN`: `your-auth-token`

Without these variables, the API will try to use a local `quotes.db` file, which **will not persist data** on Vercel.

## License

This project is open source and available under the [MIT License](LICENSE).

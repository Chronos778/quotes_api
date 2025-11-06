# Quotes API

A REST API with 2000 inspirational quotes from famous personalities.

## Endpoints

### Public Endpoints (No Authentication Required)
- `GET /` - API documentation
- `GET /quotes` - Get all quotes
- `GET /quotes/random` - Get a random quote
- `GET /quotes/:id` - Get a specific quote by ID

### Protected Endpoints (Authentication Required 🔒)
- `POST /quotes` - Add a new quote
- `PUT /quotes/:id` - Update a quote
- `DELETE /quotes/:id` - Delete a quote

## Authentication

POST, PUT, and DELETE operations require a password via header:

```bash
curl -X POST https://your-api.vercel.app/quotes \
  -H "Content-Type: application/json" \
  -H "x-api-password: your_secret_password_123" \
  -d '{"text": "New quote", "author": "Author Name"}'
```

## Local Development

```bash
npm install
npm start
```

The API will run on `http://localhost:3000`

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
API_PASSWORD=your_secret_password_123
```

On Vercel, set this as an environment variable in your project settings.

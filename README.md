# 📜 Quotes API

A REST API serving 5000 inspirational and educational quotes from history's greatest minds. Built with Express.js and deployed on Vercel.

**Live API:** https://quotes-api-ruddy.vercel.app

## 📚 Quote Categories

Our collection spans diverse areas of wisdom and knowledge:
- **Philosophy & Wisdom** - Ancient and modern philosophical insights
- **Leadership & Success** - Principles from business and military leaders
- **Science & Innovation** - Wisdom from scientists and inventors
- **Personal Growth** - Character development and self-mastery
- **Resilience & Perseverance** - Overcoming adversity and challenges
- **Education & Learning** - Knowledge acquisition and intellectual growth

---

## 🚀 Quick Start

### Local Development

1. **Clone and install dependencies:**
   ```powershell
   git clone https://github.com/Chronos778/Quotes_api.git
   cd Quotes_api
   npm install
   ```

2. **Set up environment variables:**
   ```powershell
   cp .env.example .env
   ```
   Edit `.env` and set your `API_PASSWORD`

3. **Start the server:**
   ```powershell
   npm start
   ```
   API runs at `http://localhost:3000`

---

## 📖 API Endpoints

### Public Endpoints (No Auth Required)

#### Get All Quotes
```powershell
# PowerShell
Invoke-RestMethod -Uri "https://quotes-api-ruddy.vercel.app/quotes" -Method GET

# curl
curl https://quotes-api-ruddy.vercel.app/quotes
```

#### Get Random Quote
```powershell
# PowerShell
Invoke-RestMethod -Uri "https://quotes-api-ruddy.vercel.app/quotes/random" -Method GET

# curl
curl https://quotes-api-ruddy.vercel.app/quotes/random
```

#### Get Quote by ID
```powershell
# PowerShell
Invoke-RestMethod -Uri "https://quotes-api-ruddy.vercel.app/quotes/42" -Method GET

# curl
curl https://quotes-api-ruddy.vercel.app/quotes/42
```

---

### Protected Endpoints (🔒 Auth Required)

All POST, PUT, DELETE operations require `api-password` header.

#### Add New Quote
```powershell
# PowerShell
$headers = @{
    "Content-Type" = "application/json"
    "api-password" = "YOUR_API_PASSWORD"
}
$body = @{
    text = "The only way to do great work is to love what you do."
    author = "Steve Jobs"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://quotes-api-ruddy.vercel.app/quotes" `
    -Method POST -Headers $headers -Body $body

# curl
curl -X POST https://quotes-api-ruddy.vercel.app/quotes \
  -H "Content-Type: application/json" \
  -H "api-password: YOUR_API_PASSWORD" \
  -d '{"text": "The only way to do great work is to love what you do.", "author": "Steve Jobs"}'
```

**Response (201):**
```json
{
  "success": true,
  "message": "Quote added successfully",
  "data": {
    "id": 2001,
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs"
  }
}
```

#### Update Quote
```powershell
# PowerShell
$headers = @{
    "Content-Type" = "application/json"
    "api-password" = "YOUR_API_PASSWORD"
}
$body = @{
    text = "Updated quote text"
    author = "Updated Author"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://quotes-api-ruddy.vercel.app/quotes/1" `
    -Method PUT -Headers $headers -Body $body

# curl
curl -X PUT https://quotes-api-ruddy.vercel.app/quotes/1 \
  -H "Content-Type: application/json" \
  -H "api-password: YOUR_API_PASSWORD" \
  -d '{"text": "Updated quote text", "author": "Updated Author"}'
```

#### Delete Quote
```powershell
# PowerShell
$headers = @{ "api-password" = "YOUR_API_PASSWORD" }
Invoke-RestMethod -Uri "https://quotes-api-ruddy.vercel.app/quotes/1" `
    -Method DELETE -Headers $headers

# curl
curl -X DELETE https://quotes-api-ruddy.vercel.app/quotes/1 \
  -H "api-password: YOUR_API_PASSWORD"
```

---

## 🔐 Authentication & Security

### Environment Variables

**Never commit secrets to GitHub!** The password is stored in `.env` (already in `.gitignore`).

1. Copy `.env.example` to `.env`:
   ```powershell
   cp .env.example .env
   ```

2. Update your password in `.env`:
   ```bash
   API_PASSWORD=your_strong_password_here
   ```

3. On Vercel, add environment variable:
   - Go to Project Settings → Environment Variables
   - Add `API_PASSWORD` with your secure password
   - Redeploy for changes to take effect

### Password Requirements
- Sent via `api-password` header (NOT in URL or body)
- Required for: POST, PUT, DELETE
- Not required for: GET endpoints
- Returns 401 if missing, 403 if incorrect

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Quote added successfully",
  "data": { "id": 1, "text": "...", "author": "..." }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Authentication required. Please provide password in api-password header."
}
```

### Status Codes
- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (missing fields)
- `401` - Unauthorized (no password)
- `403` - Forbidden (wrong password)
- `404` - Not Found (quote doesn't exist)

---

## 🚢 Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Deploy:**
   ```powershell
   vercel
   ```

3. **Set environment variable:**
   ```powershell
   vercel env add API_PASSWORD
   ```
   Enter your password when prompted.

4. **Redeploy:**
   ```powershell
   vercel --prod
   ```

---

## 📝 Data Storage

⚠️ **Note:** Quotes are stored in-memory. New quotes (ID 2001+) reset when server restarts. The original 2000 quotes persist.

For production persistence, consider:
- SQLite database
- PostgreSQL
- MongoDB

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Hosting:** Vercel
- **Data:** In-memory (2000 quotes)

---

## 📄 License

MIT License - Feel free to use this API in your projects!

---

## 🤝 Contributing

Pull requests welcome! Please open an issue first to discuss changes.

---

## 🔗 Links

- **Live API:** https://quotes-api-ruddy.vercel.app
- **GitHub:** https://github.com/Chronos778/Quotes_api

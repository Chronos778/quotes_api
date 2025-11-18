# 📜 Quotes API

A REST API serving **10,000 inspirational and educational quotes** from history's greatest minds. Built with Express.js and deployed on Vercel.

**🌐 Live API:** [https://quotes-api-ruddy.vercel.app](https://quotes-api-ruddy.vercel.app)

---

## ✨ Features

- 🎨 **SVG Quote Generation** - Beautiful quote images with 7 themes
- 📚 **10,000 Curated Quotes** - Philosophy, Science, Leadership, Education & more
- 🔒 **Secure API** - Password-protected modifications
- ⚡ **Fast & Serverless** - Deployed on Vercel
- 🆓 **Free to Use** - Public endpoints, no API key required

---

## 📚 Quote Categories

Our collection spans diverse areas of wisdom and knowledge:

- **Philosophy & Wisdom** (1000 quotes) - Ancient and modern philosophical insights from Socrates, Plato, Aristotle, Confucius, Buddha, Marcus Aurelius
- **Leadership & Success** (1000 quotes) - Principles from Churchill, Lincoln, Steve Jobs, Bill Gates, Warren Buffett
- **Science & Innovation** (1000 quotes) - Wisdom from Einstein, Tesla, Sagan, Hawking, Feynman
- **Personal Growth** (1000 quotes) - Character development and self-mastery from Stoic philosophers
- **Resilience & Perseverance** (1000 quotes) - Overcoming adversity from Edison, Maya Angelou, MLK Jr.
- **Education & Learning** (1000 quotes) - Knowledge and intellectual growth from Malala, Maria Montessori
- **Motivation & Inspiration** (4000 quotes) - Classic motivational quotes

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

### 🌍 Public Endpoints (No Auth Required)

#### Get All Quotes

```powershell
# PowerShell
Invoke-RestMethod -Uri "https://quotes-api-ruddy.vercel.app/quotes" -Method GET

# curl
curl https://quotes-api-ruddy.vercel.app/quotes
```

**Response:**
```json
{
  "success": true,
  "count": 10000,
  "data": [...]
}
```

---

#### Get Random Quote

```powershell
# PowerShell
Invoke-RestMethod -Uri "https://quotes-api-ruddy.vercel.app/quotes/random" -Method GET

# curl
curl https://quotes-api-ruddy.vercel.app/quotes/random
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "text": "The only true wisdom is in knowing you know nothing.",
    "author": "Socrates"
  }
}
```

---

#### Get Quote by ID

```powershell
# PowerShell
Invoke-RestMethod -Uri "https://quotes-api-ruddy.vercel.app/quotes/42" -Method GET

# curl
curl https://quotes-api-ruddy.vercel.app/quotes/42
```

---

### 🎨 SVG Quote Images

Generate beautiful quote images as SVG! Perfect for social media, websites, or embedding in documentation.

#### Get Random Quote as SVG

```html
<!-- Embed in HTML -->
<img src="https://quotes-api-ruddy.vercel.app/quotes/random/svg?theme=ocean" alt="Random Quote">

<!-- Markdown (GitHub README) -->
![Quote](https://quotes-api-ruddy.vercel.app/quotes/random/svg?theme=gradient)
```

```powershell
# PowerShell - Open in browser
Start-Process "https://quotes-api-ruddy.vercel.app/quotes/random/svg?theme=ocean"

# curl - Save to file
curl https://quotes-api-ruddy.vercel.app/quotes/random/svg?theme=gradient -o quote.svg
```

---

#### Get Specific Quote as SVG

```powershell
# Get quote #100 as SVG with forest theme
curl https://quotes-api-ruddy.vercel.app/quotes/100/svg?theme=forest -o quote100.svg
```

---

#### 🎨 Available Themes

| Theme | Description | Preview Link |
|-------|-------------|--------------|
| `light` | Clean white background | [Try it](https://quotes-api-ruddy.vercel.app/quotes/random/svg?theme=light) |
| `dark` | Dark elegant theme | [Try it](https://quotes-api-ruddy.vercel.app/quotes/random/svg?theme=dark) |
| `gradient` | Purple gradient background | [Try it](https://quotes-api-ruddy.vercel.app/quotes/random/svg?theme=gradient) |
| `ocean` | Ocean blue theme | [Try it](https://quotes-api-ruddy.vercel.app/quotes/random/svg?theme=ocean) |
| `sunset` | Warm sunset colors | [Try it](https://quotes-api-ruddy.vercel.app/quotes/random/svg?theme=sunset) |
| `forest` | Forest green theme | [Try it](https://quotes-api-ruddy.vercel.app/quotes/random/svg?theme=forest) |
| `purple` | Purple and rose theme | [Try it](https://quotes-api-ruddy.vercel.app/quotes/random/svg?theme=purple) |

---

#### ⚙️ SVG Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `theme` | string | `light` | Color theme (see table above) |
| `width` | number | `800` | Image width in pixels |
| `height` | number | `400` | Image height in pixels |

**Example URLs:**
```
https://quotes-api-ruddy.vercel.app/quotes/random/svg
https://quotes-api-ruddy.vercel.app/quotes/random/svg?theme=dark
https://quotes-api-ruddy.vercel.app/quotes/random/svg?theme=sunset&width=1200&height=600
https://quotes-api-ruddy.vercel.app/quotes/1/svg?theme=ocean&width=1000
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
    "id": 10001,
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

⚠️ **Note:** Quotes are stored in-memory. 

- **Original 10,000 quotes** - Persist across restarts
- **User-added quotes** (ID 10001+) - Reset when server restarts

For production persistence of new quotes, consider:
- SQLite database
- PostgreSQL
- MongoDB

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 14+
- **Framework:** Express.js 5.1
- **Hosting:** Vercel (Serverless)
- **Environment:** dotenv 17.2
- **Data:** 10,000 in-memory quotes

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

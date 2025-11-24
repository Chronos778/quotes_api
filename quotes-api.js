require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Password for modifying quotes (POST, PUT, DELETE)
// IMPORTANT: Set API_PASSWORD environment variable in production
const API_PASSWORD = process.env.API_PASSWORD;

if (!API_PASSWORD) {
  console.warn('⚠️  WARNING: API_PASSWORD environment variable not set!');
  console.warn('⚠️  Protected endpoints will not work properly.');
}

// Authentication middleware
const authenticate = (req, res, next) => {
  const password = req.headers['api-password'];
  
  if (!password) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required. Please provide password in api-password header.' 
    });
  }
  
  if (password !== API_PASSWORD) {
    return res.status(403).json({ 
      success: false,
      error: 'Invalid password. Access denied.' 
    });
  }
  
  next();
};

// In-memory quotes storage
const quotes = require('./quotes-data');

// Root route
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to the Quotes API!",
    endpoints: {
      "GET /quotes": "Get all quotes",
      "GET /quotes/:id": "Get a specific quote by ID",
      "GET /quotes/random": "Get a random quote",
      "GET /quotes/random/svg": "Get a random quote as SVG image",
      "GET /quotes/:id/svg": "Get a specific quote as SVG image",
      "POST /quotes": "Add a new quote (Protected - requires password)",
      "PUT /quotes/:id": "Update a quote by ID (Protected - requires password)",
      "DELETE /quotes/:id": "Delete a quote by ID (Protected - requires password)"
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
    totalQuotes: quotes.length
  });
});

// Get all quotes
app.get('/quotes', (req, res) => {
  res.json({
    success: true,
    count: quotes.length,
    data: quotes
  });
});

// Get a random quote
app.get('/quotes/random', (req, res) => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({
    success: true,
    data: randomQuote
  });
});

// Get a single quote by id
app.get('/quotes/:id', (req, res) => {
  const quote = quotes.find(q => q.id === parseInt(req.params.id));
  if (quote) {
    res.json({
      success: true,
      data: quote
    });
  } else {
    res.status(404).json({ 
      success: false,
      error: 'Quote not found' 
    });
  }
});

// Add a new quote (Protected - requires password)
app.post('/quotes', authenticate, (req, res) => {
  const { text, author } = req.body;
  if (!text) {
    return res.status(400).json({ 
      success: false,
      error: 'Text is required' 
    });
  }
  const newQuote = { 
    id: quotes.length > 0 ? Math.max(...quotes.map(q => q.id)) + 1 : 1, 
    text,
    author: author || 'Unknown'
  };
  quotes.push(newQuote);
  res.status(201).json({
    success: true,
    message: 'Quote added successfully',
    data: newQuote
  });
});

// Update a quote (Protected - requires password)
app.put('/quotes/:id', authenticate, (req, res) => {
  const { text, author } = req.body;
  const quote = quotes.find(q => q.id === parseInt(req.params.id));
  if (!quote) {
    return res.status(404).json({ 
      success: false,
      error: 'Quote not found' 
    });
  }
  if (!text) {
    return res.status(400).json({ 
      success: false,
      error: 'Text is required' 
    });
  }
  quote.text = text;
  if (author) quote.author = author;
  res.json({
    success: true,
    message: 'Quote updated successfully',
    data: quote
  });
});

// Delete a quote (Protected - requires password)
app.delete('/quotes/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const index = quotes.findIndex(q => q.id === id);
  if (index === -1) {
    return res.status(404).json({ 
      success: false,
      error: 'Quote not found' 
    });
  }
  const deletedQuote = quotes.splice(index, 1)[0];
  res.json({
    success: true,
    message: 'Quote deleted successfully',
    data: deletedQuote
  });
});

// Helper function to wrap text for SVG
function wrapText(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    // Approximate character width (adjust based on font)
    if (testLine.length * 12 < maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Escape XML special characters
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Get random quote as SVG
app.get('/quotes/random/svg', (req, res) => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const width = parseInt(req.query.width) || 800;
  const height = parseInt(req.query.height) || 400;
  const theme = req.query.theme || 'light'; // light, dark, gradient
  
  // Theme colors
  const themes = {
    light: { bg: '#ffffff', text: '#2c3e50', author: '#7f8c8d', accent: '#3498db' },
    dark: { bg: '#2c3e50', text: '#ecf0f1', author: '#95a5a6', accent: '#3498db' },
    gradient: { bg: 'url(#gradient)', text: '#ffffff', author: '#ecf0f1', accent: '#ffffff' },
    ocean: { bg: '#006994', text: '#ffffff', author: '#e0f2f7', accent: '#4fc3f7' },
    sunset: { bg: '#ff6b6b', text: '#ffffff', author: '#ffe66d', accent: '#ffd93d' },
    forest: { bg: '#2d6a4f', text: '#ffffff', author: '#d8f3dc', accent: '#95d5b2' },
    purple: { bg: '#6a4c93', text: '#ffffff', author: '#c9ada7', accent: '#d4a5a5' }
  };
  
  const colors = themes[theme] || themes.light;
  
  // Wrap text for better display
  const textLines = wrapText(randomQuote.text, width - 100);
  const lineHeight = 35;
  const textBlockHeight = textLines.length * lineHeight;
  const startY = (height - textBlockHeight - 60) / 2 + 40;
  
  // Escape text for XML
  const escapedAuthor = escapeXml(randomQuote.author);
  
  // Generate SVG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${colors.bg}" rx="10"/>
  
  <!-- Decorative quote marks -->
  <text x="50" y="60" font-family="Georgia, serif" font-size="60" fill="${colors.accent}" opacity="0.3">"</text>
  
  <!-- Quote text -->
  <text font-family="Georgia, serif" font-size="24" fill="${colors.text}" text-anchor="middle">
    ${textLines.map((line, i) => `<tspan x="${width/2}" y="${startY + (i * lineHeight)}">${escapeXml(line)}</tspan>`).join('\n    ')}
  </text>
  
  <!-- Author -->
  <text x="${width/2}" y="${startY + textBlockHeight + 40}" font-family="Georgia, serif" font-size="20" fill="${colors.author}" text-anchor="middle" font-style="italic">
    — ${escapedAuthor}
  </text>
  
  <!-- Decorative line -->
  <line x1="${width/2 - 100}" y1="${startY + textBlockHeight + 15}" x2="${width/2 + 100}" y2="${startY + textBlockHeight + 15}" stroke="${colors.accent}" stroke-width="2" opacity="0.5"/>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(svg);
});

// Get specific quote by ID as SVG
app.get('/quotes/:id/svg', (req, res) => {
  const quote = quotes.find(q => q.id === parseInt(req.params.id));
  
  if (!quote) {
    return res.status(404).json({ 
      success: false,
      error: 'Quote not found' 
    });
  }
  
  const width = parseInt(req.query.width) || 800;
  const height = parseInt(req.query.height) || 400;
  const theme = req.query.theme || 'light';
  
  // Theme colors
  const themes = {
    light: { bg: '#ffffff', text: '#2c3e50', author: '#7f8c8d', accent: '#3498db' },
    dark: { bg: '#2c3e50', text: '#ecf0f1', author: '#95a5a6', accent: '#3498db' },
    gradient: { bg: 'url(#gradient)', text: '#ffffff', author: '#ecf0f1', accent: '#ffffff' },
    ocean: { bg: '#006994', text: '#ffffff', author: '#e0f2f7', accent: '#4fc3f7' },
    sunset: { bg: '#ff6b6b', text: '#ffffff', author: '#ffe66d', accent: '#ffd93d' },
    forest: { bg: '#2d6a4f', text: '#ffffff', author: '#d8f3dc', accent: '#95d5b2' },
    purple: { bg: '#6a4c93', text: '#ffffff', author: '#c9ada7', accent: '#d4a5a5' }
  };
  
  const colors = themes[theme] || themes.light;
  
  // Wrap text for better display
  const textLines = wrapText(quote.text, width - 100);
  const lineHeight = 35;
  const textBlockHeight = textLines.length * lineHeight;
  const startY = (height - textBlockHeight - 60) / 2 + 40;
  
  // Escape text for XML
  const escapedAuthor = escapeXml(quote.author);
  
  // Generate SVG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${colors.bg}" rx="10"/>
  
  <!-- Decorative quote marks -->
  <text x="50" y="60" font-family="Georgia, serif" font-size="60" fill="${colors.accent}" opacity="0.3">"</text>
  
  <!-- Quote text -->
  <text font-family="Georgia, serif" font-size="24" fill="${colors.text}" text-anchor="middle">
    ${textLines.map((line, i) => `<tspan x="${width/2}" y="${startY + (i * lineHeight)}">${escapeXml(line)}</tspan>`).join('\n    ')}
  </text>
  
  <!-- Author -->
  <text x="${width/2}" y="${startY + textBlockHeight + 40}" font-family="Georgia, serif" font-size="20" fill="${colors.author}" text-anchor="middle" font-style="italic">
    — ${escapedAuthor}
  </text>
  
  <!-- Decorative line -->
  <line x1="${width/2 - 100}" y1="${startY + textBlockHeight + 15}" x2="${width/2 + 100}" y2="${startY + textBlockHeight + 15}" stroke="${colors.accent}" stroke-width="2" opacity="0.5"/>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.send(svg);
});

app.listen(port, () => {
  console.log(`Quotes API listening at http://localhost:${port}`);
});

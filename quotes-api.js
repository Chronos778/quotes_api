require('dotenv').config();
const express = require('express');
const cors = require('cors');
const quotesRoutes = require('./src/routes/quotesRoutes');
const { initializeDatabase, client } = require('./src/db/database');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
      totalQuotes: count,
      persistence: "Turso/LibSQL"
    });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// Mount quotes routes
app.use('/quotes', quotesRoutes);

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

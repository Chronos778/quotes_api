const { createClient } = require('@libsql/client');
const initialQuotes = require('../../quotes-data');
require('dotenv').config();

const url = process.env.TURSO_DATABASE_URL || 'file:quotes.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

async function initializeDatabase() {
  try {
    // Initialize schema
    await client.execute(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        author TEXT DEFAULT 'Unknown'
      )
    `);

    // Seed database if empty
    const result = await client.execute('SELECT COUNT(*) as count FROM quotes');
    const count = result.rows[0].count || result.rows[0][0]; // Handle different result formats

    if (count === 0) {
      console.log('Seeding database with initial quotes...');

      // Batch insert for performance
      const batchSize = 50; // Insert in chunks to avoid query length limits
      for (let i = 0; i < initialQuotes.length; i += batchSize) {
        const batch = initialQuotes.slice(i, i + batchSize);
        const placeholders = batch.map(() => '(?, ?)').join(', ');
        const args = batch.flatMap(q => [q.text, q.author || 'Unknown']);

        await client.execute({
          sql: `INSERT INTO quotes (text, author) VALUES ${placeholders}`,
          args: args
        });
      }

      console.log(`Seeded ${initialQuotes.length} quotes.`);
    } else {
      console.log('Database already contains data, skipping seed.');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

module.exports = { client, initializeDatabase };

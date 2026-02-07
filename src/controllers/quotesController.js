const { client } = require('../db/database');
const { generateSvg } = require('../utils/svgGenerator');

// Get all quotes
exports.getQuotes = async (req, res) => {
    try {
        const result = await client.execute('SELECT * FROM quotes');
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get a random quote
exports.getRandomQuote = async (req, res) => {
    try {
        const result = await client.execute('SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1');
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get a single quote by id
exports.getQuoteById = async (req, res) => {
    try {
        const result = await client.execute({
            sql: 'SELECT * FROM quotes WHERE id = ?',
            args: [req.params.id]
        });

        if (result.rows.length > 0) {
            res.json({
                success: true,
                data: result.rows[0]
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Quote not found'
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Add a new quote
exports.createQuote = async (req, res) => {
    const { text, author } = req.body;
    if (!text) {
        return res.status(400).json({
            success: false,
            error: 'Text is required'
        });
    }

    try {
        const result = await client.execute({
            sql: 'INSERT INTO quotes (text, author) VALUES (?, ?)',
            args: [text, author || 'Unknown']
        });

        res.status(201).json({
            success: true,
            message: 'Quote added successfully',
            data: {
                id: Number(result.lastInsertRowid), // LibSQL returns bigint
                text,
                author: author || 'Unknown'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update a quote
exports.updateQuote = async (req, res) => {
    const { text, author } = req.body;
    const id = req.params.id;

    if (!text) {
        return res.status(400).json({
            success: false,
            error: 'Text is required'
        });
    }

    try {
        // Check if quote exists
        const check = await client.execute({
            sql: 'SELECT * FROM quotes WHERE id = ?',
            args: [id]
        });

        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Quote not found' });
        }

        const existingQuote = check.rows[0];
        const newAuthor = author || existingQuote.author;

        await client.execute({
            sql: 'UPDATE quotes SET text = ?, author = ? WHERE id = ?',
            args: [text, newAuthor, id]
        });

        res.json({
            success: true,
            message: 'Quote updated successfully',
            data: { id: parseInt(id), text, author: newAuthor }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete a quote
exports.deleteQuote = async (req, res) => {
    const id = req.params.id;
    try {
        const check = await client.execute({
            sql: 'SELECT * FROM quotes WHERE id = ?',
            args: [id]
        });

        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Quote not found' });
        }

        await client.execute({
            sql: 'DELETE FROM quotes WHERE id = ?',
            args: [id]
        });

        res.json({
            success: true,
            message: 'Quote deleted successfully',
            data: check.rows[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get random quote as SVG
exports.getRandomQuoteSvg = async (req, res) => {
    try {
        const result = await client.execute('SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1');
        const svg = generateSvg(result.rows[0], req.query);

        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(svg);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating SVG');
    }
};

// Get specific quote as SVG
exports.getQuoteSvg = async (req, res) => {
    try {
        const result = await client.execute({
            sql: 'SELECT * FROM quotes WHERE id = ?',
            args: [req.params.id]
        });

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Quote not found'
            });
        }

        const svg = generateSvg(result.rows[0], req.query);

        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        res.send(svg);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating SVG');
    }
};

// Search quotes
exports.searchQuotes = async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({
            success: false,
            error: 'Query parameter "q" is required'
        });
    }

    try {
        const searchTerm = `%${q}%`;
        const result = await client.execute({
            sql: 'SELECT * FROM quotes WHERE text LIKE ? OR author LIKE ? LIMIT 50',
            args: [searchTerm, searchTerm]
        });

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get Quote of the Day
exports.getQuoteOfTheDay = async (req, res) => {
    try {
        // Get total count
        const countResult = await client.execute('SELECT COUNT(*) as count FROM quotes');
        const count = countResult.rows[0].count || countResult.rows[0][0];

        if (count === 0) {
            return res.status(404).json({ success: false, error: 'No quotes available' });
        }

        // Calculate deterministic index based on date
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 0);
        const diff = today - startOfYear;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        const index = dayOfYear % count;

        const result = await client.execute({
            sql: 'SELECT * FROM quotes LIMIT 1 OFFSET ?',
            args: [index]
        });

        res.json({
            success: true,
            date: today.toISOString().split('T')[0],
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

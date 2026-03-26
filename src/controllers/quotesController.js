const { client } = require('../db/database');
const { generateSvg } = require('../utils/svgGenerator');

const DEFAULT_QUOTES_LIMIT = 20;
const DEFAULT_SEARCH_LIMIT = 20;
const ALLOWED_SORT_FIELDS = new Set(['id', 'author', 'text']);
const ALLOWED_ORDER = new Set(['asc', 'desc']);

const parsePositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Get all quotes
exports.getQuotes = async (req, res) => {
    const maxQuotesLimit = parsePositiveInt(process.env.MAX_QUOTES_LIMIT, 100);
    const page = parsePositiveInt(req.query.page, 1);
    const requestedLimit = parsePositiveInt(req.query.limit, DEFAULT_QUOTES_LIMIT);
    const limit = Math.min(requestedLimit, maxQuotesLimit);
    const offset = (page - 1) * limit;

    const author = typeof req.query.author === 'string' ? req.query.author.trim() : '';
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    const sortRaw = typeof req.query.sort === 'string' ? req.query.sort.toLowerCase() : 'id';
    const sort = ALLOWED_SORT_FIELDS.has(sortRaw) ? sortRaw : 'id';

    const orderRaw = typeof req.query.order === 'string' ? req.query.order.toLowerCase() : 'asc';
    const order = ALLOWED_ORDER.has(orderRaw) ? orderRaw : 'asc';

    const whereParts = [];
    const whereArgs = [];

    if (author) {
        whereParts.push('author LIKE ?');
        whereArgs.push(`%${author}%`);
    }

    if (q) {
        whereParts.push('(text LIKE ? OR author LIKE ?)');
        whereArgs.push(`%${q}%`, `%${q}%`);
    }

    const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

    try {
        const countResult = await client.execute({
            sql: `SELECT COUNT(*) as count FROM quotes ${whereSql}`,
            args: whereArgs
        });

        const total = Number(countResult.rows[0].count || countResult.rows[0][0] || 0);
        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

        const result = await client.execute({
            sql: `SELECT * FROM quotes ${whereSql} ORDER BY ${sort} ${order.toUpperCase()} LIMIT ? OFFSET ?`,
            args: [...whereArgs, limit, offset]
        });

        res.json({
            success: true,
            count: result.rows.length,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNext: totalPages > 0 && page < totalPages,
                hasPrev: totalPages > 0 && page > 1
            },
            filters: {
                author: author || null,
                q: q || null,
                sort,
                order
            },
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
    const maxSearchLimit = parsePositiveInt(process.env.MAX_SEARCH_LIMIT, 50);
    const requestedLimit = parsePositiveInt(req.query.limit, DEFAULT_SEARCH_LIMIT);
    const limit = Math.min(requestedLimit, maxSearchLimit);

    if (!q) {
        return res.status(400).json({
            success: false,
            error: 'Query parameter "q" is required'
        });
    }

    try {
        const searchTerm = `%${q}%`;
        const result = await client.execute({
            sql: 'SELECT * FROM quotes WHERE text LIKE ? OR author LIKE ? LIMIT ?',
            args: [searchTerm, searchTerm, limit]
        });

        res.json({
            success: true,
            limit,
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

const express = require('express');
const router = express.Router();
const quotesController = require('../controllers/quotesController');
const authenticate = require('../middleware/authMiddleware');
const { readOnlyGuard, writeLimiter, svgLimiter } = require('../middleware/planProtectionMiddleware');

// Public routes
router.get('/', quotesController.getQuotes);
router.get('/random', quotesController.getRandomQuote);
router.get('/qod', quotesController.getQuoteOfTheDay);
router.get('/search', quotesController.searchQuotes);
router.get('/random/svg', svgLimiter, quotesController.getRandomQuoteSvg);
router.get('/:id', quotesController.getQuoteById);
router.get('/:id/svg', svgLimiter, quotesController.getQuoteSvg);

// Protected routes
router.post('/', readOnlyGuard, writeLimiter, authenticate, quotesController.createQuote);
router.put('/:id', readOnlyGuard, writeLimiter, authenticate, quotesController.updateQuote);
router.delete('/:id', readOnlyGuard, writeLimiter, authenticate, quotesController.deleteQuote);

module.exports = router;

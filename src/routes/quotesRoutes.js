const express = require('express');
const router = express.Router();
const quotesController = require('../controllers/quotesController');
const authenticate = require('../middleware/authMiddleware');

// Public routes
router.get('/', quotesController.getQuotes);
router.get('/random', quotesController.getRandomQuote);
router.get('/random/svg', quotesController.getRandomQuoteSvg);
router.get('/:id', quotesController.getQuoteById);
router.get('/:id/svg', quotesController.getQuoteSvg);

// Protected routes
router.post('/', authenticate, quotesController.createQuote);
router.put('/:id', authenticate, quotesController.updateQuote);
router.delete('/:id', authenticate, quotesController.deleteQuote);

module.exports = router;

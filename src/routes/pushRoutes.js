const express = require('express');
const router = express.Router();
const pushController = require('../controllers/pushController');

// Public endpoints
router.post('/subscribe', pushController.subscribe);
router.post('/unsubscribe', pushController.unsubscribe);
router.get('/vapid-public-key', pushController.getVapidPublicKey);

// Cron / admin endpoint
router.get('/send-daily', pushController.sendDaily);

module.exports = router;

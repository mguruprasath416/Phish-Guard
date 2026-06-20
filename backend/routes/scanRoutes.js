const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { scanEmail, scanUrl, getScanHistory, getScanResult, submitFeedback } = require('../controllers/scanController');

// ── Scan Routes ─────────────────────────────────────────────────────────────────

// Scan an email for phishing
router.post('/email', protect, scanEmail);

// Scan a URL for phishing
router.post('/url', protect, scanUrl);

// Get scan history for authenticated user
router.get('/history', protect, getScanHistory);

// Get specific scan result by ID
router.get('/:id', protect, getScanResult);

// Submit feedback on a scan result
router.post('/:id/feedback', protect, submitFeedback);

module.exports = router;

const express = require('express');
const router = express.Router();
const { stripeWebhook } = require('../controllers/AbonnementsControllers.js');

router.post('/', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;

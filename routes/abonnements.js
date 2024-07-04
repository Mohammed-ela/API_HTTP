const express = require('express');
const {
    allAbonnement,
    getAbonnement,
    subscription,
    createCustomerPortalSession,
    stripeWebhook
} = require('../controllers/AbonnementsControllers.js');

const router = express.Router();

// All abonnements
router.route('/')
    .get(allAbonnement);

router.route('/:id')
    .get(getAbonnement)
    .post(subscription);

// router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createCustomerPortalSession } = require('../controllers/AbonnementsControllers.js');


router.post('/customer', createCustomerPortalSession);

module.exports = router;

const express = require('express');
const { sendContactEmail } = require('../controllers/ContactControllers.js');

const router = express.Router();

// poster un msg 
router.post('/', sendContactEmail);

module.exports = router;

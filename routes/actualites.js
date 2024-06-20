const express = require('express');
const router = express.Router();
const {
    getAllActualites,
    getActualiteById
} = require('../controllers/ActualiteControllers');


router.get('/', getAllActualites);

router.get('/:id', getActualiteById);









module.exports = router;

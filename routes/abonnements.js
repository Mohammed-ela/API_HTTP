const express = require('express');
const {
    allAbonnement,
    getAbonnement,
    subscription
} = require('../controllers/AbonnementsControllers.js');

const router = express.Router();

    // All abonnement
    router.route('/')
        .get(
            allAbonnement
        );

    router.route('/:id')
        .get(
            getAbonnement
        )
        //stripe
        .post(
            subscription
        );














        
module.exports = router;

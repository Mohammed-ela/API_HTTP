const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/actualites.json');

// all abonemment
router.get('/', (req, res) => {
    fs.readFile(dataPath, (err, data) => {
        if (err) {
            res.status(500).json({ message: "Erreur lors de la lecture des données" });
            return;
        }
        const actualite = JSON.parse(data);
        res.status(200).json(actualite);
    });
});

module.exports = router;
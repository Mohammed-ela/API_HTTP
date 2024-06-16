const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/abonnements.json');

// all abonemment
router.get('/', (req, res) => {
    fs.readFile(dataPath, (err, data) => {
        if (err) {
            res.status(500).json({ message: "Erreur lors de la lecture des données" });
            return;
        }
        const abonnements = JSON.parse(data);
        res.status(200).json(abonnements);
    });
});

// abonnement en fct de id
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    fs.readFile(dataPath, (err, data) => {
        if (err) {
            res.status(500).json({ message: "Erreur lors de la lecture des données" });
            return;
        }
        const abonnements = JSON.parse(data);
        const abonnement = abonnements.find(sub => sub.id === id);
        if (abonnement) {
            res.status(200).json(abonnement);
        } else {
            res.status(404).json({ message: "Abonnement non trouvé" });
        }
    });
});

module.exports = router;

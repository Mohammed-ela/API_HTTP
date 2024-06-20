// UserControllers.js
const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
const dataPath = path.join(__dirname, '../data/abonnements.json');

module.exports = {

    allAbonnement: async (req, res, next) => {
        fs.readFile(dataPath, (err, data) => {
            if (err) {
                res.status(500).json({ message: "Erreur lors de la lecture des données" });
                return;
            }
            const abonnements = JSON.parse(data);
            res.status(200).json(abonnements);
        });
    },
    
    getAbonnement: async (req, res, next) => {
        // Récupère l'ID depuis les paramètres 
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
    },

    subscription: async (req, res) => {

        try {

        } catch (error) {
            console.error('Erreur lors de la création de l\'abonnement:', error);
            res.status(500).json({ message: 'Erreur lors de la création de l\'abonnement', error });
        }

    }
    












};

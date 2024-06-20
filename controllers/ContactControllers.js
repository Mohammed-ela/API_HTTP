// controllers/ContactControllers.js
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

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

module.exports = {
    sendContactEmail: async (req, res) => {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
        }

        try {
            // Enregistrer le message de contact dans la base de données
            const newContact = await prisma.contact.create({
                data: {
                    name,
                    email,
                    subject,
                    message
                }
            });

            // Envoyer l'e-mail
            const mailOptions = {
                from: email,
                to: process.env.EMAIL_USER,
                subject: `Contact Form: ${subject}`,
                text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
                    return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'e-mail.', error });
                }
                res.status(200).json({ message: 'E-mail envoyé avec succès.', contact: newContact });
            });
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du contact:', error);
            res.status(500).json({ message: 'Erreur lors de l\'enregistrement du contact.', error });
        }
    }
};

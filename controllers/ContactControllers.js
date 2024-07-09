// controllers/ContactControllers.js
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.EMAIL_ADMIN,
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

            // Envoyer l'e-mail à l'admin
            const mailOptionsAdmin = {
                from: email,
                to: process.env.EMAIL_ADMIN,
                subject: `Contact Form: ${subject}`,
                text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            };

            // Envoyer l'e-mail de confirmation à l'utilisateur
            const mailOptionsUser = {
                from: process.env.EMAIL_ADMIN,
                to: email,
                subject: `Votre message a bien été envoyé`,
                text: `Bonjour ${name},\n\nVotre message a bien été envoyé à notre service MomoDev.\n\nVotre message :\n${message}\n\nMerci de nous avoir contactés.`,
            };

            // Envoyer l'e-mail à l'admin
            transporter.sendMail(mailOptionsAdmin, (error, info) => {
                if (error) {
                    console.error('Erreur lors de l\'envoi de l\'e-mail à l\'admin:', error);
                    return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'e-mail à l\'admin.', error });
                }
                console.log('E-mail envoyé à l\'admin:', info.response);
            });

            // Envoyer l'e-mail de confirmation à l'utilisateur
            transporter.sendMail(mailOptionsUser, (error, info) => {
                if (error) {
                    console.error('Erreur lors de l\'envoi de l\'e-mail de confirmation à l\'utilisateur:', error);
                    return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'e-mail de confirmation à l\'utilisateur.', error });
                }
                console.log('E-mail de confirmation envoyé à l\'utilisateur:', info.response);
            });

            res.status(200).json({ message: 'E-mails envoyés avec succès.', contact: newContact });
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du contact:', error);
            res.status(500).json({ message: 'Erreur lors de l\'enregistrement du contact.', error });
        }
    }
};

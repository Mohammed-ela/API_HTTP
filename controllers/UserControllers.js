// UserControllers.js
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

const mailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;


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

    checkAuthPayload: (req, res, next) => {
        const { name, email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Veuillez saisir tous les champs' });
        }
        // si on est dans inscription , on verifie si le nom est envoyé
        if (req.path === '/inscription' && !name) {
            return res.status(400).json({ message: 'Veuillez saisir votre nom' });
        }
        req.email = email;
        req.password = password;
        req.name = name;  
        next();
    },
    
    checkEmailPayload: (req, res, next) => {
        const { email } = req.body;
        if (!mailPattern.test(email)) {
            return res.status(400).json({ message: 'Format d\'e-mail invalide' });
        }
        
        next();
    },
    
    checkPasswordPayload: (req, res, next) => {
        const { password } = req;
        
        if (!passwordPattern.test(password)) {
            const errors = [];
            
            if (!/(?=.*?[A-Z])/.test(password)) {
                errors.push("Le mot de passe doit contenir au moins une lettre majuscule.");
            }
            if (!/(?=.*?[a-z])/.test(password)) {
                errors.push("Le mot de passe doit contenir au moins une lettre minuscule.");
            }
            if (!/(?=.*?[0-9])/.test(password)) {
                errors.push("Le mot de passe doit contenir au moins un chiffre.");
            }
            if (!/(?=.*?[#?!@$%^&*-])/.test(password)) {
                errors.push("Le mot de passe doit contenir au moins un caractère spécial.");
            }
            if (password.length < 8) {
                errors.push("Le mot de passe doit avoir au moins 8 caractères.");
            }
            
            return res.status(400).json({ message: "Votre mot de passe n'est pas conforme", errors });
        }
        
        next();
    },
    //inscription
    signupResponse: async (req, res) => {
        try {
            const { email, password, name } = req;
            
            // Vérifie si l'utilisateur existe déjà
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email existante ! Veuillez vous connecter ou réinitialiser votre mot de passe' });
            }
            
            // Générer salt et hash pour le mot de passe
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
            
            // Enregistre le nouvel utilisateur
            const newUser = await prisma.user.create({
                data: {
                    email,
                    name,
                    salt,
                    hash,
                    status: 1
                }
            });
            
            // Envoie de l'email de bienvenue
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Bienvenue sur notre plateforme',
                text: `Bonjour ${email},\n\nMerci de vous être inscrit sur notre plateforme.\n\nCordialement,\nL'équipe`,
            };
            
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
                    return res.status(500).json({ message: 'Utilisateur créé mais erreur lors de l\'envoi de l\'e-mail de bienvenue.', error });
                }
                res.status(201).json({ message: 'Utilisateur enregistré avec succès.', user: newUser });
            });
            
        } catch (error) {
            console.error(new Date().toISOString(), 'controllers/UserControllers.js > signupResponse > error ', error);
            return res.status(500).json({ message: 'Erreur inattendue.', error });
        }
    },
    // connexion
    signinResponse: async (req, res) => {
        const { email, password } = req;
        
        try {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (!existingUser) {
                return res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect' });
            }
            
            const hash = crypto.pbkdf2Sync(password, existingUser.salt, 1000, 64, 'sha512').toString('hex');
            if (existingUser.hash !== hash) {
                return res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect' });
            }
            
            const token = jwt.sign({ userId: existingUser.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            
            res.status(200).json({ message: 'Connexion réussie', token , existingUser });
            
        } catch (error) {
            console.error(new Date().toISOString(), 'controllers/UserControllers.js > signinResponse > error ', error);
            return res.status(500).json({ message: 'Erreur lors de la connexion', error });
        }
    },
    // Fonction pour envoyer un email de récupération de mot de passe
    recoveryResponse: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: 'Veuillez saisir une adresse e-mail' });
            }

            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (!existingUser) {
                return res.status(404).json({ message: 'Adresse e-mail introuvable' });
            }

            const slug = uuidv4();

            const newRecoveryPassword = await prisma.recoveryPassword.create({
                data: {
                    slug,
                    userId: existingUser.id,
                }
            });

            const recoveryLink = `http://localhost:8100/users/new-password/${slug}`;
            

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Récupération de mot de passe',
                text: `Bonjour,\n\nCliquez sur le lien suivant pour réinitialiser votre mot de passe : ${recoveryLink}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
                    return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'e-mail de récupération.' });
                }
                res.status(200).json({ message: 'Un lien de récupération a été envoyé à votre adresse e-mail.' });
            });
        } catch (error) {
            console.error(new Date().toISOString(), 'controllers/UserControllers.js > recoveryResponse > error ', error);
            return res.status(500).json({ message: 'Erreur lors de la demande de récupération de mot de passe.', error });
        }
    },
    newPasswordResponse: async (req, res) => {
        try {
            const { slug } = req.params;
            const { newPassword } = req.body;

            // Valider le nouveau mot de passe
            if (!newPassword) {
                return res.status(400).json({ message: 'Veuillez fournir un nouveau mot de passe.' });
            }

            if (!passwordPattern.test(newPassword)) {
                const errors = [];

                if (!/(?=.*?[A-Z])/.test(newPassword)) {
                    errors.push("Le mot de passe doit contenir au moins une lettre majuscule.");
                }
                if (!/(?=.*?[a-z])/.test(newPassword)) {
                    errors.push("Le mot de passe doit contenir au moins une lettre minuscule.");
                }
                if (!/(?=.*?[0-9])/.test(newPassword)) {
                    errors.push("Le mot de passe doit contenir au moins un chiffre.");
                }
                if (!/(?=.*?[#?!@$%^&*-])/.test(newPassword)) {
                    errors.push("Le mot de passe doit contenir au moins un caractère spécial.");
                }
                if (newPassword.length < 8) {
                    errors.push("Le mot de passe doit avoir au moins 8 caractères.");
                }

                return res.status(400).json({ message: "Votre nouveau mot de passe n'est pas conforme", errors });
            }

            const recoveryEntry = await prisma.recoveryPassword.findUnique({ where: { slug } });
            if (!recoveryEntry) {
                return res.status(404).json({ message: 'La demande de modification de mot de passe est expirée ou invalide.' 
                    // ,test:slug

                });
            }

            const user = await prisma.user.findUnique({ where: { id: recoveryEntry.userId } });
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur introuvable.' });
            }

            const salt = crypto.randomBytes(16).toString('hex');
            const hash = crypto.pbkdf2Sync(newPassword, salt, 1000, 64, 'sha512').toString('hex');

            await prisma.user.update({
                where: { id: user.id },
                data: { salt, hash }
            });

            await prisma.recoveryPassword.deleteMany({ where: { slug: recoveryEntry.slug } });

            res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
        } catch (error) {
            console.error(new Date().toISOString(), 'controllers/UserControllers.js > newPasswordResponse > error ', error);
            return res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe.', error });
        }
    },
    // middleware d'authentification
    isconnected: async (req, res, next) => {
        try {
            const authorizationHeader = req.headers.authorization;
            
            if (!authorizationHeader) {
                return res.status(401).json({ message: 'pas de token ? => isconnected' });
            }
            
            const token = authorizationHeader.replace('Bearer ', '');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = { id: decoded.userId };
            
            next();
        } catch (error) {
            res.status(401).json({ message: 'vous etes pas connecte => isconnected', error });
        }
    },
    // faire une recherche d'user grace a l'id recuperer
    extractUserInfo: async (req, res, next) => {
        try {
            req.user = await prisma.user.findUnique({ where: { id: req.user.id } });
            if (!req.user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            next();
        } catch (error) {
            res.status(500).json({ message: 'Erreur recherche user =>  extractUserInfo', error });
        }
    },
    // afficher info user
    getUserInfo: async (req, res) => {
        try {
            res.status(200).json(req.user);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de lenvois information user =>  getUserInfo', error });
        }
    },
    // update
    // updateUserResponse dans UserControllers.js
updateUserResponse: async (req, res) => {
    try {
        const { email, name } = req.body;
        const userId = req.user.id;

        // Vérifiez que l'email est valide
        if (email && !mailPattern.test(email)) {
            return res.status(400).json({ message: 'Format d\'e-mail invalide' });
        }

        // Préparez les données à mettre à jour
        const updateData = {};
        if (email) updateData.email = email;
        if (name) updateData.name = name;

        // Mettre à jour l'utilisateur
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        res.status(200).json({ message: 'Informations mises à jour avec succès.', user: updatedUser });
    } catch (error) {
        if (error.code === 'P2002') {
            res.status(409).json({ message: 'L\'e-mail est déjà utilisé par un autre compte.' });
        } else {
            console.error(new Date().toISOString(), 'controllers/UserControllers.js > updateUserResponse > error ', error);
            res.status(500).json({ message: 'Erreur lors de la mise à jour des informations.', error });
        }
    }
},

    getUserSubscriptions: async (req, res) => {
        try {
            const userId = req.user.id;
            const subscriptions = await prisma.stripeSubscription.findMany({
                where: { userId: userId },
            });
            res.status(200).json(subscriptions);
        } catch (error) {
            console.error(new Date().toISOString(), 'controllers/UserControllers.js > getUserSubscriptions > error ', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des abonnements.', error });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const userId = req.user.id;
    
            // Récupérer les informations de l'utilisateur avant suppression
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
    
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé.' });
            }
    
            await prisma.user.delete({
                where: { id: userId },
            });
    
            // Envoyer un email de "au revoir"
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Au revoir de notre plateforme',
                text: `Bonjour ${user.name},\n\nNous sommes désolés de vous voir partir. Votre compte a été supprimé avec succès.\n\nCordialement,\nL'équipe`,
            };
    
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Erreur lors de l\'envoi de l\'e-mail de "au revoir":', error);
                } else {
                    console.log('E-mail de "au revoir" envoyé:', info.response);
                }
            });
    
            res.status(200).json({ message: 'Compte supprimé avec succès.' });
        } catch (error) {
            console.error(new Date().toISOString(), 'controllers/UserControllers.js > deleteUser > error ', error);
            res.status(500).json({ message: 'Erreur lors de la suppression du compte.', error });
        }
    },
    


};

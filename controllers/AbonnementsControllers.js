const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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


const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_ADMIN,
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
    } else {
      console.log('E-mail envoyé:', info.response);
    }
  });
};

const handleCheckoutSessionCompleted = async (session) => {
  const customer = await stripe.customers.retrieve(session.customer);
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  await prisma.stripeSubscription.create({
    data: {
      userId: parseInt(session.metadata.userId, 10), // Assurez-vous que userId est un entier
      abonnementId: parseInt(session.metadata.abonnementId, 10),
      stripeCustomerId: customer.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      status: subscription.status,
    },
  });

  sendEmail(customer.email, 'Souscription réussie', `Bonjour,

Votre souscription a été réalisée avec succès. Voici les détails de votre abonnement :
- Abonnement : ${subscription.id}
- Période de début : ${new Date(subscription.current_period_start * 1000).toLocaleDateString()}
- Période de fin : ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}

Cordialement,
L'équipe`);
};

const handleSubscriptionUpdated = async (subscription) => {
  try {
    const abonnementId = subscription.items.data[0].plan.product === 'prod_QPIIfkYn5mGwOT' ? 1 :
      subscription.items.data[0].plan.product === 'prod_QPIPSjmzMVzngA' ? 2 :
      subscription.items.data[0].plan.product === 'prod_QPIH5IEOAwXVWv' ? 3 : null;

    if (!abonnementId) {
      console.error('Erreur: Impossible de déterminer l\'abonnement à partir du produit.');
      return;
    }

    const updateData = {
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      status: subscription.status,
      abonnementId: parseInt(abonnementId, 10),
    };

    if (subscription.cancel_at_period_end) {
      updateData.status = 'canceled';
    } else if (subscription.canceled_at) {
      updateData.status = 'canceled';
    } else {
      updateData.status = subscription.status;
    }

    await prisma.stripeSubscription.updateMany({
      where: {
        stripeCustomerId: subscription.customer,
      },
      data: updateData,
    });

    const customer = await stripe.customers.retrieve(subscription.customer);

    let emailSubject, emailText;
    if (updateData.status === 'canceled') {
      emailSubject = 'Annulation d\'abonnement';
      emailText = `Bonjour,

Votre abonnement a été annulé avec succès. Nous sommes désolés de vous voir partir.

Cordialement,
L'équipe`;
    } else {
      emailSubject = 'Abonnement mis à jour';
      emailText = `Bonjour,

Votre abonnement a été mis à jour avec succès. Voici les nouveaux détails de votre abonnement :
- Abonnement : ${subscription.id}
- Période de début : ${new Date(subscription.current_period_start * 1000).toLocaleDateString()}
- Période de fin : ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}
- Statut : ${subscription.status}

Cordialement,
L'équipe`;
    }

    sendEmail(customer.email, emailSubject, emailText);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la souscription:', error);
  }
};

module.exports = {
  allAbonnement: async (req, res) => {
    try {
      const abonnements = await prisma.abonnement.findMany();
      res.status(200).json(abonnements);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des abonnements", error });
    }
  },

  getAbonnement: async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      const abonnement = await prisma.abonnement.findUnique({ where: { id } });
      if (!abonnement) {
        return res.status(404).json({ message: "Abonnement non trouvé" });
      }
      res.status(200).json(abonnement);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de l'abonnement", error });
    }
  },

  subscription: async (req, res) => {
    const { id } = req.params;
    const { email, userId } = req.body;

    try {
      // Vérification des abonnements existants pour l'utilisateur
      const existingSubscription = await prisma.stripeSubscription.findFirst({
        where: {
          userId: parseInt(userId, 10),
          status: 'active'
        }
      });

      if (existingSubscription) {
        return res.status(400).json({ message: 'Vous avez déjà un abonnement actif.' });
      }

      const abonnement = await prisma.abonnement.findUnique({ where: { id: parseInt(id) } });
      if (!abonnement) {
        return res.status(404).json({ message: 'Abonnement non trouvé' });
      }

      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId: userId,
          abonnementId: id // Ajout de l'abonnementId dans les métadonnées
        }
      });

      // Logique pour sélectionner le produit en fonction de l'ID de l'abonnement
      let productId;
      switch (parseInt(id)) {
        case 1:
          productId = 'prod_QPIIfkYn5mGwOT';
          break;
        case 2:
          productId = 'prod_QPIPSjmzMVzngA';
          break;
        case 3:
          productId = 'prod_QPIH5IEOAwXVWv';
          break;
        default:
          return res.status(400).json({ message: 'ID d\'abonnement non valide' });
      }

      const prices = await stripe.prices.list({
        product: productId,
      });

      if (prices.data.length === 0) {
        return res.status(400).json({ message: 'Aucun prix trouvé pour ce produit' });
      }

      const priceId = prices.data[0].id;

      const sessionData = {
        payment_method_types: ['card'],
        customer: customer.id,
        line_items: [{
          price: priceId, // Utilisation de l'ID du prix sélectionné
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${process.env.PWA_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.PWA_URL}/payment-cancel`,
        metadata: {
          userId: userId,
          abonnementId: id // Ajout de l'abonnementId dans les métadonnées
        }
      };

      console.log('Session Data:', sessionData); // Debugging pour les données de session

      const session = await stripe.checkout.sessions.create(sessionData);

      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error('Erreur lors de la création de l\'abonnement:', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'abonnement', error });
    }
  },

  createCustomerPortalSession: async (req, res) => {
    const { userId } = req.body;

    try {
      // Vérifier si l'utilisateur a un abonnement actif
      const activeSubscription = await prisma.stripeSubscription.findFirst({
        where: {
          userId: parseInt(userId, 10),
        }
      });
  
      if (!activeSubscription) {
        return res.status(400).json({ message: 'Impossible de récupérer votre ID Stripe. Aucun abonnement actif trouvé.' });
      }
  
      // Créer une session de portail de facturation
      const session = await stripe.billingPortal.sessions.create({
        customer: activeSubscription.stripeCustomerId,
        return_url: process.env.PWA_URL,
      });
  
      // Retourner l'URL du portail de facturation
      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error('Erreur lors de la création de la session du Customer Portal:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la session du Customer Portal', error });
    }
},

  stripeWebhook: async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      // Utiliser req.body comme un Buffer brut pour la vérification de la signature
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          console.log('Session Metadata:', session.metadata); // Debugging pour les métadonnées de la session
          await handleCheckoutSessionCompleted(session);
          break;
        case 'customer.subscription.updated':
          const subscriptionUpdated = event.data.object;
          console.log('event console log:', subscriptionUpdated); // Debugging pour les métadonnées de la souscription
          await handleSubscriptionUpdated(subscriptionUpdated);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Erreur lors du traitement du webhook Stripe:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  },
};

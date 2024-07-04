const express = require("express");
const port = process.env.PORT || 5000;
const helmet = require("helmet");
const cors = require("cors");

const app = express();

// Sécurisation des en-têtes 
app.use(helmet());
//activer les cors pour accepter all domaine
app.use(cors());

// Route pour les webhooks Stripe (appel au debut pour eviter les bug)
const webhook = require("./routes/webhook");
app.use('/webhook', webhook);

// requete en json (alternatiev to bodyparser)
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "Bienvenue sur mon API en NodeJS" });
});

const abonnements = require("./routes/abonnements");
const actualites = require("./routes/actualites");
const userRoutes = require("./routes/user");
const contactRoutes = require("./routes/contact");
//portail stripe
const portal = require("./routes/portal-billing");

app.use("/abonnements", abonnements);
app.use("/actualites", actualites);
app.use("/users", userRoutes);
app.use('/contact', contactRoutes);
// portail stripe
app.use('/portal', portal);


app.listen(port, () => {
    console.log(`Serveur en ligne sur le port : ${port}`);
});

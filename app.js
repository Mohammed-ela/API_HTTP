// app.js
const express = require("express");
const port = process.env.PORT || 5000;
const helmet = require("helmet");
//desactiver les cors
const cors = require("cors");


const app = express();
// requete en json (alternatiev to bodyparser)
app.use(express.json());
// securité helmet du header
app.use(helmet());
// cors pour api fonctionne avec des domaines differents
app.use(cors());
app.get('/', (req, res) => {
    res.json({message:"Bienvenue sur l'API en NodeJS"});
});

const abonnements = require("./routes/abonnements");
const actualites = require("./routes/actualites");
const userRoutes = require("./routes/user");
const contactRoutes = require("./routes/contact");

app.use("/abonnements", abonnements);
app.use("/actualites", actualites);
app.use("/users", userRoutes);
app.use('/contact', contactRoutes);

app.listen(port, () => {
    console.log(`Serveur en ligne sur le port : ${port}`);
});

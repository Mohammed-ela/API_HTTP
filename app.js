const express = require("express");
const port = process.env.PORT || 5000;


const app = express();

app.get('/', (req, res) => {
    res.json({message:"bienvenue sur l'api en nodeJS"})
});
const abonnements = require("./routes/abonnements")
app.use("/abonnements", abonnements)


app.listen(port, () => {
    console.log(`Serveur en ligne sur le port : ${port}`);
});

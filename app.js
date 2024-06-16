const express = require("express")
const port = process.env.PORT || 5000

const app = express();

app.lister(port,{} => {
    console.log("serveur en ligne sur le port :",port)
})
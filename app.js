const express = require("express");  // Importation d'express => Framework basé sur node.js
const helmet = require("helmet"); // Protection contre certaines vulnérabilités 
const bodyParser = require("body-parser"); // Permet d'extraire l'objet JSON des requêtes POST
const mongoose = require("mongoose"); // Facilite les intéractions avec notre base de données MongoDB
const path = require("path"); // Plugin qui sert dans l'upload des images

const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

/// Connection à MongoDb
require("dotenv").config(); // Masquage des infos de connection
mongoose.connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}?retryWrites=true&w=majority`, 
{
  useNewUrlParser: true, 
  useUnifiedTopology: true
})
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();
app.use(helmet());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

app.use(bodyParser.json());

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);


module.exports = app;
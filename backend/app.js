const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors')
require("dotenv/config");

const userRoutes = require('./routes/userRoute');
const sauceRoutes = require('./routes/sauceRoute');
const path = require('path');

// conenct app with Express
app.use(express.json({ extented: false }));
app.use(cors());

// Express routes
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')))

// connect to mongo DB with databaseURL from .env file
mongoose.connect(process.env.databaseURL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Sucess! Connexion à MongoDB réussie !'))
  .catch((error) => console.log('Fail! Connexion à MongoDB échouée !' + error));

module.exports = app;
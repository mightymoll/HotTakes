const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');

// conenct app with Express
app.use(express.json());

// Express routes
app.use('/api/auth', userRoutes);

// connect to mongo DB with databaseURL from .env file
mongoose.connect(process.env.databaseURL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Sucess! Connexion à MongoDB réussie !'))
  .catch((error) => console.log('Fail! Connexion à MongoDB échouée !' + error));

// set headers for CORS
userRoutes.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.status(200).send('OK')
  next();
});

module.exports = app;
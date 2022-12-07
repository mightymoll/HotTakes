const Sauce = require('../models/sauceModel');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => { res.status(200).json(sauces) })
    .catch(error => {
      res.status(400).json({ error: error });
    })
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  })
  sauce.save()
    .then(res => {
      res.status(201).json({ message: 'sauce successfully uploaded to database' })
    })
    .catch(error => {
      res.status(400).json({ error: error })
    })
};
const Sauce = require('../models/sauceModel');
const fs = require('fs');
const auth = require('../middleware/authToken');

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => {
      res.status(200).json(sauces)
    })
    .catch(error => {
      res.status(400).json({ error: error });
    })
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id
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

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  })
    .then(sauce => {
      res.status(200).json(sauce)
    })
    .catch(error => {
      res.status(404).json({ error: error })
    })
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.thing),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' })
      }
      else {
        Sauce.updateOne({ _id: req.params.id },
          {
            ...sauceObject,
            _id: req.params.id
          })
          .then(() => res.status(200).json({ message: 'Sauce successfully modified' }))
          .catch(error =>
            res.status(401).json({ error: error }))
      }
    })
    .catch(error => {
      res.status(400).json({ error: error });
    })
};
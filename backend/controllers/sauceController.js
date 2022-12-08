const Sauce = require('../models/sauceModel');
const fs = require('fs');

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
    ...JSON.parse(req.body.sauce),
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

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' })
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Object deleted' }) })
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error: error });
    });
}

exports.likeSauce = (req, res, next) => {
  const thisUser = req.body.userId
  const thisSauce = req.params.id
  const sauceLikeStatus = req.body.like

  switch (sauceLikeStatus) {
    case -1: {
      Sauce.updateOne({ _id: thisSauce }, { $addToSet: { usersDisliked: thisUser }, $inc: { dislikes: 1 } })
        .then(() => res.status(200).json({ message: 'Sauce dislikes +1' }))
        .catch(error => res.status(400).json({ error: error }))
      break;
    }
    case 0: {
      Sauce.findOne({ _id: thisSauce })
        .then(sauce => {
          if (sauce.usersLiked.includes(thisUser)) {
            Sauce.updateOne({ _id: thisSauce },
              { $pull: { usersLiked: thisUser } },
              { $inc: { likes: -1 }, })
              .then(() => res.status(200).json({ message: `Sauce 'like' has been removed` }))
              .catch(error => res.status(400).json({ error: error }))
          }
          if (sauce.usersDisliked.includes(thisUser)) {
            Sauce.updateOne({ _id: thisSauce },
              { $pull: { usersDisliked: thisUser } },
              { $inc: { dislikes: -1 }, })
              .then(() => res.status(200).json({ message: `Sauce 'dislike' has been removed` }))
              .catch(error => res.status(400).json({ error: error }))
          }
        })
        .catch(error => res.status(404).json({ error: error }))
      break;
    }
    case 1: {
      Sauce.updateOne({ _id: thisSauce }, { $addToSet: { usersLiked: thisUser }, $inc: { likes: 1 } })
        .then(() => res.status(200).json({ message: 'Sauce likes +1' }))
        .catch(error => res.status(400).json({ error: error }))
    }
  }
}

/*

      if (like === -1 && !alreadyVoted) {
        Sauce.updateOne({ _id: req.params.id }, { $push: { usersDisliked: req.auth.userId }, $inc: { dislikes: +1 } })
          .then(() => res.status(200).json({ message: 'Sauce dislikes +1' }))
          .catch(error => res.status(400).json({ error: error }))
      }
      if (alreadyVoted) {
        res.status(405).json({ message: 'not authorized, user already voted on this sauce' })
      }
      if (like === 0 && alreadyVoted) {
        Sauce.findOne({ _id: req.params.id })
          .then(sauce => {
            if (sauce.usersLiked.includes(req.auth.userId)) {
              Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.auth.userId }, $inc: { likes: -1 } })
                .then(() => res.status(200).json({ message: `Sauce 'like' has been removed` }))
                .catch(error => res.status(400).json({ error: error }))
            }
            if (sauce.usersDisliked.includes(req.auth.userId)) {
              Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.auth.userId }, $inc: { dislikes: -1 } })
                .then(() => res.status(200).json({ message: `Sauce 'dislike' has been removed` }))
                .catch(error => res.status(400).json({ error: error }))
            }
          })
          .catch(error => {
            res.status(404).json({ error: error })
          })
      }

    })
}*/
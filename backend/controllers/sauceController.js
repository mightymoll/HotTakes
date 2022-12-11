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
  if (req.body.file) {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const imageExisting = sauce.imageUrl.split('/images/')[1];
        const filepath = path.resolve(`images/${imageExisting}`)
        fs.unlink(filepath);
        console.log('existing image removed from storage')
      })
      .catch(error => {
        res.status(400).json({ error: error });
      })
  }
  else {
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
        Sauce.updateOne({ _id: req.params.id },
          {
            ...sauceObject,
            _id: req.params.id
          })
          .then(() => res.status(200).json({ message: 'Sauce successfully modified' }))
          .catch(() => res.status(401).json({ error: error }))
      })
      .catch(error => {
        res.status(400).json({ error: error });
      })
  }
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

  Sauce.findOne({ _id: thisSauce })
    .then(sauce => {
      const alreadyLiked = sauce.usersLiked.includes(thisUser)
      const alreadyDisliked = sauce.usersDisliked.includes(thisUser)
      switch (sauceLikeStatus) {
        case -1: {
          if (!alreadyLiked || !alreadyDisliked) {
            Sauce.updateOne({ _id: thisSauce }, { $addToSet: { usersDisliked: thisUser }, $inc: { dislikes: 1 } })
              .then(() => res.status(200).json({ message: 'Sauce dislikes +1' }))
              .catch(error => res.status(400).json({ error: error }))
          }
          else {
            res.status(400).json({ error: 'user already voted on this sauce' })
          }
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
          if (!alreadyLiked || !alreadyDisliked) {
            Sauce.updateOne({ _id: thisSauce }, { $addToSet: { usersLiked: thisUser }, $inc: { likes: 1 } })
              .then(() => res.status(200).json({ message: 'Sauce likes +1' }))
              .catch(error => res.status(400).json({ error: error }))
          }
          else {
            res.status(400).json({ error: 'user already voted on this sauce' })
          }
          break;
        }
      }
    })
}



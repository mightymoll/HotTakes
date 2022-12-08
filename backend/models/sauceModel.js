const mongoose = require('mongoose');

const sauceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  manufacturer: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  mainPepper: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  heat: {
    type: Number,
    required: true
  },
  likes: {
    type: Number,
    min: 0,
    default: 0
  },
  disLikes: {
    type: Number,
    min: 0,
    default: 0
  },
  usersLiked: [{
    type: String,
    unique: true
  }],
  usersDisliked: [{
    type: String,
    unique: true
  }]
});

module.exports = mongoose.model('Sauce', sauceSchema);
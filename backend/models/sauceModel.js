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
    default: 0
  },
  disLikes: {
    type: Number,
    default: 0
  },
  usersLiked: {
    type: Array,
    default: [],
  },
  usersDisliked: {
    type: Array,
    default: [],
  }
});

module.exports = mongoose.model('Sauce', sauceSchema);
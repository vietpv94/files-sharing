'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports.get = (uuid, callback) => {
  User.findOne({_id: uuid}, callback);
};

module.exports.getUserByEmail = (email, callback) => {
  User.findOne({email: email}, callback);
};
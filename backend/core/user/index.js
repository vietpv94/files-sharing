'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports.get = function(uuid, callback) {
  User.findOne({_id: uuid}, callback);
};
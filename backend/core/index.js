'use strict';

var mongo = require('./db/mongo')

module.exports.init = function(callback) {
  mongo.init();
  if (callback) {
    callback();
  }
};
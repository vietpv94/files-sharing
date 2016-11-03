'use strict';

module.exports.init = function(callback) {
  exports.db.mongo.init();
  if (callback) {
    callback();
  }
};
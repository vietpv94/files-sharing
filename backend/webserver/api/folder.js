'use strict';

const folder = require('../controllers/folder');

module.exports = function(app) {
  app.post('/folders/add', folder.create);
};

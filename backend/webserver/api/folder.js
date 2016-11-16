'use strict';

const folder = require('../controllers/folder');
const authMiddleware = require('../middleware/authentication');

module.exports = function(router) {
  router.post('/folders', authMiddleware.isAuthenticated, folder.create);
  router.get('/folders', authMiddleware.isAuthenticated, folder.get);
};


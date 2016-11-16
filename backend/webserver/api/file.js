'use strict';

const authMiddleware = require('../middleware/authentication');
const files = require('../controllers/files');

module.exports = function(router) {
  router.post('/files', authMiddleware.isAuthenticated, files.create);
  router.get('/files/:id', authMiddleware.isAuthenticated, files.get);
  router.delete('/files/:id', authMiddleware.isAuthenticated, files.remove);
};
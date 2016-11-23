'use strict';

const folder = require('../controllers/folder');
const authMiddleware = require('../middleware/authentication');

module.exports = function(router) {
  router.post('/folders', authMiddleware.isAuthenticated, folder.create);
  router.delete('/folder/:folderId', authMiddleware.isAuthenticated, folder.remove);
  router.put('/folder/:folderId', authMiddleware.isAuthenticated, folder.update)
};

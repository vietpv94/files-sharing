const userController = require('../controllers/user');
const authMiddleware = require('../middleware/authentication');

module.exports = function (app) {
  app.get('/account', authMiddleware.isAuthenticated, userController.getAccount);
  app.post('/account/profile', authMiddleware.isAuthenticated, userController.postUpdateProfile);
  app.post('/account/password', authMiddleware.isAuthenticated, userController.postUpdatePassword);
  app.post('/account/delete', authMiddleware.isAuthenticated, userController.postDeleteAccount);
  app.get('/account/unlink/:provider', authMiddleware.isAuthenticated, userController.getOauthUnlink);
};

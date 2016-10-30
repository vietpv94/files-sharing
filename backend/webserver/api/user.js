const userController = require('../controllers/user');
const authMiddleware = require('../middleware/authentication');

module.exports = function (router) {

  router.get('/account', authMiddleware.isAuthenticated, userController.getAccount);
  router.post('/account/profile', authMiddleware.isAuthenticated, userController.postUpdateProfile);
  router.post('/account/password', authMiddleware.isAuthenticated, userController.postUpdatePassword);
  router.post('/account/delete', authMiddleware.isAuthenticated, userController.postDeleteAccount);
  router.get('/account/unlink/:provider', authMiddleware.isAuthenticated, userController.getOauthUnlink);

};

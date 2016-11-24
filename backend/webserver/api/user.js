const userController = require('../controllers/user');
const authMiddleware = require('../middleware/authentication');

module.exports = function (router) {
  router.post('/login', userController.postLogin);

  router.post('/signup', userController.postSignup);

  router.post('/account/profile', authMiddleware.isAuthenticated, userController.postUpdateProfile);
  router.post('/account/password', authMiddleware.isAuthenticated, userController.postUpdatePassword);
  router.post('/account/delete', authMiddleware.isAuthenticated, userController.postDeleteAccount);
};

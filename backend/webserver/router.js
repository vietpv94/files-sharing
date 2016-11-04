/**
 * load routes
 * @param application
 */
module.exports = function (application) {
  const home = require('./controllers/home');
  application.get('/', home.index);

  const about = require('./controllers/about');
  application.get('/about', about.index);

  const files = require('./controllers/files');
  application.get('/my-files', files.index);

  const user = require('./controllers/user');
  application.get('/login', user.getLogin);
  application.get('/logout', user.logout);
  application.get('/signup', user.getSignup);
  application.post('/login', user.postLogin);

  application.get('/forgot', user.getForgot);
  application.post('/forgot', user.postForgot);

  application.get('/reset/:token', user.getReset);
  application.post('/reset/:token', user.postReset);
  application.post('/signup', user.postSignup);

  const passport = require('passport');

  application.get('/auth/google',
    passport.authenticate('google', { scope: ['profile email'] }));
  application.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect(req.session.returnTo || '/');
    });
 /* const userController = require('./controllers/user');
  const authMiddleware = require('./middleware/authentication');

  application.get('/account', authMiddleware.isAuthenticated, userController.getAccount);
  application.post('/account/profile', authMiddleware.isAuthenticated, userController.postUpdateProfile);
  application.post('/account/password', authMiddleware.isAuthenticated, userController.postUpdatePassword);
  application.post('/account/delete', authMiddleware.isAuthenticated, userController.postDeleteAccount);
  application.get('/account/unlink/:provider', authMiddleware.isAuthenticated, userController.getOauthUnlink);
*/
  const moduleApi = require('./api');
  moduleApi.setupAPI(application);
};

/**
 * load routes
 * @param application
 */
module.exports = function (application) {
  const cors = require('cors');
  application.all('/api/*', cors());

  const user = require('./controllers/user');
  const authMiddleware = require('./middleware/authentication');

  application.get('/logout', user.logout);

  application.post('/forgot', user.postForgot);
  application.get('/api/profile/:uuid', authMiddleware.isAuthenticated, user.profile);

  application.get('/reset/:token', user.getReset);
  application.post('/reset/:token', user.postReset);
  const folder = require('./controllers/folder');

  application.get('/api/folders', authMiddleware.isAuthenticated, folder.get);
  application.get('/api/folders/:folderId', authMiddleware.isAuthenticated, folder.getFolders);

  const passport = require('passport');

  application.get('/auth/google',
    passport.authenticate('google', { scope: ['profile email'] }));
  application.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect(req.session.returnTo || '/');
    });

  const home = require('./controllers/home');
  application.get('/', home.index);
  application.get('*', home.index);
  const moduleApi = require('./api');
  moduleApi.setupAPI(application);
};

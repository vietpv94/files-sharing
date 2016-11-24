/**
 * load routes
 * @param application
 */
module.exports = function (application) {
  const cors = require('cors');
  application.all('/api/*', cors());

  const user = require('./controllers/user');
  const authenMiddleware = require('./middleware/authentication');
  const authorMiddleware = require('./middleware/authorization');

  application.get('/logout', user.logout);

  application.post('/forgot', user.postForgot);
  application.get('/api/profile', authenMiddleware.isAuthenticated, user.profile);

  application.get('/reset/:token', user.getReset);
  application.post('/reset/:token', user.postReset);
  const folder = require('./controllers/folder');

  application.get('/api/folder/:folderId', authenMiddleware.isAuthenticated, folder.getFolder);
  application.get('/api/folders', authenMiddleware.isAuthenticated, folder.get);
  application.get('/api/user', authenMiddleware.isAuthenticated, user.getProfileByMail);

  const files = require('./controllers/files');

  application.get('/api/files/:folderId', authenMiddleware.isAuthenticated, files.getFiles);
  application.get('/api/file/:id', authenMiddleware.isAuthenticated, authorMiddleware.isAuthorized, files.get);
  application.get('/api/files', authenMiddleware.isAuthenticated, files.getFilesShared);

  const passport = require('passport');

  application.get('/auth/google',
    passport.authenticate('google', { scope: ['profile email'] }));
  application.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/');
    });

  const home = require('./controllers/home');
  application.get('/', home.index);
  application.get('*', home.index);
  const moduleApi = require('./api');
  moduleApi.setupAPI(application);
};

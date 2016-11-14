/**
 * load routes
 * @param application
 */
module.exports = function (application) {
  const home = require('./controllers/home');
  const cors = require('cors');
  application.all('/api/*', cors());
  application.get('*', home.index);

  const user = require('./controllers/user');
  application.get('/logout', user.logout);

  application.post('/forgot', user.postForgot);

  application.get('/reset/:token', user.getReset);
  application.post('/reset/:token', user.postReset);

  const passport = require('passport');

  application.get('/auth/google',
    passport.authenticate('google', { scope: ['profile email'] }));
  application.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect(req.session.returnTo || '/');
    });
  const moduleApi = require('./api');
  moduleApi.setupAPI(application);
};

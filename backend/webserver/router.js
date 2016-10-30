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

  const moduleApi = require('./api');
  moduleApi.setupAPI(application);
}

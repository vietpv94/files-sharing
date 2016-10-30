const passport = require('passport');
const User = require('../core/models/User');
const logger = require('morgan');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
var auths = ['mongo', 'google'];
passport.use('mongo', require('./auth/mongo').strategy)
passport.use('google', require('./auth/google').strategy);

/*auths.forEach(function(auth) {
  try {
    passport.use(auth, require('./auth/' + auth).strategy);
  } catch (err) {
    logger('Can not load the ' + auth + ' strategy', err.message);
  }
});*/

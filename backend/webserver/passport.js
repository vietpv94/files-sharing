const passport = require('passport');
const User = require('../core/db/mongo/models/User');
const logger = require('morgan');
const _ = require('lodash');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

var auths = ['mongo', 'google'];

_.forEach(auths, (auth) => {
  try {
    passport.use(auth, require('./auth/' + auth).strategy);
  } catch (err) {
    logger('Can not load the ' + auth + ' strategy', err.message);
  }
});


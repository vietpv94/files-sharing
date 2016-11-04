const LocalStrategy = require('passport-local').Strategy;

module.exports = {
  name: 'mongo',
  strategy: new LocalStrategy({
    usernameField: 'email'
  }, require('../../core/auth/mongo').auth)
};

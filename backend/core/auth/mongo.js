const User = require('../db/mongo/models/User');
/**
 * Authenticate a user from one of its email and password
 *
 * @param {String} email
 * @param {String} password
 * @param {Function} done
 */
function auth(email, password, done) {
  User.loadFromEmail(email, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'Email ' + email + ' not found'});
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      }

      return done(null, false, { message: 'Invalid email or password.' });
    });
  });
}

module.exports.auth = auth;

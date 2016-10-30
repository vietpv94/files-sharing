const User = require('../models/User');
/**
 * Authenticate a user from one of its email and password
 *
 * @param {String} email
 * @param {String} password
 * @param {Function} done
 */
function auth(email, password, done) {
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { msg: `Email ${email} not found.` });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      }

      return done(null, false, { msg: 'Invalid email or password.' });
    });
  });
}

module.exports.auth = auth;

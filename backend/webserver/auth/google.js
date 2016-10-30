const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

/**
 * Sign in with Google.
 */
module.exports = {
  name: 'google',
  strategy: new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
  }, require('../../core/auth/google').auth)
};

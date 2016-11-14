'use strict';

const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const trim = require('trim');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  google: String,
  steam: String,
  tokens: Array,

  profile: {
    name: String,
    gender: String,
    location: String,
    website: String,
    picture: String
  },
  login: {
    disabled: {type: Boolean, default: false},
    failures: {
      type: [Date]
    },
    success: {type: Date}
  }
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods = {
  comparePassword: function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      cb(err, isMatch);
    });
  },

  loginFailure: function(cb) {
    this.login.failures.push(new Date());
    this.save(cb);
  },

  loginSuccess: function(cb) {
    this.login.success = new Date();
    this.login.failures = [];
    this.save(cb);
  },

  resetLoginFailure: function(cb) {
    this.login.failures = [];
    this.save(cb);
  },

  /**
   * Helper method for getting user's gravatar.
   */

  gravatar: function (size = 200) {
    if (!this.email) {
      return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
  }
};

userSchema.statics = {
  loadFromEmail: function(email, callback) {
    this.findOne({
      email: email.toLowerCase()
    }, callback);
  }
};
module.exports = mongoose.model('User', userSchema);

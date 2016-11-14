'use strict';

const async = require('async');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const User = mongoose.model('User');

const DEFAULT_LOGIN_FAILURE = 5;

module.exports.success = (email, callback) => {
  User.loadFromEmail(email, function(err, user) {
    if (err) {
      return callback(err);
    }
    if (!user) {
      return callback(new Error('No such user ' + email));
    }

    user.loginSuccess(callback);
  });
};

module.exports.failure = (email, callback) => {
  User.loadFromEmail(email, function(err, user) {
    if (err) {
      return callback(err);
    }
    if (!user) {
      return callback(new Error('No such user ' + email));
    }

    user.loginFailure(callback);
  });
};

module.exports.canLogin = (email, callback) => {
  var size = DEFAULT_LOGIN_FAILURE;
  config.get(function(err, data) {
    if (data && data.failure && data.failure.size) {
      size = data.failure.size;
    }

    User.loadFromEmail(email, function(err, user) {
      if (err) {
        return callback(err);
      }
      if (!user) {
        return callback(new Error('No such user ' + email));
      }
      if (user.login.failures && user.login.failures.length >= size) {
        return callback(null, false);
      }
      return callback(err, true);
    });
  });
};

module.exports.sendPasswordReset = (user, callback) => {

  async.waterfall([
    function (done) {
      User
        .findOne({ passwordResetToken: user.passwordResetToken })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
          if (err) { return next(err); }
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },
    function (user, done) {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'noreply@localhost',
        subject: 'Your password has been changed',
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
      });
    }
  ], callback);
};

const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../../core/db/mongo/models/User');
const userlogin = require('../../core/user/login');
const userModule = require('../../core/user');

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {

  const username = req.body.username;

  passport.authenticate('mongo', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      userlogin.failure(username, function(err, data) {
        if (err) {
          console.log('ERROR', 'Problem while setting login failure for user ' + username, err);
        }
        return res.status(403).json({
          error: {
            code: 403,
            message: 'Login error',
            details: 'Bad username or password'
          }
        });
      });

      req.flash('errors', { msg: 'Failed! You are not logged in.' });
    } else {
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        userlogin.success(username, function(err, user) {
          if (err) {
            console.log('ERROR', 'Problem while setting login success for user ' + username, err);
          }

          var result = {};
          if (user) {
            result = user.toObject();
            delete result.password;
          }
          return res.status(200).json(result);
        });
        req.flash('success', { msg: 'Success! You are logged in.' });
      });
    }
  })(req, res, next);
};

/**
 * Logout the current user
 *
 * @param {request} req
 * @param {response} res
 */
exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {

  const user = new User({
    email: req.body.username,
    password: req.body.password
  });

  User.findOne({ email: req.body.username }, (err, existingUser) => {
    if (err) { return next(err); }

    if (existingUser) {
      console.log(existingUser);
      return res.status(400).json({ error: { status: 400, message: 'Bad request', details: 'User is exist hoho!'}});
    }
    user.save((err) => {
      if (err) {
        return res.status(400).json({ error: { status: 400, message: 'Bad request', details: err.message}});
      }
      req.logIn(user, (err) => {
        if (err) { return next(err); }
        userlogin.success(req.body.email, function(err, user) {
          if (err) {
            logger.error('Problem while setting login success for user ' + username, err);
          }

          var result = {};
          if (user) {
            result = user.toObject();
            delete result.password;
          }
          return res.status(200).json(result);
        });
        req.flash('success', { msg: 'Success! You are logged in.' });
      });
    });
  });
};

/**
 * GET /account
 * Profile page.
 */
exports.profile = (req, res, next) => {
  var uuid = req.params.uuid;
  if (!uuid) {
    return res.status(400).json({error: {code: 400, message: 'Bad parameters', details: 'User ID is missing'}});
  }

  userModule.get(uuid, function(err, user) {
    if (err) {
      return res.status(500).json({
        error: 500,
        message: 'Error while loading user ' + uuid,
        details: err.message
      });
    }

    if (!user) {
      return res.status(404).json({
        error: 404,
        message: 'User not found',
        details: 'User ' + uuid + ' has not been found'
      });
    }
    var result = user.toObject();
    res.status(200).json(result);
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
          return res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', { msg: 'Profile information has been updated.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.password = req.body.password;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { return next(err); }
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(token => token.kind !== provider);
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('info', { msg: `${provider} account has been unlinked.` });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }



};


/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function (done) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (err) { return done(err); }
        if (!user) {
          req.flash('errors', { msg: 'Account with that email address does not exist.' });
          return res.redirect('/forgot');
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save((err) => {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
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
        subject: 'Reset your password on Files Sharing',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/forgot');
  });
};

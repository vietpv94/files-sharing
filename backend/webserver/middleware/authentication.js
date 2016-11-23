/**
 * Login Required middleware.
 */

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    error: {
      code: 401,
      message: 'Login error',
      details: 'Please log in first'
    }
  });
};


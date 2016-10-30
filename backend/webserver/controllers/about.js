/**
 * GET /about
 * about form page.
 */
exports.index = (req, res) => {
  res.render('about', {
    title: 'About Team'
  });
};

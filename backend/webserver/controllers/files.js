/**
 * GET /about
 * about form page.
 */
exports.index = (req, res) => {
  res.render('files/my-files', {
    title: 'My Files'
  });
};

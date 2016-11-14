/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
 res.render('layout', {
   title: 'HUST'
 });
};

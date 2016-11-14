/**
 * GET folders
 */
const Folders = require('../../core/db/mongo/models/Folder');

exports.create = (req, res, next) => {
  const folder = new Folders({
    name: req.body.name
  });

  Folders.findOne({ name: req.body.name }, (err, existFolder) => {
    if(err) { return next(err); }

    folder.name = existFolder ? req.body.name + '(copy) ' + req.body.createdAt : req.body.name;

    folder.save((err) => {
      if (err) {
        return next(err);
      }

      res.redirect('/my-files');
    });
  });
};

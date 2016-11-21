/**
 * GET folders
 */
const Folders = require('../../core/db/mongo/models/Folder');
const mongoose = require('mongoose');

exports.create = (req, res, next) => {
  const folder = new Folders({
    name: req.body.name
  });

  const userId = mongoose.Types.ObjectId(req.body.userId);
  folder.parentId = req.body.parentId ? mongoose.Types.ObjectId(req.body.parentId) : null;

  Folders.findOne({ name: req.body.name , userId: userId}, (err, existFolder) => {
    if (err) {
      return next(err);
    }

    folder.name = existFolder ? req.body.name + '(' + existFolder.length + ')' : req.body.name;

    folder.userId = userId;
    folder.save((err, saved) => {
      if (err) {
        return next(err);
      }

      if (saved) {
        var childId = saved._id;
        if (folder.parentId) {
          Folders.findOneAndUpdate({ _id: folder.parentId }, { $addToSet: { childId: childId } }, { new: true }, function(err) {
            if (!err) {
              return res.status(201).end();
            }
          });
        } else {
          return res.status(201).end();
        }
      }

      res.status(404).end();
    });
  });
};

exports.get = (req, res, next) => {
  const userId = req.params.uuid;

  if (!userId) {
    return res.status(400).json({error: {code: 400, message: 'Bad parameters', details: 'User ID is missing'}});
  }

  Folders.find({ userId: userId }, (err, folders) => {
    if (err) {
      return next(err);
    }

    if (folders) {
      return res.status(200).json(folders);
    }

    return res.status(404).end();
  });
};

exports.getFolder = (req, res) => {
  var folderId = req.params.folderId;
  if (!folderId) {
    return res.status(400).json({
      error: {
        code: 400, message: 'Bad parameters', details: 'Folder ID is missing'
      }
    });
  }
  Folders.findById(folderId, (err, folder) => {
    if (err) {
      return res.status(500).json({
        error: 500,
        message: 'Error while loading folder ' + folderId,
        details: err.message
      });
    }

    if (!folder) {
      return res.status(404).json({
        error: 404,
        message: 'Folder not found',
        details: 'Folder ' + folderId + ' has not been found'
      });
    }

    var result = folder.toObject();

    return res.status(200).json(result);
  })
};

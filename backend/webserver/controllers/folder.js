/**
 * GET folders
 */
const Folders = require('../../core/db/mongo/models/Folder');
const mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

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
  const folderId = req.params.folderId;
  if (!folderId) {
    return res.status(400).json({
      error: {
        code: 400, message: 'Bad parameters', details: 'Folder ID is missing'
      }
    });
  }
  getFolderById(folderId, (err, folder) => {
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
  });
};

function getFolderById(id, callback) {
  var folderId = new ObjectId(id);

  if(!id) {
    return callback(new Error('ID is mandatory'));
  }

  Folders.findById(folderId, callback);
}

exports.update = (req, res) => {
  const folderId = req.params.folderId;
  if (!folderId) {
    return res.status(400).json({
      error: {
        code: 400, message: 'Bad parameters', details: 'Folder ID is missing'
      }
    });
  }
  var data = req.body;

  if (!data) {
    return res.status(400).json({error: 400, message: 'Bad Request', details: 'No value defined'});
  }

  Folders.findOneAndUpdate({_id: folderId}, { $set: data || {} }, function(err) {
    if (err) {
      return res.status(500).json({
        error: {
          code: 500,
          message: 'Server Error',
          details: err.message || err
        }
      });
    }

    return res.status(201).end();
  });
};

function removeLoop(childId, callback) {
  if (!childId) {
    return callback();
  }
  Folders.findOne({ _id: childId }, (err, folder) => {
    if (err) {
      return callback(new Error('Server error'));
    }
    Folders.remove({ _id: childId }, (err) => {
      if (err) {
        return callback(new Error('Server error'));
      }
    });
    if (folder.childId.length > 0) {
      folder.childId.forEach((childId) => {
        removeLoop(childId);
      });
    }
  });
}
exports.remove = (req, res) => {
  const folderId = req.params.folderId;

  if (!folderId) {
    return res.status(400).json({
      error: {
        code: 400, message: 'Bad parameters', details: 'Folder ID is missing'
      }
    });
  }

  getFolderById(folderId, (err, folder) => {
    if(err) {
      return res.status(500).json({
        error: {
          code: 500,
          message: 'Server Error',
          details: err.message || err
        }
      });
    }
    const parentId = folder.parentId;
    const childIds = folder.childId;

    Folders.remove({_id: folderId}, (err) => {
      if(err) {
        return res.status(500).json({
          error: {
            code: 500,
            message: 'Server Error',
            details: err.message || err
          }
        });
      }
      if (childIds.length > 0) {
        childIds.forEach((childId) => {
          removeLoop(childId, (err) => {
            return res.status(500).json({
              error: {
                code: 500,
                message: 'Server Error',
                details: err.message || err
              }
            });
          });
        });
      }
      if (parentId) {
        Folders.update({ _id: parentId }, { $pull: { childId: new ObjectId(folderId) }}, (err) => {
          if (err) {
            return res.status(500).json({
              error: {
                code: 500,
                message: 'Server Error',
                details: err.message || err
              }
            });
          }
        });
      }

      return res.status(201).end();
    });
  });
};

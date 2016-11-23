'use strict';

var files = require('../../core/files');
var Busboy = require('busboy');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

function create(req, res) {
  var size = parseInt(req.query.size, 10);
  if (isNaN(size) || size < 1) {
    return res.status(400).json({
      error: 400,
      message: 'Bad Parameter',
      details: 'size parameter should be a positive integer (of course =))'
    });
  }

  var fileId = new ObjectId();
  var options = {};
  var metadata = {};

  if (req.query.name) {
    options.filename = req.query.name;
  }

  if (req.user) {
    metadata.creator = {objectType: 'user', id: req.user._id, folderId: mongoose.Types.ObjectId(req.query.folderId)};
  }

  var saveStream = (stream) => {
    var interrupted = false;
    req.on('close', (err) => {
      interrupted = true;
    });

    return files.store(fileId, req.query.mimetype, metadata, stream, options, (err, saved) => {
      if (err) {
        return res.status(500).json({
          error: {
            code: 500,
            message: 'Server error',
            details: err.message || err
          }
        });
      }

      if (saved.length !== size || interrupted) {
        return files.delete(fileId, (err) => {
          res.status(412).json({
            error: {
              code: 412,
              message: 'File size mismatch',
              details: 'File size given by user agent is ' + size +
              ' and file size returned by storage system is ' +
              saved.length
            }
          });
        });
      }
      return res.status(201).json({_id: fileId});
    });
  };

  if (req.headers['content-type'] && req.headers['content-type'].indexOf('multipart/form-data') === 0) {
    var nb = 0;
    var busboy = new Busboy({
      headers: req.headers
    });

    busboy.on('file', (fieldname, file) => {
      nb++;
      return saveStream(file);
    });

    busboy.on('finish', function() {
      if (nb === 0) {
        res.status(400).json({
          error: {
            code: 400,
            message: 'Bad request',
            details: 'The form data must contain an attachment'
          }
        });
      }
    });
    req.pipe(busboy);

  } else {
    return saveStream(req);
  }
}

function getFiles(req, res) {
  if(!req.params.folderId) {
    return res.status(400).json({
      error: 400,
      message: 'Bad request',
      details: 'Missing folderId parameter'
    });
  }

  files.find({'metadata.creator.folderId': new ObjectId(req.params.folderId) }, (err, files) => {
    if (err) {
      return res.status(503).json({
        error: 503,
        message: 'Server error',
        details: err.message || err
      });
    }
    if (files) {
      return res.status(200).json(files)
    }

    return res.status(404).end();
  });
}

function remove(req, res) {
  if (!req.params.id) {
    return res.status(400).json({
      error: {
        code: 400,
        message: 'Bad request',
        details: 'Missing id parameter'
      }
    });
  }

  files.delete(req.params.id, (err) => {
    if (err) {
      return res.status(500).json({
        error: {
          code: 500,
          message: 'Server Error',
          details: err.message || err
        }
      });
    }
    return res.status(204).end();
  });
}

function get(req, res) {
  if (!req.params.id) {
    return res.status(400).json({
      error: 400,
      message: 'Bad Request',
      details: 'Missing id parameter'
    });
  }

  files.get(req.params.id, function(err, fileMeta, readStream) {
    if (err) {
      return res.status(503).json({
        error: 503,
        message: 'Server error',
        details: err.message || err
      });
    }

    if (!readStream) {
      if (req.accepts('html')) {
        res.status(404).end();
        return res.render('404', { url: req.url });
      } else {
        return res.status(404).json({
          error: 404,
          message: 'Not Found',
          details: 'Could not find file'
        });
      }
    }

    if (fileMeta) {
      var modSince = req.get('If-Modified-Since');
      var clientMod = new Date(modSince);
      var serverMod = fileMeta.uploadDate;
      clientMod.setMilliseconds(0);
      serverMod.setMilliseconds(0);

      if (modSince && clientMod.getTime() === serverMod.getTime()) {
        return res.status(304).end();
      } else {
        res.set('Last-Modified', fileMeta.uploadDate);
      }

      res.type(fileMeta.contentType);

      if (fileMeta.filename) {
        res.set('Content-Disposition', 'inline; filename="' +
          fileMeta.filename.replace(/"/g, '') + '"');
      }

      if (fileMeta.length) {
        res.set('Content-Length', fileMeta.length);
      }
    }

    res.status(200);
    return readStream.pipe(res);
  });
}

function update(req, res) {
  if (!req.params.id) {
    return res.status(400).json({
      error: 400,
      message: 'Bad Request',
      details: 'Missing id parameter'
    });
  }
  if (!req.body) {
    return res.status(400).json({error: 400, message: 'Bad Request', details: 'No value defined'});
  }

  var data = req.body;

  files.addMeta(req.params.id, data, function(err) {
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
}
module.exports = {
  create: create,
  getFiles: getFiles,
  get: get,
  update: update,
  remove: remove
};

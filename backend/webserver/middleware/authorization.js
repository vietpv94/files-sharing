'use strict';

const files = require('../../core/files');
const _ = require('lodash');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

/**
 * Authorization Required middleware.
 */

exports.isAuthorized = (req, res, next) => {
  const user = req.user;
  const fileId = req.params.id;

  files.getMeta(fileId, (err, meta) => {
    if (err) {
      return res.status(500).json({
        error: {
          code: 500,
          message: 'Server error',
          details: err.message || err
        }
      });
    }
    const creator = meta.metadata.creator;
    if (creator.id.equals(user._id)) {
      return next();
    }
    const readers = meta.metadata.readers;

    if (_.indexOf(readers, user._id.toString()) > - 1) {
      return next();
    }

    return res.status(401).json({
      error: {
        code: 401,
        message: 'Authorized error',
        details: 'Do not have Authorized'
      }
    });
  })
};

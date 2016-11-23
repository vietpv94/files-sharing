'use strict';

var Grid = require('gridfs-stream');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var chunk_size = 1024;
var extend = require('extend');

function getMongoID(id) {
  if (!id || !(id + '').length) {
    return null;
  }
  if (id.toHexString) {
    return id;
  }
  var outid;
  try {
    outid = new ObjectId(id);
  } catch (e) {
    return null;
  }
  return outid;
}

function getGrid() {
  return new Grid(mongoose.connection.db, mongoose.mongo);
}

module.exports.find = (query, callback) => {console.log(query)
  var gfs = getGrid();
  gfs.files.find(query).toArray(function(err, meta) {
    if (err) {
      return callback(err);
    }
    return callback(null, meta);
  });
};

module.exports.store = function(id, contentType, metadata, stream, options, callback) {
  var mongoId = getMongoID(id);
  if (!mongoId) {
    return callback(new Error('ID is mandatory'));
  }

  if (!stream) {
    return callback(new Error('Stream is mandatory'));
  }

  if (!metadata) {
    return callback(new Error('Metadata is required'));
  }

  if (!metadata.creator) {
    return callback(new Error('Creator metadata is required'));
  }

  callback = callback || function(err, result) {
    console.log(err);
    console.log(result);
  };

  var strMongoId = mongoId.toHexString(); // http://stackoverflow.com/a/27176168
  var opts = {
    _id: strMongoId,
    mode: 'w',
    content_type: contentType
  };

  options = options || {};

  if (options.filename) {
    opts.filename = options.filename;
  }

  if (options.chunk_size) {
    var size = parseInt(options.chunk_size, 10);
    if (!isNaN(size) && size > 0 && size < 255) {
      opts.chunk_size = chunk_size * size;
    }
  }

  opts.metadata = metadata;

  var gfs = getGrid();
  var writeStream = gfs.createWriteStream(opts);

  writeStream.on('close', function(file) {
    return callback(null, file);
  });

  writeStream.on('error', function(err) {
    return callback(err);
  });

  stream.pipe(writeStream);
};

function getMeta(id, callback) {
  const mongoId = getMongoID(id);
  if (!mongoId) {
    return callback(new Error('ID is mandatory'));
  }

  const gfs = getGrid();
  gfs.files.findOne({_id: mongoId}, callback);
}
module.exports.getMeta = getMeta;

module.exports.addMeta = function(id, data, callback) {
  const mongoId = getMongoID(id);
  if (!mongoId) {
    return callback(new Error('ID is mandatory'));
  }

  if (!data) {
    return callback(new Error('Metadata value is mandatory'));
  }

  getMeta(mongoId, function(err, file) {
    if (err) {
      return callback(err);
    }
    if (file) {
      extend(true, file, data);
      const gfs = getGrid();
      return gfs.files.update({_id: mongoId}, file, callback);
    }
    return callback();
  });
};

function get(id, callback) {
  const mongoId = getMongoID(id);
  if (!mongoId) {
    return callback(new Error('ID is mandatory'));
  }

  getMeta(id, function(err, meta) {
    if (err) {
      return callback(err);
    }

    if (!meta) {
      return callback();
    }

    const gfs = getGrid();
    const readstream = gfs.createReadStream({
      _id: mongoId
    });
    return callback(err, meta, readstream);
  });
}
module.exports.get = get;

module.exports.delete = function(id, callback) {
  const mongoId = getMongoID(id);
  if (!mongoId) {
    return callback(new Error('ID is mandatory'));
  }
  const gfs = getGrid();
  return gfs.remove({_id: mongoId}, callback);
};

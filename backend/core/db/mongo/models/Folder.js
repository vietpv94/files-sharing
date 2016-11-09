'use strict';

const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: {type: Date, default: Date.now, expires: 600},
  schemaVersion: {type: Number, default: 1}
});

module.exports = mongoose.model('folderSchema', folderSchema);

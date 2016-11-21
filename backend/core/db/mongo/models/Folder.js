'use strict';

const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true},
  parentId: { type: mongoose.Schema.ObjectId, ref: 'Folders'},
  childId: [],
  createdAt: {type: Date, default: Date.now},
  schemaVersion: {type: Number, default: 1}
});

module.exports = mongoose.model('Folders', folderSchema);

const mongoose = require('mongoose');
const chalk = require('chalk');
let connected = false;

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('connected', () => {
  connected = true;
  console.log('%s MongoDB connection established!', chalk.green('✓'));
});

mongoose.connection.on('error', () => {
  connected = false;
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

module.exports.isConnected = function() {
  return connected;
};

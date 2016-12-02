const mongoose = require('mongoose');
const chalk = require('chalk');
const url = require('url');
let connected = false;
let initialized = false;
const reconectTimes = 10;
const forceReconnect = true;

function getTimeout() {
  return process.env.MONGODB_TIMEOUT || 10000;
}

function getHost() {
  return process.env.MONGODB_HOST || 'localhost';
}

function getBackupHost() {
  return process.env.MONGODB_HOST_BACKUP;
}

function getPort() {
  return process.env.MONGODB_PORT || '27017';
}

function getDbName() {
  return process.env.MONGODB_NAME || 'files-sharing-dev';
}

function getConnectionString(hostname, port, dbname) {
  const timeout = getTimeout();
  const connectionOptions = {
      connectTimeoutMS: timeout
    };

  const connectionHash = {
    hostname: hostname,
    port: port,
    pathname: '/' + dbname,
    query: connectionOptions
  };

  return 'mongodb:' + url.format(connectionHash);
}

function getDefaultConnectionString() {
  return getConnectionString(getHost(), getPort(), getDbName());
}
function getBackupConnectionString() {
  return getConnectionString(getBackupHost(), getPort(), getDbName())
}
/**
 * Connect to MongoDB.
 */
function mongooseConnect(isUseBackup) {
  let connectionInfos;
  if (isUseBackup) {
    connectionInfos = { url: getBackupConnectionString() };
  } else {
    connectionInfos  = { url: getDefaultConnectionString() };
  }

  if (!connectionInfos) {
    return false;
  }

  try {
    mongoose.Promise = global.Promise;

    console.log('%s Launch mongoose.connect on ' + connectionInfos.url, chalk.green('✓'));
    mongoose.connect(connectionInfos.url);
  } catch (e) {
    onConnectError(e);
    return false;
  }
  initialized = true;
  return true;
}

function init() {

  if (initialized) {
    mongoose.disconnect(function() {
      initialized = false;
      mongooseConnect();
    });
    return;
  }
  return mongooseConnect();
}

function onConnectError(err) {
  console.log('%s MongoDB connection error %s. Please make sure MongoDB is running.', chalk.red('✗'), err);
}
module.exports.init = init;

module.exports.isConnected = () => {
  return connected;
};

mongoose.connection.on('error', (e) => {
  onConnectError(e);
  initialized = false;
});

mongoose.connection.on('connected', function(e) {
  console.log('%s MongoDB connection established!', chalk.green('✓'));
  connected = true;
});

mongoose.connection.on('disconnected', function() {
  console.log('%s Connection to MongoDB has been lost', chalk.red('✗'));
  connected = false;
  if (forceReconnect) {
    let i = 0;
    while (i < reconectTimes) {
      i++;
      console.log('%s Reconnecting to MongoDB', chalk.yellow('↺'));
      mongooseConnect();
    }

    mongooseConnect(true)
  }
});
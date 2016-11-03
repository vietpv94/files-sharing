const express = require('express'),
      serverApplication = require('./application'),
      http = require('http'),
      AsyncEventEmitter = require('async-eventemitter'),
      chalk = require('chalk');

const application = express();
let webserver = {
  application: serverApplication,

  ip: '0.0.0.0',
  port: 3000,
  virtualhosts: [],

  started: false
};

const emitter = new AsyncEventEmitter();
emitter.setMaxListeners(0);

function start(callback) {
  if (!webserver.port) {
    console.log('The webserver needs to be configured before it is started');
    process.exit(1);
  }
  if (webserver.started) {
    return callback();
  }
  webserver.started = true;

  if (webserver.virtualhosts.length) {
    webserver.virtualhosts.forEach(function (hostname) {
      application.use(express.vhost(hostname, serverApplication));
    });
    webserver.application = application;
  }
  let callbackFired = false;

  const ws = webserver;
  const DISABLED = 0;
  const STOPPED = 1;
  const STARTED = 2;

  let state = ws.ip && ws.port? STOPPED: DISABLED;

  if (state === STOPPED) {
    webserver.server = http.createServer(webserver.application).listen(webserver.port, webserver.ip);

    _setupEventListeners(webserver.server);
  }

  function _listenCallback(server, err) {
    if (server === webserver.server) {
      state = STARTED;
    }

    const address = server.address();

    if (address) {
      console.log('%s Webserver listening on ' + address.address + ' port ' +
        address.port + ' (' + address.family + ')', chalk.green('✓'));
    }
    server.removeListener('listening', _listenCallback);
    server.removeListener('error', _listenCallback);

    // If an error occurred call the callback
    if (!callbackFired) {
      if (err) {
        callbackFired = true;
        callback(err);
      }
    }
  }

  function _setupEventListeners(server) {
    server.on('listening', _listenCallback.bind(null, server));
    server.on('error', _listenCallback.bind(null, server));
  }
}

webserver.start = start;
module.exports.webserver = webserver;
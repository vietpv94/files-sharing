'use strict';

/**
 * load all api when called
 */

function setupAPI(application) {
  const router = require('express').Router();

  require('./user')(router);
  require('./folder')(router);
  require('./file')(router);

  application.use('/api', router);
}

module.exports.setupAPI = setupAPI;

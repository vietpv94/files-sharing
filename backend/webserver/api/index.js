/**
 * load all api when called
 */

function setupAPI(application) {
  const router = require('express').Router();

  require('./user')(router);

  application.use('/api', router);
}

module.exports.setupAPI = setupAPI;

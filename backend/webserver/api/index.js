/**
 * load all api when called
 */

function setupAPI(application) {

  require('./user')(application);
}

module.exports.setupAPI = setupAPI;

const dotenv = require('dotenv'),
      chalk = require('chalk'),
      async = require('async'),
      core = require('./backend/core');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.dev' });

function start() {
  require('./backend/webserver').webserver.start(function(err) {
    if(err) {
      console.log('Error:','Something went wrong on server!');
      console.log('Throwing:' + err);
    }
  });
}

function initCore(callback) {
  core.init(function(err) {
    if (!err) {
      console.log('%s App is now started', chalk.green('✓'));
    }
    callback(err);
  });
}
async.series([initCore, start], function(err) {
  if (err) {
    console.error('Fatal error: %s', err);
    if (err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
});
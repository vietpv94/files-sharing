const dotenv = require('dotenv');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.dev' });

require('./backend/webserver').webserver.start(function(err) {
  if(err) {
    console.log('Error:','Something went wrong on server!');
    console.log('Throwing:' + err);
  }
});

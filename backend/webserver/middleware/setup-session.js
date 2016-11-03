'use strict';

const expressSession = require('express-session'),
  mongoose = require('mongoose'),
  core = require('../../core'),
  mongo = require('../../core/db/mongo'),
  MongoStore = require('connect-mongo')(expressSession);

function setupSession(session) {
  var setSession = function() {
    console.log('mongo is connected, setting up mongo session store');

    session({
      resave: true,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET,
      store: new MongoStore({
        mongoose: mongoose,
        url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
        autoReconnect: true
      })
    });
  };

  if (mongo.isConnected()) {
    setSession();
  }
}

module.exports = setupSession;

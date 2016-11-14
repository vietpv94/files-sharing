const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const lusca = require('lusca');
const flash = require('express-flash');
const path = require('path');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');
const setupSession = require('./middleware/setup-session');
const cdm = require('connect-dynamic-middleware');

const FRONTEND_PATH = path.normalize(__dirname + '/../../frontend');
const upload = multer({ dest: FRONTEND_PATH + 'uploads' });

/**
 * Create Express server.
 */
const app = express();
exports = module.exports = app;

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', FRONTEND_PATH + '/views');
app.set('view engine', 'jade');
app.get('/views/*', function(req, res) {
    var templateName = req.params[0].replace(/\.html$/, '');
    res.render(templateName, { basedir: FRONTEND_PATH + '/views' });
  }
);
app.locals.pretty = true;

app.use('/components', express.static(FRONTEND_PATH + '/components'));
app.use('/js', express.static(FRONTEND_PATH + '/js'));
app.use('/modules', express.static(FRONTEND_PATH + '/modules'));

app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: FRONTEND_PATH,
  dest: FRONTEND_PATH
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

var sessionMiddleware = cdm(session({
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 6000000 },
  secret: 'this is the secret!'
}));

app.use(sessionMiddleware);
setupSession(sessionMiddleware);

require('./passport');

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(function(req, res, next) {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(FRONTEND_PATH, { maxAge: 31557600000 }));
require('./router')(app);

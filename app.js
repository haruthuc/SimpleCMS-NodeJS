var express = require('express'),
engine = require('ejs-locals');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// You need session to use connect flash
var session = require('express-session');
var db = require('./helpers/db.js');
var routes = require('./routes/index');
var admin = require('./routes/admin');
var upload = require('./routes/upload');

var passport = require('./helpers/passport');

var app = express();

var flash = require('connect-flash');

var helmet = require('helmet');
app.use(helmet());

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(logger('combined'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use( session({
  saveUninitialized : true,
  secret : 'Scms2ADD@D#$#@#@#A' ,
  resave : true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//register db content helper
app.locals.content_helper = db.get_content_helper;

app.use('/', routes);
app.use('/admin', admin(passport));
app.use('/file',upload(passport));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('frontend/error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('frontend/error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

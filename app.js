// CALL ENV FILE
require('dotenv').config()

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');

var publicRouter = require('./routes/public');
var customerRouter = require('./routes/customer');
var loginRouter = require('./routes/auth');
var researcherRouter = require('./routes/researcher');

// DATABASE CONNECT
// var db = require('./config/database');
// var rpoContinents = require('./repositories/continents');

var app = express();



app.use(bodyParser.json())
app.use(cookieParser())

// app.post('/login', login)
// app.post('/refrsh', refresh)


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', publicRouter);
app.use('/login', loginRouter);
app.use('/customer', customerRouter);
app.use('/researcher', researcherRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// var continents = rpoContinents.getContinents();
// console.log(continents);
// db.getUserById(3);

module.exports = app;

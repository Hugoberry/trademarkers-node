// CALL ENV FILE
require('dotenv').config()

const middleware = require('./controller/middleware');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

const expressLayouts = require('express-ejs-layouts');
var flash = require('express-flash-2');

let variable = require('./config/variables');

var cron = require('node-cron');
var oppositionCronService = require('./services/oppositionCronService')
var oaCronService = require('./services/oaCronService')
var orderService = require('./services/orderService')



var app = express();

app.use(fileUpload());

app.use(bodyParser.json())
app.use(cookieParser())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);


// APP  CONTAINER =========== >> 
let conn = require('./config/DbConnect');
conn.connectToServer( function( err, client ) {

  if (err) console.log(err);
  // start the rest of your app here

  app.locals.moment = require('moment');

  var publicRouter = require('./routes/public');
  var customerRouter = require('./routes/customer');
  var loginRouter = require('./routes/auth');
  var researcherRouter = require('./routes/researcher');
  var adminRouter = require('./routes/admin');
  var orderRouter = require('./routes/order');

  var apiRouter = require('./routes/api');
  var interceptRouter = require('./routes/routerInterceptor');

  // SESSION STORE ============ >>
  const mongoConnection = mongoose.createConnection(variable.mongoURL, variable.mongoOptions);
  const sessionStore = new MongoStore({
    mongooseConnection: mongoConnection,
    collection: process.env.TBLEXT + 'sessions'
  });
  app.use(session({
    secret: 'secretshhhhhh',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
  }))
  // SESSION STORE ============ <<

  app.use(flash());



  // ROUTE HANDLER ============ >>

  app.set('layout', 'layouts/public-layout');

  app.use('/api/v1', apiRouter);

  app.use('/customer', customerRouter);
  app.use('/researcher', researcherRouter);
  app.use('/njs-admin', adminRouter);
  app.use('/login', loginRouter);
  app.use('/status', orderRouter);
  app.use('/', publicRouter);

// console.log('asd');
  // ROUTE HANDLER ============ <<
  // oppositionCronService.generateDomainEmail();
  // oppositionCronService.sendEvent();
  // CRON JOB SCHEDULER =========== >>
  cron.schedule("0 0 */1 * * *", () => {
    // oppositionCronService.generateDomainEmail();
    // console.log("trigger generate domain / email / event");
  });

  cron.schedule("0 0 */2 * * *", () => {
    // oppositionCronService.sendEvent();
    // console.log("trigger event mailer");
  });

  // oaCronService.sendNOACron();

  // cron.schedule('*/59 30-50 */16 * * mon-fri', () => { 
  //   oaCronService.sendNOACron();
  // }, {
  //   scheduled: true,
  //   timezone: "America/New_York"
  // });

  cron.schedule('0 */20 9-16 * * mon-fri', () => { 
    oaCronService.sendNOACron();
  }, {
    scheduled: true,
    timezone: "America/New_York"
  });

  // orderService.syncOrders()

  // FOR TEST
  // cron.schedule('*/5 6-10 */16 * * mon-fri', () => {
  //   console.log("trigger event mailer");
  //   console.log(app.locals.moment().format("hh:mm:ss"));
  // });



  // CRON JOB SCHEDULER << =========== 



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


});
// APP  CONTAINER =========== << 




module.exports = app;

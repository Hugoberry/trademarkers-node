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
// var cors = require('cors')


const expressLayouts = require('express-ejs-layouts');
var flash = require('express-flash-2');

let variable = require('./config/variables');

var cron = require('node-cron');
var oppositionCronService = require('./services/oppositionCronService')
var oaCronService = require('./services/oaCronService')
var orderService = require('./services/orderService')
var cartService = require('./services/cartService')
var notificationCronService = require('./services/notificationCronService')


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

// app.use(cors())


// APP  CONTAINER =========== >> 
let conn = require('./config/DbConnect');
conn.connectToServer( function( err, client ) {

  if (err) console.log(err);
  // start the rest of your app here

  // Create our number formatter.
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  app.locals.formatter = formatter;
  app.locals.moment = require('moment');
  app.locals.helpers = require('./helpers');

  var publicRouter = require('./routes/public');
  var customerRouter = require('./routes/customer');
  var loginRouter = require('./routes/auth');
  var researcherRouter = require('./routes/researcher');
  var adminRouter = require('./routes/admin');
  var orderRouter = require('./routes/order');
  var tsdr = require('./routes/tsdr');

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

  app.use('/customer', middleware.verify, customerRouter);
  app.use('/researcher', researcherRouter);
  app.use('/njs-admin', adminRouter);
  app.use('/login', loginRouter);
  app.use('/status', orderRouter);
  app.use('/us', tsdr);
  app.use('/', publicRouter);

  // ROUTE HANDLER ============ <<

  // oppositionCronService.generateDomainEmail();
  // oppositionCronService.sendEvent();

  
  // CRON JOB SCHEDULER =========== >>
  

  // RUN EVERY 1 HR TO CHECK ABANDONED CART 
  cron.schedule('0 0 */1 * * *', () => {
    cartService.sendAbandonedCart4hr();
  });

  // RUN EVERYDAY AT 4PM US TIME TO CHECK ABANDONED CART AND ADDED SERVICES
  cron.schedule('0 0 16 * * *', () => { 
    cartService.sendAbandonedCart1d();
    cartService.sendAbandonedCart3d();
    cartService.sendAbandonedCart1Month();
    notificationCronService.fetchOtherServices();
  }, {
    scheduled: true,
    timezone: "America/New_York"
  });

  if ( process.env.ENVIRONMENT != "dev" ) {

    cron.schedule('0 */20 9-16 * * mon-fri', () => { 
      oaCronService.sendNOACron();
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });
    
    cron.schedule('0 0 8 * * mon', () => { 
      oaCronService.sendSOUSummaryNotification();
    });

  }
  

  // orderService.syncOrders()

  // FOR TEST
  // cron.schedule('*/5 6-10 */16 * * mon-fri', () => {
  //   console.log("trigger event mailer");
  //   console.log(app.locals.moment().format("hh:mm:ss"));
  // });

 //test

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

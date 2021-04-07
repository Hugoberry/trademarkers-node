const variables = require('../config/variables');
var db = require('../config/database');

const mysql = require('mysql');

var rpo = require('../repositories/orders');
var rpoTm = require('../repositories/trademarks');
var rpoTmMongo = require('../repositories/mongoTrademarks');
var rpoCountry = require('../repositories/countries');
var rpoUser = require('../repositories/users');
var rpoUserMongo = require('../repositories/usersMongo');

var helpers = require('../helpers');

var activityService = require('../services/activityLogService');
var mailService = require('../services/mailerService');

const { toInteger, unset } = require('lodash');
let moment = require('moment');
// let customerId = 1293;

exports.orders = async function(req, res, next) {

  let currentUser = helpers.getLoginUser(req);
  let currentData = await rpoUserMongo.getByIdM(currentUser._id)
  currentData = currentData[0]

  // console.log(currentUser,currentData);

  let trademarks;

  if ( currentData && currentData.isNew ) {
    console.log('new')
  } else {

    if ( currentData && !currentData.isMigrate ) {
      console.log('migrate ordersss');
      // fetch trademarks from mysql and update customer ismigrate to true
      let data = {
        isMigrate : true
      }
      rpoUserMongo.updateUser(currentData._id, data);

      let mysqlTrademarks = await rpoTm.fetchTmByUser(currentData._id);

      for (let i=0; mysqlTrademarks.length > i; i++) {

        // FETCH COUNTRY
        let country = await rpoCountry.getById(mysqlTrademarks[i].country_id);

        console.log(mysqlTrademarks[i].order_id);
        let trademark = {
          userId: currentData._id,
          orderCode: mysqlTrademarks[i].order_id,
          userEmail: '',
          serialNumber: mysqlTrademarks[i].filing_number,
          mark: mysqlTrademarks[i].name,
          serviceType: mysqlTrademarks[i].service,
          type: mysqlTrademarks[i].type,
          class: mysqlTrademarks[i].classes,
          description: mysqlTrademarks[i].classes_description,
          country: country[0].name,
          countryId: mysqlTrademarks[i].country_id,
          status: mysqlTrademarks[i].status,
          created_at: toInteger(moment(mysqlTrademarks[i].created_at).format('YYMMDD')),
          created_at_formatted: moment(mysqlTrademarks[i].created_at).format()
        }

        await rpoTmMongo.put(trademark);

      }

    } else {
      console.log('ignore')
    }
  }
  
  trademarks = await rpoTmMongo.getByCustomerId(currentData._id);

  // console.log(trademarks);

  let trademarkSortedData = [];

  for ( let i=0; i < trademarks.length; i++) {
    trademarkSortedData[trademarks[i].countryId] 

    if ( typeof trademarkSortedData[trademarks[i].countryId] === "undefined" ) {
      trademarkSortedData[trademarks[i].countryId] = {
        data:[],
        reg:0,
        pen:0
      }
    }

    trademarkSortedData[trademarks[i].countryId].countryName = trademarks[i].country
    trademarkSortedData[trademarks[i].countryId].data.push(trademarks[i])

    if ( trademarks[i] == "Registered" ) {
      trademarkSortedData[trademarks[i].countryId].reg++
    } else {
      trademarkSortedData[trademarks[i].countryId].pen++
    }
  }

  trademarkSortedData.forEach(element => {
    console.log(element);
  });
  // console.log('formatted',trademarkSortedData);
  res.render('customer/orders', { 
    layout: 'layouts/public-layout-interactive', 
    title: 'Trademarkers LLC Order Status',
    customer: currentData,
    trademarks: trademarkSortedData,
    // data: data
  });
    
}

exports.orderDetail = async function(req, res, next) {

  let trademark = await rpoTmMongo.getById(req.params.id);
  // console.log(trademark);

  if (trademark[0].statusDate) {
    trademark[0].statusDateFormatted = helpers.convertIntToDate(trademark[0].statusDate);
  }

  if (trademark[0].publicationDate) {
    trademark[0].publicationDateFormatted = helpers.convertIntToDate(trademark[0].publicationDate);
  }

  // res.locals = {
  //   siteTitle: "Trademark Search",
  //   description: "Check trademark status",
  //   keywords: "Trademark Status, trademarkers status",
  // };
  

  res.render('customer/orderDetails', { 
    layout: 'layouts/public-layout-interactive', 
    title: 'Trademarkers LLC Order Status',
    trademark: trademark[0]
  });
  
}


exports.updateCustomerForm = async function(req, res, next) {

  // FETCH USER
  // console.log(req.params.id);

  let custId = req.params.id * 1;
  let user = await rpoUserMongo.getById(custId);

  if (user.length <= 0){
    user = await rpoUser.getUserByID( )
    if (user) 
    rpoUserMongo.putUser(user[0])
  }

  // console.log(user);

  // res.locals = {
  //   siteTitle: "Trademarkers Customer Update",
  //   description: "Trademarkers Customer update details",
  //   keywords: "Trademarkers customer details",
  // };

  activityService.logger(req.ip, req.originalUrl, "Customer tried to update details userID: " +user[0].id);

  res.render('customer/updateDetailForm', { 
    layout: 'layouts/public-layout-interactive', 
    title: 'Trademarkers LLC Order Status',
    user: user[0]
  });
  
}

exports.updateCustomerFormSubmit = async function(req, res, next) {

  // FETCH USER
  // console.log(req.params.id);

  

  // console.log(req.body);

  let data = {
    firstName: req.body.fname,
    lastName: req.body.lname,
    suffix: req.body.suffix,
    secondaryEmail: req.body.secondaryEmail 
  }

  
  await rpoUserMongo.updateUser(req.body.customerId, data)

  let user = await rpoUserMongo.getByIdM(req.body.customerId);

  res.flash('success', 'Update Successful!');

  // send email notification
  mailService.sendAdminNotificationCustomerEmailUpdate(user[0]);

  res.redirect("/customer/TC-"+user[0].id+"-7C"); 

  
}

exports.index = function(req, res, next) {
  
  // let urlPhp = process.env.APP_URL_PHP;
  // res.redirect(urlPhp + '/home');

  res.render('customer/', { 
    layout: 'layouts/customer-layout-interactive', 
    title: 'Customer',
    user: helpers.getLoginUser(req)
  });
    
}

exports.redirect = async function(req, res, next) {

    let urlPhp = process.env.APP_URL_PHP;
    
    let redirectUrl = (req.params[0] ? req.params[0] : (req.params.action ? req.params.action : null));

    if (redirectUrl) {
      res.redirect(urlPhp + "/" + redirectUrl);

    } else {
      res.redirect(urlPhp + '/home');
    }

}




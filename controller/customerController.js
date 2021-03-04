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

let customerId = 1293;

exports.orders = async function(req, res, next) {

  // FETCH ORDERS
  // let orders = await rpo.fetchOrderByUserMongo(customerId);
  let trademarks = await rpoTm.fetchTmByUser(customerId);
  let user = await rpoUser.getUserByID(customerId);

  let customer = {
    name:user[0].name,
    id:user[0].id
  }
  // console.log('trademarks',trademarks);
  
  let data = {
    trademark:[]
  };
  
  for(let i = 0; i < trademarks.length; i++) {

    let country = await rpoCountry.getById(trademarks[i].country_id)
    let cronTrademark = await rpoTmMongo.getBymysqlID(trademarks[i].id);
  
    let formattedData = {
      // country: country[0],
      mark : trademarks[i],
      markMongo : cronTrademark[0]
    }
    // console.log(cronTrademark);
    if ( typeof data.trademark[trademarks[i].country_id] === 'undefined' ) {
      data.trademark[trademarks[i].country_id] = {
        data : new Array()
      }
    }

    data.trademark[trademarks[i].country_id].countryName = country[0].name
    data.trademark[trademarks[i].country_id].data.push(formattedData)

  }

  console.log(data.trademark);

  data.trademark.forEach(element => {
    if (element) {
      console.log("el", element);
    }
  });

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };


  res.render('customer/orders', { 
    layout: 'layouts/public-layout-interactive', 
    title: 'Trademarkers LLC Order Status',
    customer: customer,
    trademarks: trademarks,
    data: data
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

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };
  

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
    user = await rpoUser.getUserByID(custId)
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

  let user = await rpoUserMongo.getById(req.params.id * 1);

  // console.log(req.body);

  let data = {
    firstName: req.body.fname,
    lastName: req.body.lname,
    suffix: req.body.suffix,
    secondaryEmail: req.body.registeredEmail
  }

  await rpoUserMongo.updateUser(user[0]._id, data)

  res.flash('success', 'Update Successful!');

  // send email notification
  mailService.sendAdminNotificationCustomerEmailUpdate(user);

  res.redirect("/customer/TC-"+user[0].id+"-7C"); 
  // res.locals = {
  //   siteTitle: "Trademarkers Customer Update",
  //   description: "Trademarkers Customer update details",
  //   keywords: "Trademarkers customer details",
  // };

  // res.render('customer/updateDetailForm', { 
  //   layout: 'layouts/public-layout-interactive', 
  //   title: 'Trademarkers LLC Order Status',
  //   user: user[0]
  // });
  
}






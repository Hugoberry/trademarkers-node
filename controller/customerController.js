const variables = require('../config/variables');
var db = require('../config/database');

const mysql = require('mysql');

var rpo = require('../repositories/orders');
var rpoTm = require('../repositories/trademarks');
var rpoTmMongo = require('../repositories/mongoTrademarks');
var rpoTrademarkAddedService = require('../repositories/trademarkAddedServices');

var rpoCountry = require('../repositories/countries');
var rpoUser = require('../repositories/users');
var rpoUserMongo = require('../repositories/usersMongo');

var helpers = require('../helpers');

var activityService = require('../services/activityLogService');
var orderService = require('../services/orderService');
var mailService = require('../services/mailerService');

const { toInteger, unset } = require('lodash');
let moment = require('moment');
// let customerId = 1293;

exports.orders = async function(req, res, next) {

  let currentUser = await helpers.getLoginUser(req);
  let currentData = await rpoUserMongo.getByIdM(currentUser._id)
  currentData = currentData[0]

  // console.log(currentUser,currentData);

  let trademarks;

  // STORE OLD ORDERS
  if (currentData.id && !currentData.isMigrate) {
    await orderService.getOldOrders(currentData);
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

    // console.log(trademarks[i].status);
    if ( trademarks[i].status == "Registered" ) {
      // console.log(trademarks[i].status);
      trademarkSortedData[trademarks[i].countryId].reg++
    } else {
      trademarkSortedData[trademarks[i].countryId].pen++
    }
  }

  // trademarkSortedData.forEach(element => {
  //   console.log(element);
  // });
  // console.log('formatted',trademarkSortedData);
  res.render('customer/orders', { 
    layout: 'layouts/customer-layout-interactive', 
    title: 'Trademarkers LLC Order Status',
    customer: currentData,
    trademarks: trademarkSortedData,
    // data: data
  });
    
}

exports.orderDetail = async function(req, res, next) {

  let otherServices = await rpoTrademarkAddedService.getByTrademarkId(req.params.id);

  let otherServicesData = {
    otherServices : otherServices
  }

  await rpoTmMongo.updateDetails(req.params.id, otherServicesData);

  let trademark = await rpoTmMongo.getById(req.params.id);
  console.log(trademark);

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
    layout: 'layouts/customer-layout-interactive', 
    title: 'Trademarkers LLC Order Status',
    trademark: trademark[0]
  });
  
} 

exports.invoices = async function(req, res, next) {

  let currentUser = await helpers.getLoginUser(req);
  let currentData = await rpoUserMongo.getByIdM(currentUser._id)
  currentData = currentData[0]

  
  let orders = await rpo.getByUserId(currentData._id)
  

  res.render('customer/invoices', { 
    layout: 'layouts/customer-layout-interactive', 
    title: 'Trademarkers LLC Order Status',
    customer: currentData,
    orders: orders,
    // data: data
  });
    
}

exports.invoiceDetail = async function(req, res, next) {

  let otherServices = await rpoTrademarkAddedService.getByTrademarkId(req.params.id);

  let otherServicesData = {
    otherServices : otherServices
  }

  await rpoTmMongo.updateDetails(req.params.id, otherServicesData);

  let trademark = await rpoTmMongo.getById(req.params.id);
  console.log(trademark);

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
    layout: 'layouts/customer-layout-interactive', 
    title: 'Trademarkers LLC Order Status',
    trademark: trademark[0]
  });
  
} 

exports.addSupportingDocs = async function(req, res, next) {

  console.log("body",req.body);
  console.log("file",req.files);
  console.log("params",req.params);

  activityService.logger(req.ip, req.originalUrl, "Customer Added Supporting document", req );

  let trdId = req.params.id;

  let trademark = await rpoTmMongo.getById(trdId)

  let supporting = trademark[0].supportingDocs

  if (!Array.isArray(supporting)) {
    supporting = [];
  }

  let ext = req.files.supportingDoc.name.match(/\.[0-9a-z]+$/i)[0]
  let fileName = req.files.supportingDoc.md5 + ext;

  let data = {
    notes: req.body.supportingNotes,
    file: fileName,
    fileExt: ext,
    created_at: toInteger(moment().format('YYMMDD')),
    created_at_formatted: moment().format()
  }

  supporting.push(data);

  rpoTmMongo.updateDetails(trdId,{supportingDocs:supporting});

  let uploadPath = __dirname + '/../public/uploads/' + fileName;

  await req.files.supportingDoc.mv(uploadPath, function(err) {
    if (err) {
      activityService.logger(req.ip, req.originalUrl, "Failed to upload supporting docs," + err , req );
    } else {
      activityService.logger(req.ip, req.originalUrl, "Customer Uploaded supporting document," , req );
    }
      
  });

  res.flash('success', 'Update Successful!');
  
  res.redirect('/customer/orders/'+trdId);


  // res.redirect()
  
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

  activityService.logger(req.ip, req.originalUrl, "Customer tried to update details userID: " +user[0].id, req);

  res.render('customer/updateDetailForm', { 
    layout: 'layouts/public-layout-interactive', 
    title: 'Trademarkers LLC Order Status',
    user: user[0]

  });
  
}

exports.updateCustomerFormSubmit = async function(req, res, next) {

  let data = {
    firstName: req.body.fname,
    lastName: req.body.lname,
    suffix: req.body.suffix,
    secondaryEmail: req.body.secondaryEmail,
    contactNumber: req.body.contactNumber,
    mailingAddress: req.body.mailingAddress,
    nature: req.body.nature,
    phone: req.body.phone,
    fax: req.body.fax,
    position: req.body.position,
    country: req.body.country,
    street: req.body.street,
    city: req.body.city,
    state: req.body.state,
    zipCode: req.body.zipCode,
    nameAddress: req.body.nameAddress
  }

  
  await rpoUserMongo.updateUser(req.body.customerId, data)

  let user = await rpoUserMongo.getByIdM(req.body.customerId);

  res.flash('success', 'Update Successful!');

  // send email notification
  mailService.sendAdminNotificationCustomerEmailUpdate(user[0]);

  res.redirect("/customer/TC-"+user[0].id+"-7C"); 

  
}

exports.index = async function(req, res, next) {
  
  // let urlPhp = process.env.APP_URL_PHP;
  // res.redirect(urlPhp + '/home');

  res.render('customer/', { 
    layout: 'layouts/customer-layout-interactive', 
    title: 'Customer',
    user: await helpers.getLoginUser(req)
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

// PROFILE
exports.profile = async function(req, res, next) {

  // let user = await helpers.getLoginUser(req)
  let countries = await rpoCountry.getAll();

  res.render('customer/profile', { 
    layout: 'layouts/customer-layout-interactive', 
    title: 'Customer',
    user: await helpers.getLoginUser(req),
    countries: countries
  });

}

exports.profileEdit = async function(req, res, next) {

  // let user = await helpers.getLoginUser(req)
  let countries = await rpoCountry.getAll();

  res.render('customer/profileEdit', { 
    layout: 'layouts/customer-layout-interactive', 
    title: 'Customer',
    user: await helpers.getLoginUser(req),
    countries: countries
  });

}


exports.profileSubmit = async function(req, res, next) {

  let data = {
    firstName: req.body.fname,
    lastName: req.body.lname,
    suffix: req.body.suffix,
    secondaryEmail: req.body.secondaryEmail,
    contactNumber: req.body.contactNumber,
    mailingAddress: req.body.mailingAddress,
    nature: req.body.nature,
    phone: req.body.phone,
    fax: req.body.fax,
    position: req.body.position,
    country: req.body.country,
    street: req.body.street,
    city: req.body.city,
    state: req.body.state,
    zipCode: req.body.zipCode,
    nameAddress: req.body.nameAddress
  }

  
  await rpoUserMongo.updateUser(req.body.id, data)

  let user = await rpoUserMongo.getByIdM(req.body.id);

  helpers.setLoginUser(res,user[0])

  res.flash('success', 'Update Successful!');

  // send email notification
  // mailService.sendAdminNotificationCustomerEmailUpdate(user[0]);

  res.redirect("/customer/profile"); 

  
}

exports.customerVerifyEmail = async function(req, res, next) {

  let user = await helpers.getLoginUser(req)
  // let countries = await rpoCountry.getAll();

  if ( user.email_verified_at ) {
    res.redirect("/customer"); 
  }

  res.render('customer/verifyEmail', { 
    title: 'Customer',
    user: await helpers.getLoginUser(req)
  });

}

exports.verifyAccount = async function(req, res, next) {

  let user = await helpers.getLoginUser(req)
  console.log(user._id,req.params.id);

  if (user._id.equals(req.params.id)) {
    // update user and redirect to account
    let userData = {
      email_verified_at : moment().format()
    }

    rpoUserMongo.updateUser(user._id,userData)

    user.email_verified_at = userData.email_verified_at;

    helpers.setLoginUser(res,user);
    res.redirect("/customer"); 
  } else {
    res.flash('error', 'Please verify email address to continue');
    res.redirect("/customer/verify"); 
  }

  // res.render('customer/verifyEmail', { 
  //   title: 'Customer',
  //   user: await helpers.getLoginUser(req)
  // });

}

// http://localhost:4200/customer/verify-account/60a4d9865f3f7052445c551f


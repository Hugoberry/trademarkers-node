
const stripe = require("stripe")(process.env.PAYTEST);

var rpoAction = require('../repositories/actionCode');

var rpoCharge = require('../repositories/charges');
var rpoOrder = require('../repositories/orders');
var rpoSouNotifications = require('../repositories/souNotifications');


var rpoServiceAction = require('../repositories/serviceAction');

var activityService = require('../services/activityLogService');

var checkoutService = require('../services/checkoutService');
var mailService = require('../services/mailerService');
var orderService = require('../services/orderService');


var helpers = require('../helpers');

let moment = require('moment');

const emailValidator = require('deep-email-validator');

const { toInteger } = require('lodash');


var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};


exports.checkout = async function(req, res, next) {

  // const stripe = require('stripe')(process.env.PAYTEST);

  // console.log(req.params);
  // console.log(process.env.PAYTEST);
  console.log('body',req.body);

  req.body.stripeEmail = req.body.email;
  let action = await rpoAction.getAction(req.body.action);

  // compute price
  let price = 0;
  let description = "Trademarkers LLC Service";
  let name = "", payment = "";
  let customer = req.body.email ? req.body.email : "";
// console.log('action', action);
  if ( action[0] && action[0].number) {
    price = await checkoutService.getPrice(req.body.action);

    if ( action[0].response ) {
      description += ": " + action[0].response;
    }
  } else {
    price = req.body.price ? (req.body.price * 1) : 0;
    description = req.body.description ? req.body.description : "";
    name = req.body.name ? req.body.name : "";
    payment = req.body.payment ? req.body.payment : "";
  }
// console.log('price', price);

  // 
  try{

  let orderCode = await orderService.createOrderCode();

  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description + " | " + customer + " | " + orderCode,
    // customer: customer,
    metadata : {
      'customer': "" + customer,
      'description': "" + description + " | " + orderCode,
      'paymentFor' : payment
    },
    receipt_email: customer
  });

  if ( charge.paid ) {

    
    action[0].ordered = 'yes'

    // update action
    let actionUpdates = {
      ordered: 'yes'
    }

    await rpoAction.updateDetails(action[0]._id, actionUpdates)

    // save
    

    // let order = {
    //   orderNumber: orderCode,
    //   action: action[0],
    //   charge: charge
    // }

    let order = {
      orderNumber: orderCode,
      charge: charge,
      custom: false,
      paid: true,
      action: action[0],
      customerId: action[0].userId,
      created_at: toInteger(moment().format('YYMMDD')),
    }

    

    // send email notification
    mailService.sendOrderNotification(order);

    rpoOrder.put(order);
    rpoCharge.put(charge);
    res.flash('success', 'Payment Successful!');
    

    // update notifications collection
    let notification = await rpoSouNotifications.findBySerial(action[0].serialNumber);
    let dataNotification = {
      actionType: "Ordered: " + action[0].response
    }
    rpoSouNotifications.updateDetails(notification[0]._id, dataNotification);
    // Ordered: Statement of Use
    // Ordered: Extension for trademark allowance


    res.redirect("/thank-you/"+orderCode); 
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    
    // return with error
  }

} catch (err) {
  res.flash('error', err.error);
  console.log("errors",err);
  console.log("errors message",err.message);
}

  res.redirect("/"+req.body.action+'/pay'); 

}


// CUSTOM PAGE SERVICE -------------------------------- START

exports.serviceOrderCustom = async function(req, res, next) {

  let order = await rpoOrder.findActionCustom('L3P-5T');

  activityService.logger(req.ip, req.originalUrl, "Visited service page L3P-5T");

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  res.render("trademark-order/service-order-L3P-5T", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    tkey: process.env.PAYK,
    order: order[0],
    user: helpers.getLoginUser(req)
  });
}

exports.checkoutCustom = async function(req, res, next) {

  req.body.stripeEmail = req.body.email;
  let action = await rpoAction.getAction(req.body.action);

  
  // compute price
  let price = 362.32;
  let description = "Trademarkers LLC Service";
  let name = "", payment = "Monitoring and filing of progress";
  let customer = req.body.email ? req.body.email : "";


  // 
  try{
  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description,
    // customer: customer,
    metadata : {
      'customer': "" + customer,
      'description': "" + description,
      'paymentFor' : payment,
      'customerName' : req.body.name,
      'customerAddress' : req.body.address
    },
    receipt_email: customer
  });

  if ( charge.paid ) {

    // save
    let orderCode = await orderService.createOrderCode();

    let order = {
      orderNumber: orderCode,
      charge: charge,
      custom: true,
      paid: true,
      action: 'L3P-5T',
      customerId: '',
      created_at: toInteger(moment().format('YYMMDD')),
    }

    console.log('put', order);

    

    mailService.sendOrderNotification(order);
    rpoOrder.put(order);
    res.flash('success', 'Payment Successful!');
    rpoCharge.put(charge);

    activityService.logger(req.ip, req.originalUrl, "checkout L3P-5T");

    res.redirect("/thank-you/"+orderCode); 
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    res.redirect("/checkout/L3P-5T"); 
    // return with error
  }

} catch (err) {
  res.flash('error', err.error);
  console.log("errors",err);
  console.log("errors message",err.message);
}

}

exports.serviceOrderCustom2 = async function(req, res, next) {

  let order = await rpoOrder.findActionCustom('L3P-5T');
  
  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  activityService.logger(req.ip, req.originalUrl, "Visited service page L3P-6T");
  console.log('check');
  res.render("trademark-order/service-order-L3P-6T", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    tkey: process.env.PAYK,
    order: order[0],
    user: helpers.getLoginUser(req)
  });
}

exports.checkoutCustom2 = async function(req, res, next) {

  req.body.stripeEmail = req.body.email;
  let action = await rpoAction.getAction(req.body.action);

  // compute price
  let price = 150;
  let description = "Trademarkers LLC Service";
  let name = "", payment = "Preparation and Filling of Assignment";
  let customer = req.body.email ? req.body.email : "";


  // 
  try{
  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description,
    // customer: customer,
    metadata : {
      'customer': "" + customer,
      'description': "" + description,
      'paymentFor' : payment,
      'customerName' : req.body.name,
      'customerAddress' : req.body.address
    },
    receipt_email: customer
  });

  if ( charge.paid ) {

    // save
    let orderCode = await orderService.createOrderCode();

    let order = {
      orderNumber: orderCode,
      charge: charge,
      custom: true,
      paid: true,
      action: 'L3P-6T',
      customerId: '',
      created_at: toInteger(moment().format('YYMMDD')),
    }

    console.log('put', order);

    

    mailService.sendOrderNotification(order);
    rpoOrder.put(order);
    res.flash('success', 'Payment Successful!');
    rpoCharge.put(charge);

    activityService.logger(req.ip, req.originalUrl, "checkout L3P-6T");

    res.redirect("/thank-you/"+orderCode); 
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    res.redirect("/checkout/L3P-6T"); 
    // return with error
  }

} catch (err) {
  res.flash('error', err.error);
  console.log("errors",err);
  console.log("errors message",err.message);
}

}


exports.serviceOrderShow = async function(req, res, next) {

  console.log(req.params.serviceCode);
  let serviceOrder = await rpoServiceAction.findByCode(req.params.serviceCode)
  
  activityService.logger(req.ip, req.originalUrl, "Visited service page " + req.params.serviceCode);

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  res.render("trademark-order/service-order", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    tkey: process.env.PAYK,
    serviceOrder: serviceOrder[0],
    user: helpers.getLoginUser(req)
  });
}

exports.serviceOrderSubmit = async function(req, res, next) {

  req.body.stripeEmail = req.body.email;

  let serviceCode = await rpoServiceAction.findByCode(req.body.code);

  if (serviceCode.length <= 0) {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    res.redirect("/checkout/" + req.body.code); 
  }


  // compute price
  let price = serviceCode[0].amount;
  let description = serviceCode[0].name;
  let name = "", payment = serviceCode[0].description;
  let customer = req.body.email ? req.body.email : "";


  // 
  try{
  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description,
    // customer: customer,
    metadata : {
      'customer': "" + customer,
      'description': "" + description,
      'paymentFor' : payment,
      'customerName' : req.body.name,
      'customerAddress' : req.body.address
    },
    receipt_email: customer
  });

  if ( charge.paid ) {

    // save
    let orderCode = await orderService.createOrderCode();

    let order = {
      orderNumber: orderCode,
      charge: charge,
      custom: true,
      paid: true,
      action: req.body.code,
      customerId: '',
      created_at: toInteger(moment().format('YYMMDD')),
    }

    console.log('put', order);

    

    mailService.sendOrderNotification(order);
    rpoOrder.put(order);
    res.flash('success', 'Payment Successful!');
    rpoCharge.put(charge);

    activityService.logger(req.ip, req.originalUrl, "Checkout " + req.params.serviceCode);

    res.redirect("/thank-you/"+orderCode); 
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    res.redirect("/checkout/" + req.body.code); 
    // return with error
  }

} catch (err) {
  res.flash('error', err.error);
  console.log("errors",err);
  console.log("errors message",err.message);
}

}

exports.generateService = async function(req, res, next) {

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  res.render(
    "trademark-order/add-service", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    user: helpers.getLoginUser(req)
  });
}

exports.generateServiceSubmit = async function(req, res, next) {

  console.log('a');
  try {
   
    let code = '';
    let flag = true;
    
    // FETCH/GENERATE UNIQUE CODE
    for( ; flag;  ) {
      console.log('loop');
      code = helpers.makeid(4) + '-' + helpers.makeid(2);
      let serviceCode = await rpoServiceAction.findByCode(code);
      console.log(serviceCode);
      if (serviceCode.length <= 0) {
        flag = false;
      }

    }
    console.log('loop end', code);
    let data = {
      code: code,
      name: req.body.name,
      description: req.body.description,
      amount: req.body.amount
    }

    let serviceAction = await rpoServiceAction.put(data)

    // send email for notification

    if (serviceAction) {

      mailService.newServiceOrder(data);

      res.flash('success', 'Added new code, [' + code +']');
    } else {
      res.flash('error', 'Sorry, Something went wrong, please try again later.');
    }

  } catch(err) {
    res.flash('error', err.error);
  }
  
  res.redirect("/add-service-code-secret-132321"); 
 
}

// CUSTOM PAGE SERVICE -------------------------------- END





exports.thankYou = async function(req, res, next) {

  console.log(req.params);

  let order = await rpoOrder.findOrderNumber(req.params.number)

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  title = "Thank You!"
  layout = 'layouts/public-layout-interactive'
  render = 'trademark-order/thankyou'
      

  res.render(render, { 
    layout  : layout, 
    title   : title,
    order   : order[0]
  });
}

exports.oppositionProof = async function(req, res, next) {

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };
  
  res.render("public/opposition-proof-of-use", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    user: helpers.getLoginUser(req)
  });
}


// ======================================== function 
async function isEmailValid(email) {
  return emailValidator.validate(email)
 }




const stripe = require("stripe")(process.env.PAYTEST);

var rpoTrademarkClasses = require('../repositories/trademarkClasses');
var rpoCountries = require('../repositories/countries');
var rpoPrices = require('../repositories/prices');
var rpoCartItems = require('../repositories/cartItems');
var rpoCharge = require('../repositories/charges');
var rpoOrder = require('../repositories/orders');

var helpers = require('../helpers');

var mailService = require('../services/mailerService');
var orderService = require('../services/orderService');
var activityService = require('../services/activityLogService');

const { toInteger } = require('lodash');
let moment = require('moment');

exports.registration = async function(req, res, next) {

  let countryName = req.params.countryName;
  let serviceType = req.params.serviceType;
  let country;
  let classes = await rpoTrademarkClasses.getClasses();

  if ( countryName ) {

    countryName = countryName.replace("_"," ")
    country = await rpoCountries.getByName(countryName)
    console.log(countryName,country);
    if (!country) {
      // redirect to register
    }
  } else {
    // redirect to register
  }

  res.render('order/registration', { 
    layout: 'layouts/public-layout-default', 
    title: 'registration',
    country: country[0],
    classes: classes,
    serviceType: serviceType,
    user: helpers.getLoginUser(req)
  });
}

exports.validateOrder = async function(req, res, next) {

  let type;

  if(req.body.serviceType == "registration") {
    type = "Registration"
  } else if(req.body.serviceType == "study") {
    type = "Study"
  } else {
    // redirect to registration landing
  }

  let prices = await rpoPrices.findPriceByCountry(req.body.countryId * 1, type);
  let country = await rpoCountries.getById(req.body.countryId * 1);
  // prices.forEach(element => {
  //   rpoPrices.put(element);
  // });

  // calculate price ask helpers.js
  let data = {
    type: req.body.type,
    noClass: req.body.class.length,
    price: prices[0]
  }

  let amount = helpers.calculatePrice(data);

  console.log(amount, req.body);

  res.render('order/confirmation', { 
    layout: 'layouts/public-layout-default', 
    title: 'confirmation',
    data: req.body,
    country: country[0],
    amount: amount,
    user: helpers.getLoginUser(req)
  });
}

exports.addToCart = async function(req, res, next) {

  let type;

  if(req.body.serviceType == "registration") {
    type = "Registration"
  } else if(req.body.serviceType == "study") {
    type = "Study"
  } else {
    // redirect to registration landing
  }

  let prices = await rpoPrices.findPriceByCountry(req.body.countryId * 1, type);

  // calculate price ask helpers.js
  let dataPrice = {
    type: req.body.type,
    noClass: req.body.class.length,
    price: prices[0]
  }

  let country = await rpoCountries.getById(req.body.countryId * 1);
  let amount = helpers.calculatePrice(dataPrice);
  let currentUser = helpers.getLoginUser(req)
  // console.log(amount,req.body);
  let data = req.body
  data.user_id = currentUser._id;
  data.user = currentUser;
  data.price = amount;
  data.country = country[0];
  data.status = 'pending'

  await rpoCartItems.put(data)
  // console.log(data);

  res.redirect("/cart");
}

exports.cart = async function(req, res, next) {

  let currentUser = helpers.getLoginUser(req) 
  let cartItems = await rpoCartItems.fetchCustomerCart(currentUser._id)
  console.log(cartItems);

  res.render('order/cart', { 
    layout: 'layouts/public-layout-default', 
    title: 'cart',
    user: currentUser,
    cartItems: cartItems
  });

}

exports.checkout = async function(req, res, next) {

  let currentUser = helpers.getLoginUser(req) 
  let cartItems = await rpoCartItems.fetchCustomerCart(currentUser._id)

  let amount = await helpers.getCartTotalAmount(cartItems);

  // console.log(amount);
  res.render('order/checkout', { 
    layout: 'layouts/public-layout-interactive', 
    title: 'cart',
    user: currentUser,
    cartItems: cartItems,
    totalAmount: amount
  });

}

exports.placeOrder = async function(req, res, next) {

  // fetch details
  let currentUser = helpers.getLoginUser(req) 
  let cartItems = await rpoCartItems.fetchCustomerCart(currentUser._id)
  let orderCode = await orderService.createOrderCode();
  let description = "Trademark Order #" + orderCode;
  let amount = await helpers.getCartTotalAmount(cartItems);

  try{
    const charge = await stripe.charges.create({
      amount: (amount * 100),
      currency: 'usd',
      source: req.body.stripeToken,
      description: description,
      metadata : {
        'customerId': "" + currentUser._id,
        'description': "" + description,
        'customerEmail' : req.body.email,
        'customerName' : req.body.name,
        'customerAddress' : req.body.address,
        'orderNumber' : orderCode,
      },
      receipt_email: req.body.email
    });
  
    if ( charge.paid ) {
  
      // save
      
  
      let order = {
        orderNumber: orderCode,
        charge: charge,
        custom: true,
        paid: true,
        customerId: currentUser._id,
        created_at: toInteger(moment().format('YYMMDD')),
        cartItems: cartItems
      }
  
      console.log('put', order);
  
      
  
      mailService.sendOrderNotification(order);
      rpoOrder.put(order);
      res.flash('success', 'Payment Successful!');
      rpoCharge.put(charge);
  
      activityService.logger(req.ip, req.originalUrl, "checkout L3P-6T");

      // update cart items to complete
      await cartItems.forEach(items => {

        let data = {
          status: 'complete',
          orderNumber: orderCode
        }
        rpoCartItems.update(items._id, data);

      });
  
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
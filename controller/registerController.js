
const stripe = require("stripe")(process.env.PAYTEST);

var rpoTrademarkClasses = require('../repositories/trademarkClasses');
var rpoCountries = require('../repositories/countries');
var rpoPrices = require('../repositories/prices');
var rpoCartItems = require('../repositories/cartItems');

var helpers = require('../helpers');



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

const stripe = require("stripe")(process.env.PAYTEST);
const jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

var rpoTrademarkClasses = require('../repositories/trademarkClasses');
var rpoCountries = require('../repositories/countries');
var rpoPrices = require('../repositories/prices');
var rpoCartItems = require('../repositories/cartItems');
var rpoCharge = require('../repositories/charges');
var rpoOrder = require('../repositories/orders');
var rpoUser = require('../repositories/users');
var rpoUserMongo = require('../repositories/usersMongo');

var helpers = require('../helpers');

var mailService = require('../services/mailerService');
var orderService = require('../services/orderService');
var activityService = require('../services/activityLogService');

const { toInteger, unset } = require('lodash');
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

  let uploadPath;
  let logo_pic;
  let logoName;

  if ( req.files && req.files.logo_pic ) {  
    // updload file
    logoName = toInteger(moment().format('YYMMDDHHMMSS')) + '-' + logo_pic.name;
    logo_pic = req.files.logo_pic;
    uploadPath = __dirname + '/../public/uploads/' + logoName;
    console.log(logo_pic);
    req.body.logoName = logoName;
    // Use the mv() method to place the file somewhere on your server
    logo_pic.mv(uploadPath, function(err) {
     
        
    });

  }

  // calculate price ask helpers.js
  let data = {
    type: req.body.type,
    noClass: req.body.class.length,
    price: prices[0]
  }

  let amount = helpers.calculatePrice(data);


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
  let data = req.body;
  let actionLogin;

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

  // get customer
  // if ( req.body.action == 'notLogin') {
  //   // check user in mysql and mongo if not create new user
  //   let userMy = await rpoUser.getUserByEmail(req.body.email);
  //   let userMd = await rpoUserMongo.findUser(req.body.email);

  //   if (userMd.length > 0) {
  //     // found update or store in mongo
  //     currentUser = await rpoUser.putUser(userMd[0])
  //     actionLogin = "old"
  //   } else if( userMy.length > 0 ) {
  //     actionLogin = "old"
  //     currentUser = await rpoUser.putUser(userMy[0])
  //   } else {
  //     // new user
  //     let userData = {
  //       name: req.body.name,
  //       email: req.body.email,
  //       address: req.body.address,
  //       isNew: true,
  //       created_at: toInteger(moment().format('YYMMDD')),
  //       created_at_formatted: moment().format()
  //     }
  //     await rpoUserMongo.putUser(userData)
  //     currentUser = await rpoUserMongo.findUser(req.body.email);
  //     // console.log("new", currentUser);

  //     actionLogin = "new"
  //   }

  //   if (currentUser.length > 0) {
  //     currentUser = currentUser[0];
  //   }
 
  // }

  // VERSION 2 MODIFICATION
  if ( req.body.customerType == 'new') {

    var hash = bcrypt.hashSync(req.body.customerPassword, 10); 

    hash = hash.replace("$2b$", "$2y$");

    let userData = {
      name: req.body.name,
      address: req.body.address,
      email: req.body.email,
      password: hash,
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }
    let newUser = await rpoUserMongo.putUser(userData);
    // console.log('new', newUser.insertedId);
    let newInsertedUser = await rpoUserMongo.getByIdM(newUser.insertedId);
    currentUser = newInsertedUser[0]
    console.log(currentUser);

    let payload = {user: JSON.stringify(currentUser)}

    let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: (60 * 60) * 6
    });

    res.cookie("jwt", accessToken);

  }


  data.user_id = currentUser._id;
  data.user = currentUser;
  data.price = amount;
  data.country = country[0];
  data.status = 'active';
  data.created_at = toInteger(moment().format('YYMMDD'));
  data.created_at_formatted = moment().format();

  // if(actionLogin){

  //   if( actionLogin == 'new' ){
  //     data.status = 'pending';
  //   } else {
  //     data.status = 'active';
  //   }

  // }

  await rpoCartItems.put(data)



  // if(actionLogin && actionLogin != ''){

  // }
  // console.log(data);
  // res.locals.currentUser = currentUser

  res.redirect("/cart?uid="+currentUser._id);
}

exports.cart = async function(req, res, next) {

  let cartItems;
  let userId;
  let guest;
  let currentUser = helpers.getLoginUser(req);
  let isloggedIn = false;

  if (!currentUser) {
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = new URL(fullUrl);
    let params = new URLSearchParams(url.search);
    userId = params.get("uid")

    guest = await rpoUserMongo.getByIdM(userId);
 
  } else {
    userId = currentUser._id
    isloggedIn = true;
  }

  if (userId) {
    cartItems = await rpoCartItems.fetchCustomerCart(userId)
  }

  if( !cartItems ) {
    res.redirect("/"); 
  }

  let amount = await helpers.getCartTotalAmount(cartItems);
  

  res.render('order/cart', {
    layout: 'layouts/public-layout-default', 
    title: 'cart',
    user: currentUser,
    guest:guest ? guest[0] : null,
    cartItems: cartItems,
    totalAmount: amount,
    isloggedIn: isloggedIn
  });

}

exports.checkout = async function(req, res, next) {

  let currentUser = helpers.getLoginUser(req) 
  let cartItems;
  let userId;

  if (!currentUser) {
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = new URL(fullUrl);
    let params = new URLSearchParams(url.search);
    userId = params.get("uid")
    // console.log('1', userId);
    currentUser = await rpoUserMongo.getByIdM(userId);
 
  } else {
    // console.log('2');
    userId = currentUser._id
  }
// console.log(userId);
  
  cartItems = await rpoCartItems.fetchCustomerCart(userId)

  // if( !cartItems ) {
  //   res.redirect("/"); 
  // }

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

  // redirect customer to login
  if( !currentUser ) {
    res.redirect("/cart"); 
  }

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
        cartItems: cartItems,
        created_at: toInteger(moment().format('YYMMDD')),
        created_at_formatted: moment().format()
      }
  
      // console.log('put', order);
  
      
  
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
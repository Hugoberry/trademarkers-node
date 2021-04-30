
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
var rpoTrademark = require('../repositories/mongoTrademarks');
var rpoPrice = require('../repositories/prices');

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
  let prices;
  let classes = await rpoTrademarkClasses.getClasses();

  if ( countryName ) {

    countryName = countryName.replace("_"," ")
    country = await rpoCountries.getByName(countryName)
    console.log(countryName,country);

    
    if (!country) {
      // redirect to register
    } else {
      prices = await rpoPrice.findPriceByCountryId(country[0].id);
    }

    
  }

  // console.log('asd');
  res.render('order/registrationLanding', {
    layout: 'layouts/public-layout-default', 
    title: 'registration',
    country: country[0],
    prices: prices,
    classes: classes,
    serviceType: serviceType,
    
    user: await helpers.getLoginUser(req)
  });
}

exports.registrationProceed = async function(req, res, next) {

  let countryName = req.params.countryName;
  let serviceType = req.params.serviceType;
  let country;
  let classes = await rpoTrademarkClasses.getClasses();

  let countries = await rpoCountries.getAll();

  if ( countryName ) {

    countryName = countryName.replace("_"," ")
    country = await rpoCountries.getByName(countryName)
    // console.log(countryName,country);
    if (!country) {
      // redirect to register
    }

    
  }

  let prices = await rpoPrice.findPriceByCountry(country[0].id,serviceType);
  let price;
  // console.log(price);

  // console.log(serviceType);
  if ( serviceType == "monitoring" ) {
    price = {
      initial_cost:150,
      additional_cost:0,
      logo_initial_cost:0,
      logo_additional_cost:0
    }
  } else {
    price = prices[0]
  }

  res.render('order/registration', {
    layout: 'layouts/public-layout-default', 
    title: 'registration',
    country: country[0],
    price: price,
    classes: classes,
    serviceType: serviceType,
    countries: countries,
    user: await helpers.getLoginUser(req)
  });
}

exports.trademarkProfile = async function(req, res, next) {

  console.log('asd')

  let countries = await rpoCountries.getAll();

  res.render('order/validateProfile', { 
    layout: 'layouts/public-layout-default', 
    title: 'confirmation',
    data: req.body,
    countries:countries,
    user: await helpers.getLoginUser(req)
  });
}



exports.validateOrder = async function(req, res, next) {

  let type;

  // check if login and verify
  console.log(req.body);
  
  if ( !helpers.isAuth(req) ) {
    
  } 

  if(req.body.serviceType == "registration") {
    type = "Registration"
  } else if(req.body.serviceType == "study") {
    type = "Study"
  } else if(req.body.serviceType == "monitoring") {
    type = "Monitoring"
  } else {
    // redirect to registration landing
  }

  let prices = await rpoPrices.findPriceByCountry(req.body.countryId * 1, type);
  let country = await rpoCountries.getById(req.body.countryId * 1);
  
  let price;

  if ( type == "Monitoring" ) {
    price = {
      initial_cost:150,
      additional_cost:0,
      logo_initial_cost:150,
      logo_additional_cost:0
    }
  } else {
    price = prices[0]
  }

  let uploadPath;
  let logo_pic;
  let logoName;

  req.body.logoName = "";
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
    price: price
  }
  console.log(data);
  let amount = helpers.calculatePrice(data);


  res.render('order/confirmation', { 
    layout: 'layouts/public-layout-default', 
    title: 'confirmation',
    data: req.body,
    country: country[0],
    amount: amount,
    user: await helpers.getLoginUser(req)
  });
}

exports.addToCart = async function(req, res, next) {

  let type;
  let data;
  let actionLogin;

  if(req.body.serviceType == "registration") {
    type = "Registration"
  } else if(req.body.serviceType == "study") {
    type = "Study"
  } else if(req.body.serviceType == "monitoring") {
    type = "Monitoring"
  } else {
    // redirect to registration landing
  }

  let prices = await rpoPrices.findPriceByCountry(req.body.countryId * 1, type);
  let price;

  console.log(type);
  if ( type == "Monitoring" ) {
    price = {
      initial_cost:150,
      additional_cost:0,
      logo_initial_cost:150,
      logo_additional_cost:0
    }
  } else {
    price = prices[0]
  }

  // calculate price ask helpers.js
  let dataPrice = {
    type: req.body.type,
    noClass: req.body.class.length,
    price: price
  }

  let country = await rpoCountries.getById(req.body.countryId * 1);
  let amount = helpers.calculatePrice(dataPrice);
  let currentUser = await helpers.getLoginUser(req)
  let newInsertedUser;

  // console.log(amount);

  // VERSION 2 MODIFICATION
  if ( req.body.customerType == 'new') {

    var hash = bcrypt.hashSync(req.body.customerPassword, 10); 

    hash = hash.replace("$2b$", "$2y$");

    // GENERATE CUSTOMER NO
    let flag = true
    let custNo = ""

    for ( ; flag; ) {
        custNo = "CU-" + helpers.makeid(4)

        let dataCustomer = await rpoUserMongo.findUserNo(custNo)
        // console.log("check user", dataCustomer.length );
        if ( dataCustomer.length <= 0 ) {
            flag = false
        }
    }

    let cname = req.body.name ? req.body.name : ''

    if (req.body.fname && req.body.lname) {
      cname = req.body.lname + ", " + req.body.fname
    }

    console.log('req',req.body);

    let userData = {
      name: cname,
      firstName: req.body.fname,
      lastName: req.body.lname,
      email: req.body.email,
      secondaryEmail: req.body.email,
      password: hash,
      custNo: custNo,
      nature: req.body.nature,
      phone: req.body.phone,
      fax: req.body.phone,
      position: req.body.position,
      country: req.body.country,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }
    let newUser = await rpoUserMongo.putUser(userData);

    newInsertedUser = await rpoUserMongo.getByIdM(newUser.insertedId);
    currentUser = newInsertedUser[0]

    currentUser._id = newUser.insertedId
    let payload = {user: JSON.stringify(currentUser)}

    let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES
    });

    res.cookie("jwt", accessToken);

  }

  // check user detail and possible update
  if (!currentUser.address) {
    let addressUser = (req.body.repStreet ? (" " + req.body.repStreet) : '')
    + (req.body.repCity ? (" " + req.body.repCity) : '')
    + (req.body.repState ? (" " + req.body.repState) : '')
    + (req.body.repZipCode ? (" " + req.body.repZipCode) : '')
    + (req.body.repCountry ? (" " + req.body.repCountry) : '')

    let dataUserUpdate = {
      nature: req.body.nature,
      phone: req.body.phone,
      fax: req.body.phone,
      position: req.body.position,
      country: req.body.repCountry,
      street: req.body.repStreet,
      city: req.body.repCity,
      state: req.body.repState,
      zipCode: req.body.repZipCode,
      address: addressUser
    }

    await rpoUserMongo.updateUser(currentUser._id,dataUserUpdate)
  }

  data = req.body;

  delete req.body.email
  delete req.body.customerPassword
  delete req.body.customerPasswordConfirm

  data.serviceType = req.body.serviceType;
  data.type = req.body.type;
  data.word_mark = req.body.word_mark;
  data.class = req.body.class;
  data.description = req.body.description;
  data.userId = currentUser._id;
  data.user = currentUser;
  data.price = amount;
  data.country = country[0];
  data.nature = req.body.nature;
  data.phone = req.body.phone;
  data.fax = req.body.fax;
  data.position = req.body.position;
  data.country = req.body.country;

  data.status = 'active';
  data.created_at = toInteger(moment().format('YYMMDD'));
  data.created_at_formatted = moment().format();

  await rpoCartItems.put(data)

  res.redirect("/cart?uid="+currentUser._id);
}

exports.cart = async function(req, res, next) {

  let cartItems;
  let userId;
  let guest;
  let currentUser = await helpers.getLoginUser(req);
  let isloggedIn = false;

  if (!currentUser) {
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = new URL(fullUrl);
    let params = new URLSearchParams(url.search);
    userId = params.get("uid")

    guest = await rpoUserMongo.getByIdM(userId);
 
  } else {
    
    isloggedIn = true;

    // if ( currentUser && !currentUser._id ) {
    //   let currentUserRecord = await rpoUserMongo.findUser(currentUser.email)
  
    //   currentUser = currentUserRecord[0]
    // }

    userId = currentUser._id
  }

  // console.log(currentUser);
  if (userId) {
    cartItems = await rpoCartItems.fetchCustomerCart(userId)
  }

  if( !cartItems ) {
    // res.redirect("/"); 
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

  let currentUser = await helpers.getLoginUser(req) 
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

    // if ( currentUser && !currentUser._id ) {
    //   let currentUserRecord = await rpoUserMongo.findUser(currentUser.email)
  
    //   currentUser = currentUserRecord[0]
    // }

    userId = currentUser._id
  }
// console.log(userId);
  
  cartItems = await rpoCartItems.fetchCustomerCart(userId)

  // if( !cartItems ) {
  //   res.redirect("/"); 
  // }

  // currentUser.address = currentUser.street
  //                       + (currentUser.state ? (" " + currentUser.state) : '')
  //                       + (currentUser.zipCode ? (" " + currentUser.zipCode) : '')
  //                       + (currentUser.country ? (" " + currentUser.country) : '')

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
  let currentUser = await helpers.getLoginUser(req) 

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
        userId: currentUser._id,
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
      await cartItems.forEach(async items => {

        let data = {
          status: 'complete',
          orderNumber: orderCode
        }
        // update cart status
        rpoCartItems.update(items._id, data);

        // create trademark from cart item
        let trademark = {
          userId: items.userId,
          orderCode: orderCode,
          userEmail: items.user.email,
          serialNumber: null,
          mark: items.word_mark,
          serviceType: items.serviceType,
          type: items.type,
          class: items.class,
          description: items.description,
          country: items.country.name,
          countryId: items.country.id,
          colorClaim: items.colorClaim,
          colorClaimText: items.colorClaimText,


          nature: items.nature,
          company: items.company,
          fname: items.fname,
          lname: items.lname,
          phone: items.phone,
          fax: items.fax,
          position: items.position,

          repCountry: items.repCountry,
          repStreet: items.repStreet,
          repCity: items.repCity,
          repState: items.repState,
          repZipCode: items.repZipCode,

          companyCountry: items.companyCountry,
          companyStreet: items.companyStreet,
          companyCity: items.companyCity,
          companyState: items.companyState,
          companyZipCode: items.companyZipCode,

          commerce: items.commerce,
          filed: items.filed,
          priority: items.priority,
          origin: items.origin,
          originDate: items.originDate,
          originTm: items.originTm,

          status: 'pending',
          created_at: toInteger(moment().format('YYMMDD')),
          created_at_formatted: moment().format()
        }

        await rpoTrademark.put(trademark);

      });
  
      res.redirect("/thank-you/"+orderCode); 
    } else {
      res.flash('error', 'Sorry!, Something went wrong, try again later.');
      res.redirect("/checkout"); 
    }
  } catch (err) {
    res.flash('error', 'Sorry!, Something went wrong, try again later. No such token: a similar object exists in test mode');
    res.redirect("/checkout"); 
  }

}
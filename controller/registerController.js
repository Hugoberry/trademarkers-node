
const stripe = require("stripe")(process.env.PAYTEST);
const jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
let store = require('store')

var rpoTrademarkClasses = require('../repositories/trademarkClasses');
var rpoCountries = require('../repositories/countries');
var rpoPrices = require('../repositories/prices');
var rpoCartItems = require('../repositories/cartItems');
var rpoCharge = require('../repositories/charges');
var rpoOrder = require('../repositories/orders');
var rpoUser = require('../repositories/users');
var rpoUserMongo = require('../repositories/usersMongo');
var rpoTrademark = require('../repositories/mongoTrademarks');
var rpoTrademarkAddedService = require('../repositories/trademarkAddedServices');
var rpoPrice = require('../repositories/prices');
var rpoPromoCode = require('../repositories/promoCode');
var rpoInvoice = require('../repositories/invoice');

var helpers = require('../helpers');

var mailService = require('../services/mailerService');
var orderService = require('../services/orderService');
var activityService = require('../services/activityLogService');
var cartService = require('../services/cartService');

const { toInteger, unset } = require('lodash');
let moment = require('moment');

exports.registration = async function(req, res, next) {

  let countryName = req.params.countryName;
  let serviceType = req.params.serviceType;
  let country;
  let prices;
  let classes = await rpoTrademarkClasses.getClasses();

  activityService.logger(req.ip, req.originalUrl, "Registration page " + countryName, req);

  if ( countryName ) {

    countryName = countryName.replace(/_/g, ' ')
    // console.log(countryName);
    country = await rpoCountries.getByName(countryName)
    // console.log(countryName,country.length);

    
    if (country.length <= 0) {
      // redirect to register
      // console.log('not found');
      // search in mysql
      let countryMySql = await rpoCountries.getByNameMySQL(countryName);
      // console.log("country",countryMySql);
      country = countryMySql;

      prices = await rpoPrice.findPriceByCountryId(country[0].id);

      rpoCountries.putCountry(countryMySql[0])

    } else {
      country = await rpoCountries.getByName(countryName)
      prices = await rpoPrice.findPriceByCountryId(country[0].id);
    }

    // http://localhost:4200/trademark-registration-in-antigua_and_barbuda
  }
  

  let layout = 'layouts/public-layout-default';
  let hasStudy = true;
  let hasRegistration = true;
  let newLayout = false;

  if ( country[0].banner ){
    // if ( country[0].banner && country[0].logo ){
    layout = 'layouts/public-layout';
    newLayout = true;
  }

  if ( country[0].name == "Canada" ) {
    hasStudy = false;
  }

  // check country status
  if(country[0].status == 'disabled') {
    res.redirect("/countries"); 
  }



  

  // console.log('asd',country);
  res.render('order/registrationLanding', {
    layout: layout, 
    title: 'Trademark Registration | Trademarkers LLC',
    description: 'Trademarkers is a leading international brand protection company that specializes in global trademark registration',
    keywords: 'Trademark Registration, Trademark Study, Trademark Registration in '+ country[0].name +', register a trademark in '+ country[0].name+', trademark study in '+ country[0].name,
    country: country[0],
    prices: prices,
    classes: classes,
    serviceType: serviceType,
    hasStudy: hasStudy,
    hasRegistration: hasRegistration,
    newLayout: newLayout,
    user: await helpers.getLoginUser(req)
  });
}

exports.registrationProceed = async function(req, res, next) {

  let countryName = req.params.countryName;
  let serviceType = req.params.serviceType;
  let country;
  let classes = await rpoTrademarkClasses.getClasses();

  
  

  // console.log("store", actionStore, trademarkStore);

  let countries = await rpoCountries.getAll();

  activityService.logger(req.ip, req.originalUrl, "Proceed to Registration in " + countryName, req);

  if ( countryName ) {

    countryName = countryName.replace(/_/g, ' ')
    country = await rpoCountries.getByName(countryName)
    // console.log(countryName,country);
    if (!country) {
      // redirect to register
    }

    
  }

  let actionStore;
  let trademarkStore;

  if (store.get('action')) {
    actionStore = store.get('action').action;
    trademarkStore = store.get('action').trademark;
    // console.log("store", action);

    if (actionStore && actionStore.res.regCountry == country[0].abbr) {
      store.set('action', 
        { 
          action: actionStore,
          trademark: trademarkStore
        }
      );
    } else {
      actionStore = null;
      trademarkStore = null;
      store.remove('action');
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
    title: 'Register a Trademark | Trademarkers LLC',
    description: 'Trademarkers is a leading international brand protection company that specializes in global trademark registration',
    keywords: 'Trademark Registration in '+ country[0].name +', register a trademark in '+ country[0].name,
    country: country[0],
    price: price,
    classes: classes,
    serviceType: serviceType,
    countries: countries,
    actionStore: actionStore,
    trademarkStore: trademarkStore,
    user: await helpers.getLoginUser(req)
  });
}

exports.trademarkProfile = async function(req, res, next) {

  let uploadPath;
  let logo_pic;
  let logoName;

  if ( req.files && req.files.logo_pic ) {  

    // updload file
    logoName = toInteger(moment().format('YYMMDDHHMMSS')) + '-' + req.files.logo_pic.name;
    req.body.logoName = logoName;
    logo_pic = req.files.logo_pic;
    uploadPath = __dirname + '/../public/uploads/' + logoName;
    // console.log(logo_pic);
    req.body.logoName = logoName;
    // Use the mv() method to place the file somewhere on your server
    logo_pic.mv(uploadPath, function(err) {
     
        
    });

  }


  let countries = await rpoCountries.getAll();

  let actionStore;
  let trademarkStore;

  if (store.get('action')) {
    actionStore = store.get('action').action;
    trademarkStore = store.get('action').trademark;
    // console.log("store", action);

    if (actionStore && actionStore.res.regCountry == countries[0].abbr) {
      store.set('action', 
        { 
          action: actionStore,
          trademark: trademarkStore
        }
      );
    }
  }

  console.log("actions", actionStore);

  activityService.logger(req.ip, req.originalUrl, "Registration Profile ", req);

  res.render('order/validateProfile', { 
    layout: 'layouts/public-layout-default', 
    title: 'confirmation',
    data: req.body,
    countries:countries,
    trademarkStore: trademarkStore,
    user: await helpers.getLoginUser(req)
  });
}



exports.validateOrder = async function(req, res, next) {

  let type;

  
  
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
  

  activityService.logger(req.ip, req.originalUrl, "Validate " + type + " Order", req);

  let prices = await rpoPrices.findPriceByCountry(req.body.countryId * 1, type);
  let country = await rpoCountries.getById(req.body.countryId * 1);

  let actionStore;
  let trademarkStore;

  if (store.get('action')) {
    actionStore = store.get('action').action;
    trademarkStore = store.get('action').trademark;
    // console.log("store", action);

    if (actionStore && actionStore.res.regCountry == country[0].abbr) {
      store.set('action', 
        { 
          action: actionStore,
          trademark: trademarkStore
        }
      );
    }
  }
  
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


  // calculate price ask helpers.js
  let data = {
    type: req.body.type,
    noClass: Array.isArray(req.body.class) ? req.body.class.length : 1,
    price: price
  }
  // console.log("after",data);
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

  activityService.logger(req.ip, req.originalUrl, "Add to Cart", req);

  let prices = await rpoPrices.findPriceByCountry(req.body.countryId * 1, type);
  let price;

  // console.log(type);
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
    noClass: Array.isArray(req.body.class) ? req.body.class.length : 1,
    price: price
  }

  let country = await rpoCountries.getById(req.body.countryId * 1);
  let amount = helpers.calculatePrice(dataPrice);
  let currentUser = await helpers.getLoginUser(req)
  let newInsertedUser;

  let actionStore;
  let trademarkStore;

  if (store.get('action')) {
    actionStore = store.get('action').action;
    trademarkStore = store.get('action').trademark;
    // console.log("store", action);

    if (actionStore && actionStore.res.regCountry == country[0].abbr) {
      store.set('action', 
        { 
          action: actionStore,
          trademark: trademarkStore
        }
      );
    }
  }

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

    // console.log('req',req.body);

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

  if (actionStore) {
    let disExp = helpers.convertIntToDate(actionStore.res.discountExp)

    let expiry = moment(disExp).format('YYYY-MM-DD')
    let now = moment().format('YYYY-MM-DD')
        
    if ( moment(expiry).diff(moment(now), "day") >= 0 ) {
      data.discountAmount = amount * (actionStore.res.discount / 100);
      data.discountAmountType = 'action';
      data.discountExpiry = helpers.convertIntToDate(actionStore.res.discountExp);
      data.actionCode = actionStore._id;
      data.promoCode = actionStore.code;
    }

    store.remove('action');
    
  }

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

  await cartService.validateCartItems(currentUser)

  activityService.logger(req.ip, req.originalUrl, "Visited cart", req);

  if (!currentUser) {
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = new URL(fullUrl);
    let params = new URLSearchParams(url.search);
    userId = params.get("uid")

    guest = await rpoUserMongo.getByIdM(userId);
 
  } else {
    
    isloggedIn = true;
    userId = currentUser._id
  }

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

exports.addCartPromo = async function(req, res, next) {

  // HAS DUPLICATE FUNCTION IN CART SERVICE :: validateCartItems

  let currentUser = await helpers.getLoginUser(req) 
  let cartItems = await rpoCartItems.fetchCustomerCartActive(currentUser._id)

  let promoCodes = await rpoPromoCode.getByCode(req.body.promoCode)

  if ( promoCodes.length > 0 ) {

    let isValid = false;
    // validity
    if (promoCodes[0].startDate && promoCodes[0].endDate) {
      if( moment(promoCodes[0].startDate) <= moment() && moment(promoCodes[0].endDate) >= moment()) {
        isValid = true;
      }
    } else if(promoCodes[0].startDate && moment(promoCodes[0].startDate) <= moment()) {
      isValid = true;
    } else {
      if (!promoCodes[0].startDate && !promoCodes[0].endDate) {
        isValid = true;
      }
    }

    if(promoCodes[0].status == "Inactive") {
      isValid = false;
    }

    if (isValid ) {

      await cartItems.forEach(async items => {

        let promoData = {
          promoCode : req.body.promoCode
        }

        if (promoCodes[0].discountType == "Percentage") {
          promoData.discountAmount = items.price * (promoCodes[0].discountAmount / 100)
        } else {
          promoData.discountAmount = promoCodes[0].discountAmount
        }

        await rpoCartItems.update(items._id, promoData)

      })

      res.flash('success', 'Promo Code Applied');
    } else {
      let mailData = {
        subject: "Customer tried to enter promo code",
        message: `<p>Customer tried to enter promo code.</p>
                  <p>Invalid Code: ${req.body.promoCode}</p>`
      }
      mailService.notifyAdmin(mailData);
      res.flash('error', 'Sorry!, Promo Code not valid');
    }
    

  } else {
    let mailData = {
      subject: "Customer tried to enter promo code",
      message: `<p>Customer tried to enter promo code.</p>
                <p>Code not found: ${req.body.promoCode}</p>`
    }
    mailService.notifyAdmin(mailData);

    res.flash('error', 'Sorry!, Promo Code does not exist');
  }
  

  res.redirect('/cart');

}

exports.removeCartPromo = async function(req, res, next) {
  let currentUser = await helpers.getLoginUser(req) 
  let cartItems = await rpoCartItems.fetchCustomerCartActive(currentUser._id)

  await cartItems.forEach(async items => {

    let promoData = {
      promoCode : '',
      discountAmount : 0,
    }
    await rpoCartItems.update(items._id, promoData)

  })

  res.redirect('/cart');
}


exports.checkout = async function(req, res, next) {

  let currentUser = await helpers.getLoginUser(req) 
  let cartItems;
  let userId;

  activityService.logger(req.ip, req.originalUrl, "Proceed to checkout", req);

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
  
  cartItems = await rpoCartItems.fetchCustomerCartActive(userId)

  // console.log(cartItems.length);
  if( cartItems.length == 0) {
    res.redirect("/countries"); 
  }

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

  activityService.logger(req.ip, req.originalUrl, "Placed Order", req);

  let cartItems = await rpoCartItems.fetchCustomerCartActive(currentUser._id)
  let orderCode = await orderService.createOrderCode();
  let invoiceCode = await orderService.createInvoiceCode();
  let description = "Trademark Order #" + orderCode;
  let amount = await helpers.getCartTotalAmount(cartItems);

  console.log("here", req.body.paymentMethod);
  // return

  if ( req.body.paymentMethod == "Stripe" ) {

  
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
        invoiceCode: invoiceCode,
        charge: charge,
        custom: true,
        paid: true,
        userId: currentUser._id,
        user: currentUser,
        cartItems: cartItems,
        created_at: toInteger(moment().format('YYMMDD')),
        created_at_formatted: moment().format()
      }

      let invoice = {
        orderNumber: orderCode,
        invoiceCode: invoiceCode,
        amount: amount,
        charge: charge,
        custom: true,
        paid: true,
        userId: currentUser._id,
        user: currentUser,
        cartItems: cartItems,
        created_at: toInteger(moment().format('YYMMDD')),
        created_at_formatted: moment().format()
      }
  
      // console.log('put', order);
  
      
  
      mailService.sendOrderNotification(order);
      rpoOrder.put(order);
      rpoInvoice.put(invoice);
      res.flash('success', 'Payment Successful!');
      rpoCharge.put(charge);
  
      activityService.logger(req.ip, req.originalUrl, "checkout " + orderCode, req);

      // update cart items to complete
      await cartItems.forEach(async items => {

        let data = {
          status: 'complete',
          orderNumber: orderCode
        }
        // update cart status
        rpoCartItems.update(items._id, data);

        if (items.serviceType == "Added Trademark Service") {

          // update added service
          let serviceData = {
            status : 'paid'
          }
          await rpoTrademarkAddedService.updateDetails(items.serviceId, serviceData)

        } else {
        // create trademark from cart item
          let trademark = {
            userId: items.userId,
            orderCode: orderCode,
            userEmail: items.user.email,
            serialNumber: null,
            mark: items.word_mark,
            logoPic: items.logoName,
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
        }

      });
  
      res.redirect("/thank-you/"+orderCode); 
    } else {

      let mailData = {
        subject: "Customer tried Checkout | FAILED",
        message: `<p>Stripe Failed to charge</p>
                  <p>Email: ${currentUser.email}</p>`
      }
      mailService.notifyAdmin(mailData);

      res.flash('error', 'Sorry!, Something went wrong, try again later.');
      res.redirect("/checkout"); 

    }
  } catch (err) {

    let mailData = {
      subject: "Customer tried Checkout | FAILED",
      message: `<p>Stripe Failed to process: ${err.message}</p>
                <p>Email: ${currentUser.email}</p>`
    }
    mailService.notifyAdmin(mailData);

    res.flash('error', 'Sorry!, Something went wrong, try again later. No such token: a similar object exists in test mode');
    res.redirect("/checkout"); 
  }

  } else {
    // INVOICE
    console.log("checkout using invoice");

    let invoice = {
      orderNumber: orderCode,
      invoiceCode: invoiceCode,
      description: "Using Invoice " + invoiceCode,
      amount: amount,
      custom: false,
      paid: false,
      userId: currentUser._id,
      user: currentUser,
      cartItems: cartItems,
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }

    let order = {
      orderNumber: orderCode,
      invoiceCode: invoiceCode,
      charge: invoice,
      custom: false,
      paid: false,
      userId: currentUser._id,
      user: currentUser,
      total_amount: amount,
      cartItems: cartItems,
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }

    

    // console.log('put', order);

    

    mailService.sendOrderNotification(order);
    rpoOrder.put(order);
    rpoInvoice.put(invoice);
    res.flash('success', 'Payment Successful!');
    // rpoCharge.put(charge);

    activityService.logger(req.ip, req.originalUrl, "Invoice checkout " + orderCode, req);

    // update cart items to complete
    await cartItems.forEach(async items => {

      let data = {
        status: 'complete',
        orderNumber: orderCode
      }
      // update cart status
      rpoCartItems.update(items._id, data);

      if (items.serviceType == "Added Trademark Service") {

        // update added service
        let serviceData = {
          status : 'unpaid'
        }
        await rpoTrademarkAddedService.updateDetails(items.serviceId, serviceData)

      } else {
      // create trademark from cart item
        let trademark = {
          userId: items.userId,
          orderCode: orderCode,
          userEmail: items.user.email,
          serialNumber: null,
          mark: items.word_mark,
          logoPic: items.logoName,
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
      }

    });

    res.redirect("/thank-you/"+orderCode); 
  }

}
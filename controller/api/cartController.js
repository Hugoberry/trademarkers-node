const { NetworkAuthenticationRequire } = require('http-errors');
const variables = require('../../config/variables');


var rpo = require('../../repositories/carts');
var rpoCartItems = require('../../repositories/cartItems');
var rpoTrademarkService = require('../../repositories/trademarkAddedServices');
var rpoTrademark = require('../../repositories/mongoTrademarks');
var rpoCountries = require('../../repositories/countries');
let helpers = require('../../helpers')

const { toInteger, unset } = require('lodash');
let moment = require('moment');
const countries = require('../../repositories/countries');

exports.add = async function(req, res, next) {

  let cart = await rpo.findById(req.body.id);

  if ( cart.length <= 0 ) {

    rpo.putCart(req.body);
    console.log('added new user record');
    res.json({
      status:true,
      message:"Record Added"
    });

  } else {

    console.log('exist');
    res.json({
      status:false,
      message:"Record Already Exist"
    });
  }

}

exports.addService = async function(req, res, next) {

  let trademarkService = await rpoTrademarkService.getById(req.body.serviceId);
  let currentUser = await helpers.getLoginUser(req);
  let trademark = await rpoTrademark.getById(req.body.trademarkId);
  let country = await rpoCountries.getById(trademark[0].countryId);

  // console.log(trademark);
  let cartData = {
    serviceType : "Added Trademark Service",
    serviceId : trademarkService[0]._id,
    trademarkId : trademark[0]._id,
    type: trademark[0].type,
    country: country[0],
    countryId: trademark[0].countryId,
    word_mark: trademark[0].mark,
    class: trademark[0].class,
    description: trademark[0].description,
    price : (trademarkService[0].addAmount * 1.0),
    userId: currentUser._id,
    user: currentUser,
    status: 'active',
    created_at: toInteger(moment().format('YYMMDD')),
    created_at_formatted: moment().format()
  }

  rpoCartItems.put(cartData);
    // console.log('added new user record');
  res.json({
    status:true,
    message:"Record Added"
  });

}

exports.getcartItems = async function(req, res, next) {
  let count = await helpers.getCartCount(req)

  res.json({
    count:count
  });
}

exports.removeCartItem = async function(req, res, next) {

  let response = await rpoCartItems.remove(req.body.id)
  res.json({
    result:response
  });
}








const { NetworkAuthenticationRequire } = require('http-errors');
const variables = require('../../config/variables');


var rpo = require('../../repositories/carts');
var rpoCartItems = require('../../repositories/cartItems');
let helpers = require('../../helpers')

exports.add = async function(req, res, next) {

    // console.log(req.body,'request');

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

exports.getcartItems = async function(req, res, next) {
  let count = await helpers.getCartCount(req)

  res.json({
    count:count
  });
}

exports.removeCartItem = async function(req, res, next) {
console.log(req.body);
// console.log(req.params);

  // let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  // let url = new URL(fullUrl);
  // let params = new URLSearchParams(url.search);
  // let cartId = params.get("id")
  
    // console.log(userId);

  let response = await rpoCartItems.remove(req.body.id)
  res.json({
    result:response
  });
}








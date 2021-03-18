let moment = require('moment');
const jwt = require('jsonwebtoken');

var rpoCartItems = require('./repositories/cartItems');

exports.convertIntToDate = function(idate) {

    let s = idate+"";

    // check if 2020 or below 1999
    let year = s.substring(0, 2) * 1;

    year = year > 50 ? '19' : '20';

    return new Date(year + s.substring(0, 2) + '-' + s.substring(2, 4) + '-' + s.substring(4));
    
}

exports.getLoginUser = function(req) {
    let decode = jwt.decode(req.cookies.jwt, {complete: true});

    let user;
    if (decode) {
        user = JSON.parse(decode.payload.user);
    }
    // let user = JSON.parse(decode.payload.user);

    return user
}

exports.makeid = function(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
  
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  
    return result;
}

exports.calculatePrice = function(data) {
    // PARAMETER PASSED TO CALL THIS FUNCTION
    // let data = {
    //     type: req.body.type,
    //     noClass: req.body.class.length,
    //     price: prices[0]
    //   }
    let amount = init = add = 0;

    if (data.type == "word") {
        init = data.price.initial_cost
        add = data.price.additional_cost
    } else {
        init = data.price.logo_initial_cost
        add = data.price.logo_additional_cost
    }

    amount = init + ( add * ( data.noClass - 1 ) )
    console.log('length ',data.noClass);
    return amount;
}

exports.getCartCount = async function() {
    
    let decode = jwt.decode(req.cookies.jwt, {complete: true});

    let user;
    if (decode) {
        user = JSON.parse(decode.payload.user);

        let cartItems = await rpoCartItems.fetchCustomerCart(user._id)

        return cartItems.length;
    } else {
        return 0;
    }
    
    
}

exports.getCartTotalAmount = async function(cartItems) {
    
    let total = 0;
    return new Promise(function(resolve, reject) {

        cartItems.forEach(element => {
            // console.log(element.price);
            total += element.price
        });

        resolve(total);

    });
    
    
}

exports.getTkey = function() {
    return process.env.PAYK
}

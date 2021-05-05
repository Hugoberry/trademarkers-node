let moment = require('moment');
const jwt = require('jsonwebtoken');

const variables = require('./config/variables');

var rpoCartItems = require('./repositories/cartItems');
var rpoUser = require('./repositories/users');
var rpoUserMongo = require('./repositories/usersMongo');

let ObjectID = require('mongodb').ObjectID;

var _ = require('lodash');

exports.convertIntToDate = function(idate) {

    let s = idate+"";

    // check if 2020 or below 1999
    let year = s.substring(0, 2) * 1;

    year = year > 50 ? '19' : '20';

    return new Date(year + s.substring(0, 2) + '-' + s.substring(2, 4) + '-' + s.substring(4));
    
}

exports.getLoginUser = async function(req) {
    let decode = jwt.decode(req.cookies.jwt, {complete: true});

    let user;
    if (decode && decode.payload.user) {
        user = JSON.parse(decode.payload.user);

        if ( user && user._id ) {
            user._id = ObjectID(user._id)
        }

        if ( user && !user._id ) {
            let currentUserRecord = await rpoUserMongo.findUser(user.email)
        
            user = currentUserRecord[0]
        }

        if ( user ) {
            let currentUser = await rpoUserMongo.findUser(user.email)
            user = currentUser[0]
        }
    }
    // let user = JSON.parse(decode.payload.user);

    return user
}

exports.setLoginUser = function(res,obj) {
    // console.log(obj);
    //use the payload to store information about the user such as username, user role, etc.
    let payload = {user: JSON.stringify(obj)}

    //create the access token with the shorter lifespan
    let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES
    });

    res.cookie("jwt", accessToken);

    return obj
}

exports.getCurrentUser = function(req) {
    let decode = jwt.decode(req.cookies.jwt, {complete: true});

    let user;
    if (decode) {
        user = JSON.parse(decode.payload.currentUser);
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

exports.getCartCount = async function(req) {
    
    let decode = jwt.decode(req.cookies.jwt, {complete: true});

    let user;
    if (decode) {
        user = JSON.parse(decode.payload.user);

        if ( user && !user._id ) {
            let currentUserRecord = await rpoUserMongo.findUser(user.email)
        
            user = currentUserRecord[0]
        }

        if( !user ) {
            return 0
        }

        let cartItems = await rpoCartItems.fetchCustomerCart(user._id)

        return cartItems.length;
    } else {
        return 0;
    }
    
    
}

exports.getCartTotalAmount = async function(cartItems) {
    
    let total = 0;
    return new Promise(function(resolve, reject) {

        if (cartItems) {
            cartItems.forEach(element => {
                // console.log(element.price);
                total += element.price
            });
    
            resolve(total);
        } else {
            resolve(0);
        }

        

    });
    
    
}

exports.getTkey = function() {
    return process.env.PAYK
}

exports.convertSecretCode = function(code) {

    let secretAmountDecode='', secretDescription='';

    for (let i = 0; code.length > i; i++) {

        if ( Number.isInteger( parseInt(code[i]) ) ) {
          // number
          secretDescription = variables.secretAmount[code[i]]
        } else {
          // char
          secretAmountDecode += variables.secretAmount[code[i]]
        }

    }

    return {
        secretDescription : secretDescription,
        secretAmountDecode : secretAmountDecode
    }

}

exports.isAuth = function(req) {
    let accessToken = req.cookies.jwt
    // console.log(accessToken);
    return accessToken
}

exports.getPriceFormatted = function(price) {
    let amount;

    var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });

    if (price < 0) {
        amount = 'TBA'
    } else if (!price) {
        amount = 'FREE'
    } else {
        amount = formatter.format(price)
    }
    return amount
}

exports.fetchUsersFromCartList = async function(items) {

    let users = []
    await items.forEach(item => { 
        // let data = {
        //     userId : item.userId,
        //     user : 
        // }
        users.push(item.userId);
    })

    return _.uniq(users);

    // let uSet = new Set(users);
    // console.log([...uSet]);
    // console.log( "this",_.initial(users) );
    // return users.filter(function(elem, pos) {
    //     return users.indexOf(elem) == pos;
    // })
} 



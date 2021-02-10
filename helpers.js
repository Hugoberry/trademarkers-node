let moment = require('moment');
const jwt = require('jsonwebtoken');

exports.convertIntToDate = function(idate) {

    let s = idate+"";

    // check if 2020 or below 1999
    let year = s.substring(0, 2) * 1;

    year = year > 50 ? '19' : '20';

    return new Date(year + s.substring(0, 2) + '-' + s.substring(2, 4) + '-' + s.substring(4));
    
}

exports.getLoginUser = function(req) {
    let decode = jwt.decode(req.cookies.jwt, {complete: true});
    let user = JSON.parse(decode.payload.user);

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



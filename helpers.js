let moment = require('moment');

exports.convertIntToDate = function(idate) {

    let s = idate+"";

    // check if 2020 or below 1999
    let year = s.substring(0, 2) * 1;

    year = year > 50 ? '19' : '20';

    return new Date(year + s.substring(0, 2) + '-' + s.substring(2, 4) + '-' + s.substring(4));
    
}



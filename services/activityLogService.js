// let rpoActivityLog = require('../repositories/activityLog');

exports.logger = function(req, res, next) {
    // console.log('this', req.ip);

    let geoip = require('geoip-lite');

    var ip = "207.97.227.239";
    var geo = geoip.lookup(ip);
    
    console.log(geo);
    // console.log(req.params);
    next()
}
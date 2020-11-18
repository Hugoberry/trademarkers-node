let rpoActivity = require('../repositories/activityLog');

exports.logger = function(ip, page, msg) {
    // console.log('this', req.ip);

    let geoip = require('geoip-lite');

    // let ip = "207.97.227.239";
    let geo = geoip.lookup(ip);

    if ( geo ) {

        let _data = {
            ip      : ip,
            uri     : page,
            country : geo.country,
            city    : geo.city,
            region  : geo.region,
            activity: msg
        };

        console.log(_data);

        rpoActivity.activity(_data);
    }
    

    // rpoActivity.activity()
    
    
    // console.log(req.params);
    // next()
}
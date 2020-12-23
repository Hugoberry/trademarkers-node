let rpoActivity = require('../repositories/activityLog');
let rpoEvent = require('../repositories/events');

let _variables = require('../config/variables');

exports.logger = function(ip, page, msg) {
    // console.log('this', req.ip);

    let geoip = require('geoip-lite');

    // let ip = "207.97.227.239";

    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }

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
 
}

exports.trackingEmail = function(ip, data) {
    // console.log('this', req.ip);

    let geoip = require('geoip-lite');

    // let ip = "::ffff:44.224.22.196";

    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }

    // console.log( ip.substring(0, ip.lastIndexOf('.')), "formatted" )

    let geo = geoip.lookup(ip);
    console.log(ip);
    if ( !_variables.ipAddresses.includes(ip) ){
        console.log(ip, 'ip not included!');
        let act_data = {
            tracking: {
                email: data.related_data.email.email,
                click: data.url,
                action_code: data.number,
                ip_address: ip
            }
        }
        rpoEvent.updateDetails(data.related_data.event._id, act_data);
    }

    // console.log(data, geo, _variables.ipAddresses);
 
}


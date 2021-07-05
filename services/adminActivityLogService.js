let rpoAdminActivity = require('../repositories/adminActivityLog');

let geoip = require('geoip-lite');
let helpers = require('../helpers')

const { toInteger } = require('lodash');
let moment = require('moment');

exports.logger = async function(activityData ,req) {
    // console.log('this', ip);

    let user = await helpers.getLoginUser(req);
    let name = user && user.name ? user.name : 'guest';
    

    let ip = req.ip;

    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }

    let geo = geoip.lookup(ip);

    let _data = {
        ip      : ip,
        user    : name,
        obj     : activityData.obj,
        objId   : activityData.objId,
        objType : activityData.objType,
        activity: activityData.message,
        country : geo ? geo.country : '',
        city    : geo ? geo.city : '',
        region  : geo ? geo.region : '',
        
        created_at: toInteger(moment().format('YYMMDD')),
        created_at_formatted: moment().format()
    };


    rpoAdminActivity.activity(_data);


 
}




var log = require('../services/activityLogService');
let geoip = require('geoip-lite');
let rpoActivityLog = require('../repositories/activityLog');

exports.intercept = async function(req, res, next) {

  var ip = "207.97.227.239";
  var geo = geoip.lookup(ip);

  let _data = {
    id      : "207.97.227.239",
    country : geo.country,
    region  : geo.region,
    city    : geo.city,
    uri     : req.originalUrl
  };

  let test = await rpoActivityLog.addLogs(_data);

  next();
  
}


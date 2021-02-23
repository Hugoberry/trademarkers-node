const variables = require('../config/variables');
var db = require('../config/database');
var crawlerService = require('../services/crawlerService');
// var express = require('express');

// var app = express();


var rpoTm = require('../repositories/mongoTrademarks');

var activityService = require('../services/activityLogService');

exports.index = async function(req, res, next) {

    activityService.logger(req.ip, req.originalUrl, "Visited tsdr serial number " + req.params['serial']);

    // FETCH SERIAL NUMBER
    let trademark = null;

    // console.log(trademark[0]);

    // if (trademark.length <= 0) {
    //   // 88715666 test cron
    //   let scrape = await crawlerService.fetchTsdr('88715666');
    //   if (!scrape) {
    //     trademark = await rpoTm.getBySerial(req.params['serial']);
    //   } 
    // } else {
      
    // }

    let scrape = await crawlerService.fetchTsdr(req.params['serial']);
    if (!scrape) {
      trademark = await rpoTm.getBySerial(req.params['serial']);
    }

    res.locals = {
      siteTitle: "Trademark Search",
      description: "Check trademark status",
      keywords: "Trademark Status, trademarkers status",
    };

    res.render('public/tsdr', { 
      layout: 'layouts/public-layout-interactive',
      trademark: trademark[0]
    });
    
}







const variables = require('../config/variables');
var db = require('../config/database');
var crawlerService = require('../services/crawlerService');
// var express = require('express');

// var app = express();


var rpoTm = require('../repositories/mongoTrademarks');

var activityService = require('../services/activityLogService');

exports.index = async function(req, res, next) {

    activityService.logger(req.ip, req.originalUrl, "Visited tsdr serial number " + req.params['serial'], req);

    let scrape = await crawlerService.fetchTsdr(req.params['serial']);

    // wait for the crawler
    await new Promise(resolve => setTimeout(resolve, 2000));
    let trademark = await rpoTm.getBySerial(req.params['serial']);
    console.log(trademark);

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







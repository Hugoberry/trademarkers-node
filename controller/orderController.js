const variables = require('../config/variables');
var db = require('../config/database');

const mysql = require('mysql');

var rpo = require('../repositories/orders');
var rpoTm = require('../repositories/trademarks');

var activityService = require('../services/activityLogService');

exports.status = async function(req, res, next) {

    activityService.logger(req.ip, req.originalUrl, "Visited order status " + req.params['id'], req);

    let order = await rpo.fetchOrder(req.params['id']);

    if ( order[0] ) {
      let trademarks = await rpoTm.fetchTmByOrder(order[0].id);
      order[0].trademarks = trademarks;
    }

    res.render('order/status', { 
      layout: 'layouts/public-layout', 
      title: 'Trademarkers LLC Order Status',
      order: order[0]
    });
    
}







const variables = require('../config/variables');
var db = require('../config/database');

const mysql = require('mysql');

var rpo = require('../repositories/orders');
var rpoTm = require('../repositories/trademarks');

var activityService = require('../services/activityLogService');

let customerId = 518;

exports.orders = async function(req, res, next) {

  // FETCH ORDERS
  let orders = await rpo.fetchOrderByUserMongo(customerId);
  let trademarks = await rpoTm.fetchTmByUser(customerId);

  // console.log(trademarks);

  res.render('customer/orders', { 
    layout: 'layouts/public-layout-interactive', 
    title: 'Trademarkers LLC Order Status'
  });
    
}

exports.orderDetail = async function(req, res, next) {



  res.render('customer/orderDetails', { 
    layout: 'layouts/public-layout-interactive', 
    title: 'Trademarkers LLC Order Status'
  });
  
}







const variables = require('../config/variables');
var db = require('../config/database');

const mysql = require('mysql');

var rpo = require('../repositories/orders');
var rpoTm = require('../repositories/trademarks');
var rpoTmMongo = require('../repositories/mongoTrademarks');
var rpoCountry = require('../repositories/countries');
var rpoUser = require('../repositories/users');

var helpers = require('../helpers');

var activityService = require('../services/activityLogService');

let customerId = 1293;

exports.orders = async function(req, res, next) {

  // FETCH ORDERS
  // let orders = await rpo.fetchOrderByUserMongo(customerId);
  let trademarks = await rpoTm.fetchTmByUser(customerId);
  let user = await rpoUser.getUserByID(customerId);

  let customer = {
    name:user[0].name,
    id:user[0].id
  }
  // console.log('trademarks',trademarks);
  
  let data = {
    trademark:[]
  };
  
  for(let i = 0; i < trademarks.length; i++) {

    let country = await rpoCountry.getById(trademarks[i].country_id)
    let cronTrademark = await rpoTmMongo.getBymysqlID(trademarks[i].id);
  
    let formattedData = {
      // country: country[0],
      mark : trademarks[i],
      markMongo : cronTrademark[0]
    }
    // console.log(cronTrademark);
    if ( typeof data.trademark[trademarks[i].country_id] === 'undefined' ) {
      data.trademark[trademarks[i].country_id] = {
        data : new Array()
      }
    }

    data.trademark[trademarks[i].country_id].countryName = country[0].name
    data.trademark[trademarks[i].country_id].data.push(formattedData)

  }

  console.log(data.trademark);

  data.trademark.forEach(element => {
    if (element) {
      console.log("el", element);
    }
  });


  res.render('customer/orders', { 
    layout: 'layouts/public-layout-interactive', 
    title: 'Trademarkers LLC Order Status',
    customer: customer,
    trademarks: trademarks,
    data: data
  });
    
}

exports.orderDetail = async function(req, res, next) {

  let trademark = await rpoTmMongo.getById(req.params.id);
  console.log(trademark);

  trademark[0].statusDateFormatted = helpers.convertIntToDate(trademark[0].statusDate);

  res.render('customer/orderDetails', { 
    layout: 'layouts/public-layout-interactive', 
    title: 'Trademarkers LLC Order Status',
    trademark: trademark[0]
  });
  
}







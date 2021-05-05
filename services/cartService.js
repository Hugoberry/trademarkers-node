
var rpoUsersMysql = require('../repositories/users');
var rpoTrademarkMongo = require('../repositories/mongoTrademarks');
var rpoCartItems = require('../repositories/cartItems');
var rpoUsers = require('../repositories/usersMongo');

var helpers = require('../helpers');

var mailService = require('../services/mailerService');

let moment = require('moment');
const { toInteger, extendWith } = require('lodash');



exports.sendAbandonedCart4hr = async function() {
  let cartItems = await rpoCartItems.fetchCustomerActiveCart4hr();
// console.log("items", cartItems);
  let users = await helpers.fetchUsersFromCartList(cartItems);

  console.log(users);

  users.forEach(async userId => {
    let user = await rpoUsers.getByIdM(userId);

    // SEND EMAIL 4HRS ABANDONED
    mailService.sendAbandonedCart4hr(user[0])
  })


}

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

exports.sendAbandonedCart1d = async function() {
  let cartItems = await rpoCartItems.fetchCustomerActiveCart1Day();
// console.log("items", cartItems);
  let users = await helpers.fetchUsersFromCartList(cartItems);

  // console.log(users);

  users.forEach(async userId => {
    let user = await rpoUsers.getByIdM(userId);

    // SEND EMAIL 4HRS ABANDONED
    mailService.sendAbandonedCart1d(user[0])
  })


}

exports.sendAbandonedCart3d = async function() {
  let cartItems = await rpoCartItems.fetchCustomerActiveCart3Day();
// console.log("items", cartItems);
  let users = await helpers.fetchUsersFromCartList(cartItems);

  // console.log(users);

  users.forEach(async userId => {
    let user = await rpoUsers.getByIdM(userId);

    // SEND EMAIL 4HRS ABANDONED
    mailService.sendAbandonedCart3d(user[0])
  })


}

exports.sendAbandonedCart1Month = async function() {
  let cartItems = await rpoCartItems.fetchCustomerActiveCartMonth();
// console.log("items", cartItems);
  let users = await helpers.fetchUsersFromCartList(cartItems);

  // console.log(users);

  users.forEach(async userId => {
    let user = await rpoUsers.getByIdM(userId);

    // SEND EMAIL 4HRS ABANDONED
    mailService.sendAbandonedCartMonth(user[0])
  })


}

// TEST MAIL
exports.testMail = async function() {

  mailService.testMail()

}



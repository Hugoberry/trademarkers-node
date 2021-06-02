
var rpoUsersMysql = require('../repositories/users');
var rpoTrademarkMongo = require('../repositories/mongoTrademarks');
var rpoCartItems = require('../repositories/cartItems');
var rpoUsers = require('../repositories/usersMongo');
var rpoPromoCode = require('../repositories/promoCode');

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

exports.validateCartItems = async function(user) {

  // let currentUser = await helpers.getLoginUser(req) 
  let cartItems = await rpoCartItems.fetchCustomerCartActive(user._id)
  let promoCode = await helpers.getCartCode(cartItems)

  let promoCodes = await rpoPromoCode.getByCode(promoCode)

  if ( promoCodes.length > 0 ) {

    let isValid = false;
    // validity
    if (promoCodes[0].startDate && promoCodes[0].endDate) {
      if( moment(promoCodes[0].startDate) <= moment() && moment(promoCodes[0].endDate) >= moment()) {
        isValid = true;
      }
    } else if(promoCodes[0].startDate && moment(promoCodes[0].startDate) <= moment()) {
      isValid = true;
    } else {
      if (!promoCodes[0].startDate && !promoCodes[0].endDate) {
        isValid = true;
      }
    }

    if(promoCodes[0].status == "Inactive") {
      isValid = false;
    }

    if (isValid ) {

      await cartItems.forEach(async items => {

        let promoData = {
          promoCode : promoCode
        }

        if (promoCodes[0].discountType == "Percentage") {
          promoData.discountAmount = items.price * (promoCodes[0].discountAmount / 100)
        } else {
          promoData.discountAmount = promoCodes[0].discountAmount
        }

        await rpoCartItems.update(items._id, promoData)

      })

    } else {
      await cartItems.forEach(async items => {
        let promoData = {
          promoCode : '',
          discountAmount : 0
        }
        await rpoCartItems.update(items._id, promoData)
      })

    }
    

  }


}

// TEST MAIL
exports.testMail = async function() {

  mailService.testMail()

}



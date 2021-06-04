const { NetworkAuthenticationRequire } = require('http-errors');
const variables = require('../../config/variables');
// const jwt = require('jsonwebtoken')

var rpoUsers = require('../../repositories/usersMongo');
var rpoUsersMy = require('../../repositories/users');
var rpotrademark = require('../../repositories/mongoTrademarks');

var helpers = require('../../helpers');

var activityService = require('../../services/activityLogService');
var mailService = require('../../services/mailerService')

const { toInteger } = require('lodash');
let moment = require('moment');

exports.add = async function(req, res, next) {

    // console.log(req.body,'request');

    let user = await rpoUsers.findUser(req.body.email);


    // let payload = {user: JSON.stringify(user)}
    // let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    //   expiresIn: process.env.ACCESS_TOKEN_EXPIRES
    // });
    // console.log(accessToken);
    if ( user.length <= 0 ) {

      rpoUsers.putUser(req.body);
      console.log('added new user record');

      // res.setHeader('Cache-Control', 'private');
      // res.cookie("jwt", accessToken);

      res.json({
        status:true,
        message:"Record Added"
      });

    } else {
      // update
      rpoUsers.updateUser(user.id,req.body);

      res.json({
        status:false,
        message:"Record Already Exist"
      });
    }

}

exports.checkEmailExist = async function(req, res, next) {

  let user;

  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  let url = new URL(fullUrl);
  let params = new URLSearchParams(url.search);
  let email = params.get("email")

  let userExistMongo = await rpoUsers.findUser(email);
  if (userExistMongo) {
    user = userExistMongo[0]
  }

  if (!user) {
    let userExistMySql = await rpoUsersMy.getUserByEmail(email);
    user = userExistMySql[0]
  }

  // console.log(email,user);

  res.json({
    ...user
  }); 
  
}


exports.verifySend = async function(req, res, next) {

  let user = await helpers.getLoginUser(req)


  mailService.verifyEmailAccount(user)

  res.json({
    ...user
  }); 
  
}

exports.selectDeliveryMethod = async function(req, res, next) {

  // let user = await helpers.getLoginUser(req)

  // let trademark = await rpotrademark.updateDetails

  activityService.logger(req.ip, req.originalUrl, req.body.name + " Selected " + req.body.type + " for delivery method ");

  let dataDelivery = {
    delivery : {
      name : req.body.name,
      address : req.body.address,
      contact : req.body.contact,
      amount : req.body.amount,
      type: req.body.type,
      status: 'pending',
      trackingNumber: '',
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }
    
  }

  let mailData = {
    to: req.body.userEmail,
    name: req.body.name,
    subject: "Certificate Delivery Method | " + req.body.trdName,
    message: `<p>Customer (${req.body.name}) selected ${req.body.type} for his trademark certificate</p>`
  }

  mailService.notifyAdmin(mailData)

  mailData.subject = `Trademark Certificate Delivery Method | ${req.body.trdName}`
  mailData.message = `<p>Thank you for selecting ${req.body.type} as the delivery method in sending your Registration Certificate of (${req.body.trdName}) in Class (${req.body.strClass}) with Serial No. ${req.body.trdSer}</p>
                      <p>Name: ${req.body.name}<br>Address: ${req.body.address}</p>
                      <p></p>
                      <p>Please expect delivery within 2-3 weeks time. <br><br><br>Thank you.<br><br>NiFAEM Entertainment Inc.<br>2006 East Azalea Avenue<br>Baker LA 70714</p>`
  mailService.notifyCustomer(mailData)

  // console.log(req.body);

  await rpotrademark.updateDetails(req.body.trdId, dataDelivery)
 

  // NOTIFY ADMIN CUSTOMER SELECTION add logs

  res.json(dataDelivery); 
  
}










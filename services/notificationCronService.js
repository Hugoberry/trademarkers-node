
var rpoUsers = require('../repositories/usersMongo');
var rpotrademarks = require('../repositories/mongoTrademarks');
var rpoAddedServices = require('../repositories/trademarkAddedServices');

var helpers = require('../helpers');

var mailService = require('../services/mailerService');

let moment = require('moment');
const { toInteger, extendWith } = require('lodash');



exports.fetchOtherServices = async function() {
  
  console.log("========= Notification Cron ==========");
  let addedServices = await rpoAddedServices.fetchAddedServices();

  console.log("services",addedServices);

  await addedServices.forEach(async addedService => {
    // console.log(addedService);
    let mark = await rpotrademarks.getById(addedService.trademarkId);
    let user = await rpoUsers.getByIdM(mark[0].userId);
    // console.log(user);

    let mailData = {
      user : user[0],
      mark : mark[0],
      service : addedService
    }

    mailService.notifyAddedService(mailData);

    rpoAddedServices.updateDetails(addedService._id, {isMailed : 'yes'})

  });

}



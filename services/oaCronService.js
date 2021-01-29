
var rpoUsersMysql = require('../repositories/users');
var rpoTrademark = require('../repositories/trademarks');
var rpoSouNotifications = require('../repositories/souNotifications');
var rpoTrademarkMongo = require('../repositories/mongoTrademarks');

var mailService = require('../services/mailerService');
var actionService = require('../services/actionService')

let moment = require('moment');
const { toInteger } = require('lodash');


exports.sendNOA = async function() {

console.log('called');
let rec = await rpoTrademarkMongo.getlimitData(10);
console.log(rec[0]);
//   if (strData.length > 3) {
//     let countryCode = strData[0],
//         serialNumber = strData[1],
//         type = strData[2],
//         dateIssue = strData[3],
//         deadlineDate = strData[4],
//         userId = strData[5],
//         orderId = strData[6];

//         dateIssue = dateIssue.split('-');
//         deadlineDate = deadlineDate.split('-');
//         userId = userId.split('-');
//         orderId = orderId.split('-');

//         let user = await rpoUsersMysql.getUserByIdMysql((userId[1] * 1));
//         let trademarks = await rpoTrademark.fetchTmById(orderId[1]);

//         let mailData = {
//           serialNumber, serialNumber,
//           userId: userId[1],
//           orderId: orderId[1],
//           dateIssue: convertIntToDate(dateIssue[1]),
//           deadlineDate: convertIntToDate(deadlineDate[1]),
//           user: user[0],
//           trademark: trademarks[0],
//           lastSent: toInteger(moment().format('YYMMDD')),
//           noEmail: 1,
//           fileUrl:  uploadPath,
//           fileName:  sampleFile.name,
//           actionType: 'sou notification'
//         }

//         let action = await actionService.createActionCode(mailData,'/')

//         let notification = await rpoSouNotifications.findBySerial(serialNumber);
//         let flag = false;

//         if (notification.length > 0) {
//           // update
//           let lastNotificationSent = convertIntToDate(notification[0].lastSent)

//           if ( moment().diff(lastNotificationSent,"hours") >= 48 ) {
//             flag = true;
//             let mailDataContent = {
//               lastSent: toInteger(moment().format('YYMMDD')),
//               noEmail: (notification[0].noEmail + 1)
//             }
//             rpoSouNotifications.updateDetails(notification[0]._id, mailDataContent);
//           }

//         } else {
//           // put new record
//           flag = true;
//           rpoSouNotifications.put(mailData);
//         }

        
//         if ( flag ) {
//           switch(type.trim()) {
//             case 'AB':
//               console.log('sending');
//             break;
//             case 'AL':
//               // STATEMENT OF USE
//               console.log('sending sou');
//               mailService.sendNOA(mailData);
//               // mailService.sendSOU(mailData);
              
//             break;
//             case 'OA':
//               console.log('sending OA');
//               mailService.sendNOA(mailData);
//             break;
//           }
//         }

//     // 
//   }
  



  
}
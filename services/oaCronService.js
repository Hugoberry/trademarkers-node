
var rpoUsersMysql = require('../repositories/users');
var rpoTrademark = require('../repositories/trademarks');
var rpoSouNotifications = require('../repositories/souNotifications');
var rpoTrademarkMongo = require('../repositories/mongoTrademarks');

var helpers = require('../helpers');

var mailService = require('../services/mailerService');
var actionService = require('../services/actionService')

let moment = require('moment');
const { toInteger } = require('lodash');


exports.sendNOA = async function() {

console.log('called');
let rec = await rpoTrademarkMongo.getlimitDataByStatus();
console.log(rec.length);

let count = 0;

rec.forEach( async (trademark) => {
    // console.log(trademark.noticeOfAllowanceDate);

    let noticeOfAllowanceDateFormatted = helpers.convertIntToDate(trademark.noticeOfAllowanceDate);
    let deadLine = moment(noticeOfAllowanceDateFormatted).add(6, "M").format("YYYY-MM-DD");

    // let noaDeadLine = moment(noticeOfAllowanceDateFormatted).diff(deadLine, "months");
    // console.log('dead date', moment(deadLine).diff(moment(), "weeks"));
    
    if ( moment(deadLine).diff(moment(), "weeks") > 0 ) {


        // get notification if not yet send or sent 48 hrs ago
        let notification = await rpoSouNotifications.findBySerial(trademark.serialNumber);
        let user = await rpoUsersMysql.getUserByIdMysql(trademark.mysqlRecord.user_id);
        
        let mailData = {
            serialNumber : trademark.serialNumber,
            userId: trademark.mysqlRecord.user_id,
            orderId: trademark.mysqlRecord.order_id,
            dateIssue: helpers.convertIntToDate(moment(noticeOfAllowanceDateFormatted).format("YYMMDD")),
            deadlineDate: helpers.convertIntToDate(moment(deadLine).format("YYMMDD")),
            user: user[0],
            trademark: trademark.mysqlRecord,
            lastSent: toInteger(moment().format('YYMMDD')),
            noEmail: 1,
            fileUrl:  '',
            fileName:  '',
            actionType: 'sou notification'
          }

        let flag = false;

        if (notification.length > 0) {
          // update
          let lastNotificationSent = helpers.convertIntToDate(notification[0].lastSent)

          if ( moment().diff(lastNotificationSent,"hours") >= 48 ) {
            flag = true;
            let mailDataContent = {
              lastSent: toInteger(moment().format('YYMMDD')),
              noEmail: (notification[0].noEmail + 1)
            }

            mailData.number = notification[0].number;
            rpoSouNotifications.updateDetails(notification[0]._id, mailDataContent);
          }

        } else {
          // put new record
          flag = true;

          let action = await actionService.createActionCode(mailData,'/')

          mailData.action = action;
          mailData.number = action.number;
          
          rpoSouNotifications.put(mailData);
        }

        
        if ( flag ) {
            mailService.sendNOA(mailData);
        }
    }

    console.log( 'helper', helpers.convertIntToDate(trademark.noticeOfAllowanceDate) );
});

// if (rec[0].noticeOfAllowanceDate)
// console.log('NOA',helpers.convertIntToDate(rec[0].noticeOfAllowanceDate));


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
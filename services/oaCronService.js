
var rpoUsersMysql = require('../repositories/users');
var rpoTrademark = require('../repositories/trademarks');
var rpoSouNotifications = require('../repositories/souNotifications');
var rpoTrademarkMongo = require('../repositories/mongoTrademarks');

var helpers = require('../helpers');

var mailService = require('../services/mailerService');
var actionService = require('../services/actionService')

let moment = require('moment');
const { toInteger, extendWith } = require('lodash');


exports.sendNOACron = async function() {


let rec = await rpoTrademarkMongo.getlimitDataByStatus();
console.log(rec.length);

let count = 0;
for (let i = 0; count < 1 ; i++) {
// rec.forEach( async (trademark) => {
    // console.log(trademark.noticeOfAllowanceDate);

    let noticeOfAllowanceDateFormatted = helpers.convertIntToDate(rec[i].noticeOfAllowanceDate);
    let deadLine = moment(noticeOfAllowanceDateFormatted).add(6, "M").format("YYYY-MM-DD");

    // let noaDeadLine = moment(noticeOfAllowanceDateFormatted).diff(deadLine, "months");
    console.log('dead date', moment(deadLine).diff(moment(), "weeks"));
    
    if ( moment(deadLine).diff(moment(), "weeks") > 0 ) {


        // get notification if not yet send or sent 48 hrs ago
        let notification = await rpoSouNotifications.findBySerial(rec[i].serialNumber);
        let user = await rpoUsersMysql.getUserByIdMysql(rec[i].mysqlRecord.user_id);
        
        let mailData = {
            serialNumber : rec[i].serialNumber,
            userId: rec[i].mysqlRecord.user_id,
            orderId: rec[i].mysqlRecord.order_id,
            dateIssue: helpers.convertIntToDate(moment(noticeOfAllowanceDateFormatted).format("YYMMDD")),
            deadlineDate: helpers.convertIntToDate(moment(deadLine).format("YYMMDD")),
            user: user[0],
            trademark: rec[i].mysqlRecord,
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

          if ( moment().diff(lastNotificationSent,"days") >= 2 ) {
            flag = true;

            mailData.noEmail = (notification[0].noEmail + 1);

            if ( !notification[0].number ) {
                console.log("===========if");
              let action = await actionService.createActionCode(mailData,'/')

            //   mailData.action = action;
              mailData.number = action.number;
            } else {
                console.log("===========else");
              mailData.number = notification[0].number;
            }

            console.log("===========1");
            console.log("before", mailData);
            delete mailData._id;
            console.log("after", mailData);
            rpoSouNotifications.updateDetails(notification[0]._id, mailData);
          }

        } else {
          // put new record
          flag = true;
          console.log("===========else 2");
          let actione = await actionService.createActionCode(mailData,'/')
          console.log("===========else 2.1");
        //   mailData.action = actione;
          
          mailData.number = actione.number;
          console.log("===========else 2.2");
          await rpoSouNotifications.put(mailData);
        }

        
        if ( flag ) {
          console.log('sending');
            mailService.sendNOA(mailData);
            count++;
            // return false;
        }
    }


    // console.log( 'helper', helpers.convertIntToDate(trademark.noticeOfAllowanceDate) );
}

  



  
}
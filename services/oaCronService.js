
var rpoUsersMysql = require('../repositories/users');
var rpoTrademark = require('../repositories/trademarks');
var rpoSouNotifications = require('../repositories/souNotifications');
var rpoActions = require('../repositories/actionCode');
var rpoTrademarkMongo = require('../repositories/mongoTrademarks');

var helpers = require('../helpers');

var mailService = require('../services/mailerService');
var actionService = require('../services/actionService')

let moment = require('moment');
const { toInteger, extendWith } = require('lodash');


exports.sendNOACron = async function() {


let rec = await rpoTrademarkMongo.getlimitDataByStatus();
// console.log(rec.length);

let count = 0;
for (let i = 0; count < 1 ; i++) {
// rec.forEach( async (trademark) => {
    // console.log(trademark.noticeOfAllowanceDate);

    if (rec[i] && rec[i].noticeOfAllowanceDate) {

    
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

          if ( moment().diff(lastNotificationSent,"days") >= 2 && notification[0].actionType == 'sou notification' && !notification[0].response ) {
            flag = true;

            mailData.noEmail = (notification[0].noEmail + 1);

            if ( !notification[0].number ) {
              let action = await actionService.createActionCode(mailData,'/')


              mailData.number = action.number;
            } else {
              mailData.number = notification[0].number;
            }

     
            delete mailData._id;
            rpoSouNotifications.updateDetails(notification[0]._id, mailData);
          } else {
              console.log("last sent : ", lastNotificationSent);
          }

        } else {
          // put new record
          flag = true;
       
          let actione = await actionService.createActionCode(mailData,'/')
   

          
          mailData.number = actione.number;
    
          await rpoSouNotifications.put(mailData);
        }

        
        if ( flag ) {

          let excludeEmail = [
            "avv.ansideri@legal-partners.eu",
            "shop@drwimabeauty.com",
            "adriana.saleitao@ramaral.com",
            "samantha.ruvalcaba@yahoo.com",
            "tanja.milinkovic@mikroe.com",
            "velgis@icloud.com",
            "olisehrage@gmail.com",
            "doc.alnuaimi@gmail.com",
            "black@cavetri.com",
            "mikalouwie@gmail.com",
            "hli@eversystec.de",
            "gerard@tmcmotors.co.uk",
            "champagnesnow@usa.com",
            "avidrori65@gmail.com",
            "angele@abundantbd.com",
            "dave@ixidesigns.com",
            "albertohilloa@gmail.com",
            "ippass@ippass.com.tw",
            "brothersforum17@gmail.com",
            "nkrylova@hystax.com",
            "mikalouwie@gmail.com",
            "inna@Vioramed.com",
            "bryanjaywilliams@gmail.com",
            "thomas.gachot@gmail.com",
            "natedent1984@gmail.com",
            "info@puredalhook.com",
            "lily@tomtoc.com",
            "armiami11.11@gmail.com",
            "jarit44@gmail.com",
            "mrborislukic@gmail.com",
            "saechang@hancocorporation.com",
            "coles.banks@yahoo.com",
            "mrborislukic@gmail.com",
            "papiparra1@aol.com",
            "bennelds@gmail.com",
            "kim.poh.ng@christopherleeong.com",
            "kazanceva_z@pgstudio.io",
            "nadege@puremix.net",
            "alfredo.gd@yahoo.com",
            "maine.2008@hotmail.com"
          ];

// console.log(mailData.user.email);
          if( !excludeEmail.includes( mailData.user.email.toLowerCase() ) ) {
            mailService.sendNOA(mailData);
            count++;
          } 
      
          // 
          
            // return false;
        }
    } else {
        console.log('dead date else', moment(deadLine).diff(moment(), "weeks"));
        // console.log();
    }

  } else {
    console.log("rec", rec[i]);
  }

  if (rec.length <= i ) {
    count++;
  }


    // console.log( 'helper', helpers.convertIntToDate(trademark.noticeOfAllowanceDate) );
} // for end


}

exports.sendSOUSummaryNotification = async function() {
  // console.log("fetch");

  let mailData = []
  let notification = await rpoSouNotifications.fetchSouSummaryNotification();
  // console.log(notification);
  for(let i = 0; i < notification.length; i++){

    let notif = notification[i];

    let actions = await rpoActions.getAction(notif.number);

    let noclick = ( actions[0] && actions[0].tracking ? actions[0].tracking.length : 0 )
      
    let souData = {
      noClick: noclick
    }

    // check response
    if ( actions[0] && actions[0].response ) {
      if (!notif.response)
      souData.response = actions[0].response
    }

    await rpoSouNotifications.updateDetails(notif._id, souData);

    notif.noClick = noclick

    mailData.push(notif);


  }

  mailService.sendSouSummary(mailData);
  // console.log("data collected",mailData);
}
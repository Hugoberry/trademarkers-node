const nodemailer = require("nodemailer");

const fs = require("fs");
const ejs = require("ejs");

let rpoOutbox = require('../repositories/outbox');
let rpoEvent = require('../repositories/events');

let actionService = require('../services/actionService');

let moment = require('moment');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USERNAME, 
    pass: process.env.MAIL_PASSWORD
  }
});

exports.contact = async function(data) {

  return await transporter.sendMail({
  sender: data.name,
  replyTo: data.email,
  from: data.email, 
  to: process.env.MAIL_TO,
  subject: "New Contact from client | " + data.name, 
  html: `<p>Hi Admin,</p>
          <p>New Contact Us Inquiry:</p>
          <p>From: ${data.email}<br>
          Phone: ${data.phone}<br>
          Message: ${data.message}</p>
      `, 
  });
  
}

exports.researcherNotify = async function(message, toMail, subject) {

  return await transporter.sendMail({
    sender: 'Trademarkers LLC',
    replyTo: process.env.MAIL_FROM,
    from: process.env.MAIL_FROM, 
    to: toMail,
    subject: subject, 
    html: message, 
  });

}

exports.eventEmail = async function(mailData) {

  // return;
  console.log("sending...");
  ejs.renderFile(__dirname+"/../email-templates/opposition-euipo.ejs", { mailData: mailData }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          // to: mailData.email.email,
          // to: "mg@bigfoot.com",
          to: "felix@trademarkers.com",
          subject: mailData.event.case.name+": Enforce Your Trademark Rights Now Before It's Too Late!", 
          html: data
        };

        let mailResponse = await transporter.sendMail(mainOptions, function (err, info) {
          
          let res;
          
          if (err) {
            // eventMailData.outbox = err;
            rpoOutbox.put(err)
            res = err;
            // return err;
          } else {
  
            rpoOutbox.put(info)
            res = info;

          }

          res.mailContent = mainOptions.html

          return res;
        });
        

        // UPDATE EVENT RECORD 
        let event = await rpoEvent.getId(mailData.event._id);


        let eventMailData = {
          mailContent: [mainOptions]
        }

        if ( !Array.isArray(event[0].mailContent) && event[0].mailContent ) {
          let mailContentOld = {
            sender : event[0].mailContent.sender,
            replyTo: event[0].mailContent.replyTo,
            from : event[0].mailContent.from,
            to : event[0].mailContent.to,
            subject : event[0].mailContent.subject,
            html : event[0].mailContent.html,
          }
          // eventMailData.mailContent = [];
          eventMailData.mailContent.push(mailContentOld);
        } 

        if (event[0].mailContent && Array.isArray(event[0].mailContent)) {
          event[0].mailContent.forEach(content => {
              if ( content ) {
                  console.log(content);
                  eventMailData.mailContent.push(content);
              }
          });
        } 

        rpoEvent.addMailed(mailData.event._id,eventMailData);
    }
    
  });


}


exports.sendSOU = async function(mailData) {

  // return;
  console.log("sending...");
  ejs.renderFile(__dirname+"/../email-templates/uspto-sou.ejs", { mailData: mailData }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          to: mailData.user.email,
          // bcc: "michael@trademarkers.com",
           bcc: "felix@trademarkers.com",
           //bcc: "mg@bigfoot.com, carissa@chinesepod.com, felix@trademarkers.com",
          subject: "IMPORTANT NOTICE: Statement of use for your trademark - " + mailData.trademark.name, 
          html: data
          // attachments: [{'filename': mailData.fileName, 'content': file}]
        };

        transporter.sendMail(mainOptions, function (err, info) {
          
          let res;
          
          if (err) {
            console.log(err);
            res = err;
          } else {
            console.log(info);
            res = info;

          }

        });
      // })
       
    }
    
  });


}

exports.sendNOA = async function(mailData) {

  let transporterMG = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'michael@trademarkers.com', 
      pass: 'bigfoot1234'
      // user: process.env.MAIL_USERNAME, 
      // pass: process.env.MAIL_PASSWORD
    }
  });

  // user: 'michael@trademarkers.com', 
  // pass: 'bigfoot1234'

  // user: process.env.MAIL_USERNAME, 
  // pass: process.env.MAIL_PASSWORD

  let mailSender = 'Michael <michael@trademarkers.com>';

  // check dates to pass proper template
  let template = '';
  // let moment().
  mailData.dateFiledFormatted = moment(mailData.dateIssue).format('MMM D, YYYY');
  mailData.dateDeadFormatted = moment(mailData.deadlineDate).format('MMM D, YYYY');

  // console.log("weeks =>>>>>>>>>> ", moment().diff(mailData.dateIssue, 'weeks') );

  let dateIssue = moment().diff(mailData.dateIssue, 'weeks') < 0 ? (moment().diff(mailData.dateIssue, 'weeks') * -1) : moment().diff(mailData.dateIssue, 'weeks');
  let deadIssue = moment().diff(mailData.deadlineDate, 'weeks') < 0 ? (moment().diff(mailData.deadlineDate, 'weeks') * -1) : moment().diff(mailData.deadlineDate, 'weeks');

  if ( dateIssue <= 3 ) {
    template = 'noa-3weeks-plain.ejs'
  } else if ( dateIssue >= 4 && dateIssue < 12 ) {
    template = 'noa-4weeks-plain.ejs'
  } else if ( deadIssue <= 8 ) {
    template = 'noa-8weeks-plain.ejs';

    // add parameters for dates since moment is not define in email templates
    mailData.numberOfWeeks = deadIssue;

    // if (mailData.numberOfWeeks < 0) {
    //   mailData.numberOfWeeks = mailData.numberOfWeeks * -1;
    // }

  }


  if (template) {
  ejs.renderFile(__dirname+"/../email-templates/" + template, { mailData: mailData }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
        let mainOptions = {
          sender: mailSender,
          replyTo: mailSender,
          from: mailSender, 
          to: mailData.user.email,
          // bcc: "michael@trademarkers.com",
           bcc: "felix@trademarkers.com",
           //bcc: "mg@bigfoot.com, carissa@chinesepod.com, felix@trademarkers.com",
          subject: "IMPORTANT NOTICE: Statement of use for your trademark - " + mailData.trademark.name, 
          html: data
        };

        transporterMG.sendMail(mainOptions, function (err, info) {
          
          let res;
          
          if (err) {
            console.log(err);
            res = err;
          } else {
            console.log(info);
            res = info;

          }

        });
       
    }
    
  });
  }


}
 
// order notification

exports.sendOrderNotification = async function(charge) {

  // return;
  ejs.renderFile(__dirname+"/../email-templates/orderAdminNotification.ejs", { charge: charge }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          // to: mailData.user.email,
          // to: "mg@bigfoot.com",
          to: "info@trademarkers.com",
          subject: "New order | " + charge.description, 
          html: data
        };

        transporter.sendMail(mainOptions, function (err, info) {
          
          let res;
          
          if (err) {
            console.log(err);
            res = err;
          } else {
            console.log(info);
            res = info;

          }

        });
      // })
       
    }
    
  });


}
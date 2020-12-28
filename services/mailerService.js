const nodemailer = require("nodemailer");

const fs = require("fs");
const ejs = require("ejs");

let rpoOutbox = require('../repositories/outbox');
let rpoEvent = require('../repositories/events');

let actionService = require('../services/actionService');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USERNAME, 
    pass: process.env.MAIL_PASSWORD
  }
});

exports.contact = async function(data) {

  return await transporter.sendMail({
  sender: 'Trademarkers LLC',
  replyTo: process.env.MAIL_FROM,
  from: process.env.MAIL_FROM, 
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

  return;

  ejs.renderFile(__dirname+"/../email-templates/testMail.ejs", { mailData: mailData }, async function (err, data) {
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
          subject: mailData.lead.name+": Enforce Your Trademark Rights Now Before It's Too Late!", 
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

        if ( !Array.isArray(event[0].mailContent) ) {
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
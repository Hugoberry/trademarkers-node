const nodemailer = require("nodemailer");

const fs = require("fs");
const ejs = require("ejs");

let rpoOutbox = require('../repositories/outbox');
let rpoEvent = require('../repositories/events');

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

  ejs.renderFile(__dirname+"/../email-templates/testMail.ejs", { mailData: mailData }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          to: mailData.email.email,
          // to: "mg@bigfoot.com",
          subject: mailData.lead.name+": Enforce Your Trademark Rights Now Before It's Too Late!", 
          html: data
        };

        
        // console.log("html data ======================>", mainOptions.html);
        let mailResponse = await transporter.sendMail(mainOptions, function (err, info) {
          
          let res;
          
          if (err) {
            // eventMailData.outbox = err;
            rpoOutbox.put(err)
            res = err;
            // return err;
          } else {
            // eventMailData.outbox = info;
            rpoOutbox.put(info)
            res = info;
            // return info
            // console.log('Message sent: ' + info.response);
          }

          console.log("=======================================",res.messageId)

          // let data[res.messageId] = res;

          rpoEvent.addMailed(mailData.event._id,newMailContent);

        });
        // let eventMailData = {
        //   mailContent: mainOptions
        // }

        // let event = await rpoEvent.getId(mailData.event._id);
        // eventMailData.outbox = mailResponse;
        // eventMailData.mailContent = mainOptions;
        // let newMailContent = event.mailContent.push(eventMailData);
        // console.log('this data ================================= ', mailResponse);
        // rpoEvent.addMailed(mailData.event._id,newMailContent);
    }
    
  });


}
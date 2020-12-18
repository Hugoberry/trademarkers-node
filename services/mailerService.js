const nodemailer = require("nodemailer");

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
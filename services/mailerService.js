const nodemailer = require("nodemailer");

exports.contact = async function(data) {
console.log('called', data);

    // test start

// create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
    // host: process.env.MAIL_HOST,
    // port: process.env.MAIL_PORT,
    // secure: true, // true for 465, false for other ports
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USERNAME, // generated ethereal user
      pass: process.env.MAIL_PASSWORD, // generated ethereal password
    },
    });
  
    // let email = data.email;
    // let tld = email.split(/\./).slice(-2).join('.');
    // console.log(email.split(/\./).slice(-2).join('.'));

//   send mail with defined transport object
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
  
  // test end
}
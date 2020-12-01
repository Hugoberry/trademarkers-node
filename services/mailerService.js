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
  
//   send mail with defined transport object
    return await transporter.sendMail({
    from: process.env.MAIL_FROM, // sender address
    to: process.env.MAIL_TO, // list of receivers
    subject: "New Contact from client - " + data.name, // Subject line
    html: `<p>Hi Admin,</p>
            <p>New Contact Us Inquiry:</p>
            <p>From: ${data.email}<br>
            Phone: ${data.phone}<br>
            Message: ${data.message}</p>
        `, // html body
    });
  
  // test end
}
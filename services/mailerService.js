const nodemailer = require("nodemailer");

const fs = require("fs");
const ejs = require("ejs");

let rpoOutbox = require('../repositories/outbox');
let rpoEvent = require('../repositories/events');
let rpoUser = require('../repositories/usersMongo');

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
  // to: "felix@bigfoot.com",
  to: process.env.MAIL_TO,
  subject: "New Contact from client | " + data.name, 
  html: `<p>Hi Admin,</p>
          <p>New Contact Us Inquiry:</p>
          <p>Name: ${data.name}<br>
          From: ${data.email}<br>
          Phone: ${data.phone}<br>
          Inquiry Type: ${data.inquiry}<br>
          Message: ${data.message}</p>
      `, 
  });
  
}

exports.sendQuote = async function(quoteData) {

  // return;
  ejs.renderFile(__dirname+"/../email-templates/quoteAdminNotification.ejs", { data: quoteData }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          to: "info@trademarkers.com",
          // bcc: ["carissa@trademarkers.com", "billing-trademarkers@moas.com","felix@bigfoot.com"],
          // to: "carissa@trademarkers.com",
          bcc: ["carissa@trademarkers.com", "felix@bigfoot.com"],
          subject: "New Quote: " + quoteData.quoteType, 
          html: data
        };

        transporter.sendMail(mainOptions, function (err, info) {
          
          if (err) {
            console.log(err.message);
            // res.flash('error', 'Sorry, something went wrong, try again later!');
          } else {
            console.log('quote sent!');
            // res.flash('success', 'Thank You! Your message has been successfully sent. We’ll get back to you very soon.');
          }

          // res.redirect("/quote/"+data.quoteType);

        });
      // })
       
    }
    
  });


}

exports.newServiceOrder = async function(data) {

  let toMail = "info@trademarkers.com";
  let bcc = ["carissa@trademarkers.com", "billing-trademarkers@moas.com","felix@bigfoot.com"];
  let subject = "New Service Action | " + data.code;

  return await transporter.sendMail({
  sender: 'Trademarkers LLC',
  replyTo: process.env.MAIL_FROM,
  from: process.env.MAIL_FROM, 
  to: toMail,
  bcc: bcc,
  subject: subject, 
  html: `<p>Hi Admin,</p>
          <p>New Service action created!</p>
          <p>Name: ${data.name}<br>
          Description : ${data.description}<br>
          Amount : $${data.amount}<br>
          Code: ${data.code}<br>
          Link: https://www.trademarkers.com/checkout/${data.code}</p>
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
          // to: mailData.user.email,
          // bcc: "michael@trademarkers.com",
           to: "felix@trademarkers.com",
           //bcc: "mg@bigfoot.com, carissa@chinesepod.com, felix@trademarkers.com",
          subject: "IMPORTANT NOTICE: Statement of use for your trademark - " + mailData.trademark.name, 
          html: data
          // attachments: [{'filename': mailData.fileName, 'content': file}]
        };

        // transporter.sendMail(mainOptions, function (err, info) {
          
        //   let res;
          
        //   if (err) {
        //     console.log(err);
        //     res = err;
        //   } else {
        //     console.log(info);
        //     res = info;

        //   }

        // });
      // })
       
    }
    
  });


}

exports.sendNOA = async function(mailData) {

  let transporterMG = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'michael@trademarkers.com', 
      pass: 'bigfoot12345'
      // user: 'felix@trademarkers.com', 
      // pass: 'ixtkyqshzloqnoru'
      // user: process.env.MAIL_USERNAME, 
      // pass: process.env.MAIL_PASSWORD
    }
  });

  let mailSender = 'Michael <michael@trademarkers.com>';

  // check dates to pass proper template
  let template = '';
  // let moment().
  mailData.dateFiledFormatted = moment(mailData.dateIssue).format('MMM D, YYYY');
  mailData.dateDeadFormatted = moment(mailData.deadlineDate).format('MMM D, YYYY');

  // console.log("weeks issue =>>>>>>>>>> ", mailData.dateIssue, moment().diff(mailData.dateIssue, 'weeks') );
  // console.log("weeks dead =>>>>>>>>>> ", mailData.deadlineDate, moment().diff(mailData.deadlineDate, 'weeks') );

  let dateIssue = moment(moment()).diff(mailData.dateIssue, 'weeks')
  let deadIssue = moment(mailData.deadlineDate).diff(moment(), 'weeks')

  if ( dateIssue <= 3 ) {
    template = 'noa-3weeks-plain.ejs'
  } else if ( dateIssue >= 4 && dateIssue < 12 ) {
    template = 'noa-4weeks-plain.ejs'
  } else if ( deadIssue <= 8 && deadIssue > 0 ) {
  // } else {
    template = 'noa-8weeks-plain.ejs';

    mailData.numberOfWeeks = deadIssue;

  }

  mailData.showUsptoLink = dateIssue <= 6 ? true : false;


  if ( !template && deadIssue < 0 ) {
    template = 'noa-8weeks-plain.ejs';
  }
  console.log("template", template);


  if (template) {
    console.log('has template');
  ejs.renderFile(__dirname+"/../email-templates/" + template, { mailData: mailData }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      console.log('attempt to snd');

      let to = mailData.user.email
      
        let mainOptions = {
          sender: mailSender,
          replyTo: mailSender,
          from: mailSender, 
          to: to,
          // bcc: "michael@trademarkers.com",
           bcc: "felix@trademarkers.com",
           //bcc: "mg@bigfoot.com, carissa@chinesepod.com, felix@trademarkers.com",
          subject: "IMPORTANT NOTICE: Statement of use for your trademark application " + mailData.trademark.name + " - " + mailData.serialNumber, 
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
exports.sendOrderNotification = async function(order) {

  order.datePurchased = moment(order.created_at_formatted).format('MMM D, YYYY');
  
  // ADMIN NOTIFICATION
  ejs.renderFile(__dirname+"/../email-templates/orderAdminNotification.ejs", { order: order }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          to: "info@trademarkers.com",
          bcc: ["carissa@trademarkers.com", "felix@bigfoot.com"],
          // to: "felix@bigfoot.com",
          // bcc: ["carissa@trademarkers.com", "felix@bigfoot.com"],
          subject: "New order | " + order.charge.description, 
          html: data
        };

        transporter.sendMail(mainOptions);
      // })
      //  
    }
    
  });

  // CUSTOMER NOTIFICATION
  ejs.renderFile(__dirname+"/../email-templates/orderCustomerNotification.ejs", { order: order }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      
      let to = order.user ? order.user.email : order.custEmail;

      if (order.user && order.user.secondaryEmail) {
        to = order.user.secondaryEmail;
      }
      
      let mainOptions = {
        sender: process.env.MAIL_FROM,
        replyTo: process.env.MAIL_FROM,
        from: process.env.MAIL_FROM, 
        to: to,
        bcc: ["felix@bigfoot.com"],
        // to: "felix@bigfoot.com",
        // bcc: ["carissa@trademarkers.com", "felix@bigfoot.com"],
        subject: "TradeMarkers LLC " + order.orderNumber, 
        html: data
      };

      transporter.sendMail(mainOptions);

    }
    
  });

  // ORDER DETAILS CONFIRMATION NOTIFICATION
  if ( order.cartItems ) {
    order.cartItems.forEach(item => {
      if ( item.serviceType == "registration" || item.serviceType == "study" ) {
        
        // SEND EMAIL CONFIRMATION
        ejs.renderFile(__dirname+"/../email-templates/orderCustomerConfirmationNotification.ejs", { item: item, order: order }, async function (err, data) {
          if (err) {
              console.log(err);
          } else {
            
            let to = order.user ? order.user.email : order.custEmail;
      
            if (order.user && order.user.secondaryEmail) {
              to = order.user.secondaryEmail;
            }
            
            let mainOptions = {
              sender: process.env.MAIL_FROM,
              replyTo: process.env.MAIL_FROM,
              from: process.env.MAIL_FROM, 
              to: to,
              bcc: ["info@trademarkers.com", "carissa@trademarkers.com", "felix@bigfoot.com"],
              subject: `Update on Your ${item.country.abbr} Trademark Application: (${item.word_mark}) – (${order.orderNumber}) - Order Confirmation`, 
              html: data
            };
      
            transporter.sendMail(mainOptions);
      
          }
          
        });

      }
    })
  }

}

// added service notification
exports.notifyAddedService = async function(mailData) {

  // console.log(order);
  // return;
  ejs.renderFile(__dirname+"/../email-templates/addedServiceNotification.ejs", { mailData: mailData }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        
        let to = mailData.user.email;

        if (mailData.user.secondaryEmail) {
          to = mailData.user.secondaryEmail;
        }

        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          to: to,
          bcc: ["carissa@trademarkers.com","felix@bigfoot.com"],
          // to: "felix@trademarkers.com",
          // bcc: ["carissa@trademarkers.com", "felix@bigfoot.com"],
          subject: "Added Service From Order #" + mailData.mark.orderCode, 
          html: data
        };

        transporter.sendMail(mainOptions);
      // })
      //  
    }
    
  });

}


exports.sendSouSummary = async function(mailData) {
  // console.log(mailData);
  // return;
  ejs.renderFile(__dirname+"/../email-templates/souSummaryNotification.ejs", { mailData: mailData }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          // to: "felix@trademarkers.com",
          to: "michael@trademarkers.com",
          bcc: ["felix@trademarkers.com", "carissa@trademarkers.com"],
          subject: "Email Notification Monitoring", 
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


exports.sendAdminNotificationCustomerEmailUpdate = async function(user) {

  // return;
  ejs.renderFile(__dirname+"/../email-templates/adminNotificationCustomerEmailUpdate.ejs", { user: user }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          to: "michael@trademarkers.com",
          bcc: ["felix@trademarkers.com", "carissa@trademarkers.com"],
          subject: "Customer Detail Updated " + user.id, 
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


exports.sendCertificateNotification = async function(trademark) {

  // return;
  ejs.renderFile(__dirname+"/../email-templates/trademarkCertificateNotification.ejs", { trademark: trademark }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          // to: trademark.user.email,
          // bcc: ["carissa@trademarkers.com", "billing-trademarkers@moas.com"],
          to: "felix@trademarkers.com",
          bcc: ["felix@bigfoot.com"],
          subject: "Your Trademark Certificate ("+trademark.mark+") is now Available", 
          html: data
        };

        transporter.sendMail(mainOptions, function (err, info) {
        
        });

       
    }
    
  });


}

// ===========================
// USED IN CRON ABANDONED CART
// ===========================
exports.sendAbandonedCart4hr = async function(user) {

  ejs.renderFile(__dirname+"/../email-templates/abandonedCart4hr.ejs", { user: user }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {

      let to = user.secondaryEmail ? user.secondaryEmail : user.email;

        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          to: to,
          bcc: "felix@trademarkers.com",
          subject: "Looks like you forgot something, complete your order now!", 
          html: data
        };

        transporter.sendMail(mainOptions);

    }
    
  });


}

exports.sendAbandonedCart1d = async function(user) {

  ejs.renderFile(__dirname+"/../email-templates/abandonedCart1d.ejs", { user: user }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {

      let to = user.secondaryEmail ? user.secondaryEmail : user.email;

        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          to: to,
          bcc: "felix@trademarkers.com",
          subject: "Looks like you forgot something, complete your order now!", 
          html: data
        };

        transporter.sendMail(mainOptions);

    }
    
  });


}

exports.sendAbandonedCart3d = async function(user) {

  ejs.renderFile(__dirname+"/../email-templates/abandonedCart3d.ejs", { user: user }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {

      let to = user.secondaryEmail ? user.secondaryEmail : user.email;

        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          to: to,
          bcc: "felix@trademarkers.com",
          subject: "Looks like you forgot something, complete your order now!", 
          html: data
        };

        transporter.sendMail(mainOptions);

    }
    
  });


}

exports.sendAbandonedCartMonth = async function(user) {

  ejs.renderFile(__dirname+"/../email-templates/abandonedCart1d.ejs", { user: user }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {

      let to = user.secondaryEmail ? user.secondaryEmail : user.email;

        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          to: to,
          bcc: "felix@trademarkers.com",
          subject: "Looks like you forgot something, complete your order now!", 
          html: data
        };

        transporter.sendMail(mainOptions);

    }
    
  });


}

exports.notifyNewAccount = async function(user) {

  // console.log(order);
  // return;
  ejs.renderFile(__dirname+"/../email-templates/newAccountNotification.ejs", { user: user }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          // to: "info@trademarkers.com",
          // bcc: ["carissa@trademarkers.com", "billing-trademarkers@moas.com","felix@bigfoot.com"],
          to: user.email,
          // bcc: ["carissa@trademarkers.com", "felix@bigfoot.com"],
          subject: "Thank You for Creating an Account!", 
          html: data
        };

        transporter.sendMail(mainOptions);
      // })
      //  
    }
    
  });

}

exports.verifyEmailAccount = async function(user) {

  ejs.renderFile(__dirname+"/../email-templates/verifyEmailNotification.ejs", { user: user }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {

        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          // to: "info@trademarkers.com",
          // bcc: ["carissa@trademarkers.com", "billing-trademarkers@moas.com","felix@bigfoot.com"],
          to: user.email,
          // bcc: ["felix@bigfoot.com"],
          subject: "Verify Email Address", 
          html: data
        };

        transporter.sendMail(mainOptions);
 
    }
    
  });

}



exports.statusUpdateNotification = async function(oldTrademark,newTrademark) {

  let user = await rpoUser.getByIdM(oldTrademark.userId);

  if (user) { // START IF

    let to = user[0].secondaryEmail ? user[0].secondaryEmail : user[0].email;

    ejs.renderFile(__dirname+"/../email-templates/statusUpdateNotification.ejs", { user: user[0], oldTrademark: oldTrademark, trademark : newTrademark }, async function (err, data) {
      if (err) {
          console.log(err);
      } else {

          let mainOptions = {
            sender: process.env.MAIL_FROM,
            replyTo: process.env.MAIL_FROM,
            from: process.env.MAIL_FROM, 
            // to: "info@trademarkers.com",
            // bcc: ["carissa@trademarkers.com", "billing-trademarkers@moas.com","felix@bigfoot.com"],
            to: to,
            bcc: ["felix@bigfoot.com"],
            subject: "Trademark ("+oldTrademark.mark+") status updated", 
            html: data
          };

          transporter.sendMail(mainOptions);
  
      }
      
    });

  } else { // END IF
    transporter.sendMail({
      sender: process.env.MAIL_FROM,
      replyTo: process.env.MAIL_FROM,
      from: process.env.MAIL_FROM, 
      to: "felix@bigfoot.com",
      // bcc: ["carissa@trademarkers.com", "felix@bigfoot.com"],
      subject: mailData.subject, 
      html: `<p>Hi Admin,<br></p>
            <p>A status has been updated but no notification sent to customer, system can't find recipient. </p>
            <p>Serial Number: ${oldTrademark.serialNumber}</p>
            <p>Old Status: ${oldTrademark.status}</p>
            <p>New Status: ${newTrademark.status}</p>
            `, 
    })
  }

}

exports.notifyAdmin = async function(mailData) {

  return await transporter.sendMail({
    sender: process.env.MAIL_FROM,
    replyTo: process.env.MAIL_FROM,
    from: process.env.MAIL_FROM, 
    to: "felix@bigfoot.com",
    // bcc: ["carissa@trademarkers.com", "felix@bigfoot.com"],
    subject: mailData.subject, 
    html: "<p>Hi Admin,<br></p>"+mailData.message, 
  });
  
}

exports.notifyCustomer = async function(mailData) {

  return await transporter.sendMail({
    sender: process.env.MAIL_FROM,
    replyTo: process.env.MAIL_FROM,
    from: process.env.MAIL_FROM, 
    to: mailData.to,
    bcc: ["carissa@trademarkers.com", "felix@bigfoot.com"],
    subject: mailData.subject, 
    html: "<p>Hi "+mailData.name+",<br></p>"+mailData.message, 
  });
  
}

 


// ======================================================
// ================= MAIL TEST ONLY======================
// ======================================================


// FOR TESTING ONLY
exports.testMail = async function() {

  ejs.renderFile(__dirname+"/../email-templates/test.ejs", { user: null }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          // to: "info@trademarkers.com",
          // bcc: ["carissa@trademarkers.com", "billing-trademarkers@moas.com","felix@bigfoot.com"],
          to: "felix@bigfoot.com",
          // bcc: ["felix@bigfoot.com"],
          subject: "Test Mail", 
          html: data
        };

        transporter.sendMail(mainOptions);
      // })
      //  
    }
    
  });
  
}
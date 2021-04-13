const { NetworkAuthenticationRequire } = require('http-errors');
const variables = require('../config/variables');
var db = require('../config/database');
var formidable = require('formidable');
var fs = require('fs');
var open = require('open');
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.PAYTEST);
var bcrypt = require('bcrypt');

var path    = require('path');
var pdf2img = require('pdf2img');

var rpoContinents = require('../repositories/continents');
var rpoCountries = require('../repositories/countries');
var rpoPdfs = require('../repositories/generatedPdf');
var rpoSenders = require('../repositories/senders');
var rpoAction = require('../repositories/actionCode');
var rpoClasses = require('../repositories/classes');
var rpoTrademarks = require('../repositories/trademarks');
var rpoTrademarksMongo = require('../repositories/mongoTrademarks');
var rpoCharge = require('../repositories/charges');
var rpoOrder = require('../repositories/orders');
var rpoSouNotifications = require('../repositories/souNotifications');
var rpoUserMongo = require('../repositories/usersMongo');


var rpoServiceAction = require('../repositories/serviceAction');

var activityService = require('../services/activityLogService');
var pdfService = require('../services/pdfService');
var checkoutService = require('../services/checkoutService');
var mailService = require('../services/mailerService');
var orderService = require('../services/orderService');
var crawlerService = require('../services/crawlerService');

var helpers = require('../helpers');

let moment = require('moment');

const emailValidator = require('deep-email-validator');

const { toInteger } = require('lodash');
const { redirect } = require('./customerController');


var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

// var log = require('../services/activityLogService');


exports.home = async function(req, res, next) {

    // activityService.logger(req.ip, req.originalUrl, "Visited Homepage");

    var getClientIp = req.headers['x-real-ip'] || req.connection.remoteAddress;

    let continents = await rpoContinents.getContinents();

    // continents.forEach(async continent => {
    //   let countries = await rpoCountries.getByContinent(continent.id)

    //   rpoContinents.updateDetails(continent._id, {countries: countries });
    // });

    let user = await helpers.getLoginUser(req);

    res.render('public/index', { 
      layout: 'layouts/public-layout', 
      title: 'Trademarkers LLC',
      continents: continents,
      user: user
    });
     
}

exports.about = async function(req, res, next) {

  // activityService.logger(req.ip, req.originalUrl, "Visited About Page");

  let user = await helpers.getLoginUser(req);

  res.render('public/about', { 
    layout: 'layouts/public-layout-default', 
    title: 'About',
    user: user
  });
}

exports.terms = async function(req, res, next) {

  // activityService.logger(req.ip, req.originalUrl, "Visited Terms Page");
  let user = await helpers.getLoginUser(req);

  res.render('public/terms', { 
    layout: 'layouts/public-layout-default', 
    title: 'terms',
    user: user
  });
}

exports.privacy = async function(req, res, next) {

  // activityService.logger(req.ip, req.originalUrl, "Visited Privacy Page");

  res.render('public/privacy', { 
    layout: 'layouts/public-layout-default', 
    title: 'privacy',
    user: await helpers.getLoginUser(req)
  });
}

exports.register = async function(req, res, next) {
// console.log('register');
  // activityService.logger(req.ip, req.originalUrl, "Visited Service Page");
  let user = await helpers.getLoginUser(req)
  // console.log("token", user);
  if ( user ) {
    res.redirect("/customer")
  }
  // console.log('passed');
  res.render('public/register', { 
    layout: 'layouts/public-layout-default', 
    title: 'service',
    user: user
  });
}

exports.registerSubmit = async function(req, res, next) {

  var hash = bcrypt.hashSync(req.body.password, 10); 

  hash = hash.replace("$2b$", "$2y$");

  let flag = true
  let custNo = ""

  for ( ; flag; ) {
      custNo = "CU-" + helpers.makeid(4)

      let dataCustomer = await rpoUserMongo.findUserNo(custNo)
      // console.log("check user", dataCustomer.length );
      if ( dataCustomer.length <= 0 ) {
          flag = false
      }
  }

  let userData = {
    name: req.body.lname + ", " + req.body.fname,
    firstName:req.body.fname,
    lastName:req.body.lname,
    email: req.body.email,
    secondaryEmail: req.body.email,
    password: hash,
    custNo: custNo,
    created_at: toInteger(moment().format('YYMMDD')),
    created_at_formatted: moment().format()
  }
  let newUser = await rpoUserMongo.putUser(userData);

  newInsertedUser = await rpoUserMongo.getByIdM(newUser.insertedId);

  helpers.setLoginUser(res,newInsertedUser[0])
  // currentUser = newInsertedUser[0]

  // currentUser._id = newUser.insertedId
  // let payload = {user: JSON.stringify(currentUser)}

  // let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
  // expiresIn: process.env.ACCESS_TOKEN_EXPIRES
  // });

  // res.cookie("jwt", accessToken);
  
  // let data = {
  //   firstName: req.body.fname,
  //   lastName: req.body.lname,
  //   email: req.body.email,
  // }


  res.redirect("/customer/profile"); 
}

exports.service = async function(req, res, next) {

  // activityService.logger(req.ip, req.originalUrl, "Visited Service Page");

  res.render('public/service', { 
    layout: 'layouts/public-layout-default', 
    title: 'service',
    user: await helpers.getLoginUser(req)
  });
}

exports.cookies = async function(req, res, next) {

  // activityService.logger(req.ip, req.originalUrl, "Visited Cookies Page");

  res.render('public/cookies', { 
    layout: 'layouts/public-layout-default', 
    title: 'cookies',
    user: await helpers.getLoginUser(req)
  });
}

exports.blog = async function(req, res, next) {

  // activityService.logger(req.ip, req.originalUrl, "Visited Blog Page");

  res.render('public/blog', { 
    layout: 'layouts/public-layout-default', 
    title: 'blog',
    user: await helpers.getLoginUser(req)
  });
}

exports.contact = function(req, res, next) {

  // activityService.logger(req.ip, req.originalUrl, "Visited Contact Page");

  res.redirect("/");

  // res.render('public/contact', { layout: 'layouts/public-layout-default', title: 'contact' });
}

exports.classes = async function(req, res, next) {

  // activityService.logger(req.ip, req.originalUrl, "Visited Classes Page");

  res.render('public/classes', { 
    layout: 'layouts/public-layout-default', 
    title: 'classes',
    user: await helpers.getLoginUser(req)
  });
}

exports.resources = async function(req, res, next) {

  // activityService.logger(req.ip, req.originalUrl, "Visited Resources Page");

  res.render('public/resources', { 
    layout: 'layouts/public-layout-default', 
    title: 'resources',
    user: await helpers.getLoginUser(req)
  });
}

exports.prices = async function(req, res, next) {

  // activityService.logger(req.ip, req.originalUrl, "Visited Price Page");

  res.render('public/prices', { 
    layout: 'layouts/public-layout-default', 
    title: 'prices',
    user: await helpers.getLoginUser(req)
  });
}


exports.service_contract = async function(req, res, next) {

  // activityService.logger(req.ip, req.originalUrl, "Visited Service Page");

  res.render('public/service_contract', { 
    layout: 'layouts/public-layout-default', 
    title: 'service_contract',
    user: await helpers.getLoginUser(req)
  });
}

exports.udrp = async function(req, res, next) {

  // activityService.logger(req.ip, req.originalUrl, "Visited UDRP Page");

  res.render('public/udrp', { 
    layout: 'layouts/public-layout-default', 
    title: 'Uniform Domain-Name Dispute-Resolution Policy',
    user: await helpers.getLoginUser(req)
  });
}

exports.redirect = async function(req, res, next) {

  // console.log(req.params.action);

  let action = await rpoAction.getAction(req.params.action);

  if ( action.length > 0 ) {

    // console.log(action[0].redirect_to, 'redirecting');

    if ( action[0].related_data && action[0].related_data.email) {

      activityService.trackingEmail(req.ip,action[0]);


    }

    if ( action[0].redirect_to ) {
      // console.log('');
      if ( typeof action[0].redirect_to !== 'undefined' ) {
        // console.log(action[0].redirect_to, 'step1');
        res.redirect("https://www.trademarkers.com"+action[0].redirect_to);
      } else {
        // console.log(action[0].url, 'step2');
        res.redirect("https://trademarkers.com"+action[0].redirect_to);
      }
      
    } else {

      if ( req.params[0] && typeof req.params[0] !== 'undefined') {
        // console.log(action[0].url, 'step3');
        let urlPhp = process.env.APP_URL_PHP;
        res.redirect(urlPhp + req.params[0]);
        
      } else {
        res.redirect("https://www.trademarkers.com");
      }
      // console.log(action[0].redirect_to, 'step4');
      // res.redirect("https://www.trademarkers.com");
    }
    
  } else {
    activityService.logger(req.ip, req.originalUrl, "Visitor redirected to laravel: " + req.params[0]);
    let urlPhp = process.env.APP_URL_PHP;
    
    let redirectUrl = (req.params[0] ? req.params[0] : (req.params.action ? req.params.action : null));

    if (redirectUrl) {
      res.redirect(urlPhp + "/" + redirectUrl);

    } else {
      res.redirect(urlPhp + '/home');
    }

    
  } 

}

exports.ytVideo = async function(req, res, next) {

  let ytId = req.params.ytId;

  activityService.logger(req.ip, req.originalUrl, "Checking YT video " + ytId);

  res.render('video/index', { 
    layout: 'layouts/public-layout', 
    title: 'Youtube Videos', 
    ytId: ytId,
    user: await helpers.getLoginUser(req)
  });
}

exports.submitContact = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Submitted Contact Form");

  // filter body to avoid spam
  var urlRE= new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+");
  


  const {valid} = await isEmailValid(req.body.email);

  let trap = req.body.email_confirm

  let noWords = req.body.message.split(" ");

  if ( trap || !req.body.message.trim() || req.body.message.match(urlRE) || !valid || noWords.length < 5 ){
    console.log('found!');
    res.flash('error', 'Sorry, something went wrong, try again later!');
    res.redirect("/contact");
    // return;
  } else {

    let info = require('../services/mailerService');
    let mailInfo = await info.contact(req.body);

    if (mailInfo && mailInfo.accepted) {
      res.flash('success', 'Your Inquiry has been sent!');
    } else {
      res.flash('error', 'Sorry, something went wrong, try again later!');
    }

    res.redirect("/contact");

  }

}

exports.generatePdf = async function(req, res, next) {

  let pdfs = await rpoPdfs.getGeneratedPdfs();
  let senders = await rpoSenders.getSenders();

  activityService.logger(req.ip, req.originalUrl, "Visited pdf generator Page");

  res.render('public/generate_pdf', { 
    layout  : 'layouts/public-layout-default', 
    title   : 'Generate Pdf', 
    pdfs    : pdfs,
    senders : senders,
    user: await helpers.getLoginUser(req)
  });
}

exports.generatePdfView = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Generate pdf");

  let pdfName = await pdfService.generate(req.body);
  let fullUrl = 'https://' + req.get('host') + '/pdf/' + pdfName;
console.log(fullUrl);
  res.flash('success', 'Generated PDF!');
  res.flash('fullUrl', fullUrl);

  open( fullUrl, function (err) {
    if ( err ) {
      console.log(err,'error')
      throw err;
    }    
  });

  res.redirect("/generate-pdf");
}

exports.addSenderPdf = async function(req, res, next) {

  let now = Date.now();

  let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      
 
      if (files.logo.name) {

        let oldLogopath = files.logo.path;
        let newLogopath = variables.filePathUpload + now + "-" +files.logo.name;

        fs.rename(oldLogopath, newLogopath, function (err) {
          if (err) throw err;

        });

        fields.logo = now + "-" +files.logo.name;

      } else {
        fields.logo = '';
      }

      if (files.signature.name) {

        let oldsignaturepath = files.signature.path;
        let newsignaturepath = variables.filePathUpload + now + "-" +files.signature.name;

        fs.rename(oldsignaturepath, newsignaturepath, function (err) {
          if (err) throw err;
     
        });

        fields.signature = now + "-" +files.signature.name;

      } else {
        fields.signature = '';
      }

      rpoSenders.putSenders(fields);
      
      res.flash('success', 'Created new Sender!');
      res.redirect("/generate-pdf");

      
    });

    // res.end();

  // res.render('public/generate_pdf', { layout: 'layouts/public-layout-default', title: 'Generate Pdf', pdfs: pdfs });
}

exports.codeLanding = async function(req, res, next) {

  let code = req.params.actionCode;
  let type = req.params.type;
  let secretAmountDecode = '', secretDescription='', secretCustomer='';

  // LOOK FOR A WAY TO REDIRECT CUSTOMER AND PREFILLED FORM
  // OR CREATE A NEW NODEJS SETUP FOR ADDING TO CART IN MYSQL

  let countries = await rpoCountries.getAll();
  let classes = await rpoClasses.getAll();
  let actions = await rpoAction.getAction(code);
  let action = actions[0] ? actions[0] : null;
  let secretAmount;

  let title = "", layout = "layouts/public-layout-default";
  let classArr = [];
  let render = 'trademark-order/register';

  let casesMysql = null, trademarkMysql = null, trademark = null;

  // ACTIVITY LOG
  activityService.trackingEmailSOU(req.ip,action);

  // let ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  // console.log('this ip>>>>>>',req.ip);
  if ( action && action.case ) {
    classArr = action.case.nice.split(',').map(s => s.trim());
  }

  if ( action && action.trademark ) {
    classArr = action.trademark.classes.split(',').map(s => s.trim());
  }

  // check if has action
  //  or action is a serial number
  if ( !action || !action.actionType) {
    // empty action and search if there is a matching serial number
    action = {};
    // let crawl = await usptoCrawlService.usptoCrawl('1999445')
    casesMysql = await rpoTrademarks.fetchTmBySerial(code)

    // console.log("casesMysql",casesMysql)
    if (casesMysql.length) {
      trademarkMysql = await rpoTrademarks.fetchTmByMark(casesMysql[0].trademark);

      if (trademarkMysql.length) {
        action.serialNumber = code;
        action.trademark = trademarkMysql[0]
      }

    } 


  } else {
    action = actions[0];
  }

  
  if (type)
  switch(type){
    case 'trademark-registration' :
      title = "Trademark Registration"
      layout = 'layouts/public-layout-default'
    break;

    case 'trademark-study' :
      title = "Trademark Study"
      layout = 'layouts/public-layout-default'
    break;

    case 'recommendation' :
      title = "Our Recommendations"
      layout = 'layouts/public-layout-interactive'
      render = 'trademark-order/recommendation'
    break;

    case 'statement-of-use' :
      title = "Statement of Use"
      layout = 'layouts/public-layout-interactive'
      render = 'trademark-order/sou'

      // add open here
      let souData = {
        noClick: (action.tracking ? action.tracking.length : 0)
      }
      let souRec = await rpoSouNotifications.findBySerial(action.serialNumber)

      await rpoSouNotifications.updateDetails(souRec[0]._id, souData);

    break;

    case 'pay' :
      title = "Payment Page"
      layout = 'layouts/public-layout-interactive'
      render = 'trademark-order/payment'

    break;

    case 'delivery' :
      title = "Trademark Certificate"
      layout = 'layouts/public-layout-interactive'
      render = 'trademark-order/delivery'

      // let trdId = req.params.trdId;
      // let trademark = null;

      if ( code ) {
        trademark = await rpoTrademarks.fetchTmById(code)

        if (trademark) {
          action = {};
          action.serialNumber = code;
          action.userId = trademark[0].user_id;
          action.trademark = trademark[0]
          action.actionType = "Certificate Delivery"
          action.number = code
          trademark = trademark[0]

          // save action if code does not exist
          rpoAction.put(action);
          
        } else {
          trademark = null
        }
      }

    break;

    // case 'thankyou' :
    //   title = "Thank You!"
    //   layout = 'layouts/public-layout-interactive'
    //   render = 'trademark-order/thankyou'
    // break;

    case 'abandon' :
      title = "Abandon Confirmation"
      layout = 'layouts/public-layout-interactive'
      render = 'trademark-order/abandon'
    break;

    default:
      if (code == "pay") {
        title = "Statement of Use"
        layout = 'layouts/public-layout-interactive'
        render = 'trademark-order/checkout-order'

        let arrType = type.split('-')
        let arrTypeValue = arrType[0]
        type = arrTypeValue
        if (!arrTypeValue) {
          res.redirect('/service-order/pay');
        }

        if ( typeof arrType[1] !== "undefined" ) {
          secretCustomer = arrType[1]
        }

        for (let i = 0; [...arrTypeValue].length > i; i++) {

          if ( typeof variables.secretAmount[[...arrTypeValue][i]] == 'undefined' ) {
            console.log(i,'found not declared variable');
            res.redirect('/service-order/pay');
          }

        }

        let arrSecret = await helpers.convertSecretCode([...arrTypeValue]);

        // console.log(arrSecret);
        secretAmountDecode = parseInt(arrSecret.secretAmountDecode);
        secretDescription = arrSecret.secretDescription;
      }
      // res.redirect('/');
    break;
  }

  // res.locals = {
  //   siteTitle: "Trademark Search",
  //   description: "Check trademark status",
  //   keywords: "Trademark Status, trademarkers status",
  // };

  res.render(render, { 
    layout  : layout, 
    title   : title,
    countries: countries,
    classes: classes,
    action : action,
    classArr: classArr,
    tkey: process.env.PAYK,
    trademark: trademark,
    user: await helpers.getLoginUser(req),
    secretAmountDecode: secretAmountDecode,
    secretDescription: secretDescription,
    secretCustomer: secretCustomer,
    code: type

  });

  // res.send()

}


exports.deliveryMethod = async function(req, res, next) {

  let trdId = req.params.trdId;
  let trademark = null;
  let trademarkCertificate = null;
  let pdfUrl = '', pngName = '', pdfName='';

  if ( trdId ) {
    trademark = await rpoTrademarksMongo.getBySerial(trdId)
    
    if (trademark && trademark[0].certificate) {
      // console.log(trademark[0]);

      // trademarkCertificate = await rpoTrademarks.fetchTmCertById(trdId)
      // console.log('Cert',trademarkCertificate);

      // if (trademarkCertificate[0]) {
        // trademarkCertificate = trademarkCertificate[0]

        pdfUrl = "/uploads/certificate/"+ trademark[0].certificate.customName;
        // console.log(pdfUrl);
        pdfName = trademark[0].certificate.customName
        pngName = trademark[0].certificate.customName.replace('.pdf','')


        var input   = __dirname + "/../public/uploads/certificate/" + pdfName;
 
        pdf2img.setOptions({
          type: 'png',                                // png or jpg, default jpg
          size: 1024,                                 // default 1024
          density: 600,                               // default 600
          outputdir: __dirname + path.sep + '../public/pdf/png', // output folder, default null (if null given, then it will create folder name same as file name)
          outputname: pngName,                         // output file name, dafault null (if null given, then it will create image name same as input name)
          page: null,                                 // convert selected page, default null (if null given, then it will convert all pages)
          quality: 100                                // jpg compression quality, default: 100
        });

        // console.log(input);
        
        let gen = await pdf2img.convert(input, function(err, info) {
          console.log("gen ong");
          if (err) return err;
          else return info;
        });
        
        console.log(gen);
      

    } // end if trademark
  }

  // wait for the generated png files
  await new Promise(resolve => setTimeout(resolve, 5000));

  res.render('trademark-order/delivery', { 
    layout  : 'layouts/public-layout-interactive', 
    title   : 'Your Trademark Certificate is now available!',
    trademark: trademark[0],
    pngName: pngName,
    pdfName: pdfName,
    user: await helpers.getLoginUser(req)
  });


  // res.send()

}

exports.souResponse = async function(req, res, next) {

  // console.log(req.params);
  // console.log(req.body);
  // res.send('asdsad')

  let response = 1;
  let name = req.query.decName ? req.query.decName : '';

  if (req.params.response == '1' ) {
    response = "Statement of Use";
  } else if(req.params.response == '2') {
    response = "Extension for trademark allowance";
  } else {
    response = "Decline";
  }

  let data = {
    response: response
  }

  if ( name ) {
    data.decName = name
  }

  // if ( name ) {
  //   data.declinedName = name
  // }

  let action = await rpoAction.get(req.params.action);
  let notif = await rpoSouNotifications.findBySerial(action[0].serialNumber);

  await rpoAction.updateDetails(req.params.action, data)

  // add this in notification
  await rpoSouNotifications.updateDetails(notif[0]._id, data)

  res.json({
    status:true,
    message:"Success"
  });

}

exports.checkout = async function(req, res, next) {

  // const stripe = require('stripe')(process.env.PAYTEST);

  // console.log(req.params);
  // console.log(process.env.PAYTEST);
  console.log('body',req.body);

  req.body.stripeEmail = req.body.email;
  let action = await rpoAction.getAction(req.body.action);

  // compute price
  let price = 0;
  let description = "Trademarkers LLC Service";
  let name = "", payment = "";
  let customer = req.body.email ? req.body.email : "";
// console.log('action', action);
  if ( action[0] && action[0].number) {
    price = await checkoutService.getPrice(req.body.action);

    if ( action[0].response ) {
      description += ": " + action[0].response;
    }
  } else {
    price = req.body.price ? (req.body.price * 1) : 0;
    description = req.body.description ? req.body.description : "";
    name = req.body.name ? req.body.name : "";
    payment = req.body.payment ? req.body.payment : "";
  }
// console.log('price', price);

  // 
  try{

  let orderCode = await orderService.createOrderCode();

  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description + " | " + customer + " | " + orderCode,
    // customer: customer,
    metadata : {
      'customer': "" + customer,
      'description': "" + description + " | " + orderCode,
      'paymentFor' : payment
    },
    receipt_email: customer
  });

  if ( charge.paid ) {

    
    action[0].ordered = 'yes'

    // update action
    let actionUpdates = {
      ordered: 'yes'
    }

    await rpoAction.updateDetails(action[0]._id, actionUpdates)

    // save
    

    // let order = {
    //   orderNumber: orderCode,
    //   action: action[0],
    //   charge: charge
    // }

    let order = {
      orderNumber: orderCode,
      charge: charge,
      custom: false,
      paid: true,
      action: action[0],
      customerId: action[0].userId,
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }

    

    // send email notification
    mailService.sendOrderNotification(order);

    rpoOrder.put(order);
    rpoCharge.put(charge);
    res.flash('success', 'Payment Successful!');
    

    // update notifications collection
    let notification = await rpoSouNotifications.findBySerial(action[0].serialNumber);
    let dataNotification = {
      actionType: "Ordered: " + action[0].response
    }
    rpoSouNotifications.updateDetails(notification[0]._id, dataNotification);
    // Ordered: Statement of Use
    // Ordered: Extension for trademark allowance


    res.redirect("/thank-you/"+orderCode); 
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    
    // return with error
  }

} catch (err) {
  res.flash('error', err.error);
  console.log("errors",err);
  console.log("errors message",err.message);
}

  res.redirect("/"+req.body.action+'/pay'); 

}


// CUSTOM PAGE SERVICE -------------------------------- START

exports.serviceOrderCustom = async function(req, res, next) {

  let order = await rpoOrder.findActionCustom('L3P-5T');

  activityService.logger(req.ip, req.originalUrl, "Visited service page L3P-5T");

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  res.render("trademark-order/service-order-L3P-5T", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    tkey: process.env.PAYK,
    order: order[0],
    user: await helpers.getLoginUser(req)
  });
}

exports.checkoutCustom = async function(req, res, next) {

  req.body.stripeEmail = req.body.email;
  let action = await rpoAction.getAction(req.body.action);

  
  // compute price
  let price = 362.32;
  let description = "Trademarkers LLC Service";
  let name = "", payment = "Monitoring and filing of progress";
  let customer = req.body.email ? req.body.email : "";


  // 
  try{
  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description,
    // customer: customer,
    metadata : {
      'customer': "" + customer,
      'description': "" + description,
      'paymentFor' : payment,
      'customerName' : req.body.name,
      'customerAddress' : req.body.address
    },
    receipt_email: customer
  });

  if ( charge.paid ) {

    // save
    let orderCode = await orderService.createOrderCode();

    let order = {
      orderNumber: orderCode,
      charge: charge,
      custom: true,
      paid: true,
      action: 'L3P-5T',
      customerId: '',
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }

    console.log('put', order);

    

    mailService.sendOrderNotification(order);
    rpoOrder.put(order);
    res.flash('success', 'Payment Successful!');
    rpoCharge.put(charge);

    activityService.logger(req.ip, req.originalUrl, "checkout L3P-5T");

    res.redirect("/thank-you/"+orderCode); 
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    res.redirect("/checkout/L3P-5T"); 
    // return with error
  }

} catch (err) {
  res.flash('error', err.error);
  console.log("errors",err);
  console.log("errors message",err.message);
}

}

exports.serviceOrderCustom2 = async function(req, res, next) {

  let order = await rpoOrder.findActionCustom('L3P-5T');
  
  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  activityService.logger(req.ip, req.originalUrl, "Visited service page L3P-6T");
  console.log('check');
  res.render("trademark-order/service-order-L3P-6T", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    tkey: process.env.PAYK,
    order: order[0],
    user: await helpers.getLoginUser(req)
  });
}

exports.checkoutCustom2 = async function(req, res, next) {

  req.body.stripeEmail = req.body.email;
  let action = await rpoAction.getAction(req.body.action);

  // compute price
  let price = 150;
  let description = "Trademarkers LLC Service";
  let name = "", payment = "Preparation and Filling of Assignment";
  let customer = req.body.email ? req.body.email : "";


  // 
  try{
  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description,
    // customer: customer,
    metadata : {
      'customer': "" + customer,
      'description': "" + description,
      'paymentFor' : payment,
      'customerName' : req.body.name,
      'customerAddress' : req.body.address
    },
    receipt_email: customer
  });

  if ( charge.paid ) {

    // save
    let orderCode = await orderService.createOrderCode();

    let order = {
      orderNumber: orderCode,
      charge: charge,
      custom: true,
      paid: true,
      action: 'L3P-6T',
      customerId: '',
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }

    console.log('put', order);

    

    mailService.sendOrderNotification(order);
    rpoOrder.put(order);
    res.flash('success', 'Payment Successful!');
    rpoCharge.put(charge);

    activityService.logger(req.ip, req.originalUrl, "checkout L3P-6T");

    res.redirect("/thank-you/"+orderCode); 
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    res.redirect("/checkout/L3P-6T"); 
    // return with error
  }

} catch (err) {
  res.flash('error', err.error);
  console.log("errors",err);
  console.log("errors message",err.message);
}

}


exports.serviceOrderShow = async function(req, res, next) {

  console.log(req.params.serviceCode);
  let serviceOrder = await rpoServiceAction.findByCode(req.params.serviceCode)
  
  activityService.logger(req.ip, req.originalUrl, "Visited service page " + req.params.serviceCode);

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  res.render("trademark-order/service-order", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    tkey: process.env.PAYK,
    serviceOrder: serviceOrder[0],
    user: await helpers.getLoginUser(req)
  });
}

exports.serviceOrderSubmit = async function(req, res, next) {

  req.body.stripeEmail = req.body.email;

  let serviceCode = await rpoServiceAction.findByCode(req.body.code);

  if (serviceCode.length <= 0) {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    res.redirect("/checkout/" + req.body.code); 
  }


  // compute price
  let price = serviceCode[0].amount;
  let description = serviceCode[0].name;
  let name = "", payment = serviceCode[0].description;
  let customer = req.body.email ? req.body.email : "";


  // 
  try{
  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description,
    // customer: customer,
    metadata : {
      'customer': "" + customer,
      'description': "" + description,
      'paymentFor' : payment,
      'customerName' : req.body.name,
      'customerAddress' : req.body.address
    },
    receipt_email: customer
  });

  if ( charge.paid ) {

    // save
    let orderCode = await orderService.createOrderCode();

    let order = {
      orderNumber: orderCode,
      charge: charge,
      custom: true,
      paid: true,
      action: req.body.code,
      customerId: '',
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }

    console.log('put', order);

    

    mailService.sendOrderNotification(order);
    rpoOrder.put(order);
    res.flash('success', 'Payment Successful!');
    rpoCharge.put(charge);

    activityService.logger(req.ip, req.originalUrl, "Checkout " + req.params.serviceCode);

    res.redirect("/thank-you/"+orderCode); 
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    res.redirect("/checkout/" + req.body.code); 
    // return with error
  }

} catch (err) {
  res.flash('error', err.error);
  console.log("errors",err);
  console.log("errors message",err.message);
}

}

// SERVICE ORDER WITH SECRET CODE AMOUNT AND SERVICE
exports.serviceOrderCustom3 = async function(req, res, next) {

  req.body.stripeEmail = req.body.email;

  // compute price
  
  
  // let name = "", payment = serviceCode[0].description;
  let customer = req.body.email ? req.body.email : "";

  let arrSecret = await helpers.convertSecretCode([...req.body.code]);
  let orderCode = await orderService.createOrderCode();

  let description = arrSecret.secretDescription + " | " + orderCode + " | " + customer;
  let price = arrSecret.secretAmountDecode;

  if ( req.body.customerId ) {
    description += " " + req.body.customerId
  }

  console.log('this',arrSecret.secretAmountDecode);

  // 
  try{
  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description,
    // customer: customer,
    metadata : {
      'customer': "" + customer,
      'description': "" + description,
      'customerName' : req.body.name,
      'customerAddress' : req.body.address
    },
    receipt_email: customer
  });

  if ( charge.paid ) {

    // save
    

    let order = {
      orderNumber: orderCode,
      charge: charge,
      custom: true,
      paid: true,
      action: req.body.code,
      customerId: req.body.customerId,
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }

    // console.log('put', order);

    

    mailService.sendOrderNotification(order);
    rpoOrder.put(order);
    res.flash('success', 'Payment Successful!');
    rpoCharge.put(charge);

    activityService.logger(req.ip, req.originalUrl, "Checkout " + req.params.serviceCode);

    res.redirect("/thank-you/"+orderCode); 
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    res.redirect("/checkout/" + req.body.code); 
    // return with error
  }

} catch (err) {
  res.flash('error', err.error);
  console.log("errors",err);
  console.log("errors message",err.message);
}

}

exports.generateService = async function(req, res, next) {

  // res.locals = {
  //   siteTitle: "Trademark Search",
  //   description: "Check trademark status",
  //   keywords: "Trademark Status, trademarkers status",
  // };

  res.render(
    "trademark-order/add-service", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    user: await helpers.getLoginUser(req)
  });
}

exports.generateServiceSubmit = async function(req, res, next) {

  // console.log('a');
  try {
   
    let code = '';
    let flag = true;
    
    // FETCH/GENERATE UNIQUE CODE
    for( ; flag;  ) {
      console.log('loop');
      code = helpers.makeid(4) + '-' + helpers.makeid(2);
      let serviceCode = await rpoServiceAction.findByCode(code);
      console.log(serviceCode);
      if (serviceCode.length <= 0) {
        flag = false;
      }

    }
    // console.log('loop end', code);
    let data = {
      code: code,
      name: req.body.name,
      description: req.body.description,
      amount: req.body.amount
    }

    let serviceAction = await rpoServiceAction.put(data)

    // send email for notification

    if (serviceAction) {

      mailService.newServiceOrder(data);

      res.flash('success', 'Added new code, [' + code +']');
    } else {
      res.flash('error', 'Sorry, Something went wrong, please try again later.');
    }

  } catch(err) {
    res.flash('error', err.error);
  }
  
  res.redirect("/add-service-code-secret-132321"); 
 
}

// CUSTOM PAGE SERVICE -------------------------------- END

exports.searchSerial = async function(req, res, next) {

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  res.render("public/search", { 
    layout  : "layouts/public-layout-interactive", 
    title   : ""
  });

}

exports.searchSerialNumber = async function(req, res, next) {

  console.log(req.body);

  res.redirect("/us/"+ req.body.case_number);
}

exports.thankYou = async function(req, res, next) {

  console.log(req.params);

  let order = await rpoOrder.findOrderNumber(req.params.number)

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  title = "Thank You!"
  layout = 'layouts/public-layout-interactive'
  render = 'trademark-order/thankyou'
      

  res.render(render, { 
    layout  : layout, 
    title   : title,
    order   : order[0]
  });
}

exports.oppositionProof = async function(req, res, next) {

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };
  
  res.render("public/opposition-proof-of-use", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    user: await helpers.getLoginUser(req)
  });
}


// CUSTOM API
exports.checkTMApi = async function(req, res, next) {
  
  let serial = ''
  if (req.params) {
    serial = req.params.serialNumber
  }


  await crawlerService.fetchTsdr(req.params.serialNumber)

  await new Promise(resolve => setTimeout(resolve, 2000));
  
  let trademark  = await rpoTrademarksMongo.getBySerial(req.params.serialNumber)

  if (!trademark.length) {
    trademark = await rpoTrademarksMongo.getByReg(req.params.serialNumber)
  }
  
  if (trademark.length > 0) {

    

    res.json({
      mark: trademark[0].mark,
      ownerName: trademark[0].ownerName,
      ownerAddress: trademark[0].ownerAddress,
      ownerStreet: trademark[0].ownerStreet,
      ownerProvince: trademark[0].ownerProvince,
      ownerState: trademark[0].ownerState,
      ownerCountry: trademark[0].ownerCountry,
      ownerPostalCode: trademark[0].ownerPostalCode,
      legalEntityType: trademark[0].legalEntityType
    });

  } else {

    // add to trademarks
    // let data = {
    //   serialNumber: req.params.serialNumber
    // }
    // rpoTrademarksMongo.put(data);
    res.json({
      response:"ok"
    });

  }
}

exports.assignment = async function(req, res, next) {

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };
  
  res.render("assignment", { 
    layout  : "layouts/public-layout-assignment", 
    title   : ""
  });
}




// ======================================== function 
async function isEmailValid(email) {
  return emailValidator.validate(email)
 }



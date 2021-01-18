const { NetworkAuthenticationRequire } = require('http-errors');
const variables = require('../config/variables');
var db = require('../config/database');
var formidable = require('formidable');
var fs = require('fs');
var open = require('open');
const jwt = require('jsonwebtoken');

var rpoContinents = require('../repositories/continents');
var rpoCountries = require('../repositories/countries');
var rpoPdfs = require('../repositories/generatedPdf');
var rpoSenders = require('../repositories/senders');
var rpoAction = require('../repositories/actionCode');
var rpoClasses = require('../repositories/classes');
var rpoTrademarks = require('../repositories/trademarks');
var rpoCharge = require('../repositories/charges');

var activityService = require('../services/activityLogService');
var pdfService = require('../services/pdfService');
var checkoutService = require('../services/checkoutService');
var mailService = require('../services/mailerService');


var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

// var log = require('../services/activityLogService');


exports.home = async function(req, res, next) {

    activityService.logger(req.ip, req.originalUrl, "Visited Homepage");

    // let continentCountries=[];
    // let continentsMysql = await rpoContinents.getContinentsMysql();
    let continents = await rpoContinents.getContinents();


    // for (var key in continentsMysql) {
      
    //   // check if the property/key is defined in the object itself, not in parent
    //   if (continentsMysql.hasOwnProperty(key)) {
        
    //     rpoContinents.putContinents(continentsMysql[key]);
        
    //     continentCountries[key] = continentsMysql[key];
    //     let countries = await rpoContinents.getCountryPerContinentMysql(key);

    //     continentCountries[key].countries = countries;

    //     // put countries
    //     countries.forEach(country => {
    //       rpoCountries.putCountry(country);
    //     });
    //   }
    // }

    // console.log(continents);

    res.render('public/index', { 
      layout: 'layouts/public-layout', 
      title: 'Trademarkers LLC', 
      continents: continents
    });
    
}

exports.about = function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited About Page");

  res.render('public/about', { layout: 'layouts/public-layout-default', title: 'About' });
}

exports.terms = function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Terms Page");

  res.render('public/terms', { layout: 'layouts/public-layout-default', title: 'terms' });
}

exports.privacy = function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Privacy Page");

  res.render('public/privacy', { layout: 'layouts/public-layout-default', title: 'privacy' });
}

exports.service = function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Service Page");

  res.render('public/service', { layout: 'layouts/public-layout-default', title: 'service' });
}

exports.cookies = function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Cookies Page");

  res.render('public/cookies', { layout: 'layouts/public-layout-default', title: 'cookies' });
}

exports.blog = function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Blog Page");

  res.render('public/blog', { layout: 'layouts/public-layout-default', title: 'blog' });
}

exports.contact = function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Contact Page");

  res.render('public/contact', { layout: 'layouts/public-layout-default', title: 'contact' });
}

exports.classes = function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Classes Page");

  res.render('public/classes', { layout: 'layouts/public-layout-default', title: 'classes' });
}

exports.resources = function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Resources Page");

  res.render('public/resources', { layout: 'layouts/public-layout-default', title: 'resources' });
}

exports.prices = function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Price Page");

  res.render('public/prices', { layout: 'layouts/public-layout-default', title: 'prices' });
}

exports.registration = function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Registration Page");

  res.render('public/registration', { layout: 'layouts/public-layout-default', title: 'registration' });
}

exports.service_contract = function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Service Page");

  res.render('public/service_contract', { layout: 'layouts/public-layout-default', title: 'service_contract' });
}

exports.udrp = function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited UDRP Page");

  res.render('public/udrp', { layout: 'layouts/public-layout-default', title: 'Uniform Domain-Name Dispute-Resolution Policy' });
}

exports.redirect = async function(req, res, next) {

  // console.log(req.params.action);

  let action = await rpoAction.getAction(req.params.action);

  if ( action.length > 0 ) {

    console.log(action[0].redirect_to, 'redirecting');

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
        
      }
      // console.log(action[0].redirect_to, 'step4');
      res.redirect("https://www.trademarkers.com");
    }
    
  } else {
    activityService.logger(req.ip, req.originalUrl, "Visitor redirected to laravel: " + req.params[0]);
    let urlPhp = process.env.APP_URL_PHP;

    if (req.params[0]) {
      res.redirect(urlPhp + req.params[0]);

    } else {
      res.redirect(urlPhp + '/home');
    }

    
  } 

  

  // 
}

exports.ytVideo = function(req, res, next) {

  let ytId = req.params.ytId;

  activityService.logger(req.ip, req.originalUrl, "Checking YT video " + ytId);

  res.render('video/index', { layout: 'layouts/public-layout', title: 'Youtube Videos', ytId: ytId });
}

exports.submitContact = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Submitted Contact Form");

  // filter body to avoid spam
  var urlRE= new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+");
  
  if (req.body.message.match(urlRE)){
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


  // let info = require('../services/mailerService');
  // let mailInfo = await info.contact(req.body);

  // if (mailInfo && mailInfo.accepted) {
  //   res.flash('success', 'Your Inquiry has been sent!');
  // } else {
  //   res.flash('error', 'Sorry, something went wrong, try again later!');
  // }

  // res.redirect("/contact");

  // next();
}

exports.generatePdf = async function(req, res, next) {

  let pdfs = await rpoPdfs.getGeneratedPdfs();
  let senders = await rpoSenders.getSenders();
  // console.log(pdfs);
  activityService.logger(req.ip, req.originalUrl, "Visited pdf generator Page");

  res.render('public/generate_pdf', { 
    layout  : 'layouts/public-layout-default', 
    title   : 'Generate Pdf', 
    pdfs    : pdfs,
    senders : senders
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

  // LOOK FOR A WAY TO REDIRECT CUSTOMER AND PREFILLED FORM
  // OR CREATE A NEW NODEJS SETUP FOR ADDING TO CART IN MYSQL

  let countries = await rpoCountries.getAll();
  let classes = await rpoClasses.getAll();
  let actions = await rpoAction.getAction(code);
  let action = actions[0] ? actions[0] : null;

  let title = "";
  let classArr = [];
  let render = 'trademark-order/register';



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
    action = null;
    // casesMysql = await rpoTrademarks.fetchTmBySerial(code)
    // trademarkMysql = await rpoTrademarks.fetchTmByMark(casesMysql[0].trademark)
    // console.log('serial', trademarkMysql);

  } else {
    action = actions[0];
  }

  // console.log(action[0].case.nice);
  // console.log(classArr);

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
    break;

    case 'pay' :
      title = "Payment Page"
      layout = 'layouts/public-layout-interactive'
      render = 'trademark-order/payment'
    break;

    default:
      res.redirect('/');
    break;
  }

  res.render(render, { 
    layout  : layout, 
    title   : title,
    countries: countries,
    classes: classes,
    action : action,
    classArr: classArr
  });

  // res.send()

}


exports.deliveryMethod = async function(req, res, next) {

  let trdId = req.params.trdId;
  let trademark = null;

  if ( trdId ) {
    trademark = await rpoTrademarks.fetchTmById(trdId)

    if (trademark) {
      console.log(trademark[0]);

    } // end if trademark
  }

  res.render('trademark-order/delivery', { 
    layout  : 'layouts/public-layout-default', 
    title   : 'Your Trademark Certificate is now available!',
    trademark: trademark[0],
  });


  // res.send()

}

exports.souResponse = async function(req, res, next) {

  // console.log(req.params);
  // console.log(req.body);
  // res.send('asdsad')

  let response = 1;

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

  await rpoAction.updateDetails(req.params.action, data)

  res.json({
    status:true,
    message:"Success"
});

}

exports.checkout = async function(req, res, next) {

  const stripe = require('stripe')(process.env.PAYTEST);

  // console.log(req.params);
  // console.log(process.env.PAYTEST);
  // console.log(req.body);


  let action = await rpoAction.getAction(req.body.action);

  // compute price
  let price = 0;
  let description = "Trademarkers LLC Service";
  let name = "";
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

  }
// console.log('price', price);

  // 
  try{
  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description,
    metadata : {
      'name': "" + name,
      'description': "" + description,
    },
    receipt_email: req.body.stripeEmail
  });

  if ( charge.paid ) {
    // save
    mailService.sendOrderNotification(charge);
    res.flash('success', 'Payment Successful!');
    rpoCharge.put(charge)
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    
    // return with error
  }

} catch (err) {
  console.log(err);
}

  res.redirect("/"+req.body.action+'/pay'); 



}





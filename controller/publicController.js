const { NetworkAuthenticationRequire } = require('http-errors');
const variables = require('../config/variables');
var db = require('../config/database');
var formidable = require('formidable');
var fs = require('fs');
var open = require('open');

var rpoContinents = require('../repositories/continents');
var rpoCountries = require('../repositories/countries');
var rpoPdfs = require('../repositories/generatedPdf');
var rpoSenders = require('../repositories/senders');

var activityService = require('../services/activityLogService');
var pdfService = require('../services/pdfService');


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

exports.redirect = function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visitor redirected to laravel: " + req.params[0]);

  res.redirect("https://trademarkers.com" + req.params[0]);
}

exports.ytVideo = function(req, res, next) {

  let ytId = req.params.ytId;

  activityService.logger(req.ip, req.originalUrl, "Checking YT video " + ytId);

  res.render('video/index', { layout: 'layouts/public-layout', title: 'Youtube Videos', ytId: ytId });
}

exports.submitContact = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Submitted Contact Form");

  let info = require('../services/mailerService');
  let mailInfo = await info.contact(req.body);

  if (mailInfo && mailInfo.accepted) {
    res.flash('success', 'Your Inquiry has been sent!');
  } else {
    res.flash('error', 'Sorry, something went wrong, try again later!');
  }

  res.redirect("/contact");

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





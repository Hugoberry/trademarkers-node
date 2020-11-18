const { NetworkAuthenticationRequire } = require('http-errors');
var db = require('../config/database');
var rpoContinents = require('../repositories/continents');
var rpoCountries = require('../repositories/countries');
var activityService = require('../services/activityLogService');


var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

// var log = require('../services/activityLogService');


exports.home = async function(req, res, next) {

    activityService.logger(req.ip, req.originalUrl, "Visited Homepage");

    let continentCountries=[];
    let continentsMysql = await rpoContinents.getContinentsMysql();


    for (var key in continentsMysql) {
      
      // check if the property/key is defined in the object itself, not in parent
      if (continentsMysql.hasOwnProperty(key)) {
        
        rpoContinents.putContinents(continentsMysql[key]);
        
        continentCountries[key] = continentsMysql[key];
        let countries = await rpoContinents.getCountryPerContinentMysql(key);

        continentCountries[key].countries = countries;

        // put countries
        countries.forEach(country => {
          rpoCountries.putCountry(country);
        });
      }
    }

    res.render('public/index', { 
      layout: 'layouts/public-layout', 
      title: 'Trademarkers LLC', 
      continentCountries: continentCountries,
      continent : continentsMysql
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




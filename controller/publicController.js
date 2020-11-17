const { NetworkAuthenticationRequire } = require('http-errors');
var db = require('../config/database');
var rpoContinents = require('../repositories/continents');


var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

var log = require('../services/activityLogService');


exports.home = function(req, res, next) {
  
    var sql='SELECT c.name as contName, cc.* FROM continents c JOIN countries cc on c.id=cc.continent_id order by continent_id DESC';
    // db.query(sql, function (err, data, fields) {
    //   if (err) throw err;
  
    //   var i;
    //   var result = groupBy(data,'continent_id');
    //   var continents; 
  
    //   if ( !result.isArray ) {
    //     result = Object.entries(result);
    //   } 
  
    //   // FETCH CONTINENTS 
    //   for (i=0; i<=result.length; i++) {
  
    //   }
  
    //   // console.log( groupBy(data,'continent_id') );
    //   res.render('public/index', { title: 'Trademarkers LLC', continents: result});
    // });


    res.render('public/index', { layout: 'layouts/public-layout', title: 'Trademarkers LLC'});
    
}

exports.about = function(req, res, next) {
  console.log(req.params[0]);
    res.render('public/about', { layout: 'layouts/public-layout-default', title: 'About' });
}

exports.terms = function(req, res, next) {
  res.render('public/terms', { layout: 'layouts/public-layout-default', title: 'terms' });
}

exports.privacy = function(req, res, next) {
  res.render('public/privacy', { layout: 'layouts/public-layout-default', title: 'privacy' });
}

exports.service = function(req, res, next) {
  res.render('public/service', { layout: 'layouts/public-layout-default', title: 'service' });
}

exports.cookies = function(req, res, next) {
  res.render('public/cookies', { layout: 'layouts/public-layout-default', title: 'cookies' });
}

exports.blog = function(req, res, next) {
  res.render('public/blog', { layout: 'layouts/public-layout-default', title: 'blog' });
}

exports.contact = function(req, res, next) {
  console.log(res.flash('info'), 'asd');
  res.render('public/contact', { layout: 'layouts/public-layout-default', title: 'contact' });
}

exports.classes = function(req, res, next) {
  res.render('public/classes', { layout: 'layouts/public-layout-default', title: 'classes' });
}

exports.resources = function(req, res, next) {
  res.render('public/resources', { layout: 'layouts/public-layout-default', title: 'resources' });
}

exports.prices = function(req, res, next) {
  res.render('public/prices', { layout: 'layouts/public-layout-default', title: 'prices' });
}

exports.registration = function(req, res, next) {
  res.render('public/registration', { layout: 'layouts/public-layout-default', title: 'registration' });
}

exports.service_contract = function(req, res, next) {
  res.render('public/service_contract', { layout: 'layouts/public-layout-default', title: 'service_contract' });
}

exports.redirect = function(req, res, next) {

// next();
  res.redirect("https://trademarkers.com" + req.params[0]);
}

exports.ytVideo = function(req, res, next) {

  let ytId = req.params.ytId;

  // console.log(req.session);

  res.render('video/index', { layout: 'layouts/public-layout', title: 'Youtube Videos', ytId: ytId });
}

exports.submitContact = async function(req, res, next) {

  let info = require('../services/mailerService');
  
  // console.log(req.body);

  let mailInfo = await info.contact(req.body);

  console.log(mailInfo);
  if (mailInfo && mailInfo.accepted) {
    res.flash('success', 'Your Inquiry has been sent!');
  } else {
    res.flash('error', 'Sorry, something went wrong, try again later!');
  }

  res.redirect("/contact");

  // next();
}




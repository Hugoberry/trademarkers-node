var db = require('../config/database');
var rpoContinents = require('../repositories/continents');

var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};


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
    res.render('public/index', { title: 'Trademarkers LLC'});
    
}

exports.about = function(req, res, next) {
    res.render('public/about', { title: 'About' });
}

exports.terms = function(req, res, next) {
  res.render('public/terms', { title: 'terms' });
}

exports.privacy = function(req, res, next) {
  res.render('public/privacy', { title: 'privacy' });
}

exports.service = function(req, res, next) {
  res.render('public/service', { title: 'service' });
}

exports.cookies = function(req, res, next) {
  res.render('public/cookies', { title: 'cookies' });
}

exports.blog = function(req, res, next) {
  res.render('public/blog', { title: 'blog' });
}

exports.contact = function(req, res, next) {
  res.render('public/contact', { title: 'contact' });
}

exports.classes = function(req, res, next) {
  res.render('public/classes', { title: 'classes' });
}

exports.resources = function(req, res, next) {
  res.render('public/resources', { title: 'resources' });
}

exports.prices = function(req, res, next) {
  res.render('public/prices', { title: 'prices' });
}

exports.registration = function(req, res, next) {
  res.render('public/registration', { title: 'registration' });
}

exports.redirect = function(req, res, next) {

  res.redirect("https://trademarkers.com" + req.params[0]);
}

exports.ytVideo = function(req, res, next) {

  let ytId = req.params.ytId;

  console.log(req.session);

  res.render('video/index', { title: 'Youtube Videos', ytId: ytId });
}


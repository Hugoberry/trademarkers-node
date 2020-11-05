var db = require('../config/database');
var rpoContinents = require('../repositories/continents');

var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};


exports.index = function(req, res, next) {
  
  res.render('researcher/', { title: 'Researcher' });
    
}

exports.tasks = function(req, res, next) {
  console.log(req);
  res.render('researcher/tasks', { title: 'Researcher' });
    
}

exports.leads = function(req, res, next) {
  
  res.render('researcher/leads', { title: 'Researcher' });
    
}


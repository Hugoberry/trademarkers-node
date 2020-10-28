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
    db.query(sql, function (err, data, fields) {
      if (err) throw err;
  
      var i;
      var result = groupBy(data,'continent_id');
      var continents; 
  
      if ( !result.isArray ) {
        result = Object.entries(result);
      } 
  
      // FETCH CONTINENTS 
      for (i=0; i<=result.length; i++) {
  
      }
  
      // console.log( groupBy(data,'continent_id') );
      res.render('index', { title: 'Trademarkers LLC', continents: result});
    });
    
}

exports.about = function(req, res, next) {
    res.render('about', { title: 'About' });
}
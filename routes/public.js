var express = require('express');
const _ = require( 'lodash' );

var router = express.Router();

var db = require('../config/database');
// var rpoContinents = require('../repositories/continents');

var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

/* GET home page. */
router.get('/', function(req, res, next) {
  
  var sql='SELECT c.name as contName, cc.* FROM continents c JOIN countries cc on c.id=cc.continent_id order by continent_id DESC';
  db.query(sql, function (err, data, fields) {
    if (err) throw err;

    var i;

    // for (i = 0; i < data.length; i++) {
    //   console.log(data[i].continent_id);
    // }
    var result = groupBy(data,'continent_id');
    // console.log(result[1]);
    // for (i = 0; i < result.length; i++) {
    //   console.log(result[i]);
    //   break;
    // }
    
    if ( !result.isArray ) {
      result = Object.entries(result);
    } 

    // console.log( groupBy(data,'continent_id') );
    res.render('index', { title: 'Trademarkers LLC', continents: result});
  });
  
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About' });
});


module.exports = router;

var express = require('express');

var router = express.Router();

var db = require('../config/database');
// var rpoContinents = require('../repositories/continents');

/* GET home page. */
router.get('/', function(req, res, next) {
  
  var sql='SELECT * FROM continents';
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('index', { title: 'Trademarkers LLC', continents: data});
  });
  
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About' });
});


module.exports = router;

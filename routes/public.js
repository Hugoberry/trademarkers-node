var express = require('express');

var router = express.Router();

// var rpoUsers = require('../repositories/users');
var rpoContinents = require('../repositories/continents');

/* GET home page. */
router.get('/', function(req, res, next) {
  
  res.render('index', 
      { 
        title: 'Express',  
        continents: rpoContinents.getContinents(), 
      });
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About' });
});


module.exports = router;

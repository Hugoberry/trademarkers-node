var express = require('express');
var router = express.Router();

// var db = require('../config/database');


/* GET users listing. */
router.get('/', function(req, res, next) {

  db.getUsers();

  res.send('respond with a resource');
});

module.exports = router;

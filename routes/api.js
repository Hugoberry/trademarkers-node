var express = require('express');

const controller = require('../controller/api/userController')

var router = express.Router();


router.post('/users/add', controller.add);


module.exports = router;

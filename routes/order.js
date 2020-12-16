var express = require('express');
var router = express.Router();
const {verify} = require('../controller/middleware');

const controller = require('../controller/orderController')



router.get('/:id', controller.status);

module.exports = router;

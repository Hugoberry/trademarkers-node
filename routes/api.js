var express = require('express');

const userController = require('../controller/api/userController')
const cartController = require('../controller/api/cartController')
const orderController = require('../controller/api/orderController')

var router = express.Router();


router.post('/users/add', userController.add);
router.post('/carts/add', cartController.add);
router.post('/orders/add', orderController.add);


module.exports = router;

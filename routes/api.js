var express = require('express');

const userController = require('../controller/api/userController')
const cartController = require('../controller/api/cartController')
const orderController = require('../controller/api/orderController')
const adminController = require('../controller/adminOppositionLeadsController')

var router = express.Router();


router.post('/users/add', userController.add);
router.post('/carts/add', cartController.add);
router.post('/orders/add', orderController.add);


router.post('/olead/update', adminController.apiUpdate);
router.get('/olead/getall', adminController.getRecords);




module.exports = router;

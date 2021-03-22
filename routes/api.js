var express = require('express');

const userController = require('../controller/api/userController')
const cartController = require('../controller/api/cartController')
const orderController = require('../controller/api/orderController')
const adminController = require('../controller/adminOppositionLeadsController')
const mailOpenController = require('../controller/api/eventOpenMailDetectorController')

var router = express.Router();


router.post('/users/add', userController.add);
router.post('/carts/add', cartController.add);
router.post('/orders/add', orderController.add);


router.post('/olead/update', adminController.apiUpdate);
router.get('/olead/getall', adminController.getRecords);

// router.get('/mail/open', mailOpenController.open);

router.get('/getcartItems', cartController.getcartItems);
router.get('/removeCartItem', cartController.removeCartItem);


module.exports = router;

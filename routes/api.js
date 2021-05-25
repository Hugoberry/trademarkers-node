var express = require('express');

const userController = require('../controller/api/userController')
const cartController = require('../controller/api/cartController')
const orderController = require('../controller/api/orderController')
const adminController = require('../controller/adminOppositionLeadsController')
const adminTrademarkController = require('../controller/adminTrademarkController')
const mailOpenController = require('../controller/api/eventOpenMailDetectorController')

var router = express.Router();


router.post('/users/add', userController.add);
router.post('/carts/add', cartController.add);
router.post('/carts/addService', cartController.addService);
router.post('/orders/add', orderController.add);


router.post('/olead/update', adminController.apiUpdate);
router.get('/olead/getall', adminController.getRecords);

// router.get('/mail/open', mailOpenController.open);

router.get('/getcartItems', cartController.getcartItems);
router.post('/removeCartItem', cartController.removeCartItem);

// CHECK IF EMAIL EXISTING
router.get('/checkEmailExist', userController.checkEmailExist);

// admin trademark functions
router.post('/trademark-service/delete', adminTrademarkController.deleteService);

// re send email verification link
router.post('/verify/resend', userController.verifySend);

// select delivery method
router.post('/delivery-method', userController.selectDeliveryMethod)


module.exports = router;

var express = require('express');
var router = express.Router();
const {verify} = require('../controller/middleware');

const controller = require('../controller/customerController')

router.get('/', verify, controller.index);

router.get('/TC-:id-7C', controller.updateCustomerForm);
router.post('/TC-:id-7C/submit', controller.updateCustomerFormSubmit);

router.get('/orders', controller.orders);
router.get('/orders/:id', controller.orderDetail);

router.get('/dashboard', verify, controller.redirect);



module.exports = router;

var express = require('express');
var router = express.Router();
const {verify} = require('../controller/middleware');

const controller = require('../controller/customerController')


router.get('/TC-:id-7C', controller.updateCustomerForm);
router.post('/TC-:id-7C/submit', controller.updateCustomerFormSubmit);

router.get('/orders', controller.orders);
router.get('/orders/:id', controller.orderDetail);



module.exports = router;

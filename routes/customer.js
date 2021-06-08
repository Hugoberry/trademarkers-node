var express = require('express');
var router = express.Router();
const {verify, verifiedEmail} = require('../controller/middleware');

const controller = require('../controller/customerController')

router.get('/', verify, controller.index);

router.get('/TC-:id-7C', verifiedEmail,controller.updateCustomerForm);
router.post('/TC-:id-7C/submit', verifiedEmail,controller.updateCustomerFormSubmit);

router.get('/orders', verifiedEmail,controller.orders);
router.get('/orders/:id', verifiedEmail,controller.orderDetail);
router.post('/orders/:id', verifiedEmail,controller.addSupportingDocs);

router.get('/invoices', verifiedEmail,controller.invoices);

router.get('/profile', verifiedEmail,controller.profile);
router.get('/profile/edit', verifiedEmail,controller.profileEdit);
router.post('/profile/edit/submit', verifiedEmail,controller.profileSubmit);

router.get('/verify', verify, controller.customerVerifyEmail);
router.get('/verify-account/:id', controller.verifyAccount);

router.get('/dashboard', verifiedEmail, controller.redirect);





module.exports = router;

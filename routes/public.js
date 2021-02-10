var express = require('express');

const publicController = require('../controller/publicController')

var router = express.Router();

// DECLARE ROUTES WITH ASSIGNED CONTROLLERS
router.get('/video/:ytId', publicController.ytVideo);
router.get('/about', publicController.about);
router.get('/terms', publicController.terms);
router.get('/privacy', publicController.privacy);

router.get('/cookies', publicController.cookies);
router.get('/service_contract', publicController.service_contract);
router.get('/resources', publicController.resources);

router.get('/contact', publicController.contact);
router.post('/contact', publicController.submitContact);
router.get('/generate-pdf', publicController.generatePdf);
router.post('/generate-pdf', publicController.generatePdfView);
// router.get('/add-sender-pdf', publicController.addSenderPdf);
router.post('/add-sender-pdf', publicController.addSenderPdf);

router.get('/', publicController.home);

router.get('/what-is-the-uniform-domain-name-dispute-resolution-policy', publicController.udrp);

// CUSTOM PAGE CHECKOUT --- START
router.get('/checkout/L3P-5T', publicController.serviceOrderCustom);
router.post('/checkout/checkoutCustom', publicController.checkoutCustom);

router.get('/checkout/L3P-6T', publicController.serviceOrderCustom2);
router.post('/checkout/checkoutCustom2', publicController.checkoutCustom2);

// CUSTOM PAGE CHECKOUT --- END

router.post('/checkout/:action', publicController.checkout);

router.get('/thank-you/:number', publicController.thankYou)

router.get('/delivery-method/:trdId', publicController.deliveryMethod)
router.get('/action/response/:action/:response', publicController.souResponse)

router.get('/:actionCode/:type', publicController.codeLanding)

// action
router.get('/:action', publicController.redirect);
// redirect
router.get('*', publicController.redirect);

router.get('/services', publicController.service);
router.get('/blog', publicController.blog);

router.get('/classes', publicController.classes);
router.get('/prices', publicController.prices);


// WITH WILD CARD 
router.get('/trademark-registration-in-:countryName', publicController.registration);    


module.exports = router;

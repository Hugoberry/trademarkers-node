var express = require('express');

const publicController = require('../controller/publicController')

var router = express.Router();

// DECLARE ROUTES WITH ASSIGNED CONTROLLERS
router.get('/video/:ytId', publicController.ytVideo);
router.get('/about', publicController.about);
router.get('/terms', publicController.terms);
router.get('/privacy', publicController.privacy);
router.get('/service', publicController.service);
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

// redirect
router.get('*', publicController.redirect);


router.get('/blog', publicController.blog);

router.get('/classes', publicController.classes);
router.get('/prices', publicController.prices);


// WITH WILD CARD 
router.get('/trademark-registration-in-:countryName', publicController.registration);    


module.exports = router;

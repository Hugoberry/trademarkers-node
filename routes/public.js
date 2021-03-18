var express = require('express');
var cors = require('cors')



var allowlist = ['https://www.trademarkers.com', 'https://trademarkers.com', 'http://localhost:4200', 'http://trademarkers.staging.test/']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
      console.log('called 1');
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    console.log('called else');
    corsOptions = { origin: false } // disable CORS for this request
  }

  console.log('called last');
  callback(null, corsOptions) // callback expects two parameters: error and options
}


const publicController = require('../controller/publicController')
const registerController = require('../controller/registerController')

var router = express.Router();

// DECLARE ROUTES WITH ASSIGNED CONTROLLERS
router.get('/video/:ytId', publicController.ytVideo);
router.get('/about', publicController.about);
router.get('/terms', publicController.terms);
router.get('/privacy', publicController.privacy);

router.get('/cookies', publicController.cookies);
router.get('/service_contract', publicController.service_contract);
router.get('/resources', publicController.resources);

router.get('/oppositions-and-proof-of-use', publicController.oppositionProof);

router.get('/contact', publicController.contact);
router.post('/contact', publicController.submitContact);
router.get('/generate-pdf', publicController.generatePdf);
router.post('/generate-pdf', publicController.generatePdfView);
// router.get('/add-sender-pdf', publicController.addSenderPdf);
router.post('/add-sender-pdf', publicController.addSenderPdf);

router.get('/', publicController.home);

router.get('/what-is-the-uniform-domain-name-dispute-resolution-policy', publicController.udrp);

// CUSTOM PAGE CHECKOUT --- START

router.get('/add-service-code-secret-132321', publicController.generateService);
router.post('/add-service-code-secret-132321-submit', publicController.generateServiceSubmit);

router.get('/checkout/L3P-5T', publicController.serviceOrderCustom);
router.post('/checkout/checkoutCustom', publicController.checkoutCustom);

router.get('/checkout/L3P-6T', publicController.serviceOrderCustom2);
router.post('/checkout/checkoutCustom2', publicController.checkoutCustom2);

router.get('/checkout/:serviceCode', publicController.serviceOrderShow);
router.post('/checkout/serviceOrderSubmit', publicController.serviceOrderSubmit);

router.get('/tmreq/:serialNumber.us', cors(corsOptionsDelegate), publicController.checkTMApi);
router.post('/tmreq/:serialNumber.us', cors(corsOptionsDelegate), publicController.checkTMApi);



// CUSTOM PAGE CHECKOUT --- END

router.get('/search', publicController.searchSerial);
router.get('/us', publicController.searchSerial);
router.post('/search/serial-number', publicController.searchSerialNumber);

router.post('/checkout/:action', publicController.checkout);

router.get('/thank-you/:number', publicController.thankYou)

router.get('/delivery-method/:trdId', publicController.deliveryMethod)
router.get('/action/response/:action/:response', publicController.souResponse)

router.get('/:actionCode/:type', publicController.codeLanding)

router.get('/trademark-assignment', publicController.assignment)

// WITH WILD CARD REGISTER CONTROLLER
// REMOVE OTHER FUNCTION UNDER PUBLIC TO REGISTER SPECIALLY THE SERVICE
router.get('/trademark-:serviceType-in-:countryName', registerController.registration);    
router.post('/validate-order', registerController.validateOrder);    
router.post('/add-to-cart', registerController.addToCart);    
// router.get('/order-confirmation', registerController.orderConfirmation);    
router.get('/cart', registerController.cart);    
router.get('/checkout', registerController.checkout);    
router.post('/placeorder', registerController.placeOrder);    


// action
router.get('/:action', publicController.redirect);
// redirect
// router.get('*', publicController.redirect);

router.get('/services', publicController.service);
router.get('/blog', publicController.blog);

router.get('/classes', publicController.classes);
router.get('/prices', publicController.prices);




module.exports = router;

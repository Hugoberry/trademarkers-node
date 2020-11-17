var express = require('express');

const { 
    home, 
    about,
    terms,
    privacy,
    service,
    cookies,
    blog,
    contact,
    classes,
    resources,
    prices,
    registration,
    ytVideo,
    redirect,
    service_contract,
    submitContact
    } = require('../controller/publicController')

var router = express.Router();

// DECLARE ROUTES WITH ASSIGNED CONTROLLERS
router.get('/video/:ytId', ytVideo);
router.get('/about', about);
router.get('/terms', terms);
router.get('/privacy', privacy);
router.get('/service', service);
router.get('/cookies', cookies);
router.get('/service_contract', service_contract);
router.get('/resources', resources);

router.get('/contact', contact);
router.post('/contact', submitContact);
// redirect
router.get('*', redirect);

router.get('/', home);
router.get('/blog', blog);

router.get('/classes', classes);
router.get('/prices', prices);


// WITH WILD CARD 
router.get('/trademark-registration-in-:countryName', registration);    


module.exports = router;

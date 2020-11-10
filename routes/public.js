var express = require('express');
const _ = require( 'lodash' );

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
    registration
    } = require('../controller/publicController')

var router = express.Router();

// DECLARE ROUTES WITH ASSIGNED CONTROLLERS
router.get('/', home);
router.get('/about', about);
router.get('/terms', terms);
router.get('/privacy', privacy);
router.get('/service', service);
router.get('/cookies', cookies);
router.get('/blog', blog);
router.get('/contact', contact);
router.get('/classes', classes);
router.get('/resources', resources);
router.get('/prices', prices);

// WITH WILD CARD 
router.get('/trademark-registration-in-:countryName', registration);    


module.exports = router;

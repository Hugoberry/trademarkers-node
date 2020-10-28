var express = require('express');
const _ = require( 'lodash' );

const {home, about} = require('../controller/publicController')

var router = express.Router();

// DECLARE ROUTES WITH ASSIGNED CONTROLLERS
router.get('/', home);
router.get('/about', about);


module.exports = router;

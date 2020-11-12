var express = require('express');

const { intercept } = require('../controller/interceptorController')

var router = express.Router();

// intercept
router.get('*', intercept);

module.exports = router;

var express = require('express');
var router = express.Router();
// const {verify} = require('../controller/middleware');

const controller = require('../controller/tsdrController')



router.get('/:serial', controller.index);

module.exports = router;

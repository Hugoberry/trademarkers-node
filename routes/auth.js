var express = require('express');
var router = express.Router();

const {login, showLogin, refresh} = require('../controller/authController')

// show login form
router.get('/', showLogin)
router.post('/', login)
router.post('/refrsh', refresh)

module.exports = router;

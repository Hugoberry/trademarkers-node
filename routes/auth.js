var express = require('express');
var router = express.Router();

const {login, showLogin, refresh, loginApi, logoutApi} = require('../controller/authController')

// show login form
router.get('/', showLogin)
router.get('/auth', login)
router.post('/auth', login)
router.get('/refresh', refresh)

router.get('/:hash/:email', loginApi)
router.get('/expired', logoutApi)

module.exports = router;

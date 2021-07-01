var express = require('express');
var router = express.Router();

const { changePassword,login, showLogin, refresh, loginApi, logoutApi, login_ajax} = require('../controller/authController')

// show login form
router.get('/', showLogin)
router.get('/auth', login)
router.post('/auth2', login_ajax)
router.get('/refresh', refresh)

router.get('/:hash/:email', loginApi)
router.get('/expired', logoutApi)

router.get('/change-pass', changePassword)

module.exports = router;

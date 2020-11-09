var express = require('express');
var router = express.Router();
const {verify} = require('../controller/middleware');

const {index, tasks, leads} = require('../controller/researcherController')


/* GET users listing. */
router.get('/', verify, index);
router.get('/tasks', verify, tasks);
router.get('/leads', leads);

module.exports = router;

var express = require('express');
var router = express.Router();
const {verify} = require('../controller/middleware');

const researcher = require('../controller/researcherController')


/* GET users listing. */
router.get('/', verify, researcher.index);
router.get('/tasks', verify, researcher.tasks);
router.get('/leads', researcher.leads);
router.get('/events', researcher.events);
router.get('/events/add', researcher.eventsAdd);
router.post('/events/add', researcher.eventsAddSubmit);

module.exports = router;

var express = require('express');
var router = express.Router();
const {verify} = require('../controller/middleware');

const researcher = require('../controller/researcherController')
const adminOppositionLead = require('../controller/adminOppositionLeadsController')


/* GET users listing. */
// router.get('/log-:e-:p', researcher.login);
router.get('/', verify, researcher.index);

router.get('/tasks', verify, researcher.tasks);
router.get('/tasks/:id-:n', verify, researcher.taskEditDetail);
router.post('/tasks/update', verify, researcher.taskUpdateDetail);

router.get('/leads', verify, researcher.leads);
router.get('/leads/add', verify, researcher.leadsAdd);
router.post('/leads/add', verify, researcher.leadsAddSubmit);

router.get('/leads/view/:id', verify, researcher.leadsShow);
router.get('/leads/edit/:id', verify, researcher.leadsEdit);
router.post('/leads/edit/:id', verify, researcher.leadsEditSubmit);

router.get('/events', verify, researcher.events);
router.get('/events/add', verify, researcher.eventsAdd);
router.post('/events/add', verify, researcher.eventsAddSubmit);

router.get('/events/view/:id', verify, researcher.eventsShow);
router.get('/events/edit/:id', verify, researcher.eventsEdit);
router.post('/events/edit/:id', verify, researcher.eventsEditSubmit);

router.get('/opposition-leads', verify, adminOppositionLead.leads);
router.get('/opposition-leads/view/:id', verify, adminOppositionLead.show);
router.get('/opposition-leads/edit/:id', verify, adminOppositionLead.edit);
router.post('/opposition-leads/edit/:id', verify, adminOppositionLead.editSubmit);


router.get('/sou-uploads', researcher.uploadSou);
router.post('/sou-uploads', researcher.uploadSouSubmit);

module.exports = router;

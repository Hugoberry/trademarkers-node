var express = require('express');
var router = express.Router();
const {verify, guardResearcher} = require('../controller/middleware');

const researcher = require('../controller/researcherController')
const adminOppositionLead = require('../controller/adminOppositionLeadsController')


/* GET users listing. */
// router.get('/log-:e-:p', researcher.login);
router.get('/', verify, guardResearcher, researcher.index);

router.get('/tasks', verify, guardResearcher, researcher.tasks);
router.get('/tasks/:id-:n', verify, guardResearcher, researcher.taskEditDetail);
router.post('/tasks/update', verify, guardResearcher, researcher.taskUpdateDetail);

router.get('/leads', verify, guardResearcher, researcher.leads);
router.get('/leads/add', verify, guardResearcher, researcher.leadsAdd);
router.post('/leads/add', verify, guardResearcher, researcher.leadsAddSubmit);

router.get('/leads/view/:id', verify,guardResearcher, researcher.leadsShow);
router.get('/leads/edit/:id', verify,guardResearcher, researcher.leadsEdit);
router.post('/leads/edit/:id', verify,guardResearcher, researcher.leadsEditSubmit);

router.get('/events', verify,guardResearcher, researcher.events);
router.get('/events/add', verify,guardResearcher, researcher.eventsAdd);
router.post('/events/add', verify,guardResearcher, researcher.eventsAddSubmit);

router.get('/events/view/:id', verify,guardResearcher, researcher.eventsShow);
router.get('/events/edit/:id', verify,guardResearcher, researcher.eventsEdit);
router.post('/events/edit/:id', verify,guardResearcher, researcher.eventsEditSubmit);

router.get('/opposition-leads', verify,guardResearcher, adminOppositionLead.leads);
router.get('/opposition-leads/view/:id', verify,guardResearcher, adminOppositionLead.show);
router.get('/opposition-leads/edit/:id', verify,guardResearcher, adminOppositionLead.edit);
router.post('/opposition-leads/edit/:id', verify,guardResearcher, adminOppositionLead.editSubmit);


router.get('/sou-uploads', researcher.uploadSou);
router.post('/sou-uploads', researcher.uploadSouSubmit);

module.exports = router;

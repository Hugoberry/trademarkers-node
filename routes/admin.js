var express = require('express');
var router = express.Router();
const {verify} = require('../controller/middleware');

const adminTask = require('../controller/adminTaskController')
const adminEvent = require('../controller/adminEventController')
const adminLead = require('../controller/adminLeadController')
const adminOppositionLead = require('../controller/adminOppositionLeadsController')


/* GET users listing. */
router.get('/', verify, adminTask.index);

router.get('/manage/tasks', verify, adminTask.tasks);
router.get('/manage/tasks/add', verify, adminTask.tasksAdd);
router.post('/manage/tasks/add', verify, adminTask.tasksAddSubmit);

router.get('/manage/tasks/view/:id', verify, adminTask.taskShow);
router.get('/manage/tasks/edit/:id', verify, adminTask.taskEdit);
router.post('/manage/tasks/edit/:id', verify, adminTask.taskEditSubmit);
 
router.get('/manage/events', verify, adminEvent.events);
router.get('/manage/events/view/:id', verify, adminEvent.show);
router.get('/manage/events/edit/:id', verify, adminEvent.edit);
router.post('/manage/events/edit/:id', verify, adminEvent.editSubmit);

router.get('/manage/leads', verify, adminLead.leads);
router.get('/manage/leads/view/:id', verify, adminLead.show);
router.get('/manage/leads/edit/:id', verify, adminLead.edit);
router.post('/manage/leads/edit/:id', verify, adminLead.editSubmit);

router.get('/manage/opposition-leads', verify, adminOppositionLead.leads);
router.get('/manage/opposition-leads/view/:id', verify, adminOppositionLead.show);
router.get('/manage/opposition-leads/edit/:id', verify, adminOppositionLead.edit);
router.post('/manage/opposition-leads/edit/:id', verify, adminOppositionLead.editSubmit);

module.exports = router;

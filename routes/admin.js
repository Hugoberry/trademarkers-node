var express = require('express');
var router = express.Router();
const {verify} = require('../controller/middleware');

const adminTask = require('../controller/adminTaskController')
const adminEvent = require('../controller/adminEventController')


/* GET users listing. */
router.get('/', verify, adminTask.index);

router.get('/manage/tasks', verify, adminTask.tasks);
router.get('/manage/tasks/add', verify, adminTask.tasksAdd);
router.post('/manage/tasks/add', verify, adminTask.tasksAddSubmit);

router.get('/manage/tasks/view/:id', verify, adminTask.taskShow);
router.get('/manage/tasks/edit/:id', verify, adminTask.taskEdit);
router.post('/manage/tasks/edit/:id', verify, adminTask.taskEditSubmit);
 
router.get('/manage/events', verify, adminEvent.events);
// router.get('/manage/events/add', verify, adminEvent.add);
// router.post('/manage/events/add', verify, adminEvent.addSubmit);

router.get('/manage/events/view/:id', verify, adminEvent.show);
router.get('/manage/events/edit/:id', verify, adminEvent.edit);
router.post('/manage/events/edit/:id', verify, adminEvent.editSubmit);

module.exports = router;

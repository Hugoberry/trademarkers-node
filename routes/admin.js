var express = require('express');
var router = express.Router();
const {verify} = require('../controller/middleware');

const admin = require('../controller/adminController')


/* GET users listing. */
router.get('/', verify, admin.index);

router.get('/manage/tasks', verify, admin.tasks);
router.get('/manage/tasks/add', verify, admin.tasksAdd);
router.post('/manage/tasks/add', verify, admin.tasksAddSubmit);

// router.get('/manage/events', verify, admin.events);

module.exports = router;

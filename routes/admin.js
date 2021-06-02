var express = require('express');
var router = express.Router();
const {verify} = require('../controller/middleware');

const adminTask = require('../controller/adminTaskController')
const adminEvent = require('../controller/adminEventController')
const adminLead = require('../controller/adminLeadController')
const adminOppositionLead = require('../controller/adminOppositionLeadsController')
const adminTrademark = require('../controller/adminTrademarkController')
const countryTrademark = require('../controller/adminCountryController')
const adminUser = require('../controller/adminUserController')
const adminPromo = require('../controller/adminPromoCodeController')


/* GET users listing. */
router.get('/', verify, adminTask.index);

router.get('/manage/tasks', verify, adminTask.tasks);
router.get('/manage/tasks/add', verify, adminTask.tasksAdd);
router.post('/manage/tasks/add', verify, adminTask.tasksAddSubmit);

router.get('/manage/tasks/view/:id', verify, adminTask.taskShow);
router.get('/manage/tasks/edit/:id', verify, adminTask.taskEdit);
router.post('/manage/tasks/edit/:id', verify, adminTask.taskEditSubmit);

router.get('/manage/trademark', verify, adminTrademark.index);
router.get('/manage/trademark/view/:id', verify, adminTrademark.show);
router.get('/manage/trademark/edit/:id', verify, adminTrademark.edit);
router.post('/manage/trademark/edit/:id', verify, adminTrademark.editSubmit);
 
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

router.get('/manage/country', verify, countryTrademark.index);
router.get('/manage/country/view/:id', verify, countryTrademark.show);
router.get('/manage/country/edit/:id', verify, countryTrademark.edit);
router.post('/manage/country/edit/:id', verify, countryTrademark.editSubmit);

router.get('/manage/user', verify, adminUser.index);
router.get('/manage/user/view/:id', verify, adminUser.show);
router.get('/manage/user/edit/:id', verify, adminUser.edit);
router.post('/manage/user/edit/:id', verify, adminUser.editSubmit);
router.get('/manage/user/add', verify, adminUser.add);
router.post('/manage/user/add', verify, adminUser.addSubmit);

router.get('/manage/promo', verify, adminPromo.index);
router.get('/manage/promo/view/:id', verify, adminPromo.show);
router.get('/manage/promo/edit/:id', verify, adminPromo.edit);
router.post('/manage/promo/edit/:id', verify, adminPromo.editSubmit);
router.get('/manage/promo/add', verify, adminPromo.add);
router.post('/manage/promo/add', verify, adminPromo.addSubmit);

module.exports = router;

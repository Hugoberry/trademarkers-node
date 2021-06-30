var express = require('express');
var router = express.Router();
const {verify, guardAdmin} = require('../controller/middleware');

const adminTask = require('../controller/adminTaskController')
const adminEvent = require('../controller/adminEventController')
const adminLead = require('../controller/adminLeadController')
const adminOppositionLead = require('../controller/adminOppositionLeadsController')
const adminTrademark = require('../controller/adminTrademarkController')
const countryTrademark = require('../controller/adminCountryController')
const adminUser = require('../controller/adminUserController')
const adminPromo = require('../controller/adminPromoCodeController')
const adminOrder = require('../controller/adminOrderController')
const adminBlog = require('../controller/adminBlogController')
const adminEuActions = require('../controller/adminEuActionsController')
const adminVideos = require('../controller/adminVideosController')
const adminActivities = require('../controller/adminActivitiesController')
const adminCartItems = require('../controller/adminCartItemController')
const adminAttorneys = require('../controller/adminAttorneysController')


/* GET users listing. */
router.get('/', verify,guardAdmin, adminTask.index);

router.get('/manage/tasks', verify, guardAdmin, adminTask.tasks);
router.get('/manage/tasks/add', verify, guardAdmin, adminTask.tasksAdd);
router.post('/manage/tasks/add', verify, guardAdmin, adminTask.tasksAddSubmit);

router.get('/manage/tasks/view/:id', verify, guardAdmin, adminTask.taskShow);
router.get('/manage/tasks/edit/:id', verify, guardAdmin, adminTask.taskEdit);
router.post('/manage/tasks/edit/:id', verify, guardAdmin, adminTask.taskEditSubmit);

router.get('/manage/trademark', verify, guardAdmin, adminTrademark.index);
router.get('/manage/trademark/view/:id', verify, guardAdmin, adminTrademark.show);
router.get('/manage/trademark/edit/:id', verify, guardAdmin, adminTrademark.edit);
router.post('/manage/trademark/edit/:id', verify, guardAdmin, adminTrademark.editSubmit);
 
router.get('/manage/events', verify, guardAdmin, adminEvent.events);
router.get('/manage/events/view/:id', verify, guardAdmin, adminEvent.show);
router.get('/manage/events/edit/:id', verify, guardAdmin, adminEvent.edit);
router.post('/manage/events/edit/:id', verify, guardAdmin, adminEvent.editSubmit);

router.get('/manage/leads', verify, guardAdmin, adminLead.leads);
router.get('/manage/leads/view/:id', verify, guardAdmin, adminLead.show);
router.get('/manage/leads/edit/:id', verify, guardAdmin, adminLead.edit);
router.post('/manage/leads/edit/:id', verify, guardAdmin, adminLead.editSubmit);

router.get('/manage/opposition-leads', verify, guardAdmin, adminOppositionLead.leads);
router.get('/manage/opposition-leads/view/:id', verify, guardAdmin, adminOppositionLead.show);
router.get('/manage/opposition-leads/edit/:id', verify, guardAdmin, adminOppositionLead.edit);
router.post('/manage/opposition-leads/edit/:id', verify, guardAdmin, adminOppositionLead.editSubmit);

router.get('/manage/country', verify, guardAdmin, countryTrademark.index);
router.get('/manage/country/view/:id', verify, guardAdmin, countryTrademark.show);
router.get('/manage/country/edit/:id', verify, guardAdmin, countryTrademark.edit);
router.post('/manage/country/edit/:id', verify, guardAdmin, countryTrademark.editSubmit);

router.get('/manage/user', verify, guardAdmin, adminUser.index);
router.get('/manage/user/view/:id', verify, guardAdmin, adminUser.show);
router.get('/manage/user/edit/:id', verify, guardAdmin, adminUser.edit);
router.post('/manage/user/edit/:id', verify, guardAdmin, adminUser.editSubmit);
router.get('/manage/user/add', verify, guardAdmin, adminUser.add);
router.post('/manage/user/add', verify, guardAdmin, adminUser.addSubmit);

router.get('/manage/promo', verify, guardAdmin, adminPromo.index);
router.get('/manage/promo/view/:id', verify, guardAdmin, adminPromo.show);
router.get('/manage/promo/edit/:id', verify, guardAdmin, adminPromo.edit);
router.post('/manage/promo/edit/:id', verify, guardAdmin, adminPromo.editSubmit);
router.get('/manage/promo/add', verify, guardAdmin, adminPromo.add);
router.post('/manage/promo/add', verify, guardAdmin, adminPromo.addSubmit);

router.get('/manage/invoice', verify, guardAdmin, countryTrademark.index);
router.get('/manage/invoice/view/:id', verify, guardAdmin, countryTrademark.show);

router.get('/manage/orders', verify, guardAdmin, adminOrder.index);
router.get('/manage/orders/view/:id', verify, guardAdmin, adminOrder.show);
router.get('/manage/orders/edit/:id', verify, guardAdmin, adminOrder.edit);
router.post('/manage/orders/edit/:id', verify, guardAdmin, adminOrder.editSubmit);

router.get('/manage/articles', verify, guardAdmin, adminBlog.index);
router.get('/manage/articles/view/:id', verify, guardAdmin, adminBlog.show);
router.get('/manage/articles/edit/:id', verify, guardAdmin, adminBlog.edit);
router.post('/manage/articles/edit/:id', verify, guardAdmin, adminBlog.editSubmit);
router.get('/manage/articles/add', verify, guardAdmin, adminBlog.add);
router.post('/manage/articles/add', verify, guardAdmin, adminBlog.addSubmit);

router.get('/manage/euactions', verify, guardAdmin, adminEuActions.index);
router.get('/manage/euactions/view/:id', verify, guardAdmin, adminEuActions.show);
router.get('/manage/euactions/edit/:id', verify, guardAdmin, adminEuActions.edit);
router.post('/manage/euactions/edit/:id', verify, guardAdmin, adminEuActions.editSubmit);
router.get('/manage/euactions/add', verify, guardAdmin, adminEuActions.add);
router.post('/manage/euactions/add', verify, guardAdmin, adminEuActions.addSubmit);

router.get('/manage/videos', verify, guardAdmin, adminVideos.index);
router.get('/manage/videos/view/:id', verify, guardAdmin, adminVideos.show);
router.get('/manage/videos/edit/:id', verify, guardAdmin, adminVideos.edit);
router.post('/manage/videos/edit/:id', verify, guardAdmin, adminVideos.editSubmit);
router.get('/manage/videos/add', verify, guardAdmin, adminVideos.add);
router.post('/manage/videos/add', verify, guardAdmin, adminVideos.addSubmit);
router.get('/manage/videos/delete/:id', verify, guardAdmin, adminVideos.deleteRecord);

router.get('/manage/activities', verify, guardAdmin, adminActivities.index);
router.get('/manage/activities/view/:id', verify, guardAdmin, adminActivities.show);
router.get('/manage/activities/delete/:id', verify, guardAdmin, adminActivities.deleteRecord);

router.get('/manage/cart-items', verify, guardAdmin, adminCartItems.index);
router.get('/manage/cart-items/edit/:id', verify, guardAdmin, adminCartItems.edit);
router.post('/manage/cart-items/edit/:id', verify, guardAdmin, adminCartItems.editSubmit);
router.get('/manage/cart-items/add', verify, guardAdmin, adminCartItems.add);
router.post('/manage/cart-items/add', verify, guardAdmin, adminCartItems.addSubmit);
router.get('/manage/cart-items/delete/:id', verify, guardAdmin, adminCartItems.deleteRecord);


router.get('/manage/attorneys', verify, guardAdmin, adminAttorneys.index);
router.get('/manage/attorneys/edit/:id', verify, guardAdmin, adminAttorneys.edit);
router.post('/manage/attorneys/edit/:id', verify, guardAdmin, adminAttorneys.editSubmit);
router.get('/manage/attorneys/add', verify, guardAdmin, adminAttorneys.add);
router.post('/manage/attorneys/add', verify, guardAdmin, adminAttorneys.addSubmit);
router.get('/manage/attorneys/delete/:id', verify, guardAdmin, adminAttorneys.deleteRecord);




module.exports = router;

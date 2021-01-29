const jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var rpoTask = require('../repositories/task');
var rpoEvent = require('../repositories/events'); 
var rpoLead = require('../repositories/lead');
var rpoUsers = require('../repositories/usersMongo');
var rpoUsersMysql = require('../repositories/users');
var rpoTrademark = require('../repositories/trademarks');
var rpoSouNotifications = require('../repositories/souNotifications');

var mailService = require('../services/mailerService');
var actionService = require('../services/actionService')

const multer = require('multer');
const path = require('path');

let moment = require('moment');
const { toInteger } = require('lodash');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'uploads/');
  },

  // By default, multer removes file extensions so let's add them back
  filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

exports.index = function(req, res, next) {
  
  res.render('researcher/', { layout: 'layouts/public-layout-researcher', title: 'Researcher' });
    
}

exports.tasks = async function(req, res, next) {

  let decode = jwt.decode(req.cookies.jwt, {complete: true});
  let user = JSON.parse(decode.payload.user);
  
  let task = await rpoTask.getResearcherTask(user._id);
  
  // console.log(task[0]);

  res.render('researcher/tasks/', { layout: 'layouts/public-layout-researcher', title: 'Researcher', task: task[0] });
    
}

exports.taskEditDetail = async function(req, res, next) {

  let decode = jwt.decode(req.cookies.jwt, {complete: true});
  let user = JSON.parse(decode.payload.user);
  
  let task = await rpoTask.getResearcherTask(user._id);

  res.render('researcher/tasks/tasks-number-detail', { 
    layout: 'layouts/public-layout-researcher', 
    title: 'Researcher', 
    task: task[0],
    n: req.params['n']
  });
    
}

exports.taskUpdateDetail = async function(req, res, next) {

  let decode = jwt.decode(req.cookies.jwt, {complete: true});
  let user = JSON.parse(decode.payload.user);
  
  let task = await rpoTask.getResearcherTask(user._id);
  let detail = [];
  let statusUpdate = true;


  task[0].details.forEach(function(taskDetail,key) {
    detail[key] = taskDetail;
    if ( req.body['task_number'] == taskDetail.task_number ) {
      detail[key].task_status =  req.body['task_status'];
      console.log("in", detail[key].task_number);
    }

    // count
    if ( taskDetail.task_status != 'review' || req.body['task_status'] != 'review') {
      statusUpdate = false;
    }


  });
  // console.log("detail", detail);

  // let taskStatus = statusCount == 4 ? 

  if ( statusUpdate ) {
    task[0].task_status = "review";
    await rpoTask.updateTask(task[0]._id,task[0]);

    await mailService.researcherNotify(
      `<p>Hi Admin</p>
      <p>Researcher ${task[0].researcher[0].name} updated a task ${task[0].task_name}</p>
      `,
      process.env.MAIL_TO,
      `Researcher updated task | ${task[0].researcher[0].name}`
    );
  } else {
    await rpoTask.updateDetails(task[0]._id,detail);
  }
 
  // let update = await rpoTask.updateDetails(task[0]._id,detail);


  

  res.flash('success', 'Task status updated successfully!');
  
  res.redirect('/researcher/tasks/');

  // next();
}

exports.leads = async function(req, res, next) {

  let decode = jwt.decode(req.cookies.jwt, {complete: true});
  let user = JSON.parse(decode.payload.user);
  
  let leads = await rpoLead.getResearcherLeads(user._id);
  
  res.render('researcher/leads', { 
    layout: 'layouts/public-layout-researcher', 
    title: 'Researcher', 
    leads: leads 
  });
    
}

exports.leadsAdd = async function(req, res, next) {

  let decode = jwt.decode(req.cookies.jwt, {complete: true});
  let user = JSON.parse(decode.payload.user);
  
  let task = await rpoTask.getResearcherTask(user._id);
  
  res.render('researcher/leads/add', { 
    layout: 'layouts/public-layout-researcher', 
    title: 'Researcher', leads: null,
    task: task[0]
  });
    
}

exports.leadsAddSubmit = async function(req, res, next) {
  

  let selectedTask = await rpoTask.getTaskById(req.body.task_id);

  req.body.task = selectedTask;

  let add = await rpoLead.putLead(req.body);

  res.flash('success', 'Lead added successfully!');
  res.redirect('/researcher/leads');
  next();
}

exports.leadsShow = async function(req, res, next) {

  let lead = await rpoLead.getResearcherLeadById(req.params['id']);
  
  res.render('researcher/leads/view', { layout: 'layouts/public-layout-researcher', title: 'Researcher', lead: lead[0] });
    
}

exports.leadsEdit = async function(req, res, next) {

  let lead = await rpoLead.getResearcherLeadById(req.params['id']);
  
  res.render('researcher/leads/edit', { layout: 'layouts/public-layout-researcher', title: 'Researcher', lead: lead[0] });
    
}

exports.leadsEditSubmit = async function(req, res, next) {

  console.log(req.body);
  rpoLead.updateDetails(req.params['id'],req.body);

  res.flash('success', 'Lead updated successfully!');
  res.redirect('/researcher/leads');

}

exports.events = async function(req, res, next) {

  let decode = jwt.decode(req.cookies.jwt, {complete: true});
  let user = JSON.parse(decode.payload.user);
  
  let events = await rpoEvent.getResearcherEvents(user._id);

  res.render('researcher/events/', { 
    layout: 'layouts/public-layout-researcher', 
    title: 'Researcher', 
    events: events 
  });
    
}

exports.eventsAdd = async function(req, res, next) {

  let decode = jwt.decode(req.cookies.jwt, {complete: true});
  let user = JSON.parse(decode.payload.user);
  
  let task = await rpoTask.getResearcherTask(user._id);
  
  console.log(task[0]);
  
  res.render('researcher/events/add', { 
    layout: 'layouts/public-layout-researcher', 
    title: 'Researcher', 
    task: task[0] 
  });
    
}

exports.eventsAddSubmit = async function(req, res, next) {

  let selectedTask = await rpoTask.getTaskById(req.body.task_id);
  req.body.task = selectedTask;

  let add = await rpoEvent.putEvent(req.body);

  res.flash('success', 'Event Added successfully!');
  res.redirect('/researcher/events');
  next();
}

exports.eventsShow = async function(req, res, next) {

  let event = await rpoEvent.getResearcherEventById(req.params['id']);
  
  res.render('researcher/events/view', { layout: 'layouts/public-layout-researcher', title: 'Researcher', event: event[0] });
    
}

exports.eventsEdit = async function(req, res, next) {

  let event = await rpoEvent.getResearcherEventById(req.params['id']);
  
  res.render('researcher/events/edit', { layout: 'layouts/public-layout-researcher', title: 'Researcher', event: event[0] });
    
}

exports.eventsEditSubmit = async function(req, res, next) {


  rpoEvent.updateDetails(req.params['id'],req.body);

  res.flash('success', 'Event updated successfully!');

  res.redirect('/researcher/events');

}


exports.uploadSou = async function(req, res, next) {

  // let event = await rpoEvent.getResearcherEventById(req.params['id']);
  
  res.render('researcher/upload/sou', { layout: 'layouts/public-layout-researcher', title: 'Researcher' });
    
}

exports.uploadSouSubmit = async function(req, res, next) {

  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = req.files.sampleFile;
  uploadPath = __dirname + '/../public/uploads/' + sampleFile.name;

  let strData = sampleFile.name.split('.');
  // console.log(strData);
  if (strData.length > 3) {
    let countryCode = strData[0],
        serialNumber = strData[1],
        type = strData[2],
        dateIssue = strData[3],
        deadlineDate = strData[4],
        userId = strData[5],
        orderId = strData[6];

        dateIssue = dateIssue.split('-');
        deadlineDate = deadlineDate.split('-');
        userId = userId.split('-');
        orderId = orderId.split('-');
        // console.log(orderId);

        let user = await rpoUsersMysql.getUserByIdMysql((userId[1] * 1));
        let trademarks = await rpoTrademark.fetchTmById(orderId[1]);

        // console.log(user);
        // console.log(trademarks);

       

       
        // console.log("order_id",orderId[1]);
        // console.log('trademarks',trademarks);
        

        let mailData = {
          serialNumber, serialNumber,
          userId: userId[1],
          orderId: orderId[1],
          dateIssue: convertIntToDate(dateIssue[1]),
          deadlineDate: convertIntToDate(deadlineDate[1]),
          user: user[0],
          trademark: trademarks[0],
          lastSent: toInteger(moment().format('YYMMDD')),
          noEmail: 1,
          fileUrl:  uploadPath,
          fileName:  sampleFile.name,
          actionType: 'sou notification'
        }

        let action = await actionService.createActionCode(mailData,'/')

        // mailData.action = action;

        // console.log("mailData",mailData);
        // find first before put or update
        let notification = await rpoSouNotifications.findBySerial(serialNumber);
        let flag = false;

        if (notification.length > 0) {
          // update
          let lastNotificationSent = convertIntToDate(notification[0].lastSent)

          if ( moment().diff(lastNotificationSent,"hours") >= 48 ) {
            flag = true;
            let mailDataContent = {
              lastSent: toInteger(moment().format('YYMMDD')),
              noEmail: (notification[0].noEmail + 1)
            }
            rpoSouNotifications.updateDetails(notification[0]._id, mailDataContent);
          }

        } else {
          // put new record
          flag = true;
          rpoSouNotifications.put(mailData);
        }

        
        if ( flag ) {
          switch(type.trim()) {
            case 'AB':
              console.log('sending');
            break;
            case 'AL':
              // STATEMENT OF USE
              console.log('sending sou');
              mailService.sendNOA(mailData);
              // mailService.sendSOU(mailData);
              
            break;
            case 'OA':
              console.log('sending OA');
              mailService.sendNOA(mailData);
            break;
          }
        }

    // 
  }
  

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      res.flash('error', 'Something went wrong!');
      res.redirect('/researcher/sou-uploads');
      // return res.status(500).send(err);
    } else {
      res.flash('success', 'File uploaded!');
      res.redirect('/researcher/sou-uploads');
      // res.send('File uploaded!');

    }
      

     
  });


  
}

// temporary login auto redirect from php
// exports.login = async function(req,res){



//   // return 'asd';
//   var username=req.params['e'];
//   var password=req.params['p'];

//   // CHECK MONGODB IF EXIST AND VALIDATE
//   let userExistMongo = await rpoUsersMongo.findUser(username);

//   // if (userExistMongo)
//   console.log(userExistMongo);

//   // check in mongo db
//   if ( userExistMongo && userExistMongo[0]) {

//       console.log('Validating Via mongo DB...');
//       validateHashUser(password, userExistMongo[0], res);

//   } else {

//       connection.query('SELECT * FROM users WHERE email = ?',[username], function (error, results, fields) {
//           if (error) {
//               res.json({
//                 status:false,
//                 message:'there are some error with query'
//                 })
//           }else{

//               if(results.length >0){
//                   console.log('Validating Via MYSQL DB...');
//                   validateHashUser(password, results[0], res);

//               }
//               else{

//                   res.json({
//                       status:false,
//                       message:"Email does not exits"
//                   });

//               }

//           }
//       });

//   } // END ELSE

// }

function validateHashUser(pass, obj, res){

  var hash = obj.password;
  hash = hash.replace(/^\$2y(.+)$/i, '$2a$1');

  bcrypt.compare(pass, hash, function(err, ress) {

      if(!ress){
          
          res.flash('error', 'Email and password does not match!');

          res.json({
          status:false,                  
          message:"Email and password does not match"
          });

      }else{     

          //use the payload to store information about the user such as username, user role, etc.
          let payload = {user: JSON.stringify(obj)}

          //create the access token with the shorter lifespan
          let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: (60 * 60) * 6
          });

          rpoUsers.putUser(obj);

          //send the access token to the client inside a cookie
          res.setHeader('Cache-Control', 'private');
          res.cookie("jwt", accessToken);
          res.json({
          status:true,
          message:"Success"
      });

      }
  });   

}

function convertIntToDate(idate) {

  let s = idate+"";

  // check if 2020 or below 1999
  let year = s.substring(0, 2) * 1;

  year = year > 50 ? '19' : '20';

  return new Date(year + s.substring(0, 2) + '-' + s.substring(2, 4) + '-' + s.substring(4));
  
}


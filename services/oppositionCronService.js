let rpo = require('../repositories/oppositionLeads');
let rpoDomains = require('../repositories/domains');
let rpoEmails = require('../repositories/eventEmails');
let rpoEvents = require('../repositories/events');
let rpoOutbox = require('../repositories/outbox');
let rpoAction = require('../repositories/actionCode');

var actionService = require('../services/actionService')
let mailService = require('../services/mailerService')

const _variables = require( '../config/variables' );

let moment = require('moment');
const { toInteger } = require('lodash');

exports.generateDomainEmail = async function() {

  let leads = await rpo.getlimitData(1);

  leads.forEach(function(lead,key) {
    let str = cleanString(lead.name);
    console.log(str);
    // create domains and email address
    generateDomains(lead);

    let data = {
      domain_generated : true,
      email_generated  : true
    }

    rpo.updateDetails(lead._id,data)

  })

}

exports.sendEvent = async function() {

  let events = await rpoEvents.getlimitData(1);

  if ( events.length > 0 ) {

    let event = events[0];
    // fetch email
    let email = event.emailProspects.find(e => !e.done);
    
    let eventUpdateData = {
      last_crawl: (moment().format('YYMMDD') * 1),
      emailProspects: []
    }

    if ( email ) {
  
      // send event email
      let emailDataSet = {
        event : event,
        email : email
      }

      let actions = [];
      // actions.udpr        = await actionService.createActionCode(emailDataSet,'/what-is-the-uniform-domain-name-dispute-resolution-policy');
      actions.udpr        = await actionService.createActionCode(emailDataSet,'https://tm.trademarkers.com/');
      actions.services    = await actionService.createActionCode(emailDataSet,'/services');
      actions.register    = await actionService.createActionCode(emailDataSet,'/countries');
      actions.about       = await actionService.createActionCode(emailDataSet,'/about');
      actions.video       = await actionService.createActionCode(emailDataSet,'/video/PexvELzGraA');
      actions.prices      = await actionService.createActionCode(emailDataSet,'/prices');
      actions.resources   = await actionService.createActionCode(emailDataSet,'/resources');
      actions.blog        = await actionService.createActionCode(emailDataSet,'/blog');
      actions.contact     = await actionService.createActionCode(emailDataSet,'/contact');

      emailDataSet.actions = actions;
      mailService.eventEmail(emailDataSet);
      
      // fetch email set to update event emails
      // let emailProspects = [];

      event.emailProspects.forEach(emails => {
        if ( emails.email == email.email) {
          email.done = toInteger(moment().format('YYMMDD'));
          eventUpdateData.emailProspects.push(email);
        } else {
          eventUpdateData.emailProspects.push(emails);
        }
      });
    } else {
      eventUpdateData.emailProspects = event.emailProspects;
    }

    // update event last crawl
    
    rpoEvents.updateDetails(event._id, eventUpdateData)

  }

}


 function generateDomains(data) {
  let str = cleanString(data.name);

  console.log('generating domains and emails to use in event');
  
  // create domain and emails
  let eventData = {
    brand: str,
    domains : [],
    emailProspects : []
  }
  _variables.domainTLD.forEach(function(name,key){

    let domainData = {
      domain_name   : str + "." + name.name,
      created_at    : toInteger(moment().format('YYMMDD'))
    }

    eventData.domains.push(domainData);

    _variables.emailGen.forEach(function(email,key){
      
      let emailData = {
        email         : email.name + "@" + domainData.domain_name
      }

      eventData.emailProspects.push(emailData);

    })

  
    let yesterday = moment().subtract(1, "days").format('YYMMDD');

    eventData.event_type = 'opposition-for-domain-owners-euipo';
    eventData.last_crawl = toInteger(yesterday);
    eventData.case = data;
    eventData.created_at = toInteger(moment().format('YYMMDD'));

    rpoEvents.put(eventData);

    console.log("generated event ++ "+ eventData.event_type +" ++");

  })
  
  
  

}

function cleanString(str) {
  str = str.replace(/\s/g, '');
  str = str.replace(/[^a-zA-Z0-9]/g, '');

  return str.toLowerCase()
}

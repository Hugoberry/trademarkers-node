let rpoActivity = require('../repositories/activityLog');
let rpoEvent = require('../repositories/events');
let rpoAction = require('../repositories/actionCode');

let _variables = require('../config/variables');

let geoip = require('geoip-lite');

const { toInteger } = require('lodash');
let moment = require('moment');

exports.logger = function(ip, page, msg) {
    // console.log('this', ip);

    

    // let ip = "207.97.227.239";

    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }

    let geo = geoip.lookup(ip);

    if ( geo ) {

        let _data = {
            ip      : ip,
            uri     : page,
            country : geo.country,
            city    : geo.city,
            region  : geo.region,
            activity: msg,
            created_at: toInteger(moment().format('YYMMDD')),
            created_at_formatted: moment().format()
        };

        // console.log(_data);

        rpoActivity.activity(_data);
    }
 
}

exports.trackingEmail = async function(ip, data) {
  
    // console.log(data);

    if ( data.related_data.event._id ) {

        let event = await rpoEvent.getId(data.related_data.event._id);

        if (ip.substr(0, 7) == "::ffff:") {
            ip = ip.substr(7)
        }
    
    
        let geo = geoip.lookup(ip);
        // console.log(ip);
        if ( !_variables.ipAddresses.includes(ip) ){
            // console.log(ip, 'ip not included!');
            let act_data = {
                tracking: [{
                    email: data.related_data.email.email,
                    click: data.redirect_to,
                    action_code: data.number,
                    ip_address: ip,
                    date: (moment().format('YYMMDD') * 1)
                }],
                emailProspects: []
            }

            if (event[0].tracking) {
                event[0].tracking.forEach(track => {
                    if ( track ) {
                        // console.log(track);
                        act_data.tracking.push(track);
                    }
                });
            }

            event[0].emailProspects.forEach(emails => {
                if ( emails.email == data.related_data.email.email ) {
                    emails.click = data.redirect_to;
                } 
                act_data.emailProspects.push(emails);
            });

            // event.tracking.push(act_data);
            rpoEvent.updateDetails(data.related_data.event._id, act_data);
        }
    }

    

 
}


exports.trackingEmailSOU = async function(ip, data) {
  
    // console.log(data);

    if ( data ) {

        // let action = r

        if (ip.substr(0, 7) == "::ffff:") {
            ip = ip.substr(7)
        }
    
    
        let geo = geoip.lookup(ip);

        if ( !_variables.ipAddresses.includes(ip) ){
          
            // log here
            let act_data = {
                tracking: [{
                    email: data.user.email,
                    ip_address: ip,
                    country : geo.country,
                    city    : geo.city,
                    region  : geo.region,
                    date: (moment().format('YYMMDD') * 1)
                }]
            }

            if (data.tracking) {
                data.tracking.forEach(track => {
                    if ( track ) {
                        // console.log(track);
                        act_data.tracking.push(track);
                    }
                });
            } 

            await rpoAction.updateDetails(data._id, act_data)

        }
    }

    

 
}


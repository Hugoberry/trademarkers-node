let rpoActivity = require('../repositories/activityLog');
let rpoEvent = require('../repositories/events');

let _variables = require('../config/variables');

let geoip = require('geoip-lite');

let moment = require('moment');

exports.logger = function(ip, page, msg) {
    // console.log('this', req.ip);

    

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
            activity: msg
        };

        console.log(_data);

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

                    // if (emails.tracking) {
                    //     emails.tracking.forEach(track => {
                    //         if ( track ) {
                    //             // console.log(track);
                    //             emails.tracking.push(track);
                    //         }
                    //     });
                    // } else {
                    //     emails.tracking = [{
                    //         click: data.url,
                    //         action_code: data.number,
                    //         ip_address: ip,
                    //         date: moment().toDate()
                    //     }]
                    // }

                } 
                act_data.emailProspects.push(emails);
            });

            // event.tracking.push(act_data);
            rpoEvent.updateDetails(data.related_data.event._id, act_data);
        }
    }

    

 
}


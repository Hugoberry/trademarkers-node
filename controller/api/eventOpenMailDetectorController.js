const { NetworkAuthenticationRequire } = require('http-errors');
let _variables = require('../../config/variables');
let geoip = require('geoip-lite');
let moment = require('moment');

var rpoEvent = require('../../repositories/events');


exports.open = async function(req, res, next) {

    // console.log("body", req.query);

    let ip = req.ip;

    if (req.query.email && req.query.eventId){
      console.log('open email');

      if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
      }

      if ( !_variables.ipAddresses.includes(ip) ){

        let events = await rpoEvent.getId(req.query.eventId);
        let event = events[0]

        // create update on event with its email that was opened
        event.emailProspects.forEach(emails => {
          if ( emails.email == req.query.email ) {
              emails.open = true;
          }

        })

        let updates = {
          emailProspects: event.emailProspects
        }

        rpoEvent.updateDetails(event._id, updates)
      }
    }

    res.send();
    // next();

}










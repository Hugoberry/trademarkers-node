const { NetworkAuthenticationRequire } = require('http-errors');
const variables = require('../config/variables');

var rpo = require('../repositories/actionCodes');
var rpoCountry = require('../repositories/countries');
var rpoEuipo = require('../repositories/euipo');


var helpers = require('../helpers');
let moment = require('moment');
let store = require('store')
const { toInteger } = require('lodash');


exports.actionCodes = async function(req, res, next) {

  let actions = await rpo.findByCode(req.params.actioncodes);

  let action = actions[0]
  if (action && action.res) {
    // res.flash('actionCode', action);
    // action found process 
    
    let euipoRec = await rpoEuipo.findByCode(action.res.no);
    let countries = await rpoCountry.getByAbbr(action.res.regCountry)
    
    action.res.discountDateFormatted = helpers.convertIntToDate(action.res.discountExp)

    store.set('action', 
      { 
        action: action,
        trademark: euipoRec[0]
      }
    );

    res.render('order/actionRegistration', {
      layout  : 'layouts/public-layout-interactive', 
      title   : 'Trademark Registration',
      trademark: euipoRec[0],
      country: countries[0],
      action: action,
      user: await helpers.getLoginUser(req)
    });

  } 

  // continue
  next();
}

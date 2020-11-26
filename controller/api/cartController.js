const { NetworkAuthenticationRequire } = require('http-errors');
const variables = require('../../config/variables');


var rpo = require('../../repositories/carts');


exports.add = async function(req, res, next) {

    // console.log(req.body,'request');

    let cart = await rpo.findById(req.body.id);

    if ( cart.length <= 0 ) {

      rpo.putCart(req.body);
      console.log('added new user record');
      res.json({
        status:true,
        message:"Record Added"
      });

    } else {

      console.log('exist');
      res.json({
        status:false,
        message:"Record Already Exist"
      });
    }

    
    
    
}








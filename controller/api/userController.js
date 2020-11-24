const { NetworkAuthenticationRequire } = require('http-errors');
const variables = require('../../config/variables');


var rpoUsers = require('../../repositories/usersMongo');


exports.add = async function(req, res, next) {

    // console.log(req.body,'request');

    let user = await rpoUsers.findUser(req.body.email);

    if ( user.length <= 0 ) {

      rpoUsers.putUser(req.body);
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








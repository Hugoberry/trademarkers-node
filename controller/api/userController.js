const { NetworkAuthenticationRequire } = require('http-errors');
const variables = require('../../config/variables');
// const jwt = require('jsonwebtoken')

var rpoUsers = require('../../repositories/usersMongo');


exports.add = async function(req, res, next) {

    // console.log(req.body,'request');

    let user = await rpoUsers.findUser(req.body.email);


    // let payload = {user: JSON.stringify(user)}
    // let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    //   expiresIn: (60 * 60) * 6
    // });
    // console.log(accessToken);
    if ( user.length <= 0 ) {

      rpoUsers.putUser(req.body);
      console.log('added new user record');

      // res.setHeader('Cache-Control', 'private');
      // res.cookie("jwt", accessToken);

      res.json({
        status:true,
        message:"Record Added"
      });

    } else {
      // update
      rpoUsers.updateUser(user.id,req.body);

      res.json({
        status:false,
        message:"Record Already Exist"
      });
    }

    
    
    
}








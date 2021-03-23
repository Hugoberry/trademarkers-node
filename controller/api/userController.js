const { NetworkAuthenticationRequire } = require('http-errors');
const variables = require('../../config/variables');
// const jwt = require('jsonwebtoken')

var rpoUsers = require('../../repositories/usersMongo');
var rpoUsersMy = require('../../repositories/users');



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

exports.checkEmailExist = async function(req, res, next) {

  let user;

  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  let url = new URL(fullUrl);
  let params = new URLSearchParams(url.search);
  let email = params.get("email")

  let userExistMongo = await rpoUsers.findUser(email);
  if (userExistMongo) {
    user = userExistMongo[0]
  }

  if (!user) {
    let userExistMySql = await rpoUsersMy.getUserByEmail(email);
    user = userExistMySql[0]
  }

  // console.log(email,user);

  res.json({
    ...user
  }); 
  
}










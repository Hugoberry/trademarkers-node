const jwt = require('jsonwebtoken')
const mysql = require('mysql');
var bcrypt = require('bcrypt');

// MYSQL
const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

// MONGO


var rpoUsersMongo = require('../repositories/usersMongo');
var rpoUsers = require('../repositories/users');
var helpers = require('../helpers');

exports.showLogin = function(req, res, next) {

    // if ( process.env.ENVIRONMENT != "dev" ) {

    //     let urlPhp = process.env.APP_URL_PHP;
    //     res.redirect(urlPhp + '/login');
    // }

    res.render('public/login', { title: 'Login Form' });
}

exports.login2 = async function(req, res){

    let username = req.body.username
    let password = req.body.password

    let validateLogin = await rpoUsers.validateUser(username, password);

    // validate user login
    if (!validateLogin){
        res.status(401).send({ status:false, response: 'Email or Password Mismatch' });
        // res.redirect('/login'); 
    }


    //use the payload to store information about the user such as username, user role, etc.
    let payload = {username: username}

    //create the access token with the shorter lifespan
    let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES
    })

    //send the access token to the client inside a cookie
    res.cookie("jwt", accessToken, {secure: true, httpOnly: true})
    // console.log(userExist);

    // res.redirect('/users');

    res.status(res.statusCode || 200)
        .send({ status: true, response: 'user' });

    
    // next()
    // res.redirect('/users'); 
    // res.send()
    // console.log(req.cookies.jwt);
    // res.redirect('/users'); 

    
    return res;
}

exports.refresh = function (req, res){

    let accessToken = req.cookies.jwt
    console.log('refresh');
    if (!accessToken){
        return res.status(403).send()
    }

    let payload
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    }
    catch(e){
        console.log(e);
        return res.status(401).send()
    }

    //retrieve the refresh token from the users array
    let refreshToken = users[payload.username].refreshToken

    //verify the refresh token
    try{
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    }
    catch(e){
        return res.status(401).send()
    }

    let newToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, 
    {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES
    })

    res.cookie("jwt", newToken, {secure: true, httpOnly: false})
    res.send()
}

exports.login = async function(req,res){

    // return 'asd';
    var username=req.query.username;
    var password=req.query.password;

    // CHECK MONGODB IF EXIST AND VALIDATE
    let userExistMongo = await rpoUsersMongo.findUser(username);

    // if (userExistMongo)
    console.log("param",req.params);
    console.log("body",req.body);
    console.log("query",req.query);
    // console.log("all",req);
    console.log(userExistMongo);

    // check in mongo db
    if ( userExistMongo && userExistMongo[0]) {

        console.log('Validating Via mongo DB...');

        

        validateHashUser(password, userExistMongo[0], res);

    } else {

        connection.query('SELECT * FROM users WHERE email = ?',[username], function (error, results, fields) {
            if (error) {
                res.json({
                  status:false,
                  message:'there are some error with query'
                  })
            }else{

                if(results.length >0){
                    console.log('Validating Via MYSQL DB...');
                    validateHashUser(password, results[0], res);

                }
                else{
                    console.log("error", results);
                    res.json({
                        status:false,
                        message:"Email does not exist"
                    });

                }

            }
        });

    } // END ELSE

}

exports.login_ajax = async function(req,res){

    // return 'asd';
    var username=req.body.username;
    var password=req.body.password;

    // CHECK MONGODB IF EXIST AND VALIDATE
    let userExistMongo = await rpoUsersMongo.findUser(username);

    // if (userExistMongo)
    console.log("param",req.params);
    console.log("body",req.body);
    console.log("query",req.query);
    // console.log("all",req);
    console.log(userExistMongo);

    // check in mongo db
    if ( userExistMongo && userExistMongo[0]) {

        console.log('Validating Via mongo DB...');

        // check for password and update record
        if ( !userExistMongo[0].password && userExistMongo[0].id ) {
            let userSQL = await rpoUsers.getUserByIdMysql(userExistMongo[0].id)

            console.log("fetched from sql", userSQL);

            userExistMongo[0].password = userSQL[0].password

            rpoUsersMongo.updateUser(userExistMongo[0]._id, {password: userSQL[0].password})
        }

        validateHashUser(password, userExistMongo[0], res);

    } else {

        connection.query('SELECT * FROM users WHERE email = ?',[username], function (error, results, fields) {
            if (error) {
                res.json({
                  status:false,
                  message:'there are some error with query'
                  })
            }else{

                if(results.length > 0){
                    console.log('ajax Validating Via MYSQL DB...');
                    validateHashUser(password, results[0], res);

                }
                else{
                    console.log("error", results);
                    res.json({
                        status:false,
                        message:"Email does not exist"
                    });

                }

            }
        });

    } // END ELSE



}

function validateHashUser(pass, obj, res){

    var hash = obj.password;

    console.log(obj);

    if (!hash) {

        res.json({
            status:false,                  
            message:"Email and password does not match"
            });
    }

    hash = hash.replace(/^\$2y(.+)$/i, '$2a$1');

    bcrypt.compare(pass, hash, async function(err, ress) {

        if(!ress){
            
            res.flash('error', 'Email and password does not match!');

            res.json({
            status:false,                  
            message:"Email and password does not match"
            });

        }else{     

            // GENERATE CUSTOMER NO
            if (!obj.custNo) {
                let flag = true
                let custNo = ""

                for ( ; flag; ) {
                    custNo = "CU-" + helpers.makeid(4)

                    let dataCustomer = await rpoUsersMongo.findUserNo(custNo)
                    // console.log("check user", dataCustomer.length );
                    if ( dataCustomer.length <= 0 ) {
                        flag = false
                    }
                }
                obj.custNo = custNo

            }

            
            let storedUser = await rpoUsers.putUser(obj);

            // console.log(storedUser.insertedId);
            if (!obj._id) {
                obj._id = storedUser.insertedId;
            }
            

            //use the payload to store information about the user such as username, user role, etc.
            let payload = {user: JSON.stringify(obj)}

            //create the access token with the shorter lifespan
            let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES
            });

            

            //send the access token to the client inside a cookie
            // res.setHeader('Cache-Control', 'private');
            res.cookie("jwt", accessToken);
            res.json({
                status:true,
                message:"Success",
                user: obj
            });

        }
    });   

}

exports.loginApi = async function(req, res, next) {
    
    let email = urldecode(req.params['email'])
    let hash = urldecode(req.params['hash'])

    let userExistMongo = await rpoUsersMongo.findUser(email);

    if ( userExistMongo && userExistMongo[0]) {

        let payload = {user: JSON.stringify(userExistMongo[0])}

            //create the access token with the shorter lifespan
            let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES
            });

            res.cookie("jwt", accessToken);

            // rpoUsers.putUser(obj);

    }
    res.redirect('/home'); 
    next()
}

exports.logoutApi = async function(req, res, next) {
    
    res.clearCookie("jwt");
    let urlPhp = process.env.APP_URL_PHP;

    // res.redirect(urlPhp + '/loggedout');
    res.redirect('/login'); 
    // next()
}

function urldecode (str) {

    return decodeURIComponent((str + '')
      .replace(/%(?![\da-f]{2})/gi, function () {
        return '%25'
      })
      .replace(/\+/g, '%20'))

}
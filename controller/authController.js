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

exports.showLogin = function(req, res, next) {
    // clear cookie is for logout function
    // res.clearCookie("__session");
    res.clearCookie("jwt");
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
        expiresIn: process.env.ACCESS_TOKEN_LIFE
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
        expiresIn: process.env.ACCESS_TOKEN_LIFE
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

                    res.json({
                        status:false,
                        message:"Email does not exits"
                    });

                }

            }
        });

    } // END ELSE

}

function validateHashUser(pass, obj, res){

    var hash = obj.password;
    hash = hash.replace(/^\$2y(.+)$/i, '$2a$1');

    bcrypt.compare(pass, hash, function(err, ress) {

        if(!ress){
            
            res.json({
            status:false,                  
            message:"Email and password does not match"
            });

        }else{     

            //use the payload to store information about the user such as username, user role, etc.
            let payload = {user: JSON.stringify(obj)}

            //create the access token with the shorter lifespan
            let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: (60 * 60) * 6
            });

            rpoUsers.putUser(obj);

            //send the access token to the client inside a cookie
            res.setHeader('Cache-Control', 'private');
            res.cookie("jwt", accessToken);
            res.json({
            status:true,
            message:"Success"
        });

        }
    });   

}
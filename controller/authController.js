const jwt = require('jsonwebtoken')

var rpoUsers = require('../repositories/users');

exports.showLogin = function(req, res, next) {
    res.render('login', { title: 'Login Form' });
}

exports.login = async function(req, res){

    let username = req.body.username
    let password = req.body.password

    let user = await rpoUsers.validateUser(username, password);
console.log(user);
    // validate user login
    if (!user){
        return res.status(401).send()
    }
// console.log(user);
//     if (!rpoUsers.validateUser(user[0],password)) {
//         return res.status(401).send()
//     }

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
        .send({ status: true, response: user });
    res.send()
    // console.log(req.cookies.jwt);
    // res.redirect('/users'); 

    
    // return res;
}

exports.refresh = function (req, res){

    let accessToken = req.cookies.jwt

    if (!accessToken){
        return res.status(403).send()
    }

    let payload
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    }
    catch(e){
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

    res.cookie("jwt", newToken, {secure: true, httpOnly: true})
    res.send()
}
const jwt = require('jsonwebtoken')

exports.verify = function(req, res, next){
    let accessToken = req.cookies.jwt

    //if there is no token stored in cookies, the request is unauthorized
    if (!accessToken){
        // return res.status(403).send()
        res.redirect('/login'); 
    }

    let payload
    try{
        //use the jwt.verify method to verify the access token
        //throws an error if the token has expired or has a invalid signature
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        next()
    }
    catch(e){
        console.log(e);
        //if an error occured return request unauthorized error
        res.redirect('/login'); 
        return res.status(401).send()
    }
}

exports.guardResearcher = function(req, res, next){
    let accessToken = req.cookies.jwt

    //if there is no token stored in cookies, the request is unauthorized
    if (!accessToken){
        // return res.status(403).send()
        res.redirect('/login'); 
    }

    let payload
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        let user = JSON.parse(payload.user);
        
        console.log(user.role_id);

        if ( user.role_id != 4 ) {
            return res.status(403).send()
        }

        next()
    }
    catch(e){
        console.log(e);

        res.redirect('/home'); 
        return res.status(401).send()
    }
}

exports.guardReviewer = function(req, res, next){
    let accessToken = req.cookies.jwt

    //if there is no token stored in cookies, the request is unauthorized
    if (!accessToken){
        // return res.status(403).send()
        res.redirect('/login'); 
    }

    let payload
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        let user = JSON.parse(payload.user);
        
        console.log(user.role_id);

        if ( user.role_id != 5 ) {
            return res.status(403).send()
        }

        next()
    }
    catch(e){
        console.log(e);

        res.redirect('/login'); 
        return res.status(401).send()
    }
}
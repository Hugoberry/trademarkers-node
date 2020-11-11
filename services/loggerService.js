const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

var app = require('../app');

// MONGO : DATABASE CONNECTION
const mongoose = require('mongoose');
const mongoDb = process.env.MongoURILOCAL;
const mongoDbOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
};

// DB Connect
const mongoConnection = mongoose.createConnection(mongoDb, mongoDbOptions);


exports.logger = async function(req, res, next) {
    
    

    return new Promise(function(resolve, reject) {
			
        // this snippet will create sessions as collection on mongodb
        const sessionStore = new MongoStore({
            mongooseConnection: mongoConnection,
            collection: 'trd_session_logs'
        });

        resolve(sessionStore);

    });

    
}
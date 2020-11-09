

// MYSQL : DATABASE CONNECTION
const mysql = require('mysql');
var mysqlConnection = mysql.createConnection({
  host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

// MONGO : DATABASE CONNECTION
const mongoose = require('mongoose');
const mongoDb = process.env.MongoURILOCAL;
const mongoDbOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
};

// DB Connect
const mongoConnection = mongoose.createConnection(mongoDb, mongoDbOptions);

// 
mongoConnection
    .then(() => console.log('Mongo Database is connected successfully !'))
    .catch(err => console.log(err));

mysqlConnection.connect(function(err) {
    if (err) throw err;
    console.log('MySQL Database is connected successfully !');
  });
  
module.exports = mysqlConnection;
module.exports = mongoConnection;

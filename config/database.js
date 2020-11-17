const _variables = require( './variables' );
// MYSQL : DATABASE CONNECTION
const mysql = require('mysql');
// MONGO : DATABASE CONNECTION
const mongoose = require('mongoose');

var mysqlConnection = mysql.createConnection({
  host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});



// DB Connect
const mongoConnection = mongoose.createConnection(_variables.mongoURL, _variables.mongoOptions);

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

let _table = process.env.TBLEXT + "trademark_classes";

// DATABASE CONNECTION
const mysql = require('mysql');
const util = require('util');
var bcrypt = require('bcrypt');

// MONGO : DATABASE CONNECTION
let conn = require('../config/DbConnect');

// DB Connect
// const mongoConnection = mongoose.createConnection(mongoDb, mongoDbOptions);

// const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});




module.exports = {



	getClasses : async function() {


		return new Promise(function(resolve, reject) {

			conn.getDb().collection(_table).find().sort( { id: 1 } ).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});
	

		});

	},

	put: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

	},

	
	
};
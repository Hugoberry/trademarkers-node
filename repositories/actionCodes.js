let _table = "tm.actioncodes";

let conn = require('../config/DbConnect');

// DATABASE CONNECTION
const mysql = require('mysql');
const util = require('util');

const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

module.exports = {

	findByCode : async function(code) {
		return new Promise(function(resolve, reject) {

			let query = { code: code.toUpperCase() };

			let db = conn.getDb();
			
			db.collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	

	put: async function(data) {
		return new Promise(function(resolve, reject) {
			conn.getDb().collection(_table).insertOne(data, 
				function(err, res2) {
					if (err) reject(err);

					resolve(res2);
				}
			);
		});

	},

}; 
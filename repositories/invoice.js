let _table = process.env.TBLEXT + "invoice";

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

	findById : async function(id) {
		return new Promise(function(resolve, reject) {

			let query = { id: id };

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


	
	fetchByOrderIdMysql: async function ( order_id ) {

		return new Promise(function(resolve, reject) {
			connection.query("SELECT * FROM invoices WHERE order_id = ?",[(order_id * 1)],function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});

	},

}; 